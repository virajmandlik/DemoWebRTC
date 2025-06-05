// Enhanced hook for media device management with comprehensive error handling
import { useState, useEffect, useCallback, useRef } from 'react';
import { MediaService } from '../services/mediaService';

export const useMediaDevices = () => {
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState({
    videoInputs: [],
    audioInputs: [],
    audioOutputs: []
  });
  const [permissions, setPermissions] = useState({
    camera: 'unknown',
    microphone: 'unknown'
  });
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const mediaService = useRef(new MediaService());
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  // Check browser compatibility on mount
  useEffect(() => {
    checkBrowserCompatibility();
    updateDeviceList();
    checkCurrentPermissions();
  }, []);

  // Check browser compatibility
  const checkBrowserCompatibility = useCallback(() => {
    const service = mediaService.current;
    const diagnostic = service.getDiagnosticInfo();
    setDiagnosticInfo(diagnostic);

    if (!diagnostic.isSupported) {
      setError('Your browser does not support camera/microphone access. Please use Chrome, Firefox, Safari, or Edge.');
      return false;
    }

    if (!diagnostic.isSecureContext) {
      setError('Camera/microphone access requires HTTPS or localhost. Please use a secure connection.');
      return false;
    }

    return true;
  }, []);

  // Update device list
  const updateDeviceList = useCallback(async () => {
    try {
      const availableDevices = await mediaService.current.getAvailableDevices();
      setDevices(availableDevices);
      return availableDevices;
    } catch (error) {
      console.error('Error updating device list:', error);
      return devices;
    }
  }, [devices]);

  // Check current permissions
  const checkCurrentPermissions = useCallback(async () => {
    try {
      const currentPermissions = await mediaService.current.checkPermissions();
      setPermissions(currentPermissions);
      return currentPermissions;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return permissions;
    }
  }, [permissions]);

  // Get user media with comprehensive error handling
  const getUserMedia = useCallback(async (forceRetry = false) => {
    if (!forceRetry && !checkBrowserCompatibility()) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🎥 Attempting to get user media...');
      
      // Update devices and permissions before attempting
      await updateDeviceList();
      await checkCurrentPermissions();

      const result = await mediaService.current.getMediaStream();
      
      if (result && result.stream) {
        setStream(result.stream);
        setRetryCount(0);
        setIsRetrying(false);
        
        console.log('✅ Successfully obtained media stream:', result);
        
        // Update diagnostic info
        setDiagnosticInfo(mediaService.current.getDiagnosticInfo());
        
        return result;
      } else {
        throw new Error('No media stream obtained');
      }
    } catch (err) {
      console.error('❌ Error getting user media:', err);
      setError(err.message);
      
      // Update diagnostic info even on error
      setDiagnosticInfo(mediaService.current.getDiagnosticInfo());
      
      // Auto-retry logic
      if (retryCount < maxRetries && !isRetrying) {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);
        
        console.log(`🔄 Auto-retry attempt ${retryCount + 1}/${maxRetries} in ${retryDelay}ms...`);
        
        setTimeout(() => {
          getUserMedia(true);
        }, retryDelay);
      } else {
        setIsRetrying(false);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [retryCount, isRetrying, checkBrowserCompatibility, updateDeviceList, checkCurrentPermissions]);

  // Manual retry function
  const retryGetUserMedia = useCallback(async () => {
    setRetryCount(0);
    setIsRetrying(false);
    setError(null);
    return await getUserMedia(true);
  }, [getUserMedia]);

  // Test media access without keeping the stream
  const testMediaAccess = useCallback(async () => {
    try {
      const result = await mediaService.current.testMediaAccess();
      setDiagnosticInfo(mediaService.current.getDiagnosticInfo());
      return result;
    } catch (error) {
      console.error('Media access test failed:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Stop current stream
  const stopStream = useCallback(() => {
    if (stream) {
      mediaService.current.stopStream();
      setStream(null);
      console.log('🛑 Media stream stopped');
    }
  }, [stream]);

  // Get specific device stream
  const getDeviceStream = useCallback(async (deviceId, kind = 'videoinput') => {
    try {
      setIsLoading(true);
      setError(null);

      const constraints = {
        video: kind === 'videoinput' ? { deviceId: { exact: deviceId } } : false,
        audio: kind === 'audioinput' ? { deviceId: { exact: deviceId } } : true
      };

      const deviceStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop current stream before setting new one
      if (stream) {
        stopStream();
      }
      
      setStream(deviceStream);
      return deviceStream;
    } catch (error) {
      console.error('Error getting device stream:', error);
      setError(`Failed to access ${kind}: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [stream, stopStream]);

  // Switch camera (front/back on mobile)
  const switchCamera = useCallback(async () => {
    try {
      if (devices.videoInputs.length < 2) {
        throw new Error('No alternative camera available');
      }

      const currentVideoTrack = stream?.getVideoTracks()[0];
      const currentDeviceId = currentVideoTrack?.getSettings()?.deviceId;
      
      // Find next available camera
      const nextDevice = devices.videoInputs.find(device => 
        device.deviceId !== currentDeviceId
      );

      if (nextDevice) {
        await getDeviceStream(nextDevice.deviceId, 'videoinput');
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      setError('Failed to switch camera: ' + error.message);
    }
  }, [devices.videoInputs, stream, getDeviceStream]);

  // Get detailed error information
  const getDetailedError = useCallback(() => {
    if (!error) return null;

    return {
      message: error,
      diagnostic: diagnosticInfo,
      suggestions: generateErrorSuggestions(error, diagnosticInfo),
      canRetry: retryCount < maxRetries,
      retryCount,
      maxRetries
    };
  }, [error, diagnosticInfo, retryCount]);

  // Generate error suggestions based on the error and diagnostic info
  const generateErrorSuggestions = (errorMessage, diagnostic) => {
    const suggestions = [];

    if (!diagnostic?.isSecureContext) {
      suggestions.push({
        type: 'critical',
        message: 'Use HTTPS or localhost',
        action: 'Ensure you are accessing the site via HTTPS or localhost'
      });
    }

    if (diagnostic?.devices?.videoInputs?.length === 0) {
      suggestions.push({
        type: 'warning',
        message: 'No camera detected',
        action: 'Connect a camera and refresh the page'
      });
    }

    if (diagnostic?.devices?.audioInputs?.length === 0) {
      suggestions.push({
        type: 'warning',
        message: 'No microphone detected',
        action: 'Connect a microphone and refresh the page'
      });
    }

    if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
      suggestions.push({
        type: 'error',
        message: 'Permission denied',
        action: 'Click the camera icon in the address bar and allow access'
      });
    }

    if (errorMessage.includes('NotReadableError') || errorMessage.includes('TrackStartError')) {
      suggestions.push({
        type: 'warning',
        message: 'Device in use',
        action: 'Close other applications using the camera/microphone'
      });
    }

    suggestions.push({
      type: 'info',
      message: 'Try different browser',
      action: 'Chrome usually has the best WebRTC support'
    });

    return suggestions;
  };

  // Reset all states
  const reset = useCallback(() => {
    stopStream();
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
    setDiagnosticInfo(null);
  }, [stopStream]);

  return {
    // State
    stream,
    isLoading,
    error,
    devices,
    permissions,
    diagnosticInfo,
    retryCount,
    isRetrying,
    maxRetries,

    // Actions
    getUserMedia,
    retryGetUserMedia,
    testMediaAccess,
    stopStream,
    getDeviceStream,
    switchCamera,
    updateDeviceList,
    checkCurrentPermissions,
    reset,

    // Utilities
    getDetailedError,
    hasVideo: stream?.getVideoTracks().length > 0,
    hasAudio: stream?.getAudioTracks().length > 0,
    isCompatible: diagnosticInfo?.isSupported && diagnosticInfo?.isSecureContext
  };
};