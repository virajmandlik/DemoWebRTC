// Custom hook for WebRTC functionality
import { useState, useEffect, useCallback, useRef } from 'react';
import { WebRTCService } from '../services/webrtc';
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

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [roomId, setRoomId] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const webrtcService = useRef(new WebRTCService());
  const unsubscribeRef = useRef(null);

  // Initialize WebRTC service callbacks
  useEffect(() => {
    const service = webrtcService.current;

    service.onRemoteStream((stream) => {
      setRemoteStream(stream);
    });

    service.onConnectionStateChange((state) => {
      setConnectionState(state);
      setIsConnected(state === 'connected');
    });

    return () => {
      cleanup();
    };
  }, []);

  // Get user media
  const getUserMedia = useCallback(async (constraints = { video: true, audio: true }) => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await webrtcService.current.getUserMedia(constraints);
      setLocalStream(stream);
      setIsAudioEnabled(stream.getAudioTracks()[0]?.enabled || false);
      setIsVideoEnabled(stream.getVideoTracks()[0]?.enabled || false);

      return stream;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create room
  const createRoom = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!localStream) {
        throw new Error('Local stream not available. Please start camera first.');
      }

      // Create peer connection
      webrtcService.current.createPeerConnection();
      webrtcService.current.addLocalStream();
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
        createdBy: 'caller'
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

      return newRoomId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [localStream]);

  // Join room
  const joinRoom = useCallback(async (roomIdToJoin) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!localStream) {
        throw new Error('Local stream not available. Please start camera first.');
      }

      const roomRef = doc(db, 'rooms', roomIdToJoin);
      const roomSnapshot = await getDoc(roomRef);

      if (!roomSnapshot.exists()) {
        throw new Error('Room not found');
      }

      setRoomId(roomIdToJoin);

      // Create peer connection
      webrtcService.current.createPeerConnection();
      webrtcService.current.addLocalStream();

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

      return roomIdToJoin;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    const enabled = webrtcService.current.toggleAudio();
    setIsAudioEnabled(enabled);
    return enabled;
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    const enabled = webrtcService.current.toggleVideo();
    setIsVideoEnabled(enabled);
    return enabled;
  }, []);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await webrtcService.current.startScreenShare();
      setIsScreenSharing(true);
      return screenStream;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    try {
      await webrtcService.current.stopScreenShare();
      setIsScreenSharing(false);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Send message
  const sendMessage = useCallback((message) => {
    return webrtcService.current.sendMessage(message);
  }, []);

  // Set message callback
  const onMessage = useCallback((callback) => {
    webrtcService.current.onDataChannelMessage(callback);
  }, []);

  // Cleanup function
  const cleanup = useCallback(async () => {
    try {
      // Unsubscribe from Firestore listeners
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      // Delete room from Firestore
      if (roomId) {
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
      }

      // Cleanup WebRTC service
      webrtcService.current.cleanup();

      // Reset state
      setLocalStream(null);
      setRemoteStream(null);
      setIsConnected(false);
      setConnectionState('disconnected');
      setRoomId(null);
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);
      setIsScreenSharing(false);
      setError(null);
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  }, [roomId]);

  // Hang up
  const hangUp = useCallback(async () => {
    await cleanup();
  }, [cleanup]);

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
    error,
    isLoading,

    // Actions
    getUserMedia,
    createRoom,
    joinRoom,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    sendMessage,
    onMessage,
    hangUp,
    cleanup
  };
};