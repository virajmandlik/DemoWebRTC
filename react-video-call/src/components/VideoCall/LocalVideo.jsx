// Local Video Component
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiUser, FiMonitor } from 'react-icons/fi';

const VideoWrapper = styled.div`
  position: relative;
  background: #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${props => props.isActive ? '#4CAF50' : '#444'};
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

const StatusIndicator = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.isActive ? '#4CAF50' : '#f44336'};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
`;

const LocalVideo = ({ stream, isScreenSharing }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;

  return (
    <VideoWrapper isActive={!!stream}>
      <StatusIndicator isActive={!!stream} />
      
      {stream && hasVideo ? (
        <Video
          ref={videoRef}
          autoPlay
          muted
          playsInline
        />
      ) : (
        <Placeholder>
          <FiUser />
          <span>Camera Off</span>
        </Placeholder>
      )}
      
      <Label>
        {isScreenSharing ? (
          <>
            <FiMonitor />
            You (Screen)
          </>
        ) : (
          <>
            <FiUser />
            You
          </>
        )}
      </Label>
    </VideoWrapper>
  );
};

export default LocalVideo;