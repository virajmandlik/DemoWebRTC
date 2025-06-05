// Video Controls Component
import React from 'react';
import styled from 'styled-components';
import { 
  FiMic, 
  FiMicOff, 
  FiVideo, 
  FiVideoOff, 
  FiMonitor, 
  FiPhone, 
  FiPhoneOff,
  FiSettings,
  FiMaximize2
} from 'react-icons/fi';

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 10px;
    padding: 15px;
  }
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 20px;
  position: relative;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
`;

const MicButton = styled(ControlButton)`
  background: ${props => props.isEnabled ? '#4CAF50' : '#f44336'};
  color: white;

  &:hover:not(:disabled) {
    background: ${props => props.isEnabled ? '#45a049' : '#da190b'};
  }
`;

const VideoButton = styled(ControlButton)`
  background: ${props => props.isEnabled ? '#2196F3' : '#f44336'};
  color: white;

  &:hover:not(:disabled) {
    background: ${props => props.isEnabled ? '#1976D2' : '#da190b'};
  }
`;

const ScreenShareButton = styled(ControlButton)`
  background: ${props => props.isSharing ? '#FF9800' : '#666'};
  color: white;

  &:hover:not(:disabled) {
    background: ${props => props.isSharing ? '#F57C00' : '#777'};
  }
`;

const HangUpButton = styled(ControlButton)`
  background: #f44336;
  color: white;
  width: 60px;
  height: 60px;
  font-size: 24px;

  &:hover:not(:disabled) {
    background: #da190b;
  }

  @media (max-width: 768px) {
    width: 55px;
    height: 55px;
    font-size: 22px;
  }
`;

const SecondaryButton = styled(ControlButton)`
  background: #666;
  color: white;

  &:hover:not(:disabled) {
    background: #777;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;

  ${ControlButton}:hover & {
    opacity: 1;
  }

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`;

const VideoControls = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isConnected,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onHangUp,
  onSettings,
  onFullscreen,
  disabled = false
}) => {
  return (
    <ControlsContainer>
      <ButtonGroup>
        <MicButton
          isEnabled={isAudioEnabled}
          onClick={onToggleAudio}
          disabled={disabled}
        >
          {isAudioEnabled ? <FiMic /> : <FiMicOff />}
          <Tooltip>
            {isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          </Tooltip>
        </MicButton>

        <VideoButton
          isEnabled={isVideoEnabled}
          onClick={onToggleVideo}
          disabled={disabled}
        >
          {isVideoEnabled ? <FiVideo /> : <FiVideoOff />}
          <Tooltip>
            {isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          </Tooltip>
        </VideoButton>

        <ScreenShareButton
          isSharing={isScreenSharing}
          onClick={onToggleScreenShare}
          disabled={disabled || !isConnected}
        >
          <FiMonitor />
          <Tooltip>
            {isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
          </Tooltip>
        </ScreenShareButton>
      </ButtonGroup>

      <HangUpButton
        onClick={onHangUp}
        disabled={disabled}
      >
        <FiPhoneOff />
        <Tooltip>End call</Tooltip>
      </HangUpButton>

      <ButtonGroup>
        {onSettings && (
          <SecondaryButton
            onClick={onSettings}
            disabled={disabled}
          >
            <FiSettings />
            <Tooltip>Settings</Tooltip>
          </SecondaryButton>
        )}

        {onFullscreen && (
          <SecondaryButton
            onClick={onFullscreen}
            disabled={disabled}
          >
            <FiMaximize2 />
            <Tooltip>Fullscreen</Tooltip>
          </SecondaryButton>
        )}
      </ButtonGroup>
    </ControlsContainer>
  );
};

export default VideoControls;