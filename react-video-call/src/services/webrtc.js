// WebRTC Service for handling peer connections
export class WebRTCService {
  constructor() {
    this.configuration = {
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
    
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
    this.onRemoteStreamCallback = null;
    this.onDataChannelMessageCallback = null;
    this.onConnectionStateChangeCallback = null;
  }

  // Initialize peer connection
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.configuration);
    this.remoteStream = new MediaStream();
    
    // Set up event listeners
    this.setupPeerConnectionListeners();
    
    return this.peerConnection;
  }

  // Set up peer connection event listeners
  setupPeerConnectionListeners() {
    if (!this.peerConnection) return;

    // Handle remote stream
    this.peerConnection.addEventListener('track', (event) => {
      console.log('Received remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream.addTrack(track);
      });
      
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    });

    // Handle connection state changes
    this.peerConnection.addEventListener('connectionstatechange', () => {
      console.log('Connection state:', this.peerConnection.connectionState);
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(this.peerConnection.connectionState);
      }
    });

    // Handle data channel
    this.peerConnection.addEventListener('datachannel', (event) => {
      const receiveChannel = event.channel;
      this.setupDataChannel(receiveChannel);
    });

    // Handle ICE connection state
    this.peerConnection.addEventListener('iceconnectionstatechange', () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState);
    });

    // Handle signaling state
    this.peerConnection.addEventListener('signalingstatechange', () => {
      console.log('Signaling state:', this.peerConnection.signalingState);
    });
  }

  // Get user media
  async getUserMedia(constraints = { video: true, audio: true }) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  // Add local stream to peer connection
  addLocalStream() {
    if (this.localStream && this.peerConnection) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }
  }

  // Create data channel for chat and file sharing
  createDataChannel(label = 'chat') {
    if (this.peerConnection) {
      this.dataChannel = this.peerConnection.createDataChannel(label);
      this.setupDataChannel(this.dataChannel);
      return this.dataChannel;
    }
    return null;
  }

  // Setup data channel event listeners
  setupDataChannel(channel) {
    this.dataChannel = channel;

    channel.onopen = () => {
      console.log('Data channel opened');
    };

    channel.onclose = () => {
      console.log('Data channel closed');
    };

    channel.onmessage = (event) => {
      console.log('Received data channel message:', event.data);
      if (this.onDataChannelMessageCallback) {
        this.onDataChannelMessageCallback(event.data);
      }
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
    };
  }

  // Send message through data channel
  sendMessage(message) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(message);
      return true;
    }
    return false;
  }

  // Create offer
  async createOffer() {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  // Create answer
  async createAnswer() {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  // Set remote description
  async setRemoteDescription(description) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(description);
    }
  }

  // Add ICE candidate
  async addIceCandidate(candidate) {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(candidate);
    }
  }

  // Screen sharing
  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: true
      });

      // Replace video track
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );

      if (sender) {
        await sender.replaceTrack(videoTrack);
      }

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  // Stop screen sharing
  async stopScreenShare() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );

      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
    }
  }

  // Toggle audio
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Cleanup
  cleanup() {
    // Stop local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    // Stop remote tracks
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
    }

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    // Reset variables
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
  }

  // Set callbacks
  onRemoteStream(callback) {
    this.onRemoteStreamCallback = callback;
  }

  onDataChannelMessage(callback) {
    this.onDataChannelMessageCallback = callback;
  }

  onConnectionStateChange(callback) {
    this.onConnectionStateChangeCallback = callback;
  }
}