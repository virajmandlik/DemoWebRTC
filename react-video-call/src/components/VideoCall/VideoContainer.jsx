// Video Container Component
import React from 'react';
import styled from 'styled-components';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    flex-direction: row;
    height: 500px;
  }
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 767px) {
    grid-template-rows: 1fr auto;
  }
`;

const VideoContainer = ({ 
  localStream, 
  remoteStream, 
  isScreenSharing,
  connectionState,
  roomId 
}) => {
  return (
    <Container>
      <VideoGrid>
        <LocalVideo 
          stream={localStream}
          isScreenSharing={isScreenSharing}
        />
        <RemoteVideo 
          stream={remoteStream}
          connectionState={connectionState}
          roomId={roomId}
        />
      </VideoGrid>
    </Container>
  );
};

export default VideoContainer;