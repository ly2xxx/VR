/**
 * Dream Tycoon VR - Visual Effects
 * Particle systems, animations, and celebrations
 */

/**
 * Trigger win celebration effects
 */
window.triggerWinEffects = function () {
    // Activate confetti
    const confetti = document.getElementById('confetti-emitter');
    if (confetti) {
        confetti.setAttribute('visible', true);
        confetti.setAttribute('particle-system', 'enabled', true);

        // Disable after animation
        setTimeout(() => {
            confetti.setAttribute('particle-system', 'enabled', false);
            confetti.setAttribute('visible', false);
        }, 3000);
    }

    // Flash the room with green tint
    flashRoom('#4affaa', 500);

    // Pulse the score panel
    pulseElement('score-panel', 1.1, 300);
};

/**
 * Trigger loss effects
 */
function triggerLossEffects() {
    // Flash room with subtle red
    flashRoom('#ff4444', 300);
}

/**
 * Flash the room with a color overlay
 */
function flashRoom(color, duration) {
    const lights = document.querySelectorAll('a-light[type="point"]');
    const originalColors = [];

    lights.forEach((light, index) => {
        originalColors[index] = light.getAttribute('color');
        light.setAttribute('color', color);
    });

    setTimeout(() => {
        lights.forEach((light, index) => {
            light.setAttribute('color', originalColors[index]);
        });
    }, duration);
}

/**
 * Pulse an element's scale
 */
function pulseElement(elementId, scale, duration) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const originalScale = el.getAttribute('scale') || { x: 1, y: 1, z: 1 };

    el.setAttribute('animation__pulse', {
        property: 'scale',
        to: `${scale} ${scale} ${scale}`,
        dur: duration,
        easing: 'easeOutQuad'
    });

    setTimeout(() => {
        el.setAttribute('animation__pulse', {
            property: 'scale',
            to: `${originalScale.x} ${originalScale.y} ${originalScale.z}`,
            dur: duration,
            easing: 'easeInQuad'
        });
    }, duration);
}

/**
 * Create floating coin particles
 */
function createFloatingCoins(container, count = 10) {
    for (let i = 0; i < count; i++) {
        const coin = document.createElement('a-entity');
        const x = (Math.random() - 0.5) * 6;
        const y = Math.random() * 3 + 0.5;
        const z = (Math.random() - 0.5) * 6 - 2;

        coin.setAttribute('geometry', 'primitive: cylinder; radius: 0.08; height: 0.02');
        coin.setAttribute('material', 'color: #FFD700; metalness: 0.9; roughness: 0.1');
        coin.setAttribute('position', `${x} ${y} ${z}`);
        coin.setAttribute('rotation', `${Math.random() * 360} ${Math.random() * 360} 0`);
        coin.setAttribute('animation', {
            property: 'rotation',
            to: `${Math.random() * 360} ${Math.random() * 360 + 360} 0`,
            dur: 3000 + Math.random() * 2000,
            loop: true,
            easing: 'linear'
        });
        coin.setAttribute('animation__float', {
            property: 'position',
            to: `${x} ${y + 0.2} ${z}`,
            dur: 1000 + Math.random() * 1000,
            loop: true,
            dir: 'alternate',
            easing: 'easeInOutSine'
        });

        container.appendChild(coin);
    }
}

/**
 * Add ambient particle fog
 */
function addAmbientFog() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    const fog = document.createElement('a-entity');
    fog.setAttribute('id', 'ambient-fog');
    fog.setAttribute('position', '0 0 -3');
    fog.setAttribute('particle-system', {
        preset: 'dust',
        color: '#4a9eff, #764ba2',
        particleCount: 50,
        size: 0.03,
        opacity: 0.3,
        velocityValue: '0 0.1 0',
        accelerationValue: '0 0 0',
        maxAge: 10
    });

    scene.appendChild(fog);
}

/**
 * Initialize ambient effects
 */
function initAmbientEffects() {
    const effectsContainer = document.getElementById('effects-container');
    if (effectsContainer) {
        createFloatingCoins(effectsContainer, 8);
    }

    // Add subtle fog
    addAmbientFog();
}

// Initialize effects when scene loads
document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    if (scene) {
        if (scene.hasLoaded) {
            setTimeout(initAmbientEffects, 2000);
        } else {
            scene.addEventListener('loaded', () => {
                setTimeout(initAmbientEffects, 2000);
            });
        }
    }
});

// Export functions
window.triggerLossEffects = triggerLossEffects;
window.flashRoom = flashRoom;
window.pulseElement = pulseElement;
