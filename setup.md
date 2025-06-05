# Setup Instructions

Follow these steps to get your WebRTC Firebase Video Chat application running:

## Step 1: Install Prerequisites

### Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download and install the LTS version
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Install Firebase CLI
```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "my-video-chat")
4. Choose whether to enable Google Analytics
5. Click "Create project"

## Step 3: Enable Cloud Firestore

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode"
4. Choose a location close to your users
5. Click "Done"

## Step 4: Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>)
4. Register your app with a nickname
5. Copy the configuration object

## Step 5: Configure Your App

1. Open `public/main.js`
2. Replace the Firebase configuration at the top:

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

## Step 6: Initialize Firebase in Your Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project directory
firebase use --add
```

Select your project and give it an alias (e.g., "default").

## Step 7: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Step 8: Run the Application

```bash
# Start the development server
firebase serve --only hosting
```

Your app will be available at `http://localhost:5000`

## Step 9: Test the Application

1. Open `http://localhost:5000` in two different browser windows/tabs
2. In both windows, click "Start Camera" and allow camera/microphone access
3. In the first window, click "Create Room" and note the Room ID
4. In the second window, click "Join Room" and enter the Room ID
5. You should now see video chat working between both windows!

## Step 10: Deploy to Production (Optional)

```bash
firebase deploy --only hosting
```

Your app will be live at `https://your-project-id.web.app`

## Troubleshooting

### Camera/Microphone Issues
- Make sure you're using HTTPS or localhost
- Check browser permissions
- Try different browsers

### Connection Issues
- Verify Firebase configuration
- Check browser console for errors
- Ensure Firestore rules are deployed

### No Video/Audio
- Both users must grant permissions
- Check network connectivity
- Refresh browser windows

## Next Steps

- Add user authentication
- Implement room management
- Add TURN servers for production
- Customize the UI/UX
- Add more features like recording

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all configuration steps
3. Test with different browsers
4. Check Firebase project settings
