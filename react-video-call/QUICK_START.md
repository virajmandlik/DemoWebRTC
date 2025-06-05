# Quick Start Guide

## 🚀 Running the Enhanced React Video Call Application

### Method 1: Using the Batch File (Windows)
1. Double-click `start.bat` in the project folder
2. The application will start automatically
3. Your browser will open to `http://localhost:3000`

### Method 2: Using Command Line
1. Open terminal/command prompt
2. Navigate to the project folder: `cd react-video-call`
3. Run: `npm start`
4. Open browser to `http://localhost:3000`

### Method 3: Using VS Code
1. Open the `react-video-call` folder in VS Code
2. Open terminal in VS Code (Ctrl+`)
3. Run: `npm start`

## 📋 First Time Setup

If this is your first time running the application:

```bash
cd react-video-call
npm install
npm start
```

## 🎯 How to Test the Application

### Single Browser Testing
1. Open the application
2. Click "Start Camera" and allow permissions
3. Click "Create Room"
4. Copy the Room ID
5. Open a new incognito/private window
6. Go to the same URL
7. Click "Start Camera" and allow permissions
8. Click "Join Room" and paste the Room ID

### Multiple Device Testing
1. Start the application on one device
2. Create a room and copy the Room ID
3. Open the application on another device
4. Join the room using the Room ID

## ✨ Key Features to Test

- **Video Calling**: Basic video and audio communication
- **Screen Sharing**: Click the monitor icon to share your screen
- **Chat**: Send messages in real-time
- **File Sharing**: Click the paperclip icon in chat to share files
- **Media Controls**: Mute/unmute, camera on/off
- **Responsive Design**: Try on different screen sizes

## 🔧 Troubleshooting

### If the app doesn't start:
1. Make sure Node.js is installed
2. Run `npm install` first
3. Check if port 3000 is available

### If camera/microphone doesn't work:
1. Check browser permissions
2. Use HTTPS or localhost
3. Close other apps using camera/microphone
4. Try Chrome browser for best compatibility

### If connection fails:
1. Check internet connection
2. Try refreshing the page
3. Check browser console for errors
4. Ensure both users are on the same network type (not behind strict firewalls)

## 🌟 What's New in This Enhanced Version

Compared to the original vanilla JavaScript version, this React version includes:

- **Modern React Architecture** with hooks and components
- **Enhanced File Sharing** with Firebase Storage
- **Better UI/UX** with styled components
- **Improved Error Handling** with toast notifications
- **Responsive Design** for mobile and desktop
- **Real-time Chat** with typing indicators
- **Advanced Media Controls** with better feedback
- **Modular Code Structure** for easier maintenance
- **Performance Optimizations** and better state management

## 📱 Browser Compatibility

- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

---

**Ready to start video calling!** 🎥✨