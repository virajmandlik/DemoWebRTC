// Enhanced Main App Component with comprehensive media diagnostics
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Hooks
import { useEnhancedWebRTC } from './hooks/useEnhancedWebRTC';
import { useChat } from './hooks/useChat';

// Components
import VideoContainer from './components/VideoCall/VideoContainer';
import VideoControls from './components/VideoCall/VideoControls';
import ChatContainer from './components/Chat/ChatContainer';
import RoomControls from './components/Room/RoomControls';
import MediaDiagnostic from './components/MediaDiagnostic/MediaDiagnostic';

// Services
import { FileService } from './services/fileService';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.header`
  text-align: center;
  color: white;
  margin-bottom: 20px;

  h1 {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  p {
    margin: 10px 0 0 0;
    font-size: 1.1rem;
    opacity: 0.9;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const VideoSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ErrorSection = styled.section`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  color: #856404;
`;

const ErrorTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(ActionButton)`
  background: #2196F3;
  color: white;
  
  &:hover:not(:disabled) {
    background: #1976D2;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover:not(:disabled) {
    background: #e0e0e0;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: white;
  font-size: 18px;
  gap: 15px;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const DiagnosticToggle = styled.button`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: #FF9800;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 1000;
  
  &:hover {
    background: #F57C00;
    transform: scale(1.1);
  }
  
  svg {
    font-size: 24px;
  }
`;

function App() {
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [autoShowDiagnostic, setAutoShowDiagnostic] = useState(false);

  const {
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
    
    // Enhanced actions
    retryGetUserMedia,
    testMediaAccess,
    getDiagnosticInfo
  } = useEnhancedWebRTC();

  const {
    messages,
    newMessage,
    isTyping,
    messagesEndRef,
    sendChatMessage,
    handleInputChange,
    handleKeyPress,
    addMessage
  } = useChat(sendMessage, onMessage);

  const fileService = new FileService();

  // Auto-show diagnostic if there are compatibility issues
  useEffect(() => {
    if (error && !isCompatible && !autoShowDiagnostic) {
      setShowDiagnostic(true);
      setAutoShowDiagnostic(true);
    }
  }, [error, isCompatible, autoShowDiagnostic]);

  // Handle errors with enhanced toast notifications
  useEffect(() => {
    if (error) {
      // Show different toast types based on error severity
      if (error.includes('Permission denied') || error.includes('NotAllowedError')) {
        toast.error('🔒 Camera/microphone permission denied. Please allow access and try again.');
      } else if (error.includes('NotFoundError') || error.includes('DevicesNotFoundError')) {
        toast.error('📹 No camera/microphone found. Please connect devices and refresh.');
      } else if (error.includes('NotReadableError') || error.includes('TrackStartError')) {
        toast.warning('⚠️ Device is busy. Close other apps using camera/microphone.');
      } else if (error.includes('HTTPS') || error.includes('secure')) {
        toast.error('🔒 Secure connection required. Please use HTTPS or localhost.');
      } else {
        toast.error(`❌ ${error}`);
      }
    }
  }, [error]);

  // Handle connection state changes
  useEffect(() => {
    if (connectionState === 'connected') {
      toast.success('🎉 Connected to peer!');
    } else if (connectionState === 'failed') {
      toast.error('💔 Connection failed. Please try again.');
    }
  }, [connectionState]);

  // Enhanced camera/media handlers
  const handleStartCamera = async () => {
    try {
      console.log('🎬 Starting camera with enhanced diagnostics...');
      const result = await getUserMedia();
      
      if (result) {
        toast.success(`✅ Camera started! Video: ${result.hasVideo ? 'ON' : 'OFF'}, Audio: ${result.hasAudio ? 'ON' : 'OFF'}`);
        
        // Show diagnostic if fallback was used
        if (result.fallbackUsed > 0) {
          toast.info(`ℹ️ Using fallback configuration (level ${result.fallbackUsed})`);
        }
      }
    } catch (err) {
      console.error('❌ Error starting camera:', err);
      
      // Auto-show diagnostic on camera failure
      setShowDiagnostic(true);
      
      // Enhanced error message
      toast.error('🚨 Failed to access camera/microphone. Check diagnostic panel for solutions.');
    }
  };

  const handleCreateRoom = async () => {
    try {
      const newRoomId = await createRoom();
      toast.success(`🏠 Room created! ID: ${newRoomId.slice(0, 8)}...`);
    } catch (err) {
      console.error('Error creating room:', err);
      toast.error('Failed to create room. Please try again.');
    }
  };

  const handleJoinRoom = async (roomIdToJoin) => {
    try {
      await joinRoom(roomIdToJoin);
      toast.success('🚪 Joined room successfully!');
    } catch (err) {
      console.error('Error joining room:', err);
      toast.error('Failed to join room. Please check the room ID.');
    }
  };

  // Video control handlers with enhanced feedback
  const handleToggleAudio = () => {
    const enabled = toggleAudio();
    toast.info(enabled ? '🎤 Microphone unmuted' : '🔇 Microphone muted');
  };

  const handleToggleVideo = () => {
    const enabled = toggleVideo();
    toast.info(enabled ? '📹 Camera turned on' : '📷 Camera turned off');
  };

  const handleToggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await stopScreenShare();
        toast.info('🛑 Screen sharing stopped');
      } else {
        await startScreenShare();
        toast.success('🖥️ Screen sharing started');
      }
    } catch (err) {
      console.error('Error toggling screen share:', err);
      toast.error('Failed to toggle screen sharing');
    }
  };

  const handleHangUp = async () => {
    try {
      await hangUp();
      toast.info('📞 Call ended');
    } catch (err) {
      console.error('Error hanging up:', err);
    }
  };

  // Enhanced retry handler
  const handleRetry = async () => {
    try {
      toast.info('🔄 Retrying camera access...');
      await retryGetUserMedia();
      toast.success('✅ Retry successful!');
    } catch (err) {
      toast.error('❌ Retry failed. Check diagnostic panel for solutions.');
    }
  };

  // Diagnostic handlers
  const handleTestMedia = async () => {
    try {
      return await testMediaAccess();
    } catch (err) {
      console.error('Media test failed:', err);
      return { success: false, error: err.message };
    }
  };

  const handleRefreshDevices = async () => {
    try {
      toast.info('🔄 Refreshing device list...');
      // This would be handled by the useMediaDevices hook
      window.location.reload(); // Simple refresh for now
    } catch (err) {
      toast.error('Failed to refresh devices');
    }
  };

  // File sharing handler
  const handleFileSelect = async (file) => {
    try {
      if (!roomId) {
        toast.error('Please join a room first');
        return;
      }

      toast.info('📤 Uploading file...');
      
      const fileData = await fileService.uploadFile(file, roomId, (progress) => {
        console.log('Upload progress:', progress);
      });

      const fileMessage = {
        type: 'file',
        fileName: fileData.name,
        fileUrl: fileData.url,
        fileSize: fileData.size,
        fileType: fileData.type,
        timestamp: new Date().toISOString()
      };

      const success = sendMessage(JSON.stringify(fileMessage));
      
      if (success) {
        addMessage(`Shared a file: ${fileData.name}`, 'local', 'file');
        toast.success('📎 File shared successfully!');
      } else {
        toast.error('Failed to share file');
      }
    } catch (err) {
      console.error('Error sharing file:', err);
      toast.error('Failed to share file: ' + err.message);
    }
  };

  // Fullscreen handler
  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const hasMediaAccess = !!localStream;
  const showVideoCall = hasMediaAccess && roomId;
  const showErrorSection = error && !showVideoCall;

  return (
    <AppContainer>
      <Header>
        <h1>Enhanced Video Call</h1>
        <p>High-quality video calling with comprehensive diagnostics</p>
      </Header>

      <MainContent>
        {/* Error Section with Enhanced Actions */}
        {showErrorSection && (
          <ErrorSection>
            <ErrorTitle>
              🚨 Camera/Microphone Issue Detected
            </ErrorTitle>
            <p>
              We detected an issue accessing your camera or microphone. 
              {retryCount > 0 && ` (Retry attempt: ${retryCount}/${3})`}
            </p>
            <ErrorActions>
              <PrimaryButton onClick={handleRetry} disabled={isLoading || isRetrying}>
                {isRetrying ? '🔄 Retrying...' : '🔄 Retry Access'}
              </PrimaryButton>
              <SecondaryButton onClick={() => setShowDiagnostic(true)}>
                🔧 Open Diagnostic
              </SecondaryButton>
              <SecondaryButton onClick={() => window.location.reload()}>
                🔃 Refresh Page
              </SecondaryButton>
            </ErrorActions>
          </ErrorSection>
        )}

        {/* Main Content */}
        {!showVideoCall ? (
          <RoomControls
            hasMediaAccess={hasMediaAccess}
            roomId={roomId}
            isLoading={isLoading}
            onStartCamera={handleStartCamera}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            connectionState={connectionState}
          />
        ) : (
          <VideoSection>
            <VideoContainer
              localStream={localStream}
              remoteStream={remoteStream}
              isScreenSharing={isScreenSharing}
              connectionState={connectionState}
              roomId={roomId}
            />
            
            <VideoControls
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              isScreenSharing={isScreenSharing}
              isConnected={isConnected}
              onToggleAudio={handleToggleAudio}
              onToggleVideo={handleToggleVideo}
              onToggleScreenShare={handleToggleScreenShare}
              onHangUp={handleHangUp}
              onFullscreen={handleFullscreen}
              disabled={isLoading}
            />
          </VideoSection>
        )}

        {/* Chat Container */}
        {showVideoCall && (
          <ChatContainer
            messages={messages}
            newMessage={newMessage}
            onSendMessage={sendChatMessage}
            onMessageChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFileSelect={handleFileSelect}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
            isConnected={isConnected}
            disabled={isLoading}
          />
        )}

        {/* Media Diagnostic Panel */}
        {showDiagnostic && (
          <MediaDiagnostic
            diagnosticInfo={diagnosticInfo}
            devices={devices}
            permissions={permissions}
            error={error}
            onTest={handleTestMedia}
            onRetry={handleRetry}
            onRefreshDevices={handleRefreshDevices}
            isLoading={isLoading}
          />
        )}
      </MainContent>

      {/* Diagnostic Toggle Button */}
      <DiagnosticToggle 
        onClick={() => setShowDiagnostic(!showDiagnostic)}
        title="Toggle Media Diagnostic"
      >
        🔧
      </DiagnosticToggle>

      {/* Loading Overlay */}
      {isLoading && (
        <LoadingOverlay>
          <div className="spinner"></div>
          <span>
            {isRetrying ? `Retrying... (${retryCount}/${3})` : 'Loading...'}
          </span>
        </LoadingOverlay>
      )}

      {/* Enhanced Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{
          fontSize: '14px',
          borderRadius: '8px'
        }}
      />
    </AppContainer>
  );
}

export default App;