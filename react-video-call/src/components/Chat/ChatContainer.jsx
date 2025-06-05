// Chat Container Component
import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMessageCircle, FiX, FiMinimize2, FiMaximize2 } from 'react-icons/fi';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: ${props => props.isMinimized ? '60px' : '350px'};
  height: ${props => props.isMinimized ? '60px' : '500px'};
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 1000;
  border: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    width: ${props => props.isMinimized ? '60px' : 'calc(100vw - 40px)'};
    height: ${props => props.isMinimized ? '60px' : '400px'};
    bottom: 10px;
    right: 10px;
  }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: #2196F3;
  color: white;
  border-radius: 12px 12px 0 0;
  cursor: ${props => props.isMinimized ? 'pointer' : 'default'};
  min-height: 30px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const HeaderButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    font-size: 16px;
  }
`;

const ChatContent = styled.div`
  display: ${props => props.isMinimized ? 'none' : 'flex'};
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const MessageCount = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f44336;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const MinimizedIcon = styled.div`
  display: ${props => props.isMinimized ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #2196F3;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    background: #1976D2;
    transform: scale(1.1);
  }

  svg {
    font-size: 24px;
  }
`;

const ChatContainer = ({
  messages,
  newMessage,
  onSendMessage,
  onMessageChange,
  onKeyPress,
  isTyping,
  messagesEndRef,
  isConnected,
  disabled = false
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setUnreadCount(0);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleMinimizedClick = () => {
    setIsMinimized(false);
    setUnreadCount(0);
  };

  // Update unread count when new messages arrive and chat is minimized
  React.useEffect(() => {
    if (isMinimized && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'remote') {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, isMinimized]);

  if (!isVisible) {
    return null;
  }

  return (
    <ChatWrapper isMinimized={isMinimized}>
      {isMinimized ? (
        <MinimizedIcon isMinimized={isMinimized} onClick={handleMinimizedClick}>
          <FiMessageCircle />
          {unreadCount > 0 && <MessageCount>{unreadCount}</MessageCount>}
        </MinimizedIcon>
      ) : (
        <>
          <ChatHeader isMinimized={isMinimized}>
            <h3>Chat</h3>
            <HeaderControls>
              <HeaderButton onClick={handleToggleMinimize}>
                <FiMinimize2 />
              </HeaderButton>
              <HeaderButton onClick={handleClose}>
                <FiX />
              </HeaderButton>
            </HeaderControls>
          </ChatHeader>

          <ChatContent isMinimized={isMinimized}>
            <MessageList
              messages={messages}
              isTyping={isTyping}
              messagesEndRef={messagesEndRef}
            />
            <MessageInput
              value={newMessage}
              onChange={onMessageChange}
              onSend={onSendMessage}
              onKeyPress={onKeyPress}
              disabled={disabled || !isConnected}
              placeholder={
                !isConnected 
                  ? "Connect to start chatting..." 
                  : "Type a message..."
              }
            />
          </ChatContent>
        </>
      )}
    </ChatWrapper>
  );
};

export default ChatContainer;