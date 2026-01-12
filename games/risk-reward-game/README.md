# Dream Tycoon VR 🥽

The immersive VR version of Dream Tycoon for **Meta Quest 3** and other WebXR-compatible headsets.

## 🎮 Quick Start

### Play Locally

```bash
cd vr
npx -y serve .
```

Open `http://localhost:3000` in your browser.

### Play on Meta Quest 3

1. Deploy to any static hosting (GitHub Pages, Vercel, Netlify)
2. Open the URL in Quest 3 browser
3. Click "Enter VR" button

### Local Development with Quest 3

```bash
# Start local server
cd vr
npx -y serve .

# In another terminal, forward port to Quest
adb reverse tcp:3000 tcp:3000
```

Then open `http://localhost:3000` in Quest browser.

## 🎯 Features

| Feature | Description |
|---------|-------------|
| **3D Casino Environment** | Neon-lit trading floor with ambient effects |
| **Leverage Orbs** | Touch/click glowing orbs to select power |
| **Giant Slot Machine** | Immersive market value display |
| **Hand Tracking** | Native Quest 3 hand tracking support |
| **Controller Support** | Laser pointer interaction |
| **Win Celebrations** | Confetti particles and room lighting effects |

## 🛠 Technology

- **A-Frame 1.6** - WebXR framework with Quest 3 support
- **WebXR Device API** - Native VR/AR browser API
- **Pure JavaScript** - No build step required

## 📁 Project Structure

```
vr/
├── index.html      # Main VR entry point
├── css/
│   └── style.css   # Loading screen & UI styles
├── js/
│   ├── game.js     # Core game logic
│   ├── ui.js       # A-Frame UI components
│   └── effects.js  # Particles & celebrations
└── assets/
    ├── sounds/     # Audio files (user-provided)
    └── README.md   # Asset requirements
```

## 🔊 Audio Setup

The game expects audio files in `assets/sounds/`. See [assets/README.md](assets/README.md) for details.

The game works without audio - sounds are optional but enhance immersion.

## 🌐 Deployment

### GitHub Pages

1. Push the `vr/` folder to your repo
2. Enable GitHub Pages in Settings
3. Access at `https://ly2xxx.github.io/VR/games/risk-reward-game/`

### Vercel

```bash
vercel --prod
```

## 📱 Browser Compatibility

| Platform | Status |
|----------|--------|
| Meta Quest 3 | ✅ Full VR + Hand Tracking |
| Meta Quest 2 | ✅ Full VR |
| Desktop Chrome/Firefox | ✅ 3D (no VR) |
| Mobile | ✅ 3D (gyroscope) |
