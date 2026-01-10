# Meta Quest 3 Linux Desktop Setup Guide

Run a full Linux desktop environment on your Meta Quest 3 using Termux + proot-distro + Termux X11. This method is completely safe with **zero brick risk** as it runs entirely in userspace without modifying system partitions.

![Platform](https://img.shields.io/badge/Platform-Meta%20Quest%203-blue)
![Risk Level](https://img.shields.io/badge/Risk%20Level-None-green)
![Difficulty](https://img.shields.io/badge/Difficulty-Intermediate-yellow)

## Table of Contents

- [Overview](#overview)
- [What You'll Get](#what-youll-get)
- [Prerequisites](#prerequisites)
- [Part 1: Prepare Your PC](#part-1-prepare-your-pc)
- [Part 2: Enable Developer Mode on Quest 3](#part-2-enable-developer-mode-on-quest-3)
- [Part 3: Download Required APKs](#part-3-download-required-apks)
- [Part 4: Install APKs via ADB](#part-4-install-apks-via-adb)
- [Part 5: Disable Phantom Process Killer](#part-5-disable-phantom-process-killer)
- [Part 6: Initial Termux Setup](#part-6-initial-termux-setup)
- [Part 7: Install Linux Distribution](#part-7-install-linux-distribution)
- [Part 8: Install Desktop Environment](#part-8-install-desktop-environment)
- [Part 9: Create Launch Scripts](#part-9-create-launch-scripts)
- [Part 10: Launch Your Linux Desktop](#part-10-launch-your-linux-desktop)
- [Part 11: Essential Applications](#part-11-essential-applications)
- [Part 12: GPU Acceleration (Optional)](#part-12-gpu-acceleration-optional)
- [Part 13: Audio Setup](#part-13-audio-setup)
- [Troubleshooting](#troubleshooting)
- [Performance Tips](#performance-tips)
- [Useful Resources](#useful-resources)

---

## Overview

This guide uses a layered approach to run Linux on Quest 3:

```
┌─────────────────────────────────────┐
│         Your Linux Desktop          │  ← XFCE/LXQt/GNOME etc.
├─────────────────────────────────────┤
│     Linux Distribution (Ubuntu)     │  ← Full ARM64 Linux
├─────────────────────────────────────┤
│          proot-distro               │  ← Userspace container
├─────────────────────────────────────┤
│            Termux                   │  ← Android terminal emulator
├─────────────────────────────────────┤
│      Meta Horizon OS (Android)      │  ← Quest 3 operating system
└─────────────────────────────────────┘
```

**Why this method is safe:**
- Runs entirely in userspace (no root required)
- No system partition modifications
- Completely reversible (just uninstall the apps)
- Works on any Quest 3 firmware version

---

## What You'll Get

- ✅ Full Linux desktop environment (XFCE, LXQt, or others)
- ✅ Access to thousands of Linux applications
- ✅ Web browsers (Firefox, Chromium)
- ✅ Development tools (VS Code, Git, Python, Node.js, etc.)
- ✅ Office applications (LibreOffice)
- ✅ GPU acceleration via VirGL (experimental)
- ✅ Audio support via PulseAudio
- ✅ Network access (WiFi, Tailscale VPN)

---

## Prerequisites

### Hardware Required

| Item | Required | Notes |
|------|----------|-------|
| Meta Quest 3 | ✅ Yes | Any firmware version |
| PC (Windows/Mac/Linux) | ✅ Yes | For initial setup via ADB |
| USB-C Cable | ✅ Yes | Data-capable cable |
| Bluetooth Keyboard | 🔶 Highly Recommended | Physical keyboard essential for productivity |
| Bluetooth Mouse | 🔶 Highly Recommended | Much easier navigation |

### Software Required

| Software | Platform | Purpose |
|----------|----------|---------|
| ADB (Android Debug Bridge) | PC | Install apps and configure device |
| Meta Quest App | Mobile (iOS/Android) | Enable Developer Mode |

---

## Part 1: Prepare Your PC

### Windows

1. Download [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools)
2. Extract to a folder (e.g., `C:\platform-tools`)
3. Add to PATH:
   - Right-click "This PC" → Properties → Advanced System Settings
   - Environment Variables → Edit "Path" → Add `C:\platform-tools`
4. Open Command Prompt and verify:
   ```cmd
   adb version
   ```

### macOS

Using Homebrew:
```bash
brew install android-platform-tools
```

Verify installation:
```bash
adb version
```

### Linux

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install android-tools-adb
```

**Fedora:**
```bash
sudo dnf install android-tools
```

**Arch Linux:**
```bash
sudo pacman -S android-tools
```

Verify installation:
```bash
adb version
```

---

## Part 2: Enable Developer Mode on Quest 3

1. **Create Meta Developer Account:**
   - Go to https://developer.meta.com/
   - Sign in with your Meta account
   - Complete the developer registration (free)

2. **Enable Developer Mode:**
   - Open the **Meta Quest** app on your phone
   - Tap **Menu** (bottom right) → **Devices**
   - Select your Quest 3
   - Tap **Headset Settings** → **Developer Mode**
   - Toggle **Developer Mode** ON

3. **Verify USB Debugging:**
   - Connect Quest 3 to your PC via USB-C
   - Put on the headset - you'll see a prompt to "Allow USB debugging"
   - Check "Always allow from this computer"
   - Tap **Allow**

4. **Test the connection on your PC:**
   ```bash
   adb devices
   ```
   
   You should see something like:
   ```
   List of devices attached
   1WMHH123456789    device
   ```

---

## Part 3: Download Required APKs

Create a folder on your PC for the APKs:
```bash
mkdir quest3-linux
cd quest3-linux
```

### 1. Termux (Terminal Emulator)

⚠️ **IMPORTANT:** Do NOT use the Play Store version - it's outdated and won't work.

Download from GitHub Releases:
- Go to: https://github.com/termux/termux-app/releases
- Download: `termux-app_v0.118.x+github-debug_arm64-v8a.apk` (get the latest arm64-v8a version)

Or via command line:
```bash
# Check for latest version at the releases page
curl -L -o termux.apk "https://github.com/termux/termux-app/releases/download/v0.118.1/termux-app_v0.118.1+github-debug_arm64-v8a.apk"
```

### 2. Termux:X11 (X Server for Android)

Download from GitHub Releases:
- Go to: https://github.com/termux/termux-x11/releases
- Download: `termux-x11-arm64-v8a-debug.apk`

Or via command line:
```bash
# Get the latest release
curl -L -o termux-x11.apk "https://github.com/termux/termux-x11/releases/download/nightly/termux-x11-arm64-v8a-debug.apk"
```

---

## Part 4: Install APKs via ADB

With your Quest 3 connected:

```bash
# Install Termux
adb install termux.apk

# Install Termux X11
adb install termux-x11.apk
```

Expected output for each:
```
Performing Streamed Install
Success
```

**Finding the apps on Quest 3:**
1. Go to **App Library** (grid icon on your home bar)
2. Filter by **Unknown Sources** (dropdown at top)
3. You'll see Termux and Termux:X11

---

## Part 5: Disable Phantom Process Killer

Android 12+ aggressively kills background processes. Without disabling this, your Linux session will crash randomly.

Run these commands via ADB:

```bash
# Disable config sync for device_config
adb shell "/system/bin/device_config set_sync_disabled_for_tests persistent"

# Set max phantom processes to maximum
adb shell "/system/bin/device_config put activity_manager max_phantom_processes 2147483647"

# Disable phantom process monitoring
adb shell settings put global settings_enable_monitor_phantom_procs false
```

**Verify the settings:**
```bash
adb shell "/system/bin/device_config get activity_manager max_phantom_processes"
# Should return: 2147483647
```

> 💡 **Note:** These settings may reset after a Quest 3 reboot. You can create a script to reapply them quickly.

---

## Part 6: Initial Termux Setup

1. **Launch Termux** on your Quest 3 (from Unknown Sources in App Library)

2. **Grant storage permission** when prompted

3. **Update packages:**
   ```bash
   pkg update && pkg upgrade -y
   ```
   - Press `Y` and Enter when prompted

4. **Install essential repositories and packages:**
   ```bash
   # Install X11 repository
   pkg install x11-repo -y
   
   # Install core packages
   pkg install termux-x11-nightly pulseaudio proot-distro wget git nano -y
   ```

5. **Set up storage access:**
   ```bash
   termux-setup-storage
   ```
   - Grant permission when prompted
   - This creates symlinks to shared storage in `~/storage/`

---

## Part 7: Install Linux Distribution

### Available Distributions

| Distribution | Command | Notes |
|-------------|---------|-------|
| Ubuntu | `proot-distro install ubuntu` | Recommended for beginners, best compatibility |
| Debian | `proot-distro install debian` | Stable, lightweight |
| Arch Linux | `proot-distro install archlinux` | Rolling release, latest packages |
| Fedora | `proot-distro install fedora` | Modern, good hardware support |
| Alpine | `proot-distro install alpine` | Extremely lightweight, uses musl libc |

### Install Ubuntu (Recommended)

```bash
# List available distributions
proot-distro list

# Install Ubuntu
proot-distro install ubuntu
```

This downloads about 30-50MB and extracts to ~500MB.

### Test the installation

```bash
# Login to Ubuntu
proot-distro login ubuntu

# Verify you're in Ubuntu
cat /etc/os-release

# Update packages
apt update && apt upgrade -y

# Exit back to Termux
exit
```

---

## Part 8: Install Desktop Environment

### Option A: XFCE (Recommended - Lightweight)

XFCE is lightweight and works great on Quest 3.

```bash
# Login to Ubuntu
proot-distro login ubuntu

# Install XFCE and dependencies
apt update
apt install xfce4 xfce4-goodies xfce4-terminal dbus-x11 -y

# Install additional useful packages
apt install sudo nano htop neofetch -y

# Exit back to Termux
exit
```

### Option B: LXQt (Even Lighter)

```bash
proot-distro login ubuntu
apt update
apt install lxqt openbox dbus-x11 -y
exit
```

### Option C: MATE (More Features)

```bash
proot-distro login ubuntu
apt update
apt install mate-desktop-environment dbus-x11 -y
exit
```

---

## Part 9: Create Launch Scripts

Create convenient scripts to start your Linux desktop.

### Main Launch Script

In Termux (not inside proot):

```bash
cat > ~/start-linux.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

echo "🚀 Starting Quest 3 Linux Desktop..."

# Kill any existing X11 sessions
pkill -f "termux.x11" 2>/dev/null
pkill pulseaudio 2>/dev/null
sleep 1

# Start PulseAudio for audio support
echo "🔊 Starting PulseAudio..."
pulseaudio --start --load="module-native-protocol-tcp auth-ip-acl=127.0.0.1 auth-anonymous=1" --exit-idle-time=-1 2>/dev/null

# Export display variable
export DISPLAY=:1

# Start Termux X11 in background
echo "🖥️  Starting X11 server..."
termux-x11 :1 &
sleep 3

# Start the Linux desktop
echo "🐧 Starting XFCE desktop in Ubuntu..."
proot-distro login ubuntu --shared-tmp -- bash -c "
    export DISPLAY=:1
    export PULSE_SERVER=tcp:127.0.0.1:4713
    export XDG_RUNTIME_DIR=/tmp/runtime-root
    mkdir -p /tmp/runtime-root
    chmod 700 /tmp/runtime-root
    dbus-launch --exit-with-session startxfce4
"
EOF

chmod +x ~/start-linux.sh
```

### Quick Start Alias

Add to your Termux bashrc:

```bash
echo 'alias linux="~/start-linux.sh"' >> ~/.bashrc
source ~/.bashrc
```

Now you can just type `linux` to start your desktop.

### Stop Script

```bash
cat > ~/stop-linux.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
echo "🛑 Stopping Linux desktop..."
pkill -f "termux.x11"
pkill -f "xfce"
pkill pulseaudio
echo "✅ Stopped"
EOF

chmod +x ~/stop-linux.sh
echo 'alias stoplinux="~/stop-linux.sh"' >> ~/.bashrc
source ~/.bashrc
```

---

## Part 10: Launch Your Linux Desktop

1. **Start the desktop:**
   ```bash
   linux
   # or: ~/start-linux.sh
   ```

2. **Switch to Termux:X11:**
   - Press the Oculus button to go to your home
   - Open **Termux:X11** from your apps (Unknown Sources)
   - Your XFCE desktop should appear!

3. **First-time setup:**
   - The first launch may take a moment
   - Click "Use default config" if prompted by XFCE

4. **Using the desktop:**
   - Use your Bluetooth mouse to navigate
   - Use your Bluetooth keyboard for typing
   - Right-click on desktop for menu

### Switching Between Apps

- **To return to Termux:** Press Oculus button, select Termux from recents
- **To return to Linux desktop:** Select Termux:X11 from recents
- Keep Termux running in background (don't close it)

---

## Part 11: Essential Applications

### Web Browsers

```bash
proot-distro login ubuntu

# Firefox (recommended)
apt install firefox -y

# Chromium
apt install chromium-browser -y
# Run with: chromium-browser --no-sandbox
```

### Development Tools

```bash
# VS Code
# Download ARM64 .deb from https://code.visualstudio.com/download
cd /tmp
wget "https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-arm64" -O vscode.deb
dpkg -i vscode.deb
apt install -f -y  # Install dependencies

# Run VS Code with:
# code --no-sandbox

# Git
apt install git -y

# Python
apt install python3 python3-pip python3-venv -y

# Node.js
apt install nodejs npm -y

# Build essentials
apt install build-essential -y
```

### Office Suite

```bash
# LibreOffice
apt install libreoffice -y
```

### File Management

```bash
# Thunar (usually included with XFCE)
apt install thunar -y

# Archive manager
apt install file-roller -y
```

### Media

```bash
# VLC Media Player
apt install vlc -y

# Image viewer
apt install gpicview -y

# GIMP
apt install gimp -y
```

### Utilities

```bash
# System monitor
apt install htop btop -y

# Screenshot tool
apt install scrot -y

# Text editors
apt install gedit mousepad -y
```

---

## Part 12: GPU Acceleration (Optional)

Enable experimental GPU acceleration using VirGL.

### Setup

In Termux (not inside proot):

```bash
# Install VirGL server
pkg install virglrenderer-android -y
```

### Modified Launch Script with GPU

```bash
cat > ~/start-linux-gpu.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

echo "🚀 Starting Quest 3 Linux Desktop with GPU..."

# Kill existing sessions
pkill -f "termux.x11" 2>/dev/null
pkill -f "virgl" 2>/dev/null
pkill pulseaudio 2>/dev/null
sleep 1

# Start VirGL server
echo "🎮 Starting VirGL GPU server..."
virgl_test_server_android &
sleep 2

# Start PulseAudio
echo "🔊 Starting PulseAudio..."
pulseaudio --start --load="module-native-protocol-tcp auth-ip-acl=127.0.0.1 auth-anonymous=1" --exit-idle-time=-1 2>/dev/null

# Export variables
export DISPLAY=:1
export GALLIUM_DRIVER=virpipe

# Start X11
echo "🖥️  Starting X11 server..."
termux-x11 :1 &
sleep 3

# Start desktop with GPU
echo "🐧 Starting XFCE with GPU acceleration..."
proot-distro login ubuntu --shared-tmp -- bash -c "
    export DISPLAY=:1
    export PULSE_SERVER=tcp:127.0.0.1:4713
    export GALLIUM_DRIVER=virpipe
    export XDG_RUNTIME_DIR=/tmp/runtime-root
    mkdir -p /tmp/runtime-root
    chmod 700 /tmp/runtime-root
    dbus-launch --exit-with-session startxfce4
"
EOF

chmod +x ~/start-linux-gpu.sh
echo 'alias linuxgpu="~/start-linux-gpu.sh"' >> ~/.bashrc
```

### Test GPU Acceleration

Inside your Linux desktop terminal:

```bash
# Install testing tools
apt install mesa-utils -y

# Test OpenGL
glxinfo | grep "OpenGL renderer"
# Should show "virgl" if working

# Visual test
glxgears
```

---

## Part 13: Audio Setup

Audio should work with the launch scripts above. Here's how to troubleshoot or manually configure.

### Test Audio

In your Linux desktop terminal:

```bash
# Install audio tools
apt install alsa-utils pulseaudio-utils -y

# Test audio
speaker-test -c 2 -t wav

# Or install a sound player
apt install mpv -y
mpv /usr/share/sounds/alsa/Front_Center.wav
```

### Volume Control

```bash
# Install pavucontrol for GUI volume control
apt install pavucontrol -y
pavucontrol
```

---

## Troubleshooting

### "Session terminated" or Crashes

**Cause:** Phantom Process Killer is active

**Solution:** Reapply the settings from Part 5:
```bash
adb shell "/system/bin/device_config set_sync_disabled_for_tests persistent"
adb shell "/system/bin/device_config put activity_manager max_phantom_processes 2147483647"
adb shell settings put global settings_enable_monitor_phantom_procs false
```

### Black Screen in Termux:X11

**Solution 1:** Wait a few seconds, the desktop may be loading

**Solution 2:** Restart the script:
```bash
pkill -f termux.x11
~/start-linux.sh
```

**Solution 3:** Check if X11 started properly:
```bash
ps aux | grep termux-x11
```

### "DISPLAY not set" Error

**Solution:** Export the display variable before running graphical apps:
```bash
export DISPLAY=:1
```

### Keyboard Not Working

**Solution 1:** Make sure Bluetooth keyboard is connected to Quest 3 (Settings → Devices → Bluetooth)

**Solution 2:** Use the on-screen keyboard:
- In Termux:X11, three-finger tap shows/hides virtual keyboard

### No Sound

**Solution 1:** Restart PulseAudio:
```bash
pkill pulseaudio
pulseaudio --start --load="module-native-protocol-tcp auth-ip-acl=127.0.0.1 auth-anonymous=1" --exit-idle-time=-1
```

**Solution 2:** Check PULSE_SERVER is set:
```bash
export PULSE_SERVER=tcp:127.0.0.1:4713
```

### Slow Performance

**Tips:**
- Close other Quest apps
- Use XFCE or LXQt instead of GNOME/KDE
- Disable desktop effects in XFCE settings
- Reduce screen resolution in Termux:X11 preferences

### Can't Install Packages

**Solution:** Update package lists:
```bash
apt update
apt upgrade
apt install -f  # Fix broken dependencies
```

---

## Performance Tips

### Desktop Environment

| DE | RAM Usage | Recommended |
|----|-----------|-------------|
| XFCE | ~300-400MB | ✅ Yes |
| LXQt | ~250-350MB | ✅ Yes |
| MATE | ~400-500MB | ✅ Yes |
| GNOME | ~800MB+ | ❌ Too heavy |
| KDE | ~700MB+ | ❌ Too heavy |

### Optimise XFCE

1. **Disable compositor:**
   - Settings → Window Manager Tweaks → Compositor → Disable

2. **Reduce animations:**
   - Settings → Window Manager → Disable title bar animations

3. **Use simpler theme:**
   - Settings → Appearance → Use Greybird or Adwaita

### Memory Management

```bash
# Check memory usage
free -h

# Clear cache
sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
```

---

## Useful Resources

### Official Documentation

- [Termux Wiki](https://wiki.termux.com/)
- [proot-distro GitHub](https://github.com/termux/proot-distro)
- [Termux:X11 GitHub](https://github.com/termux/termux-x11)

### Community Resources

- [Termux Reddit](https://reddit.com/r/termux)
- [Quest 3 Hacking Platform Guide](https://github.com/Pyro57000/quest3_hacking_platform)
- [Termux Desktops Scripts](https://github.com/LinuxDroidMaster/Termux-Desktops)

### Benchmarks

Expected performance (UnixBench):

| Environment | Single-core | Multi-core |
|-------------|-------------|------------|
| Quest 3 (Termux native) | 551 | 2086 |
| Quest 3 (proot Ubuntu) | 254 | 1198 |

This is comparable to a mid-range laptop from ~2018.

---

## Credits

- Termux team for the excellent Android terminal
- proot-distro maintainers
- Termux:X11 developers
- Community guides from [kazuho](https://gist.github.com/kazuho/2432b0dce057b34488de4e5e7b356cad) and others

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-10 | 1.0 | Initial comprehensive guide |

---

## License

This guide is released under the MIT License. Feel free to share and adapt.
