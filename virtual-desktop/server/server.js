/**
 * VR Desktop Streaming Server
 * WebSocket signaling server for WebRTC peer connections
 * 
 * References:
 * - WebRTC: https://webrtc.org/
 * - A-Frame: https://github.com/aframevr/aframe
 * - Three.js: https://github.com/mrdoob/three.js
 */

const express = require('express');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/client', express.static(path.join(__dirname, '..', 'client')));

// Track connected clients
const clients = new Map();
let streamer = null;

// Get local IP addresses
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    return ips;
}

wss.on('connection', (ws) => {
    const clientId = uuidv4();
    clients.set(clientId, ws);

    console.log(`Client connected: ${clientId}`);

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleMessage(ws, clientId, message);
        } catch (e) {
            console.error('Invalid message:', e);
        }
    });

    ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        clients.delete(clientId);
        if (streamer === ws) {
            streamer = null;
            // Notify all viewers that streamer disconnected
            broadcast({ type: 'streamer-disconnected' });
        }
    });

    // Send client their ID
    ws.send(JSON.stringify({ type: 'connected', clientId }));
});

function handleMessage(ws, senderId, message) {
    switch (message.type) {
        case 'register-streamer':
            streamer = ws;
            console.log('Streamer registered');
            // Notify waiting viewers
            broadcast({ type: 'streamer-available' }, ws);
            break;

        case 'register-viewer':
            if (streamer) {
                ws.send(JSON.stringify({ type: 'streamer-available' }));
            }
            break;

        case 'offer':
        case 'answer':
        case 'ice-candidate':
            // Forward signaling messages
            if (message.target === 'streamer' && streamer) {
                streamer.send(JSON.stringify({ ...message, from: senderId }));
            } else if (message.target) {
                const targetClient = clients.get(message.target);
                if (targetClient) {
                    targetClient.send(JSON.stringify({ ...message, from: senderId }));
                }
            }
            break;

        default:
            console.log('Unknown message type:', message.type);
    }
}

function broadcast(message, exclude = null) {
    const data = JSON.stringify(message);
    for (const [id, client] of clients) {
        if (client !== exclude && client.readyState === 1) {
            client.send(data);
        }
    }
}

server.listen(PORT, '0.0.0.0', () => {
    const ips = getLocalIPs();
    console.log('\n🖥️  VR Desktop Server Running!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📡 PC Streamer:');
    console.log(`   http://localhost:${PORT}/streamer.html`);
    console.log('\n🥽 Quest 3 Viewer (use one of these IPs):');
    ips.forEach(ip => {
        console.log(`   http://${ip}:${PORT}/client/`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
