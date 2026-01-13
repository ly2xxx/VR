/**
 * Screen Controls for VR Desktop
 * Provides A-Frame components for screen manipulation in VR
 * 
 * Features:
 * - Aspect ratio switching (16:9, 21:9, 32:9)
 * - Screen distance adjustment
 * - Curved/flat screen toggle
 * - Controller-based interactions
 */

// Register A-Frame component for screen controls
if (typeof AFRAME !== 'undefined') {

    AFRAME.registerComponent('screen-controls', {
        schema: {
            aspectRatio: { type: 'string', default: '16:9' },
            distance: { type: 'number', default: 3 },
            curved: { type: 'boolean', default: false }
        },

        init: function () {
            this.aspectRatios = {
                '16:9': { width: 3.2, height: 1.8 },
                '21:9': { width: 3.78, height: 1.62 },
                '32:9': { width: 5.76, height: 1.62 }
            };

            this.setupControllerListeners();
        },

        setupControllerListeners: function () {
            const scene = this.el.sceneEl;

            // Listen for trigger presses to cycle aspect ratio
            scene.addEventListener('triggerdown', (evt) => {
                if (evt.detail.hand === 'right') {
                    this.cycleAspectRatio();
                } else if (evt.detail.hand === 'left') {
                    this.toggleCurved();
                }
            });

            // Listen for thumbstick for distance
            scene.addEventListener('thumbstickmoved', (evt) => {
                if (Math.abs(evt.detail.y) > 0.5) {
                    this.adjustDistance(evt.detail.y > 0 ? 0.1 : -0.1);
                }
            });
        },

        cycleAspectRatio: function () {
            const ratios = Object.keys(this.aspectRatios);
            const currentIndex = ratios.indexOf(this.data.aspectRatio);
            const nextIndex = (currentIndex + 1) % ratios.length;
            this.el.setAttribute('screen-controls', 'aspectRatio', ratios[nextIndex]);
        },

        toggleCurved: function () {
            this.el.setAttribute('screen-controls', 'curved', !this.data.curved);
        },

        adjustDistance: function (delta) {
            const newDistance = Math.max(1.5, Math.min(6, this.data.distance + delta));
            this.el.setAttribute('screen-controls', 'distance', newDistance);
        },

        update: function (oldData) {
            // Update screen dimensions
            if (oldData.aspectRatio !== this.data.aspectRatio) {
                this.updateScreenSize();
            }

            // Update distance
            if (oldData.distance !== this.data.distance) {
                this.el.setAttribute('position', `0 1.6 ${-this.data.distance}`);
            }

            // Update curved state
            if (oldData.curved !== this.data.curved) {
                const flatScreen = this.el.querySelector('#flat-screen');
                const curvedScreen = this.el.querySelector('#curved-screen');
                const screenFrame = this.el.querySelector('#screen-frame');

                if (flatScreen) flatScreen.setAttribute('visible', !this.data.curved);
                if (curvedScreen) curvedScreen.setAttribute('visible', this.data.curved);
                if (screenFrame) screenFrame.setAttribute('visible', !this.data.curved);
            }
        },

        updateScreenSize: function () {
            const dims = this.aspectRatios[this.data.aspectRatio];
            if (!dims) return;

            const flatScreen = this.el.querySelector('#flat-screen');
            const curvedScreen = this.el.querySelector('#curved-screen');
            const screenFrame = this.el.querySelector('#screen-frame');

            if (flatScreen) {
                flatScreen.setAttribute('width', dims.width);
                flatScreen.setAttribute('height', dims.height);
            }

            if (curvedScreen) {
                const radius = 4;
                const thetaLength = (dims.width / (2 * Math.PI * radius)) * 360;
                curvedScreen.setAttribute('geometry', {
                    primitive: 'cylinder',
                    radius: radius,
                    height: dims.height,
                    openEnded: true,
                    thetaStart: 180 - thetaLength / 2,
                    thetaLength: thetaLength,
                    segmentsRadial: 64
                });
            }

            if (screenFrame) {
                screenFrame.setAttribute('width', dims.width + 0.1);
                screenFrame.setAttribute('height', dims.height + 0.1);
            }
        }
    });

    // Component for gaze-based controls (for hand tracking without controllers)
    AFRAME.registerComponent('gaze-control', {
        init: function () {
            this.gazeTimer = null;

            this.el.addEventListener('mouseenter', () => {
                this.gazeTimer = setTimeout(() => {
                    this.el.emit('gaze-activate');
                }, 1500);
            });

            this.el.addEventListener('mouseleave', () => {
                if (this.gazeTimer) {
                    clearTimeout(this.gazeTimer);
                    this.gazeTimer = null;
                }
            });
        }
    });
}

// Keyboard controls for desktop testing
document.addEventListener('keydown', (e) => {
    const screenContainer = document.getElementById('screen-container');
    if (!screenContainer) return;

    switch (e.key) {
        case '1':
            document.getElementById('btn-16-9')?.click();
            break;
        case '2':
            document.getElementById('btn-21-9')?.click();
            break;
        case '3':
            document.getElementById('btn-32-9')?.click();
            break;
        case 'c':
            document.getElementById('btn-curved')?.click();
            break;
        case 'ArrowUp':
            document.getElementById('btn-closer')?.click();
            break;
        case 'ArrowDown':
            document.getElementById('btn-farther')?.click();
            break;
    }
});
