/**
 * Dream Tycoon VR - Core Game Logic
 * Ported from leverage_game.py
 */

// Leverage Options: multiplier -> cost
const LEVERAGE_OPTIONS = {
    2: 100,
    3: 200,
    4: 300,
    5: 400,
    6: 500,
    7: 600,
    8: 700
};

// Game State
const gameState = {
    capital: 1000,
    insolvent: false,
    marketOpen: false,
    currentValuation: 0,
    selectedLeverage: null,
    history: [],
    marketInterval: null
};

// DOM References (A-Frame entities)
let scoreValueEl, leverageAreaEl, marketAreaEl, slotValueEl;
let catchHintEl, startBtnEl, catchBtnEl, backBtnEl;
let insolventScreenEl, resultDisplayEl, confettiEl;

/**
 * Initialize game when scene is loaded
 * Multiple fallbacks for Quest 3 browser compatibility
 */
(function () {
    let initialized = false;

    function runInit() {
        if (initialized) return;
        initialized = true;
        window.gameInitialized = true;
        console.log('🎮 Dream Tycoon VR Initializing...');
        initGame();
    }

    function tryInit() {
        const scene = document.querySelector('a-scene');
        if (!scene) {
            // Scene not in DOM yet, try again
            requestAnimationFrame(tryInit);
            return;
        }

        if (scene.hasLoaded) {
            runInit();
        } else {
            scene.addEventListener('loaded', runInit);
        }
    }

    // Primary: DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }

    // Fallback 1: Window load event (fires after all resources)
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!initialized) {
                console.warn('⚠️ Fallback 1: Window load timeout, forcing start...');
                runInit();
            }
        }, 2000);
    });

    // Fallback 2: Absolute timeout (Quest 3 may be slow)
    setTimeout(() => {
        if (!initialized) {
            console.warn('⚠️ Fallback 2: Absolute timeout (6s), forcing start...');

            // FORCE THE SCENE TO BE "LOADED"
            const scene = document.querySelector('a-scene');
            if (scene && !scene.hasLoaded) {
                console.warn('⚡ FORCING scene.emit("loaded") to unlock A-Frame render loop');
                scene.emit('loaded');
            }

            runInit();
        }
    }, 5000);
})();

/**
 * Initialize game elements and state
 */
function initGame() {
    console.log('🎮 Dream Tycoon VR Initializing...');

    // Get DOM references
    scoreValueEl = document.getElementById('score-value');
    leverageAreaEl = document.getElementById('leverage-area');
    marketAreaEl = document.getElementById('market-area');
    slotValueEl = document.getElementById('slot-value-current');
    catchHintEl = document.getElementById('catch-hint');
    startBtnEl = document.getElementById('start-btn');
    catchBtnEl = document.getElementById('catch-btn');
    backBtnEl = document.getElementById('back-btn');
    insolventScreenEl = document.getElementById('insolvent-screen');
    resultDisplayEl = document.getElementById('result-display');
    confettiEl = document.getElementById('confetti-emitter');

    // Create leverage orbs
    createLeverageOrbs();

    // Setup button listeners
    setupButtonListeners();

    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1500);

    // Update initial score display
    updateScoreDisplay();

    console.log('✅ Dream Tycoon VR Ready!');
}

/**
 * Create leverage selection orbs
 */
function createLeverageOrbs() {
    const container = document.getElementById('leverage-orbs');
    if (!container) return;

    const leverages = Object.keys(LEVERAGE_OPTIONS);
    const totalWidth = leverages.length * 0.5;
    const startX = -totalWidth / 2 + 0.25;

    leverages.forEach((lev, index) => {
        const multiplier = parseInt(lev);
        const cost = LEVERAGE_OPTIONS[multiplier];
        const x = startX + (index * 0.5);

        // Create orb entity
        const orb = document.createElement('a-entity');
        orb.setAttribute('id', `leverage-orb-${multiplier}`);
        orb.setAttribute('class', 'clickable leverage-orb');
        orb.setAttribute('position', `${x} 0 0`);
        orb.setAttribute('data-multiplier', multiplier);
        orb.setAttribute('data-cost', cost);

        // Orb sphere with glow
        const sphere = document.createElement('a-sphere');
        sphere.setAttribute('radius', '0.15');
        sphere.setAttribute('color', getOrbColor(multiplier));
        sphere.setAttribute('material', `emissive: ${getOrbColor(multiplier)}; emissiveIntensity: 0.4`);
        sphere.setAttribute('animation__hover', 'property: position; to: 0 0.05 0; dur: 1000; easing: easeInOutSine; loop: true; dir: alternate');

        // Multiplier text
        const text = document.createElement('a-text');
        text.setAttribute('value', `x${multiplier}`);
        text.setAttribute('color', '#fff');
        text.setAttribute('align', 'center');
        text.setAttribute('position', '0 0.28 0');
        text.setAttribute('width', '1');

        // Cost text
        const costText = document.createElement('a-text');
        costText.setAttribute('value', `-$${cost}`);
        costText.setAttribute('color', '#ff9999');
        costText.setAttribute('align', 'center');
        costText.setAttribute('position', '0 -0.28 0');
        costText.setAttribute('width', '0.8');

        orb.appendChild(sphere);
        orb.appendChild(text);
        orb.appendChild(costText);
        container.appendChild(orb);

        // Add click listener
        orb.addEventListener('click', () => selectLeverage(multiplier));
    });
}

/**
 * Get color for leverage orb based on risk level
 */
function getOrbColor(multiplier) {
    const colors = {
        2: '#4affaa', // Green - Safe
        3: '#4aff4a',
        4: '#aaff4a',
        5: '#ffff4a', // Yellow - Medium
        6: '#ffaa4a',
        7: '#ff6a4a',
        8: '#ff4a4a'  // Red - Risky
    };
    return colors[multiplier] || '#4a9eff';
}

/**
 * Setup button click listeners
 */
function setupButtonListeners() {
    // Start market button
    if (startBtnEl) {
        startBtnEl.addEventListener('click', startMarket);
    }

    // Catch button
    if (catchBtnEl) {
        catchBtnEl.addEventListener('click', catchValue);
    }

    // Back button
    if (backBtnEl) {
        backBtnEl.addEventListener('click', goBack);
    }

    // Restart button
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
}

/**
 * Select a leverage multiplier
 */
function selectLeverage(multiplier) {
    const cost = LEVERAGE_OPTIONS[multiplier];
    const remaining = gameState.capital - cost;

    if (remaining <= 0) {
        showToast('Not enough funds for this power!', 'loss');
        return;
    }

    gameState.selectedLeverage = multiplier;
    gameState.marketOpen = false;

    // Update UI
    leverageAreaEl.setAttribute('visible', false);
    marketAreaEl.setAttribute('visible', true);

    // Update market title
    const marketTitle = document.getElementById('market-title');
    if (marketTitle) {
        marketTitle.setAttribute('value', `🌊 POWER x${multiplier} SELECTED! 🌊`);
    }

    // Reset buttons
    startBtnEl.setAttribute('visible', true);
    catchBtnEl.setAttribute('visible', false);

    // Play select sound
    playSound('sfx-select');

    console.log(`Selected leverage: x${multiplier} (cost: $${cost})`);
}

/**
 * Start the market simulation
 */
function startMarket() {
    if (!gameState.selectedLeverage) return;

    gameState.marketOpen = true;

    // Hide start, show catch
    startBtnEl.setAttribute('visible', false);
    catchBtnEl.setAttribute('visible', true);

    // Play spin sound
    playSound('sfx-spin');

    // Start market fluctuation
    const cost = LEVERAGE_OPTIONS[gameState.selectedLeverage];
    const maxValue = gameState.capital - cost;

    gameState.marketInterval = setInterval(() => {
        if (!gameState.marketOpen) {
            clearInterval(gameState.marketInterval);
            return;
        }

        // Random market value
        gameState.currentValuation = Math.floor(Math.random() * (maxValue + 1));
        updateMarketDisplay();
    }, 100);
}

/**
 * Update the slot machine display
 */
function updateMarketDisplay() {
    const current = gameState.currentValuation;
    const leverage = gameState.selectedLeverage;
    const result = current * leverage;

    // Update slot values
    if (slotValueEl) {
        slotValueEl.setAttribute('value', `$${current.toLocaleString()}`);
    }

    const prevEl = document.getElementById('slot-value-prev');
    const nextEl = document.getElementById('slot-value-next');
    if (prevEl) prevEl.setAttribute('value', `$${Math.max(0, current - 50).toLocaleString()}`);
    if (nextEl) nextEl.setAttribute('value', `$${(current + 50).toLocaleString()}`);

    // Update hint based on potential result
    if (catchHintEl) {
        if (result > gameState.capital) {
            catchHintEl.setAttribute('value', '🔥 WINNING ZONE! 🔥');
            catchHintEl.setAttribute('color', '#4affaa');
        } else {
            catchHintEl.setAttribute('value', '❄️ looking for a wave... ❄️');
            catchHintEl.setAttribute('color', '#888');
        }
    }
}

/**
 * Catch the current market value
 */
function catchValue() {
    if (!gameState.marketOpen) return;

    // Stop market
    gameState.marketOpen = false;
    clearInterval(gameState.marketInterval);

    const leverage = gameState.selectedLeverage;
    const cost = LEVERAGE_OPTIONS[leverage];
    const lockedValue = gameState.currentValuation;
    const newCapital = lockedValue * leverage;
    const oldCapital = gameState.capital;
    const profit = newCapital - oldCapital;

    // Record history
    gameState.history.push({
        leverage,
        cost,
        lockedValue,
        result: newCapital,
        oldCapital
    });

    // Update capital
    gameState.capital = newCapital;

    // Show result
    showResult(profit, lockedValue, leverage, newCapital);

    // Check insolvency
    const minCost = Math.min(...Object.values(LEVERAGE_OPTIONS));
    if (gameState.capital < minCost) {
        gameState.insolvent = true;
        setTimeout(() => showInsolvency(), 2000);
    } else {
        // Return to leverage selection after delay
        setTimeout(() => {
            resultDisplayEl.setAttribute('visible', false);
            marketAreaEl.setAttribute('visible', false);
            leverageAreaEl.setAttribute('visible', true);
            gameState.selectedLeverage = null;
            updateLeverageOrbs();
        }, 2500);
    }

    // Update score
    updateScoreDisplay();
}

/**
 * Show the round result
 */
function showResult(profit, lockedValue, leverage, newCapital) {
    resultDisplayEl.setAttribute('visible', true);

    const resultText = document.getElementById('result-text');

    if (profit > 0) {
        resultText.setAttribute('value', `🎉 PROFIT! +$${profit.toLocaleString()}\n$${lockedValue.toLocaleString()} × ${leverage} = $${newCapital.toLocaleString()}`);
        resultText.setAttribute('color', '#4affaa');

        // Trigger win effects
        triggerWinEffects();
        playSound('sfx-win');
        showToast(`+$${profit.toLocaleString()} Profit!`, 'win');
    } else {
        resultText.setAttribute('value', `📉 Loss: $${Math.abs(profit).toLocaleString()}\n$${lockedValue.toLocaleString()} × ${leverage} = $${newCapital.toLocaleString()}`);
        resultText.setAttribute('color', '#ff6666');

        playSound('sfx-loss');
        showToast(`-$${Math.abs(profit).toLocaleString()} Loss`, 'loss');
    }
}

/**
 * Update score display
 */
function updateScoreDisplay() {
    if (scoreValueEl) {
        scoreValueEl.setAttribute('value', `$${gameState.capital.toLocaleString()}`);
    }
}

/**
 * Update leverage orbs based on affordability
 */
function updateLeverageOrbs() {
    Object.keys(LEVERAGE_OPTIONS).forEach(lev => {
        const multiplier = parseInt(lev);
        const cost = LEVERAGE_OPTIONS[multiplier];
        const orb = document.getElementById(`leverage-orb-${multiplier}`);

        if (orb) {
            const canAfford = gameState.capital - cost > 0;
            const sphere = orb.querySelector('a-sphere');
            if (sphere) {
                if (canAfford) {
                    sphere.setAttribute('opacity', 1);
                    sphere.setAttribute('material', `emissive: ${getOrbColor(multiplier)}; emissiveIntensity: 0.4`);
                } else {
                    sphere.setAttribute('opacity', 0.3);
                    sphere.setAttribute('material', `emissive: #333; emissiveIntensity: 0.1`);
                }
            }
        }
    });
}

/**
 * Go back to leverage selection
 */
function goBack() {
    gameState.marketOpen = false;
    gameState.selectedLeverage = null;
    clearInterval(gameState.marketInterval);

    marketAreaEl.setAttribute('visible', false);
    leverageAreaEl.setAttribute('visible', true);
}

/**
 * Show insolvency screen
 */
function showInsolvency() {
    marketAreaEl.setAttribute('visible', false);
    leverageAreaEl.setAttribute('visible', false);
    resultDisplayEl.setAttribute('visible', false);
    insolventScreenEl.setAttribute('visible', true);
}

/**
 * Restart the game
 */
function restartGame() {
    gameState.capital = 1000;
    gameState.insolvent = false;
    gameState.marketOpen = false;
    gameState.currentValuation = 0;
    gameState.selectedLeverage = null;
    gameState.history = [];

    insolventScreenEl.setAttribute('visible', false);
    marketAreaEl.setAttribute('visible', false);
    leverageAreaEl.setAttribute('visible', true);

    updateScoreDisplay();
    updateLeverageOrbs();

    playSound('sfx-select');
}

/**
 * Play a sound effect
 */
function playSound(id) {
    const audio = document.getElementById(id);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => { }); // Ignore autoplay restrictions
    }
}

/**
 * Show a toast notification
 */
function showToast(message, type = '') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Export for effects.js
window.gameState = gameState;
window.triggerWinEffects = function () {
    // Will be implemented in effects.js
};
