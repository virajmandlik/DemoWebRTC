# Enhanced React Video Call Application

A modern, feature-rich video calling application built with React, WebRTC, and Firebase. This application provides high-quality video calling with advanced features like file sharing, real-time chat, screen sharing, and more.

## 🚀 Features

### Core Video Calling
- **HD Video Quality** with adaptive bitrate
- **Crystal Clear Audio** with echo cancellation and noise suppression
- **Real-time Communication** using WebRTC
- **Cross-platform Support** (Desktop, Mobile, Tablet)

### Advanced Features
- **Screen Sharing** with audio support
- **File Sharing** up to 50MB (images, videos, documents, PDFs)
- **Real-time Chat** with emoji support
- **Room-based Calls** with shareable room IDs
- **Responsive Design** for all screen sizes
- **Connection Status** indicators
- **Media Controls** (mute/unmute, camera on/off)

### Enhanced UI/UX
- **Modern Design** with smooth animations
- **Dark/Light Theme** support
- **Toast Notifications** for user feedback
- **Minimizable Chat** window
- **Fullscreen Mode** support
- **Accessibility Features** built-in

### Technical Features
- **Firebase Integration** for signaling and file storage
- **Real-time Database** for room management
- **Secure File Upload** with validation
- **Error Handling** and recovery
- **Performance Optimized** components

## 🛠️ Technology Stack

- **Frontend**: React 19, Styled Components
- **Real-time Communication**: WebRTC
- **Backend Services**: Firebase (Firestore, Storage)
- **UI Components**: React Icons, React Toastify
- **Build Tool**: Create React App
- **Styling**: Styled Components, CSS3

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with WebRTC support
- Camera and microphone access

## 🚀 Getting Started

### 1. Installation

```bash
# Navigate to the project directory
cd react-video-call

# Install dependencies (if not already installed)
npm install

# Start the development server
npm start
```

### 2. Open the Application

The application will open in your browser at `http://localhost:3000`

### 3. Using the Application

1. **Grant Permissions**: Click "Start Camera" and allow camera/microphone access
2. **Create Room**: Click "Create Room" to start a new video call
3. **Share Room ID**: Copy and share the room ID with others
4. **Join Room**: Others can join using the room ID
5. **Enjoy Features**: Use chat, file sharing, screen sharing, and more!

## 🎯 How to Use

### Starting a Video Call

1. **Camera Access**: Click "Start Camera" to enable your camera and microphone
2. **Create Room**: Click "Create Room" to generate a unique room ID
3. **Share Room ID**: Copy the room ID and share it with participants
4. **Wait for Connection**: Others can join using the room ID

### Joining a Video Call

1. **Camera Access**: Click "Start Camera" to enable your camera and microphone
2. **Join Room**: Click "Join Room" and enter the room ID
3. **Connect**: You'll be connected to the video call

### Using Features

#### Video Controls
- **Mute/Unmute**: Toggle microphone on/off
- **Camera On/Off**: Toggle camera on/off
- **Screen Share**: Share your screen with audio
- **Hang Up**: End the call

#### Chat Features
- **Send Messages**: Type and send text messages
- **File Sharing**: Click the paperclip icon to share files
- **Emoji Support**: Click the smile icon for quick emojis
- **Minimize Chat**: Click minimize to reduce chat window

#### File Sharing
- **Supported Formats**: Images, videos, audio, PDFs, documents
- **File Size Limit**: Up to 50MB per file
- **Secure Upload**: Files are stored securely in Firebase Storage
- **Download Files**: Click on shared files to download

## 🔧 Configuration

### Firebase Setup

The application uses Firebase for signaling and file storage. The configuration is already set up, but you can modify it in:

```javascript
// src/services/firebase.js
const firebaseConfig = {
  // Your Firebase configuration
};
```

### WebRTC Configuration

WebRTC settings can be modified in:

```javascript
// src/services/webrtc.js
this.configuration = {
  iceServers: [
    // Your STUN/TURN servers
  ]
};
```

## 📱 Browser Support

- **Chrome** 60+ (Recommended)
- **Firefox** 60+
- **Safari** 12+
- **Edge** 79+
- **Mobile browsers** with WebRTC support

## 🔒 Security & Privacy

- **Peer-to-peer Connection**: Video/audio streams are transmitted directly between users
- **Secure File Storage**: Files are stored securely in Firebase Storage
- **No Data Persistence**: Chat messages are not stored permanently
- **Room Cleanup**: Rooms are automatically cleaned up after calls end

## 🐛 Troubleshooting

### Camera/Microphone Issues

1. **Check Permissions**: Ensure browser has camera/microphone access
2. **Close Other Apps**: Close other applications using camera/microphone
3. **Try Different Browser**: Use Chrome for best compatibility
4. **Check Hardware**: Ensure camera/microphone are working

### Connection Issues

1. **Check Internet**: Ensure stable internet connection
2. **Firewall Settings**: Check if WebRTC is blocked
3. **Try Different Network**: Switch to different network if possible
4. **Refresh Page**: Reload the application

### File Sharing Issues

1. **File Size**: Ensure file is under 50MB
2. **File Type**: Check if file type is supported
3. **Internet Speed**: Large files need good internet connection
4. **Try Again**: Retry file upload if it fails

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or need help:

1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure all permissions are granted
4. Try refreshing the application

## 🔮 Future Enhancements

- **Recording Functionality**: Record video calls
- **Virtual Backgrounds**: Add virtual background support
- **Multiple Participants**: Support for group video calls
- **User Authentication**: Add user accounts and profiles
- **Call History**: Track previous calls and shared files
- **Mobile App**: Native mobile applications
- **Advanced Chat**: Rich text formatting, message reactions
- **Whiteboard**: Collaborative drawing feature

---

**Enjoy your enhanced video calling experience!** 🎥📞