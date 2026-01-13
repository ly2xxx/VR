# VR Desktop for Quest 3

A lightweight virtual desktop solution that streams your Windows PC screen to your Quest 3 headset over local WiFi. Built with WebXR + WebRTC - **no sideloading required!**

![Virtual Desktop](https://img.shields.io/badge/WebXR-Ready-blue) ![Quest 3](https://img.shields.io/badge/Quest%203-Compatible-green)

## ✨ Features

- 🖥️ **Screen Streaming** - View your entire Windows desktop in VR
- 📐 **Ultrawide Support** - Switch between 16:9, 21:9, and 32:9 aspect ratios
- 🌀 **Curved/Flat Screen** - Toggle curved display for immersion
- 🎮 **VR Controls** - Adjust screen distance and size with controllers
- 🔒 **Local Only** - Runs entirely on your WiFi, no cloud services

## 🚀 Quick Start

### 1. On Your Windows PC

```bash
cd virtual-desktop/server
npm install
npm start
```

Open Chrome and go to `http://localhost:3000/streamer.html`, then click **"Start Screen Share"**.

### 2. On Your Quest 3

1. Open the Quest browser
2. Navigate to `http://[YOUR_PC_IP]:3000/client/`  
   *(The server console shows your PC's IP addresses)*
3. Click **"Connect to Desktop"**
4. Click **"Enter VR Mode"** 🥽

## 📊 Aspect Ratio Controls

| Button | Ratio | Best For |
|--------|-------|----------|
| 16:9 | Standard | General use, movies |
| 21:9 | Ultrawide | Productivity, coding |
| 32:9 | Super Ultrawide | Multi-window workflows |

## ⌨️ Keyboard Shortcuts (Desktop Testing)

- `1` / `2` / `3` - Switch aspect ratio
- `C` - Toggle curved screen
- `↑` / `↓` - Adjust distance

## 📁 Project Structure

```
virtual-desktop/
├── server/
│   ├── server.js           # WebSocket signaling server
│   ├── package.json        # Node.js dependencies
│   └── public/
│       └── streamer.html   # PC streaming page
└── client/
    ├── index.html          # Quest connection page
    ├── vr-desktop.html     # WebXR VR scene
    ├── css/style.css       # UI styling
    └── js/
        ├── webrtc-client.js    # WebRTC receiver
        └── screen-controls.js  # VR interaction
```

## 🔧 Requirements

- **PC**: Windows 10/11, Node.js 18+, Chrome browser
- **Quest 3**: Any firmware (bootloaded OK)
- **Network**: Both devices on same WiFi (5GHz recommended)

## 🔗 References

This project builds on these open-source technologies:

- [A-Frame](https://github.com/aframevr/aframe) - WebXR framework
- [Three.js](https://github.com/mrdoob/three.js) - 3D graphics library  
- [WebRTC API](https://webrtc.org/) - Real-time communication
- [ALVR](https://github.com/alvr-org/ALVR) - Alternative for VR gaming
- [WiVRn](https://github.com/WiVRn/WiVRn) - Linux PCVR streaming

## 🐛 Troubleshooting

**"Server not found" on Quest**
- Ensure PC and Quest are on the same WiFi network
- Try the IP address shown in server console
- Disable Windows Firewall temporarily

**Stream not appearing**
- Make sure you clicked "Start Screen Share" on PC first
- Check that Chrome has screen share permission
- Try refreshing the Quest browser page

**High latency**
- Use 5GHz WiFi band
- Connect PC via Ethernet to router
- Close bandwidth-heavy apps

## 📄 License

MIT License - Feel free to modify and share!
