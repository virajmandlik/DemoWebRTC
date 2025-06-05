# 🔧 Camera/Microphone Troubleshooting Guide

## 🚨 **CRITICAL SOLUTIONS FOR CAMERA/MICROPHONE ACCESS ISSUES**

### **Problem: "Failed to access camera/microphone. Please check permissions."**

This comprehensive guide provides multiple solutions to resolve camera/microphone access issues.

---

## 🔒 **SOLUTION 1: Browser Permissions (MOST COMMON)**

### **Chrome/Edge:**
1. **Click the camera/lock icon** in the address bar (left side)
2. **Set Camera and Microphone to "Allow"**
3. **Refresh the page** (F5 or Ctrl+R)

### **Alternative Chrome Method:**
1. Go to `chrome://settings/content/camera`
2. Find your site in the "Block" list
3. **Move it to "Allow" list**
4. Do the same for `chrome://settings/content/microphone`

### **Firefox:**
1. Click the **shield icon** in the address bar
2. Click **"Turn off Blocking"** for this site
3. Or go to Settings → Privacy & Security → Permissions

### **Safari:**
1. Safari → Preferences → Websites
2. Select **Camera** and **Microphone**
3. Set to **"Allow"** for your site

---

## 🌐 **SOLUTION 2: Secure Connection (CRITICAL)**

**Camera/microphone requires HTTPS or localhost!**

### **If using localhost:**
✅ `http://localhost:3000` - **WORKS**
✅ `https://localhost:3000` - **WORKS**

### **If using IP address:**
❌ `http://192.168.1.100:3000` - **BLOCKED**
✅ `https://192.168.1.100:3000` - **WORKS**

### **Solutions:**
1. **Use localhost instead of IP address**
2. **Set up HTTPS** for your development server
3. **Use ngrok** for secure tunneling: `npx ngrok http 3000`

---

## 🔄 **SOLUTION 3: Reset Browser Data**

### **Clear Site Data:**
1. **Right-click** on the page → **Inspect**
2. Go to **Application** tab
3. Click **"Clear storage"** in the left sidebar
4. Click **"Clear site data"**
5. **Refresh the page**

### **Reset Permissions:**
1. Go to `chrome://settings/content/all`
2. **Search for your site**
3. **Delete all permissions**
4. **Refresh and try again**

---

## 🖥️ **SOLUTION 4: Device Issues**

### **Check Device Availability:**
1. **Close all other applications** using camera/microphone:
   - Zoom, Teams, Skype, OBS, etc.
   - **Task Manager** → End camera/microphone processes

2. **Test in other applications:**
   - Windows Camera app
   - Browser's camera test: `https://webcamtests.com`

3. **Restart devices:**
   - **Unplug and reconnect** USB camera/microphone
   - **Restart your computer**

### **Device Manager (Windows):**
1. **Right-click Start** → Device Manager
2. Expand **"Cameras"** and **"Audio inputs"**
3. **Right-click devices** → **"Update driver"**
4. **Disable and re-enable** devices

---

## 🌍 **SOLUTION 5: Browser-Specific Fixes**

### **Chrome (Recommended):**
- **Update to latest version**
- **Disable extensions** (try incognito mode)
- **Reset Chrome settings**: `chrome://settings/reset`

### **Firefox:**
- **Update to latest version**
- **Disable tracking protection** for your site
- **Clear cookies and site data**

### **Safari:**
- **Update macOS and Safari**
- **Reset Safari**: Safari → Reset Safari
- **Check system preferences** → Security & Privacy

### **Edge:**
- **Update to latest version**
- **Reset Edge settings**
- **Try Chrome** as alternative

---

## 🔧 **SOLUTION 6: Advanced Troubleshooting**

### **Windows 10/11 Privacy Settings:**
1. **Settings** → **Privacy & Security**
2. **Camera** → **Allow apps to access camera** → **ON**
3. **Microphone** → **Allow apps to access microphone** → **ON**
4. **Allow desktop apps to access camera/microphone** → **ON**

### **Antivirus/Firewall:**
- **Temporarily disable** antivirus camera protection
- **Add browser to exceptions**
- **Check firewall settings**

### **Network Issues:**
- **Try different network** (mobile hotspot)
- **Disable VPN** temporarily
- **Check corporate firewall** settings

---

## 🚀 **SOLUTION 7: Emergency Fallbacks**

### **If nothing works:**

1. **Try different browser:**
   ```
   Chrome → Firefox → Edge → Safari
   ```

2. **Use mobile device:**
   - **Open on phone/tablet**
   - **Mobile browsers** often have fewer restrictions

3. **Use different computer:**
   - **Test on another device**
   - **Verify it's not hardware issue**

4. **Audio-only mode:**
   - **Disable video** in browser settings
   - **Use microphone only**

---

## 🔍 **SOLUTION 8: Diagnostic Steps**

### **Browser Console Check:**
1. **F12** → **Console** tab
2. **Look for error messages**
3. **Common errors:**
   - `NotAllowedError` → Permission denied
   - `NotFoundError` → No devices found
   - `NotReadableError` → Device in use
   - `OverconstrainedError` → Unsupported settings

### **Test URLs:**
- **WebRTC Test**: `https://test.webrtc.org`
- **Camera Test**: `https://webcamtests.com`
- **Microphone Test**: `https://mictests.com`

---

## ⚡ **QUICK FIX CHECKLIST**

**Try these in order:**

- [ ] **Click camera icon** in address bar → Allow
- [ ] **Use localhost** instead of IP address
- [ ] **Close other camera apps** (Zoom, Teams, etc.)
- [ ] **Refresh the page** (F5)
- [ ] **Try incognito/private mode**
- [ ] **Try different browser** (Chrome recommended)
- [ ] **Restart browser completely**
- [ ] **Clear browser data** for the site
- [ ] **Restart computer**
- [ ] **Update browser** to latest version

---

## 🆘 **STILL NOT WORKING?**

### **Contact Information:**
If you've tried all solutions above and still have issues:

1. **Check browser console** for specific error messages
2. **Try the diagnostic tool** in the app (🔧 button)
3. **Test with different devices/networks**
4. **Report the specific error message** you're seeing

### **Common Working Configurations:**
- ✅ **Chrome + localhost + Windows 10/11**
- ✅ **Firefox + localhost + macOS**
- ✅ **Safari + localhost + macOS**
- ✅ **Edge + localhost + Windows 10/11**

---

## 📱 **Mobile Troubleshooting**

### **iOS Safari:**
- **Settings** → **Safari** → **Camera & Microphone Access**
- **Allow websites to access camera/microphone**

### **Android Chrome:**
- **Chrome Settings** → **Site Settings** → **Camera/Microphone**
- **Allow for your site**

---

**Remember: Camera/microphone access requires user permission and a secure connection (HTTPS or localhost). Most issues are resolved by checking browser permissions and ensuring a secure connection.**