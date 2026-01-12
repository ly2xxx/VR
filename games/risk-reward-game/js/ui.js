/**
 * Dream Tycoon VR - UI Components
 * Custom A-Frame components for VR interactions
 */

// Register custom A-Frame components when A-Frame is ready
if (typeof AFRAME !== 'undefined') {
    initUIComponents();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof AFRAME !== 'undefined') {
            initUIComponents();
        }
    });
}

function initUIComponents() {

    /**
     * VR Button Component - Adds hover and click effects
     */
    AFRAME.registerComponent('vr-button', {
        schema: {
            hoverColor: { type: 'color', default: '#6ab4ff' },
            clickScale: { type: 'number', default: 0.95 }
        },

        init: function () {
            this.originalColor = null;
            this.box = this.el.querySelector('a-box');

            if (this.box) {
                this.originalColor = this.box.getAttribute('color');
            }

            // Hover effects
            this.el.addEventListener('mouseenter', this.onHover.bind(this));
            this.el.addEventListener('mouseleave', this.onLeave.bind(this));
            this.el.addEventListener('click', this.onClick.bind(this));
        },

        onHover: function () {
            if (this.box) {
                this.box.setAttribute('material', 'emissiveIntensity', 0.6);
            }
            this.el.setAttribute('scale', '1.05 1.05 1.05');
        },

        onLeave: function () {
            if (this.box) {
                this.box.setAttribute('material', 'emissiveIntensity', 0.3);
            }
            this.el.setAttribute('scale', '1 1 1');
        },

        onClick: function () {
            // Quick scale animation
            this.el.setAttribute('scale', `${this.data.clickScale} ${this.data.clickScale} ${this.data.clickScale}`);
            setTimeout(() => {
                this.el.setAttribute('scale', '1 1 1');
            }, 100);
        }
    });

    /**
     * Leverage Orb Component - Interactive power selection orbs
     */
    AFRAME.registerComponent('leverage-orb', {
        schema: {
            multiplier: { type: 'number', default: 2 },
            cost: { type: 'number', default: 100 },
            selected: { type: 'boolean', default: false }
        },

        init: function () {
            this.sphere = this.el.querySelector('a-sphere');

            this.el.addEventListener('mouseenter', this.onHover.bind(this));
            this.el.addEventListener('mouseleave', this.onLeave.bind(this));
        },

        onHover: function () {
            if (this.sphere) {
                this.sphere.setAttribute('material', 'emissiveIntensity', 0.8);
                this.el.setAttribute('scale', '1.2 1.2 1.2');
            }
        },

        onLeave: function () {
            if (this.sphere && !this.data.selected) {
                this.sphere.setAttribute('material', 'emissiveIntensity', 0.4);
                this.el.setAttribute('scale', '1 1 1');
            }
        }
    });

    /**
     * Floating Animation Component
     */
    AFRAME.registerComponent('float', {
        schema: {
            amplitude: { type: 'number', default: 0.1 },
            speed: { type: 'number', default: 1000 }
        },

        init: function () {
            const pos = this.el.getAttribute('position');
            this.el.setAttribute('animation', {
                property: 'position',
                to: `${pos.x} ${pos.y + this.data.amplitude} ${pos.z}`,
                dur: this.data.speed,
                easing: 'easeInOutSine',
                loop: true,
                dir: 'alternate'
            });
        }
    });

    /**
     * Glow Pulse Component
     */
    AFRAME.registerComponent('glow-pulse', {
        schema: {
            minIntensity: { type: 'number', default: 0.3 },
            maxIntensity: { type: 'number', default: 0.8 },
            speed: { type: 'number', default: 1000 }
        },

        init: function () {
            this.el.setAttribute('animation__glow', {
                property: 'material.emissiveIntensity',
                from: this.data.minIntensity,
                to: this.data.maxIntensity,
                dur: this.data.speed,
                easing: 'easeInOutSine',
                loop: true,
                dir: 'alternate'
            });
        }
    });

    /**
     * Look-At-Camera Component
     */
    AFRAME.registerComponent('look-at-camera', {
        init: function () {
            this.camera = document.querySelector('#camera');
        },

        tick: function () {
            if (this.camera) {
                const cameraPos = this.camera.getAttribute('position');
                this.el.object3D.lookAt(cameraPos.x, cameraPos.y, cameraPos.z);
            }
        }
    });

    /**
     * Score Panel Animation
     */
    AFRAME.registerComponent('score-panel', {
        init: function () {
            // Add subtle floating effect
            this.el.setAttribute('animation', {
                property: 'position',
                to: '0 2.85 -1',
                dur: 2000,
                easing: 'easeInOutSine',
                loop: true,
                dir: 'alternate'
            });
        }
    });

    console.log('✅ VR UI Components Registered');
}

/**
 * Create neon grid lines on the floor
 */
function createNeonGrid() {
    const gridContainer = document.getElementById('grid-lines');
    if (!gridContainer) return;

    const gridSize = 30;
    const spacing = 2;
    const halfSize = gridSize / 2;

    // Create grid lines
    for (let i = -halfSize; i <= halfSize; i += spacing) {
        // Horizontal lines
        const hLine = document.createElement('a-entity');
        hLine.setAttribute('geometry', `primitive: plane; width: ${gridSize}; height: 0.02`);
        hLine.setAttribute('material', 'color: #4a9eff; opacity: 0.15; shader: flat');
        hLine.setAttribute('rotation', '-90 0 0');
        hLine.setAttribute('position', `0 0 ${i}`);
        gridContainer.appendChild(hLine);

        // Vertical lines
        const vLine = document.createElement('a-entity');
        vLine.setAttribute('geometry', `primitive: plane; width: 0.02; height: ${gridSize}`);
        vLine.setAttribute('material', 'color: #4a9eff; opacity: 0.15; shader: flat');
        vLine.setAttribute('rotation', '-90 0 0');
        vLine.setAttribute('position', `${i} 0 0`);
        gridContainer.appendChild(vLine);
    }
}

// Create grid when scene loads
document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    if (scene) {
        if (scene.hasLoaded) {
            createNeonGrid();
        } else {
            scene.addEventListener('loaded', createNeonGrid);
        }
    }
});
