// Remote Video Component
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiUser, FiWifi, FiWifiOff } from 'react-icons/fi';

const VideoWrapper = styled.div`
  position: relative;
  background: #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${props => {
    if (props.connectionState === 'connected') return '#4CAF50';
    if (props.connectionState === 'connecting') return '#FF9800';
    return '#444';
  }};
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #666;
  }
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
`;

const Placeholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 16px;
  gap: 10px;
  text-align: center;
  padding: 20px;

  svg {
    font-size: 48px;
    opacity: 0.5;
  }
`;

const Label = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;

  svg {
    font-size: 14px;
  }
`;

const ConnectionStatus = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;

  svg {
    font-size: 14px;
    color: ${props => {
      if (props.connectionState === 'connected') return '#4CAF50';
      if (props.connectionState === 'connecting') return '#FF9800';
      return '#f44336';
    }};
  }
`;

const RoomInfo = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const getConnectionStatusText = (state) => {
  switch (state) {
    case 'connected':
      return 'Connected';
    case 'connecting':
      return 'Connecting...';
    case 'disconnected':
      return 'Disconnected';
    case 'failed':
      return 'Connection Failed';
    case 'closed':
      return 'Connection Closed';
    default:
      return 'Waiting...';
  }
};

const getPlaceholderText = (connectionState, roomId) => {
  if (!roomId) {
    return 'Create or join a room to start video call';
  }
  
  switch (connectionState) {
    case 'connected':
      return 'Remote camera is off';
    case 'connecting':
      return 'Connecting to remote peer...';
    case 'disconnected':
      return 'Waiting for remote peer to join';
    case 'failed':
      return 'Connection failed. Please try again.';
    case 'closed':
      return 'Remote peer disconnected';
    default:
      return 'Waiting for remote peer...';
  }
};

const RemoteVideo = ({ stream, connectionState, roomId }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
  const hasAudio = stream && stream.getAudioTracks().length > 0;

  return (
    <VideoWrapper connectionState={connectionState}>
      {roomId && (
        <RoomInfo>
          Room: {roomId.slice(0, 8)}...
        </RoomInfo>
      )}
      
      <ConnectionStatus connectionState={connectionState}>
        {connectionState === 'connected' ? <FiWifi /> : <FiWifiOff />}
        {getConnectionStatusText(connectionState)}
      </ConnectionStatus>
      
      {stream && hasVideo ? (
        <Video
          ref={videoRef}
          autoPlay
          playsInline
        />
      ) : (
        <Placeholder>
          <FiUser />
          <span>{getPlaceholderText(connectionState, roomId)}</span>
        </Placeholder>
      )}
      
      {stream && (
        <Label>
          <FiUser />
          Remote {hasAudio ? '🔊' : '🔇'}
        </Label>
      )}
    </VideoWrapper>
  );
};

export default RemoteVideo;