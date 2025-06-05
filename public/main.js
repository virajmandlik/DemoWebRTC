// Firebase Configuration - Replace with your actual config
const firebaseConfig = {
 /**
  * Your keys
  */
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// WebRTC Configuration
const configuration = {
    iceServers: [
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302'
            ]
        }
    ],
    iceCandidatePoolSize: 10
};

// Global variables
let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomId = null;
let dataChannel = null;

// DOM elements
const localVideo = document.querySelector('#localVideo');
const remoteVideo = document.querySelector('#remoteVideo');
const startButton = document.querySelector('#startButton');
const createBtn = document.querySelector('#createBtn');
const joinBtn = document.querySelector('#joinBtn');
const hangupBtn = document.querySelector('#hangupBtn');
const currentRoomSpan = document.querySelector('#currentRoom');
const roomDialog = document.querySelector('#roomDialog');
const roomIdInput = document.querySelector('#roomId');
const confirmJoinBtn = document.querySelector('#confirmJoinBtn');
const cancelJoinBtn = document.querySelector('#cancelJoinBtn');

// Control elements
const muteBtn = document.querySelector('#muteBtn');
const videoBtn = document.querySelector('#videoBtn');
const shareScreenBtn = document.querySelector('#shareScreenBtn');
const controlsDiv = document.querySelector('#controls');

// Chat elements
const chatContainer = document.querySelector('#chatContainer');
const messagesDiv = document.querySelector('#messages');
const messageInput = document.querySelector('#messageInput');
const sendBtn = document.querySelector('#sendBtn');

// Initialize the application
function init() {
    startButton.addEventListener('click', openUserMedia);
    createBtn.addEventListener('click', createRoom);
    joinBtn.addEventListener('click', showJoinDialog);
    confirmJoinBtn.addEventListener('click', joinRoom);
    cancelJoinBtn.addEventListener('click', hideJoinDialog);
    hangupBtn.addEventListener('click', hangUp);
    
    // Control event listeners
    muteBtn.addEventListener('click', toggleMute);
    videoBtn.addEventListener('click', toggleVideo);
    shareScreenBtn.addEventListener('click', () => {
        if (shareScreenBtn.textContent === 'Share Screen') {
            shareScreen();
        } else {
            stopScreenShare();
        }
    });
    
    // Chat event listeners
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Open user media (camera and microphone)
async function openUserMedia() {
    try {
        showLoading(startButton);

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('getUserMedia is not supported in this browser');
        }

        // First try with both video and audio
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
        } catch (error) {
            console.warn('Failed to get both video and audio, trying video only:', error);

            // If that fails, try video only
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                    },
                    audio: false
                });
                alert('Audio access denied. Video-only mode enabled.');
            } catch (videoError) {
                console.warn('Failed to get video, trying audio only:', videoError);

                // If video fails, try audio only
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: false,
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        }
                    });
                    alert('Video access denied. Audio-only mode enabled.');
                } catch (audioError) {
                    throw new Error('Both video and audio access denied');
                }
            }
        }

        localVideo.srcObject = stream;
        localStream = stream;
        remoteStream = new MediaStream();
        remoteVideo.srcObject = remoteStream;

        console.log('Stream:', stream);
        console.log('Video tracks:', stream.getVideoTracks());
        console.log('Audio tracks:', stream.getAudioTracks());

        // Update UI
        startButton.disabled = true;
        createBtn.disabled = false;
        joinBtn.disabled = false;
        hangupBtn.disabled = false;
        controlsDiv.style.display = 'flex';

        hideLoading(startButton);
        startButton.textContent = 'Camera Started';

        // Show success message
        updateRoomInfo('Media access granted! You can now create or join a room.', 'connected');

    } catch (error) {
        console.error('Error accessing media devices:', error);
        hideLoading(startButton);

        let errorMessage = 'Error accessing camera/microphone. ';

        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMessage += 'Please allow camera and microphone access in your browser settings and try again.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMessage += 'No camera or microphone found. Please connect a camera/microphone and try again.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            errorMessage += 'Camera/microphone is already in use by another application.';
        } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
            errorMessage += 'Camera/microphone constraints could not be satisfied.';
        } else if (error.name === 'NotSupportedError') {
            errorMessage += 'Camera/microphone access is not supported in this browser.';
        } else if (error.name === 'TypeError') {
            errorMessage += 'Invalid constraints specified.';
        } else {
            errorMessage += error.message || 'Unknown error occurred.';
        }

        alert(errorMessage);
        updateRoomInfo('Media access failed. Please check permissions and try again.', 'disconnected');

        // Show troubleshooting tips
        showTroubleshootingTips();

        // Also show specific permission reset instructions
        showPermissionResetInstructions();
    }
}

// Create a new room
async function createRoom() {
    try {
        showLoading(createBtn);
        
        createBtn.disabled = true;
        joinBtn.disabled = true;
        
        // Create peer connection
        peerConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners();
        
        // Create data channel for chat
        dataChannel = peerConnection.createDataChannel('chat');
        setupDataChannel(dataChannel);
        
        // Add local stream tracks to peer connection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Create room document
        const roomRef = db.collection('rooms').doc();
        roomId = roomRef.id;
        
        const callerCandidatesCollection = roomRef.collection('callerCandidates');

        // Collect ICE candidates
        peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final candidate!');
                return;
            }
            console.log('Got candidate: ', event.candidate);
            callerCandidatesCollection.add(event.candidate.toJSON());
        });

        // Create offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log('Created offer:', offer);

        const roomWithOffer = {
            'offer': {
                type: offer.type,
                sdp: offer.sdp
            },
            'createdAt': firebase.firestore.FieldValue.serverTimestamp()
        };

        await roomRef.set(roomWithOffer);
        console.log(`New room created with SDP offer. Room ID: ${roomId}`);
        
        updateRoomInfo(`Room ID: ${roomId} - You are the caller!`, 'connected');
        
        // Listen for remote session description
        roomRef.onSnapshot(async snapshot => {
            const data = snapshot.data();
            if (!peerConnection.currentRemoteDescription && data && data.answer) {
                console.log('Got remote description: ', data.answer);
                const rtcSessionDescription = new RTCSessionDescription(data.answer);
                await peerConnection.setRemoteDescription(rtcSessionDescription);
            }
        });

        // Listen for remote ICE candidates
        roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
        
        hideLoading(createBtn);
        chatContainer.style.display = 'block';
        
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Error creating room. Please try again.');
        hideLoading(createBtn);
        createBtn.disabled = false;
        joinBtn.disabled = false;
    }
}

// Show join room dialog
function showJoinDialog() {
    roomDialog.style.display = 'flex';
    roomIdInput.focus();
}

// Hide join room dialog
function hideJoinDialog() {
    roomDialog.style.display = 'none';
    roomIdInput.value = '';
}

// Join an existing room
async function joinRoom() {
    const inputRoomId = roomIdInput.value.trim();
    if (!inputRoomId) {
        alert('Please enter a room ID');
        return;
    }
    
    try {
        showLoading(confirmJoinBtn);
        
        createBtn.disabled = true;
        joinBtn.disabled = true;
        roomId = inputRoomId;
        
        console.log('Join room: ', roomId);
        updateRoomInfo(`Room ID: ${roomId} - You are the callee!`, 'connecting');
        
        const roomRef = db.collection('rooms').doc(roomId);
        const roomSnapshot = await roomRef.get();
        
        if (!roomSnapshot.exists) {
            alert('Room not found. Please check the room ID.');
            hideLoading(confirmJoinBtn);
            createBtn.disabled = false;
            joinBtn.disabled = false;
            return;
        }
        
        console.log('Create PeerConnection with configuration: ', configuration);
        peerConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners();
        
        // Handle data channel
        peerConnection.addEventListener('datachannel', event => {
            const receiveChannel = event.channel;
            setupDataChannel(receiveChannel);
        });
        
        // Add local stream tracks
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Collect ICE candidates
        const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
        peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final candidate!');
                return;
            }
            console.log('Got candidate: ', event.candidate);
            calleeCandidatesCollection.add(event.candidate.toJSON());
        });

        // Create SDP answer
        const offer = roomSnapshot.data().offer;
        console.log('Got offer:', offer);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        console.log('Created answer:', answer);
        await peerConnection.setLocalDescription(answer);

        const roomWithAnswer = {
            answer: {
                type: answer.type,
                sdp: answer.sdp
            }
        };
        await roomRef.update(roomWithAnswer);

        // Listen for remote ICE candidates
        roomRef.collection('callerCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
        
        hideJoinDialog();
        hideLoading(confirmJoinBtn);
        chatContainer.style.display = 'block';
        updateRoomInfo(`Room ID: ${roomId} - Connected!`, 'connected');
        
    } catch (error) {
        console.error('Error joining room:', error);
        alert('Error joining room. Please try again.');
        hideLoading(confirmJoinBtn);
        createBtn.disabled = false;
        joinBtn.disabled = false;
    }
}

// Hang up call
async function hangUp() {
    try {
        // Stop local tracks
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
            });
        }

        // Stop remote tracks
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }

        // Close peer connection
        if (peerConnection) {
            peerConnection.close();
        }

        // Close data channel
        if (dataChannel) {
            dataChannel.close();
        }

        // Clear video elements
        localVideo.srcObject = null;
        remoteVideo.srcObject = null;

        // Reset UI
        startButton.disabled = false;
        startButton.textContent = 'Start Camera';
        createBtn.disabled = true;
        joinBtn.disabled = true;
        hangupBtn.disabled = true;
        controlsDiv.style.display = 'none';
        chatContainer.style.display = 'none';
        currentRoomSpan.textContent = '';

        // Delete room on hangup
        if (roomId) {
            const roomRef = db.collection('rooms').doc(roomId);

            // Delete subcollections
            const calleeCandidates = await roomRef.collection('calleeCandidates').get();
            calleeCandidates.forEach(async candidate => {
                await candidate.ref.delete();
            });

            const callerCandidates = await roomRef.collection('callerCandidates').get();
            callerCandidates.forEach(async candidate => {
                await candidate.ref.delete();
            });

            await roomRef.delete();
        }

        // Reset variables
        peerConnection = null;
        localStream = null;
        remoteStream = null;
        roomId = null;
        dataChannel = null;

        console.log('Hung up successfully');

    } catch (error) {
        console.error('Error during hangup:', error);
    }
}

// Register peer connection listeners
function registerPeerConnectionListeners() {
    peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${peerConnection.connectionState}`);
        updateConnectionStatus(peerConnection.connectionState);
    });

    peerConnection.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener('iceconnectionstatechange', () => {
        console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`);
    });

    peerConnection.addEventListener('track', event => {
        console.log('Got remote track:', event.streams[0]);
        event.streams[0].getTracks().forEach(track => {
            console.log('Add a track to the remoteStream:', track);
            remoteStream.addTrack(track);
        });
    });
}

// Media controls
function toggleMute() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            muteBtn.textContent = audioTrack.enabled ? 'Mute' : 'Unmute';
            muteBtn.className = audioTrack.enabled ? 'btn btn-warning' : 'btn btn-danger';
        }
    }
}

function toggleVideo() {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            videoBtn.textContent = videoTrack.enabled ? 'Stop Video' : 'Start Video';
            videoBtn.className = videoTrack.enabled ? 'btn btn-warning' : 'btn btn-danger';
        }
    }
}

// Screen sharing
async function shareScreen() {
    try {
        if (!peerConnection) {
            alert('Please start a call before sharing your screen.');
            return;
        }

        console.log('Starting screen share...');

        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: 'always',
                displaySurface: 'monitor'
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            }
        });

        const videoTrack = screenStream.getVideoTracks()[0];
        const audioTrack = screenStream.getAudioTracks()[0];

        console.log('Screen stream obtained:', screenStream);
        console.log('Video track:', videoTrack);
        console.log('Audio track:', audioTrack);

        // Find the video sender
        const videoSender = peerConnection.getSenders().find(s =>
            s.track && s.track.kind === 'video'
        );

        if (videoSender) {
            console.log('Replacing video track...');
            await videoSender.replaceTrack(videoTrack);
            console.log('Video track replaced successfully');
        } else {
            console.log('No video sender found, adding track...');
            peerConnection.addTrack(videoTrack, screenStream);
        }

        // Handle audio track if available
        if (audioTrack) {
            const audioSender = peerConnection.getSenders().find(s =>
                s.track && s.track.kind === 'audio'
            );

            if (audioSender) {
                console.log('Replacing audio track...');
                await audioSender.replaceTrack(audioTrack);
            } else {
                console.log('Adding audio track...');
                peerConnection.addTrack(audioTrack, screenStream);
            }
        }

        // Update local video to show screen share
        const localVideo = document.querySelector('#localVideo');
        localVideo.srcObject = screenStream;

        shareScreenBtn.textContent = 'Stop Sharing';
        shareScreenBtn.className = 'btn btn-danger';

        // Handle when screen sharing ends
        videoTrack.onended = async () => {
            console.log('Screen sharing ended');
            await stopScreenShare();
        };

        console.log('Screen sharing started successfully');

    } catch (error) {
        console.error('Error sharing screen:', error);

        let errorMessage = 'Error sharing screen: ';
        if (error.name === 'NotAllowedError') {
            errorMessage += 'Screen sharing permission denied.';
        } else if (error.name === 'NotSupportedError') {
            errorMessage += 'Screen sharing is not supported in this browser.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'No screen available to share.';
        } else {
            errorMessage += error.message || 'Unknown error occurred.';
        }

        alert(errorMessage);
    }
}

// Stop screen sharing and return to camera
async function stopScreenShare() {
    try {
        console.log('Stopping screen share...');

        if (!localStream) {
            console.error('No local stream available to switch back to');
            return;
        }

        // Get the original camera tracks
        const cameraVideoTrack = localStream.getVideoTracks()[0];
        const cameraAudioTrack = localStream.getAudioTracks()[0];

        if (peerConnection) {
            // Replace video track back to camera
            const videoSender = peerConnection.getSenders().find(s =>
                s.track && s.track.kind === 'video'
            );

            if (videoSender && cameraVideoTrack) {
                console.log('Switching back to camera...');
                await videoSender.replaceTrack(cameraVideoTrack);
            }

            // Replace audio track back to microphone
            const audioSender = peerConnection.getSenders().find(s =>
                s.track && s.track.kind === 'audio'
            );

            if (audioSender && cameraAudioTrack) {
                console.log('Switching back to microphone...');
                await audioSender.replaceTrack(cameraAudioTrack);
            }
        }

        // Update local video back to camera
        const localVideo = document.querySelector('#localVideo');
        localVideo.srcObject = localStream;

        shareScreenBtn.textContent = 'Share Screen';
        shareScreenBtn.className = 'btn btn-info';

        console.log('Successfully switched back to camera');

    } catch (error) {
        console.error('Error stopping screen share:', error);
    }
}

// Data channel setup for chat
function setupDataChannel(channel) {
    dataChannel = channel;

    dataChannel.onopen = () => {
        console.log('Data channel opened');
    };

    dataChannel.onclose = () => {
        console.log('Data channel closed');
    };

    dataChannel.onmessage = (event) => {
        console.log('Received message:', event.data);
        displayMessage(event.data, 'remote');
    };

    dataChannel.onerror = (error) => {
        console.error('Data channel error:', error);
    };
}

// Chat functionality
function sendMessage() {
    const message = messageInput.value.trim();
    if (message && dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(message);
        displayMessage(message, 'local');
        messageInput.value = '';
    } else if (!dataChannel || dataChannel.readyState !== 'open') {
        alert('Chat is not available. Please ensure you are connected to a peer.');
    }
}

function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// UI helper functions
function updateRoomInfo(text, status) {
    currentRoomSpan.innerHTML = `<span class="status-indicator status-${status}"></span>${text}`;
}

function updateConnectionStatus(state) {
    const statusMap = {
        'connecting': 'connecting',
        'connected': 'connected',
        'disconnected': 'disconnected',
        'failed': 'disconnected',
        'closed': 'disconnected'
    };

    const status = statusMap[state] || 'disconnected';
    const indicator = document.querySelector('.status-indicator');
    if (indicator) {
        indicator.className = `status-indicator status-${status}`;
    }
}

function showLoading(button) {
    button.innerHTML = '<span class="loading"></span> Loading...';
    button.disabled = true;
}

function hideLoading(button) {
    button.disabled = false;
}

// Show troubleshooting tips for media access issues
function showTroubleshootingTips() {
    const tips = `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; color: #856404;">
            <h3 style="margin-top: 0; color: #856404;">🔧 Troubleshooting Camera/Microphone Issues</h3>
            <div style="text-align: left;">
                <p><strong>1. Check Browser Permissions:</strong></p>
                <ul>
                    <li>Click the camera/lock icon in your browser's address bar</li>
                    <li>Make sure Camera and Microphone are set to "Allow"</li>
                    <li>Refresh the page after changing permissions</li>
                </ul>

                <p><strong>2. Browser-Specific Steps:</strong></p>
                <ul>
                    <li><strong>Chrome:</strong> Settings → Privacy and Security → Site Settings → Camera/Microphone</li>
                    <li><strong>Firefox:</strong> Settings → Privacy & Security → Permissions → Camera/Microphone</li>
                    <li><strong>Safari:</strong> Safari → Preferences → Websites → Camera/Microphone</li>
                </ul>

                <p><strong>3. Common Solutions:</strong></p>
                <ul>
                    <li>Close other applications using camera/microphone (Zoom, Teams, etc.)</li>
                    <li>Try a different browser (Chrome recommended)</li>
                    <li>Restart your browser</li>
                    <li>Check if camera/microphone works in other applications</li>
                    <li>Make sure you're using HTTPS or localhost</li>
                </ul>

                <p><strong>4. Test Your Setup:</strong></p>
                <ul>
                    <li><a href="/test.html" target="_blank" style="color: #007bff;">Run Browser Compatibility Test</a></li>
                    <li>Try the <a href="https://webrtc.github.io/samples/src/content/getusermedia/gum/" target="_blank" style="color: #007bff;">WebRTC Sample Page</a></li>
                </ul>
            </div>
            <button onclick="this.parentElement.style.display='none'" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Close Tips</button>
        </div>
    `;

    // Insert tips after the room info
    const roomInfo = document.querySelector('#roomInfo');
    if (roomInfo && !document.querySelector('#troubleshooting-tips')) {
        const tipsDiv = document.createElement('div');
        tipsDiv.id = 'troubleshooting-tips';
        tipsDiv.innerHTML = tips;
        roomInfo.insertAdjacentElement('afterend', tipsDiv);
    }
}

// Check media device permissions
async function checkMediaPermissions() {
    try {
        if (!navigator.permissions) {
            console.log('Permissions API not supported');
            return { camera: 'unknown', microphone: 'unknown' };
        }

        const cameraPermission = await navigator.permissions.query({ name: 'camera' });
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' });

        return {
            camera: cameraPermission.state,
            microphone: microphonePermission.state
        };
    } catch (error) {
        console.log('Error checking permissions:', error);
        return { camera: 'unknown', microphone: 'unknown' };
    }
}

// Enhanced media device enumeration
async function enumerateDevices() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.log('enumerateDevices not supported');
            return { videoDevices: [], audioDevices: [] };
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audioDevices = devices.filter(device => device.kind === 'audioinput');

        console.log('Available video devices:', videoDevices);
        console.log('Available audio devices:', audioDevices);

        return { videoDevices, audioDevices };
    } catch (error) {
        console.error('Error enumerating devices:', error);
        return { videoDevices: [], audioDevices: [] };
    }
}

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    init();

    // Check browser compatibility and permissions
    await checkBrowserCompatibility();

    // Check current permissions
    const permissions = await checkMediaPermissions();
    console.log('Current permissions:', permissions);

    // Enumerate available devices
    const devices = await enumerateDevices();
    console.log('Available devices:', devices);

    // Show initial status and help if needed
    if (permissions.camera === 'denied' || permissions.microphone === 'denied') {
        updateRoomInfo('Camera/microphone access denied. Please check browser permissions.', 'disconnected');
        showPermissionHelp();
        showTroubleshootingTips();
    } else if (devices.videoDevices.length === 0 && devices.audioDevices.length === 0) {
        updateRoomInfo('No camera or microphone detected. Please connect devices and refresh.', 'disconnected');
        showTroubleshootingTips();
    } else {
        updateRoomInfo('Click "Start Camera" to begin using the video chat.', 'connecting');
    }
});

// Check browser compatibility
async function checkBrowserCompatibility() {
    const issues = [];

    // Check WebRTC support
    if (!window.RTCPeerConnection) {
        issues.push('WebRTC is not supported in this browser');
    }

    // Check getUserMedia support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        issues.push('Camera/microphone access is not supported in this browser');
    }

    // Check if running in secure context
    if (!window.isSecureContext && location.hostname !== 'localhost') {
        issues.push('This app requires HTTPS to access camera/microphone');
    }

    // Check data channel support
    try {
        const pc = new RTCPeerConnection();
        pc.createDataChannel('test');
        pc.close();
    } catch (error) {
        issues.push('Data channels are not supported');
    }

    if (issues.length > 0) {
        console.warn('Browser compatibility issues:', issues);
        const issueList = issues.map(issue => `• ${issue}`).join('\n');
        alert(`Browser Compatibility Issues:\n\n${issueList}\n\nPlease use a modern browser like Chrome, Firefox, or Safari.`);
    } else {
        console.log('✅ Browser compatibility check passed');
    }

    return issues.length === 0;
}

// Show permission help dialog
function showPermissionHelp() {
    const permissionHelp = document.getElementById('permissionHelp');
    if (permissionHelp) {
        permissionHelp.style.display = 'flex';
    }
}

// Show specific permission reset instructions
function showPermissionResetInstructions() {
    const instructions = `
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; color: #721c24;">
            <h3 style="margin-top: 0; color: #721c24;">🚨 Camera/Microphone Access Denied</h3>
            <p><strong>To fix this, you need to reset permissions for this site:</strong></p>

            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h4 style="color: #333; margin-top: 0;">For Chrome/Edge:</h4>
                <ol style="text-align: left; padding-left: 20px;">
                    <li>Click the <strong>🔒 lock icon</strong> or <strong>🎥 camera icon</strong> in the address bar</li>
                    <li>Change Camera and Microphone from "Block" to <strong>"Allow"</strong></li>
                    <li>Click <strong>"Reload"</strong> or refresh this page</li>
                    <li>If no icon appears, go to: <code>chrome://settings/content/camera</code></li>
                    <li>Find this site in the "Block" list and move it to "Allow"</li>
                </ol>
            </div>

            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h4 style="color: #333; margin-top: 0;">Alternative Method:</h4>
                <ol style="text-align: left; padding-left: 20px;">
                    <li>Right-click on this page and select <strong>"Inspect"</strong></li>
                    <li>Go to the <strong>"Application"</strong> tab</li>
                    <li>Click <strong>"Storage"</strong> in the left sidebar</li>
                    <li>Click <strong>"Clear site data"</strong></li>
                    <li>Refresh the page and try again</li>
                </ol>
            </div>

            <div style="text-align: center; margin-top: 15px;">
                <a href="fix-permissions.html" target="_blank" style="background: #dc3545; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; display: inline-block;">🚨 Detailed Fix Guide</a>
                <button onclick="location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px;">🔄 Refresh Page</button>
                <button onclick="this.parentElement.parentElement.parentElement.style.display='none'" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px;">Close</button>
            </div>
        </div>
    `;

    // Insert instructions after the room info
    const roomInfo = document.querySelector('#roomInfo');
    if (roomInfo && !document.querySelector('#permission-reset-instructions')) {
        const instructionsDiv = document.createElement('div');
        instructionsDiv.id = 'permission-reset-instructions';
        instructionsDiv.innerHTML = instructions;
        roomInfo.insertAdjacentElement('afterend', instructionsDiv);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (peerConnection) {
        hangUp();
    }
});
