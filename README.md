
# WebRTC Firebase Video Chat Application

![WebRTC Video Chat](https://res.cloudinary.com/dd87pzoq7/image/upload/v1749150551/imgWebRTC_boghbk.png)

A complete peer-to-peer video chat application built with WebRTC and Firebase Firestore for signaling. Features include video calling, audio/video controls, screen sharing, and real-time chat.

---

## 🚀 Features

- 🎥 **Peer-to-peer video calling** using WebRTC  
- 🔊 **Audio/Video controls** (mute, camera on/off)  
- 🖥️ **Screen sharing** capability  
- 💬 **Real-time chat** during video calls  
- 📱 **Responsive design** for mobile and desktop  
- 🔒 **Secure** Firebase Firestore signaling  
- 🎨 **Modern UI** with smooth animations  

---

## 🔧 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- Firebase CLI:  
  ```bash
  npm install -g firebase-tools
````

* [Git](https://git-scm.com/)

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd videoCall
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Cloud Firestore** in **test mode**
4. Add a new Web App under Project Settings
5. Copy your Firebase configuration

### 4. Configure Firebase

Replace the config in `public/main.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 5. Initialize Firebase CLI

```bash
firebase login
firebase use --add
# Select your project and give an alias (e.g. "default")
```

### 6. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 7. Run the App

```bash
npm start
# or
firebase serve --only hosting
```

App will be live at `http://localhost:5000`

---

## 🎬 How to Use

### Start a Call

1. Click **Start Camera**
2. Click **Create Room**
3. Share **Room ID**
4. Second user clicks **Join Room** and enters Room ID

### During a Call

* Mute/Unmute
* Toggle Video
* Screen Share
* Chat
* Hang Up

---

## 📁 Project Structure

```
videoCall/
├── public/
│   ├── index.html          # UI
│   ├── style.css           # Styles
│   └── main.js             # Logic (WebRTC + Firebase)
├── firebase.json           # Hosting config
├── firestore.rules         # Firestore rules
├── firestore.indexes.json  # Firestore indexes
├── package.json            # Dependencies
└── README.md               # You're reading it
```

---

## 🛠️ Tech Stack

* **WebRTC** – peer-to-peer media stream
* **Firebase Firestore** – signaling
* **Firebase Hosting**
* **Vanilla JS** – No framework
* **CSS3** – Modern responsive design

---

## 🌐 Browser Compatibility

* ✅ Chrome (Recommended)
* ✅ Firefox
* ✅ Safari (iOS 11+)
* ✅ Edge

> ⚠️ Use **HTTPS** in production

---

## 🚢 Deployment

### Hosting Only

```bash
firebase deploy --only hosting
```

### Full Deploy (hosting + rules + indexes)

```bash
firebase deploy
```

---

## 🔐 Security Considerations

### For Production

* Update Firestore rules
* Add authentication
* Use TURN servers
* Add room creation limits
* Implement room auto-cleanup

#### Sample Secure Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if request.auth != null 
        && request.time < timestamp.date(2025, 12, 31);

      match /{subcollection=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

---

## 🛠️ Troubleshooting

### ❗ Camera/Mic Access Denied

* Use **HTTPS** or localhost
* Allow permissions in browser
* Go to:

  * `chrome://settings/content/camera`
  * `chrome://settings/content/microphone`

### ❗ Connection Failed

* Verify Firebase config
* Deploy Firestore rules
* Check console logs

### ❗ No Remote Video

* Both users must allow camera/mic
* Refresh both browsers
* Check network

### ❗ Chat Not Working

* Make sure users are in the same room
* Check data channel in console

---

## 🧪 Debug Mode

Use **F12 Developer Tools** for logs and WebRTC internals.

---

## 🤝 Contributing

1. Fork repo
2. Create branch (`git checkout -b feature/foo`)
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📄 License

MIT License – see [LICENSE](LICENSE)

---

## 🙌 Acknowledgments

* Based on [WebRTC Firebase Codelab](https://webrtc.org/getting-started/firebase-rtc-codelab)
* Uses Google STUN servers
* Powered by Firebase


