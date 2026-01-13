# Windows Firewall Fix for Quest 3 Access

## Problem
Quest 3 shows `ERR_CONNECTION_TIMED_OUT` when accessing `http://192.168.0.29:3000/client/` even though other browsers on the same PC can access it.

## Cause
Windows Firewall is blocking incoming connections from devices on your local network.

## Quick Fix (Recommended)

### Option 1: Add Firewall Rule for Node.js
Run this in **PowerShell as Administrator**:

```powershell
New-NetFirewallRule -DisplayName "VR Desktop Server" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow -Profile Private
```

### Option 2: Allow Port 3000
Run this in **PowerShell as Administrator**:

```powershell
New-NetFirewallRule -DisplayName "VR Desktop Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Private
```

## Manual Fix (GUI Method)

1. Open **Windows Defender Firewall with Advanced Security**
   - Press `Win + R`, type `wf.msc`, press Enter

2. Click **Inbound Rules** → **New Rule...**

3. Select **Port** → Next

4. Select **TCP**, enter port `3000` → Next

5. Select **Allow the connection** → Next

6. Check **Private** (uncheck Public/Domain) → Next

7. Name it "VR Desktop Server" → Finish

## Temporary Fix (Testing Only)

**⚠️ Not recommended for security reasons**

```powershell
# Disable firewall temporarily (run as Admin)
Set-NetFirewallProfile -Profile Private -Enabled False

# Re-enable after testing
Set-NetFirewallProfile -Profile Private -Enabled True
```

## Verify Fix

After applying the fix:
1. Restart the server: `npm start`
2. On Quest 3, try: `http://192.168.0.29:3000/client/`
3. Should now load successfully ✅
