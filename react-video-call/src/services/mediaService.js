// Enhanced Media Service with comprehensive fallback mechanisms
export class MediaService {
  constructor() {
    this.stream = null;
    this.devices = {
      videoInputs: [],
      audioInputs: [],
      audioOutputs: []
    };
    this.constraints = {
      video: true,
      audio: true
    };
    this.fallbackAttempts = [];
  }

  // Check if getUserMedia is supported
  isGetUserMediaSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );
  }

  // Check if we're in a secure context
  isSecureContext() {
    return window.isSecureContext || 
           window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }

  // Get available media devices
  async getAvailableDevices() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('Device enumeration not supported');
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      
      this.devices = {
        videoInputs: devices.filter(device => device.kind === 'videoinput'),
        audioInputs: devices.filter(device => device.kind === 'audioinput'),
        audioOutputs: devices.filter(device => device.kind === 'audiooutput')
      };

      console.log('Available devices:', this.devices);
      return this.devices;
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return this.devices;
    }
  }

  // Check current permissions
  async checkPermissions() {
    try {
      if (!navigator.permissions) {
        return { camera: 'unknown', microphone: 'unknown' };
      }

      const [cameraPermission, microphonePermission] = await Promise.all([
        navigator.permissions.query({ name: 'camera' }).catch(() => ({ state: 'unknown' })),
        navigator.permissions.query({ name: 'microphone' }).catch(() => ({ state: 'unknown' }))
      ]);

      return {
        camera: cameraPermission.state,
        microphone: microphonePermission.state
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return { camera: 'unknown', microphone: 'unknown' };
    }
  }

  // Progressive fallback constraints
  getConstraintsFallbacks() {
    return [
      // Attempt 1: Ideal high quality
      {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      },
      // Attempt 2: Standard quality
      {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 15, max: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      },
      // Attempt 3: Basic quality
      {
        video: {
          width: 320,
          height: 240,
          frameRate: 15
        },
        audio: true
      },
      // Attempt 4: Video only
      {
        video: true,
        audio: false
      },
      // Attempt 5: Audio only
      {
        video: false,
        audio: true
      },
      // Attempt 6: Most basic
      {
        video: { width: 160, height: 120 },
        audio: false
      }
    ];
  }

  // Try getUserMedia with progressive fallbacks
  async getUserMediaWithFallbacks() {
    const fallbacks = this.getConstraintsFallbacks();
    let lastError = null;

    // Check basic support first
    if (!this.isGetUserMediaSupported()) {
      throw new Error('getUserMedia is not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.');
    }

    // Check secure context
    if (!this.isSecureContext()) {
      throw new Error('Camera/microphone access requires HTTPS or localhost. Please use a secure connection.');
    }

    // Get available devices first
    await this.getAvailableDevices();

    // Check if devices are available
    if (this.devices.videoInputs.length === 0 && this.devices.audioInputs.length === 0) {
      throw new Error('No camera or microphone devices found. Please connect a camera/microphone and refresh the page.');
    }

    // Try each fallback constraint
    for (let i = 0; i < fallbacks.length; i++) {
      const constraints = fallbacks[i];
      
      try {
        console.log(`Attempting getUserMedia with constraints ${i + 1}:`, constraints);
        
        // Special handling for device-specific constraints
        if (constraints.video && typeof constraints.video === 'object') {
          // If no video devices available, skip video constraints
          if (this.devices.videoInputs.length === 0) {
            constraints.video = false;
          }
        }
        
        if (constraints.audio && typeof constraints.audio === 'object') {
          // If no audio devices available, skip audio constraints
          if (this.devices.audioInputs.length === 0) {
            constraints.audio = false;
          }
        }

        // Skip if both video and audio are false
        if (!constraints.video && !constraints.audio) {
          continue;
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (stream && stream.getTracks().length > 0) {
          this.stream = stream;
          this.constraints = constraints;
          
          console.log('✅ Successfully obtained media stream:', {
            videoTracks: stream.getVideoTracks().length,
            audioTracks: stream.getAudioTracks().length,
            constraints: constraints
          });

          // Log track details
          stream.getTracks().forEach(track => {
            console.log(`Track: ${track.kind}, enabled: ${track.enabled}, settings:`, track.getSettings());
          });

          return {
            stream,
            constraints,
            fallbackUsed: i,
            videoTracks: stream.getVideoTracks().length,
            audioTracks: stream.getAudioTracks().length
          };
        }
      } catch (error) {
        lastError = error;
        console.warn(`❌ Attempt ${i + 1} failed:`, error.name, error.message);
        this.fallbackAttempts.push({
          attempt: i + 1,
          constraints,
          error: error.message,
          errorName: error.name
        });
        
        // Continue to next fallback
        continue;
      }
    }

    // If all attempts failed, throw detailed error
    throw new Error(this.generateDetailedErrorMessage(lastError));
  }

  // Generate detailed error message with troubleshooting
  generateDetailedErrorMessage(lastError) {
    const permissions = this.checkPermissions();
    const devices = this.devices;
    
    let message = 'Failed to access camera/microphone after trying all fallback options.\n\n';
    
    message += '🔍 Diagnostic Information:\n';
    message += `- Browser: ${navigator.userAgent.split(' ')[0]}\n`;
    message += `- Secure Context: ${this.isSecureContext()}\n`;
    message += `- getUserMedia Support: ${this.isGetUserMediaSupported()}\n`;
    message += `- Video Devices: ${devices.videoInputs.length}\n`;
    message += `- Audio Devices: ${devices.audioInputs.length}\n`;
    
    if (lastError) {
      message += `- Last Error: ${lastError.name} - ${lastError.message}\n`;
    }
    
    message += '\n🛠️ Troubleshooting Steps:\n';
    
    if (!this.isSecureContext()) {
      message += '1. ⚠️ Use HTTPS or localhost (required for camera/microphone access)\n';
    }
    
    if (devices.videoInputs.length === 0) {
      message += '2. 📹 No camera detected - please connect a camera\n';
    }
    
    if (devices.audioInputs.length === 0) {
      message += '3. 🎤 No microphone detected - please connect a microphone\n';
    }
    
    message += '4. 🔒 Check browser permissions (click lock icon in address bar)\n';
    message += '5. 🔄 Close other apps using camera/microphone\n';
    message += '6. 🌐 Try a different browser (Chrome recommended)\n';
    message += '7. 🔃 Refresh the page and try again\n';
    
    return message;
  }

  // Legacy getUserMedia fallback for older browsers
  async getLegacyUserMedia(constraints) {
    return new Promise((resolve, reject) => {
      const getUserMedia = navigator.getUserMedia || 
                          navigator.webkitGetUserMedia || 
                          navigator.mozGetUserMedia || 
                          navigator.msGetUserMedia;

      if (!getUserMedia) {
        reject(new Error('getUserMedia is not supported in this browser'));
        return;
      }

      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }

  // Try with legacy API as final fallback
  async tryLegacyGetUserMedia() {
    try {
      console.log('Trying legacy getUserMedia API...');
      const stream = await this.getLegacyUserMedia({ video: true, audio: true });
      return { stream, legacy: true };
    } catch (error) {
      console.error('Legacy getUserMedia also failed:', error);
      throw error;
    }
  }

  // Main method to get user media with all fallbacks
  async getMediaStream() {
    try {
      // First try modern API with fallbacks
      return await this.getUserMediaWithFallbacks();
    } catch (modernError) {
      console.warn('Modern getUserMedia failed, trying legacy API...');
      
      try {
        // Try legacy API as final fallback
        return await this.tryLegacyGetUserMedia();
      } catch (legacyError) {
        // Both failed, throw comprehensive error
        throw new Error(this.generateDetailedErrorMessage(modernError));
      }
    }
  }

  // Stop all tracks
  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      this.stream = null;
    }
  }

  // Get diagnostic information
  getDiagnosticInfo() {
    return {
      isSupported: this.isGetUserMediaSupported(),
      isSecureContext: this.isSecureContext(),
      devices: this.devices,
      fallbackAttempts: this.fallbackAttempts,
      currentStream: this.stream ? {
        videoTracks: this.stream.getVideoTracks().length,
        audioTracks: this.stream.getAudioTracks().length,
        active: this.stream.active
      } : null
    };
  }

  // Test camera/microphone access
  async testMediaAccess() {
    try {
      const result = await this.getMediaStream();
      this.stopStream(); // Stop immediately after test
      return {
        success: true,
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        diagnostic: this.getDiagnosticInfo()
      };
    }
  }
}