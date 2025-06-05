// Enhanced WebRTC hook with comprehensive media handling
import { useState, useEffect, useCallback, useRef } from 'react';
import { WebRTCService } from '../services/webrtc';
import { useMediaDevices } from './useMediaDevices';
import { db } from '../services/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  addDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';

export const useEnhancedWebRTC = () => {
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [roomId, setRoomId] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [webrtcError, setWebrtcError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaResult, setMediaResult] = useState(null);

  // Use enhanced media devices hook
  const {
    stream: localStream,
    isLoading: mediaLoading,
    error: mediaError,
    devices,
    permissions,
    diagnosticInfo,
    retryCount,
    isRetrying,
    getUserMedia,
    retryGetUserMedia,
    testMediaAccess,
    stopStream,
    hasVideo,
    hasAudio,
    isCompatible,
    getDetailedError
  } = useMediaDevices();

  const webrtcService = useRef(new WebRTCService());
  const unsubscribeRef = useRef(null);

  // Combine loading states
  const combinedLoading = isLoading || mediaLoading || isRetrying;
  
  // Combine errors with priority to media errors
  const combinedError = mediaError || webrtcError;

  // Audio and video enabled states based on actual tracks
  const isAudioEnabled = hasAudio && localStream?.getAudioTracks()[0]?.enabled;
  const isVideoEnabled = hasVideo && localStream?.getVideoTracks()[0]?.enabled;

  // Initialize WebRTC service callbacks
  useEffect(() => {
    const service = webrtcService.current;

    service.onRemoteStream((stream) => {
      console.log('📺 Remote stream received');
      setRemoteStream(stream);
    });

    service.onConnectionStateChange((state) => {
      console.log('🔗 Connection state changed:', state);
      setConnectionState(state);
      setIsConnected(state === 'connected');
    });

    return () => {
      cleanup();
    };
  }, []);

  // Enhanced getUserMedia with comprehensive error handling
  const startCamera = useCallback(async () => {
    try {
      setWebrtcError(null);
      console.log('🎥 Starting camera with enhanced media service...');
      
      const result = await getUserMedia();
      setMediaResult(result);
      
      console.log('✅ Camera started successfully:', {
        hasVideo: result?.hasVideo,
        hasAudio: result?.hasAudio,
        retryCount: retryCount
      });
      
      return result;
    } catch (err) {
      console.error('❌ Failed to start camera:', err);
      setWebrtcError(err.message);
      throw err;
    }
  }, [getUserMedia, retryCount]);

  // Create room with enhanced error handling
  const createRoom = useCallback(async () => {
    try {
      setIsLoading(true);
      setWebrtcError(null);

      if (!localStream) {
        throw new Error('Local stream not available. Please start camera first.');
      }

      console.log('🏠 Creating room...');

      // Create peer connection
      webrtcService.current.createPeerConnection();
      
      // Add local stream - handle the enhanced result format
      if (localStream) {
        webrtcService.current.localStream = localStream;
        webrtcService.current.addLocalStream();
      }
      
      webrtcService.current.createDataChannel();

      // Create room document
      const roomRef = doc(collection(db, 'rooms'));
      const newRoomId = roomRef.id;
      setRoomId(newRoomId);

      const callerCandidatesCollection = collection(roomRef, 'callerCandidates');

      // Collect ICE candidates
      webrtcService.current.peerConnection.addEventListener('icecandidate', async (event) => {
        if (event.candidate) {
          await addDoc(callerCandidatesCollection, event.candidate.toJSON());
        }
      });

      // Create offer
      const offer = await webrtcService.current.createOffer();

      const roomData = {
        offer: {
          type: offer.type,
          sdp: offer.sdp
        },
        createdAt: new Date(),
        createdBy: 'caller',
        mediaInfo: {
          hasVideo: hasVideo,
          hasAudio: hasAudio,
          fallbackUsed: mediaResult?.fallbackUsed || 0
        }
      };

      await setDoc(roomRef, roomData);

      // Listen for answer
      const unsubscribe = onSnapshot(roomRef, async (snapshot) => {
        const data = snapshot.data();
        if (data?.answer && !webrtcService.current.peerConnection.currentRemoteDescription) {
          await webrtcService.current.setRemoteDescription(data.answer);
        }
      });

      // Listen for callee candidates
      const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
      const calleeCandidatesUnsubscribe = onSnapshot(calleeCandidatesCollection, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const candidate = change.doc.data();
            await webrtcService.current.addIceCandidate(candidate);
          }
        });
      });

      unsubscribeRef.current = () => {
        unsubscribe();
        calleeCandidatesUnsubscribe();
      };

      console.log('✅ Room created successfully:', newRoomId);
      return newRoomId;
    } catch (err) {
      console.error('❌ Error creating room:', err);
      setWebrtcError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [localStream, hasVideo, hasAudio, mediaResult]);

  // Join room with enhanced error handling
  const joinRoom = useCallback(async (roomIdToJoin) => {
    try {
      setIsLoading(true);
      setWebrtcError(null);

      if (!localStream) {
        throw new Error('Local stream not available. Please start camera first.');
      }

      console.log('🚪 Joining room:', roomIdToJoin);

      const roomRef = doc(db, 'rooms', roomIdToJoin);
      const roomSnapshot = await getDoc(roomRef);

      if (!roomSnapshot.exists()) {
        throw new Error('Room not found. Please check the room ID.');
      }

      setRoomId(roomIdToJoin);

      // Create peer connection
      webrtcService.current.createPeerConnection();
      
      // Add local stream
      if (localStream) {
        webrtcService.current.localStream = localStream;
        webrtcService.current.addLocalStream();
      }

      const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');

      // Collect ICE candidates
      webrtcService.current.peerConnection.addEventListener('icecandidate', async (event) => {
        if (event.candidate) {
          await addDoc(calleeCandidatesCollection, event.candidate.toJSON());
        }
      });

      // Set remote description and create answer
      const roomData = roomSnapshot.data();
      await webrtcService.current.setRemoteDescription(roomData.offer);
      const answer = await webrtcService.current.createAnswer();

      await updateDoc(roomRef, {
        answer: {
          type: answer.type,
          sdp: answer.sdp
        },
        joinedAt: new Date(),
        calleeMediaInfo: {
          hasVideo: hasVideo,
          hasAudio: hasAudio,
          fallbackUsed: mediaResult?.fallbackUsed || 0
        }
      });

      // Listen for caller candidates
      const callerCandidatesCollection = collection(roomRef, 'callerCandidates');
      const callerCandidatesUnsubscribe = onSnapshot(callerCandidatesCollection, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const candidate = change.doc.data();
            await webrtcService.current.addIceCandidate(candidate);
          }
        });
      });

      unsubscribeRef.current = callerCandidatesUnsubscribe;

      console.log('✅ Joined room successfully:', roomIdToJoin);
      return roomIdToJoin;
    } catch (err) {
      console.error('❌ Error joining room:', err);
      setWebrtcError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [localStream, hasVideo, hasAudio, mediaResult]);

  // Toggle audio with enhanced feedback
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('🎤 Audio toggled:', audioTrack.enabled ? 'ON' : 'OFF');
        return audioTrack.enabled;
      }
    }
    console.warn('⚠️ No audio track available to toggle');
    return false;
  }, [localStream]);

  // Toggle video with enhanced feedback
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log('�� Video toggled:', videoTrack.enabled ? 'ON' : 'OFF');
        return videoTrack.enabled;
      }
    }
    console.warn('⚠️ No video track available to toggle');
    return false;
  }, [localStream]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      console.log('🖥️ Starting screen share...');
      const screenStream = await webrtcService.current.startScreenShare();
      setIsScreenSharing(true);
      console.log('✅ Screen sharing started');
      return screenStream;
    } catch (err) {
      console.error('❌ Error starting screen share:', err);
      setWebrtcError(err.message);
      throw err;
    }
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    try {
      console.log('🛑 Stopping screen share...');
      await webrtcService.current.stopScreenShare();
      setIsScreenSharing(false);
      console.log('✅ Screen sharing stopped');
    } catch (err) {
      console.error('❌ Error stopping screen share:', err);
      setWebrtcError(err.message);
      throw err;
    }
  }, []);

  // Send message
  const sendMessage = useCallback((message) => {
    const success = webrtcService.current.sendMessage(message);
    if (!success) {
      console.warn('⚠️ Failed to send message - data channel not ready');
    }
    return success;
  }, []);

  // Set message callback
  const onMessage = useCallback((callback) => {
    webrtcService.current.onDataChannelMessage(callback);
  }, []);

  // Enhanced cleanup function
  const cleanup = useCallback(async () => {
    try {
      console.log('🧹 Cleaning up WebRTC connection...');
      
      // Unsubscribe from Firestore listeners
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      // Delete room from Firestore
      if (roomId) {
        try {
          const roomRef = doc(db, 'rooms', roomId);
          
          // Delete subcollections
          const callerCandidates = await getDocs(collection(roomRef, 'callerCandidates'));
          const calleeCandidates = await getDocs(collection(roomRef, 'calleeCandidates'));
          
          const deletePromises = [
            ...callerCandidates.docs.map(doc => deleteDoc(doc.ref)),
            ...calleeCandidates.docs.map(doc => deleteDoc(doc.ref))
          ];
          
          await Promise.all(deletePromises);
          await deleteDoc(roomRef);
          console.log('🗑️ Room deleted from Firestore');
        } catch (error) {
          console.warn('⚠️ Error deleting room from Firestore:', error);
        }
      }

      // Cleanup WebRTC service
      webrtcService.current.cleanup();

      // Stop media stream
      stopStream();

      // Reset state
      setRemoteStream(null);
      setIsConnected(false);
      setConnectionState('disconnected');
      setRoomId(null);
      setIsScreenSharing(false);
      setWebrtcError(null);
      setMediaResult(null);
      
      console.log('✅ Cleanup completed');
    } catch (err) {
      console.error('❌ Error during cleanup:', err);
    }
  }, [roomId, stopStream]);

  // Hang up
  const hangUp = useCallback(async () => {
    console.log('📞 Hanging up call...');
    await cleanup();
  }, [cleanup]);

  // Get comprehensive diagnostic information
  const getDiagnosticInfo = useCallback(() => {
    return {
      media: {
        devices,
        permissions,
        diagnosticInfo,
        hasVideo,
        hasAudio,
        isCompatible,
        retryCount,
        isRetrying,
        mediaResult
      },
      webrtc: {
        connectionState,
        isConnected,
        roomId,
        isScreenSharing,
        localStreamActive: localStream?.active,
        remoteStreamActive: remoteStream?.active
      },
      errors: {
        mediaError,
        webrtcError,
        combinedError,
        detailedError: getDetailedError()
      }
    };
  }, [
    devices, permissions, diagnosticInfo, hasVideo, hasAudio, isCompatible,
    retryCount, isRetrying, mediaResult, connectionState, isConnected,
    roomId, isScreenSharing, localStream, remoteStream, mediaError,
    webrtcError, combinedError, getDetailedError
  ]);

  return {
    // State
    localStream,
    remoteStream,
    isConnected,
    connectionState,
    roomId,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    error: combinedError,
    isLoading: combinedLoading,

    // Enhanced media state
    devices,
    permissions,
    diagnosticInfo,
    hasVideo,
    hasAudio,
    isCompatible,
    retryCount,
    isRetrying,

    // Actions
    getUserMedia: startCamera,
    createRoom,
    joinRoom,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    sendMessage,
    onMessage,
    hangUp,
    cleanup,

    // Enhanced actions
    retryGetUserMedia,
    testMediaAccess,
    getDiagnosticInfo
  };
};