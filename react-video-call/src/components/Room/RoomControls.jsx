// Room Controls Component
import React, { useState } from 'react';
import styled from 'styled-components';
import { FiVideo, FiUsers, FiCopy, FiCheck, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 50px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 20px;
  }
`;

const StartButton = styled(ActionButton)`
  background: #4CAF50;
  color: white;

  &:hover:not(:disabled) {
    background: #45a049;
  }
`;

const CreateButton = styled(ActionButton)`
  background: #2196F3;
  color: white;

  &:hover:not(:disabled) {
    background: #1976D2;
  }
`;

const JoinButton = styled(ActionButton)`
  background: #FF9800;
  color: white;

  &:hover:not(:disabled) {
    background: #F57C00;
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const RoomInput = styled.input`
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #2196F3;
  }

  &::placeholder {
    color: #999;
  }
`;

const JoinSubmitButton = styled(ActionButton)`
  background: #FF9800;
  color: white;
  flex: none;
  padding: 12px 20px;

  &:hover:not(:disabled) {
    background: #F57C00;
  }
`;

const RoomInfo = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
`;

const RoomIdDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px 15px;
  margin-top: 10px;
`;

const RoomIdText = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #333;
  word-break: break-all;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #1976D2;
  }

  svg {
    font-size: 14px;
  }
`;

const StatusText = styled.p`
  text-align: center;
  color: #666;
  margin: 10px 0 0 0;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const RoomControls = ({
  hasMediaAccess,
  roomId,
  isLoading,
  onStartCamera,
  onCreateRoom,
  onJoinRoom,
  connectionState
}) => {
  const [joinRoomId, setJoinRoomId] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success('Room ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room ID:', err);
      toast.error('Failed to copy room ID');
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      onJoinRoom(joinRoomId.trim());
      setJoinRoomId('');
      setShowJoinInput(false);
    }
  };

  const handleJoinClick = () => {
    setShowJoinInput(true);
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected to peer!';
      case 'connecting':
        return 'Connecting to peer...';
      case 'disconnected':
        return 'Waiting for peer to join...';
      case 'failed':
        return 'Connection failed. Please try again.';
      default:
        return '';
    }
  };

  return (
    <ControlsContainer>
      <Title>Video Call</Title>

      {!hasMediaAccess ? (
        <>
          <StartButton onClick={onStartCamera} disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner />
                Starting Camera...
              </>
            ) : (
              <>
                <FiVideo />
                Start Camera
              </>
            )}
          </StartButton>
          <StatusText>
            Click "Start Camera" to access your camera and microphone
          </StatusText>
        </>
      ) : !roomId ? (
        <>
          <ButtonGroup>
            <CreateButton onClick={onCreateRoom} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Creating...
                </>
              ) : (
                <>
                  <FiUsers />
                  Create Room
                </>
              )}
            </CreateButton>

            {!showJoinInput ? (
              <JoinButton onClick={handleJoinClick} disabled={isLoading}>
                <FiUsers />
                Join Room
              </JoinButton>
            ) : (
              <form onSubmit={handleJoinSubmit} style={{ flex: 1 }}>
                <InputGroup>
                  <RoomInput
                    type="text"
                    placeholder="Enter Room ID"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                  />
                  <JoinSubmitButton type="submit" disabled={isLoading || !joinRoomId.trim()}>
                    {isLoading ? <FiLoader /> : 'Join'}
                  </JoinSubmitButton>
                </InputGroup>
              </form>
            )}
          </ButtonGroup>
          <StatusText>
            Create a new room or join an existing one to start video calling
          </StatusText>
        </>
      ) : (
        <RoomInfo>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Room Created!</h3>
          <p style={{ margin: '0 0 10px 0', color: '#666' }}>
            Share this Room ID with others to join the call:
          </p>
          <RoomIdDisplay>
            <RoomIdText>{roomId}</RoomIdText>
            <CopyButton onClick={handleCopyRoomId}>
              {copied ? <FiCheck /> : <FiCopy />}
              {copied ? 'Copied!' : 'Copy'}
            </CopyButton>
          </RoomIdDisplay>
          {connectionState && (
            <StatusText>{getConnectionStatusText()}</StatusText>
          )}
        </RoomInfo>
      )}
    </ControlsContainer>
  );
};

export default RoomControls;