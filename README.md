# VR Development &amp; Customisation

A collection of guides and resources for VR headset customisation and development.

## 🎮 Quest 3 Linux Desktop

Run a full Linux desktop environment on your Meta Quest 3 using Termux + proot-distro. **Zero brick risk** - runs entirely in userspace.

### Quick Start (5-minute setup)

After installing 
[Termux](https://github.com/termux/termux-app/releases) => download termux-app_v0.119.0-beta.3+apt-android-7-github-debug_arm64-v8a.apk
and [Termux:X11](https://github.com/termux/termux-x11/releases) => download app-arm64-v8a-debug.apk
APKs on your Quest 3. **Termux** provides the Linux system, while **Termux:X11** displays the graphical desktop.

```bash
# Run this in Termux on your Quest 3
curl -fsSL https://raw.githubusercontent.com/ly2xxx/VR/main/scripts/quest3-linux-setup.sh | bash
```

> 💡 **Tip:** Open this page in the **Meta Quest Browser**, copy the command above, then switch to Termux and **long-press (hold trigger)** anywhere in the terminal to paste.

Wait until you see **"Setup Complete!"**. This may take a few minutes.

Then restart Termux, or run:
```bash
source ~/.bashrc
```

If you get a "No such file" error, the installation likely didn't finish. Try running the setup command again.

To actully start your desktop, type: `linux` (or `./start-linux.sh`)

### What You Get

- ✅ Full XFCE Linux desktop
- ✅ Firefox browser
- ✅ Development tools (VS Code, Git, Python, Node.js)
- ✅ Office applications (LibreOffice)
- ✅ GPU acceleration (experimental)
- ✅ Audio support

### Documentation

| Document | Description |
|----------|-------------|
| [Quest 3 Linux Desktop Setup Guide](docs/quest3-linux-desktop-setup.md) | Complete step-by-step setup with troubleshooting |
| [Setup Script](scripts/quest3-linux-setup.sh) | Automated installation script |

### Prerequisites

- Meta Quest 3 (any firmware version)
- Developer Mode enabled
- PC with ADB for initial setup
- Bluetooth keyboard &amp; mouse (recommended)

### Important: Disable Phantom Process Killer

Before using, run these via ADB on your PC to prevent session crashes:

```bash
adb shell "/system/bin/device_config set_sync_disabled_for_tests persistent"
adb shell "/system/bin/device_config put activity_manager max_phantom_processes 2147483647"
adb shell settings put global settings_enable_monitor_phantom_procs false
```

---

## 📁 Repository Contents

```
VR/
├── docs/
│   └── quest3-linux-desktop-setup.md   # Comprehensive setup guide
├── scripts/
│   └── quest3-linux-setup.sh           # Automated setup script
└── README.md
```

## 🤝 Contributing

Feel free to submit issues and pull requests for improvements or additional guides.

## 📄 License

MIT License

## 🔗 Resources

- [Termux Wiki](https://wiki.termux.com/)
- [proot-distro](https://github.com/termux/proot-distro)
- [Termux:X11](https://github.com/termux/termux-x11)
- [Termux Desktops Community Scripts](https://github.com/LinuxDroidMaster/Termux-Desktops)
![alt text](hq720.jpg) ![alt text](<Screenshot 2026-01-13 201511.png>)