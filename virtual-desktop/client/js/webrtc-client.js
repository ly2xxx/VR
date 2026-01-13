/**
 * WebRTC Client for VR Desktop
 * Handles signaling and peer connection to receive desktop stream
 * 
 * References:
 * - WebRTC API: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
 * - getDisplayMedia: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
 */

class VRDesktopClient {
    constructor() {
        this.ws = null;
        this.pc = null;
        this.clientId = null;
        this.stream = null;

        this.onStatusChange = null;
        this.onStream = null;

        this.iceServers = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
    }

    setStatus(status, message) {
        if (this.onStatusChange) {
            this.onStatusChange(status, message);
        }
    }

    async connect() {
        return new Promise((resolve, reject) => {
            const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
            this.ws = new WebSocket(`${protocol}//${location.host}`);

            this.ws.onopen = () => {
                this.setStatus('connected', 'Connected to server');
                resolve();
            };

            this.ws.onerror = (err) => {
                this.setStatus('error', 'Connection failed');
                reject(new Error('WebSocket connection failed'));
            };

            this.ws.onclose = () => {
                this.setStatus('disconnected', 'Disconnected from server');
            };

            this.ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            };
        });
    }

    async handleMessage(message) {
        switch (message.type) {
            case 'connected':
                this.clientId = message.clientId;
                console.log('Client ID:', this.clientId);
                break;

            case 'streamer-available':
                this.setStatus('connected', 'Streamer found - Connecting...');
                break;

            case 'streamer-disconnected':
                this.setStatus('error', 'Streamer disconnected');
                if (this.pc) {
                    this.pc.close();
                    this.pc = null;
                }
                break;

            case 'answer':
                if (this.pc && message.answer) {
                    await this.pc.setRemoteDescription(new RTCSessionDescription(message.answer));
                }
                break;

            case 'ice-candidate':
                if (this.pc && message.candidate) {
                    await this.pc.addIceCandidate(new RTCIceCandidate(message.candidate));
                }
                break;
        }
    }

    async requestStream() {
        // Register as viewer
        this.ws.send(JSON.stringify({ type: 'register-viewer' }));

        // Create peer connection
        this.pc = new RTCPeerConnection(this.iceServers);

        // Add transceiver to receive video
        this.pc.addTransceiver('video', { direction: 'recvonly' });
        this.pc.addTransceiver('audio', { direction: 'recvonly' });

        // Handle incoming stream
        this.pc.ontrack = (event) => {
            console.log('Received track:', event.track.kind);
            if (event.streams && event.streams[0]) {
                this.stream = event.streams[0];
                if (this.onStream) {
                    this.onStream(this.stream);
                }
            }
        };

        // Handle ICE candidates
        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    target: 'streamer',
                    candidate: event.candidate
                }));
            }
        };

        // Connection state
        this.pc.onconnectionstatechange = () => {
            console.log('Connection state:', this.pc.connectionState);
            if (this.pc.connectionState === 'connected') {
                this.setStatus('connected', 'Stream connected!');
            } else if (this.pc.connectionState === 'failed') {
                this.setStatus('error', 'Connection failed');
            }
        };

        // Create offer
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);

        // Send offer to streamer
        this.ws.send(JSON.stringify({
            type: 'offer',
            target: 'streamer',
            offer: offer
        }));

        this.setStatus('connecting', 'Requesting stream...');
    }

    disconnect() {
        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.stream = null;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VRDesktopClient;
}
