#!/data/data/com.termux/files/usr/bin/bash
#
# Quest 3 Linux Desktop - Quick Setup Script
# Repository: https://github.com/ly2xxx/VR
#
# This script automates the Termux setup for running Linux on Quest 3
# Run this inside Termux after installing it on your Quest 3
#
# Usage: curl -fsSL https://raw.githubusercontent.com/ly2xxx/VR/main/scripts/quest3-linux-setup.sh | bash
#

set -e

echo "=============================================="
echo "  Quest 3 Linux Desktop - Quick Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Step 1: Update Termux packages
print_step "Updating Termux packages..."
pkg update -y && pkg upgrade -y
print_success "Packages updated"

# Step 2: Install X11 repository
print_step "Installing X11 repository..."
pkg install x11-repo -y
print_success "X11 repository installed"

# Step 3: Install required packages
print_step "Installing required packages..."
pkg install termux-x11-nightly pulseaudio proot-distro wget git nano htop -y
print_success "Required packages installed"

# Step 4: Set up storage access
print_step "Setting up storage access..."
termux-setup-storage || true
print_success "Storage access configured"

# Step 5: Install Ubuntu
print_step "Installing Ubuntu distribution (this may take a few minutes)..."
proot-distro install ubuntu
print_success "Ubuntu installed"

# Step 6: Install XFCE in Ubuntu
print_step "Installing XFCE desktop environment in Ubuntu..."
proot-distro login ubuntu -- bash -c "
    apt update
    apt upgrade -y
    apt install xfce4 xfce4-goodies xfce4-terminal dbus-x11 sudo nano htop neofetch firefox -y
"
print_success "XFCE desktop installed"

# Step 7: Create launch script
print_step "Creating launch scripts..."

cat > ~/start-linux.sh << 'STARTSCRIPT'
#!/data/data/com.termux/files/usr/bin/bash

echo "🚀 Starting Quest 3 Linux Desktop..."

# Kill any existing sessions
pkill -f "termux.x11" 2>/dev/null
pkill pulseaudio 2>/dev/null
sleep 1

# Start PulseAudio
echo "🔊 Starting PulseAudio..."
pulseaudio --start --load="module-native-protocol-tcp auth-ip-acl=127.0.0.1 auth-anonymous=1" --exit-idle-time=-1 2>/dev/null

# Set display
export DISPLAY=:1

# Start Termux X11
echo "🖥️  Starting X11 server..."
termux-x11 :1 &
sleep 3

# Start desktop
echo "🐧 Starting XFCE desktop..."
proot-distro login ubuntu --shared-tmp -- bash -c "
    export DISPLAY=:1
    export PULSE_SERVER=tcp:127.0.0.1:4713
    export XDG_RUNTIME_DIR=/tmp/runtime-root
    mkdir -p /tmp/runtime-root
    chmod 700 /tmp/runtime-root
    dbus-launch --exit-with-session startxfce4
"
STARTSCRIPT

chmod +x ~/start-linux.sh

# Create stop script
cat > ~/stop-linux.sh << 'STOPSCRIPT'
#!/data/data/com.termux/files/usr/bin/bash
echo "🛑 Stopping Linux desktop..."
pkill -f "termux.x11"
pkill -f "xfce"
pkill pulseaudio
echo "✅ Stopped"
STOPSCRIPT

chmod +x ~/stop-linux.sh

# Create GPU version
cat > ~/start-linux-gpu.sh << 'GPUSCRIPT'
#!/data/data/com.termux/files/usr/bin/bash

echo "🚀 Starting Quest 3 Linux Desktop with GPU..."

pkill -f "termux.x11" 2>/dev/null
pkill -f "virgl" 2>/dev/null
pkill pulseaudio 2>/dev/null
sleep 1

# Start VirGL if available
if command -v virgl_test_server_android &> /dev/null; then
    echo "🎮 Starting VirGL..."
    virgl_test_server_android &
    sleep 2
    export GALLIUM_DRIVER=virpipe
fi

echo "🔊 Starting PulseAudio..."
pulseaudio --start --load="module-native-protocol-tcp auth-ip-acl=127.0.0.1 auth-anonymous=1" --exit-idle-time=-1 2>/dev/null

export DISPLAY=:1

echo "🖥️  Starting X11..."
termux-x11 :1 &
sleep 3

echo "🐧 Starting XFCE..."
proot-distro login ubuntu --shared-tmp -- bash -c "
    export DISPLAY=:1
    export PULSE_SERVER=tcp:127.0.0.1:4713
    export GALLIUM_DRIVER=virpipe
    export XDG_RUNTIME_DIR=/tmp/runtime-root
    mkdir -p /tmp/runtime-root
    chmod 700 /tmp/runtime-root
    dbus-launch --exit-with-session startxfce4
"
GPUSCRIPT

chmod +x ~/start-linux-gpu.sh

# Add aliases to bashrc
echo '' >> ~/.bashrc
echo '# Quest 3 Linux Desktop aliases' >> ~/.bashrc
echo 'alias linux="~/start-linux.sh"' >> ~/.bashrc
echo 'alias linuxgpu="~/start-linux-gpu.sh"' >> ~/.bashrc
echo 'alias stoplinux="~/stop-linux.sh"' >> ~/.bashrc

print_success "Launch scripts created"

# Install VirGL for GPU acceleration
print_step "Installing VirGL for GPU acceleration..."
pkg install virglrenderer-android -y || print_warning "VirGL installation skipped"
print_success "VirGL installed"

echo ""
echo "=============================================="
echo -e "${GREEN}  Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "To start your Linux desktop:"
echo "  1. Type: linux (or: ~/start-linux.sh)"
echo "  2. Switch to the Termux:X11 app"
echo ""
echo "For GPU acceleration (experimental):"
echo "  Type: linuxgpu"
echo ""
echo "To stop the desktop:"
echo "  Type: stoplinux"
echo ""
echo "=============================================="
echo -e "${YELLOW}IMPORTANT:${NC} Before first use, run these commands"
echo "via ADB on your PC to prevent session crashes:"
echo ""
echo 'adb shell "/system/bin/device_config set_sync_disabled_for_tests persistent"'
echo 'adb shell "/system/bin/device_config put activity_manager max_phantom_processes 2147483647"'
echo 'adb shell settings put global settings_enable_monitor_phantom_procs false'
echo "=============================================="
echo ""

# Reload bashrc
source ~/.bashrc 2>/dev/null || true

print_success "All done! Type 'linux' to start your desktop."
