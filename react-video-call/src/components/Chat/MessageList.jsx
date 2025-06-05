// Message List Component
import React from 'react';
import styled from 'styled-components';
import { FiFile, FiDownload } from 'react-icons/fi';

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8f9fa;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 18px;
  word-wrap: break-word;
  position: relative;
  align-self: ${props => props.sender === 'local' ? 'flex-end' : 'flex-start'};
  
  background: ${props => {
    if (props.sender === 'local') return '#2196F3';
    return '#e0e0e0';
  }};
  
  color: ${props => {
    if (props.sender === 'local') return 'white';
    return '#333';
  }};

  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    
    ${props => props.sender === 'local' ? `
      right: -8px;
      top: 50%;
      transform: translateY(-50%);
      border-left-color: #2196F3;
    ` : `
      left: -8px;
      top: 50%;
      transform: translateY(-50%);
      border-right-color: #e0e0e0;
    `}
  }
`;

const MessageText = styled.div`
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 5px;
`;

const MessageTime = styled.div`
  font-size: 11px;
  opacity: 0.7;
  text-align: ${props => props.sender === 'local' ? 'right' : 'left'};
`;

const FileMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-top: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    font-size: 20px;
  }
`;

const FileInfo = styled.div`
  flex: 1;
  
  .file-name {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .file-size {
    font-size: 12px;
    opacity: 0.8;
  }
`;

const TypingIndicator = styled.div`
  align-self: flex-start;
  padding: 10px 15px;
  background: #e0e0e0;
  border-radius: 18px;
  color: #666;
  font-style: italic;
  font-size: 14px;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #666;
  text-align: center;
  padding: 20px;

  svg {
    font-size: 48px;
    margin-bottom: 10px;
    opacity: 0.3;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MessageList = ({ messages, isTyping, messagesEndRef }) => {
  const handleFileDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (messages.length === 0 && !isTyping) {
    return (
      <MessagesContainer>
        <EmptyState>
          <FiFile />
          <p>No messages yet</p>
          <p>Start a conversation!</p>
        </EmptyState>
      </MessagesContainer>
    );
  }

  return (
    <MessagesContainer>
      {messages.map((message) => (
        <MessageBubble key={message.id} sender={message.sender}>
          {message.type === 'file' ? (
            <>
              <MessageText>Shared a file:</MessageText>
              <FileMessage onClick={() => handleFileDownload(message.fileUrl, message.fileName)}>
                <FiFile />
                <FileInfo>
                  <div className="file-name">{message.fileName}</div>
                  <div className="file-size">{formatFileSize(message.fileSize)}</div>
                </FileInfo>
                <FiDownload />
              </FileMessage>
            </>
          ) : (
            <MessageText>{message.text}</MessageText>
          )}
          <MessageTime sender={message.sender}>
            {formatTimestamp(message.timestamp)}
          </MessageTime>
        </MessageBubble>
      ))}
      
      {isTyping && (
        <TypingIndicator>
          Remote user is typing...
        </TypingIndicator>
      )}
      
      <div ref={messagesEndRef} />
    </MessagesContainer>
  );
};

export default MessageList;