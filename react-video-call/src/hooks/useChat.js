// Custom hook for chat functionality
import { useState, useCallback, useRef, useEffect } from 'react';

export const useChat = (sendMessage, onMessage) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Add message to chat
  const addMessage = useCallback((message, sender = 'local', type = 'text') => {
    const newMsg = {
      id: Date.now() + Math.random(),
      text: message,
      sender,
      type,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  // Send chat message
  const sendChatMessage = useCallback(() => {
    if (newMessage.trim() && sendMessage) {
      const messageData = {
        type: 'chat',
        text: newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      const success = sendMessage(JSON.stringify(messageData));
      
      if (success) {
        addMessage(newMessage.trim(), 'local');
        setNewMessage('');
      } else {
        console.error('Failed to send message');
      }
    }
  }, [newMessage, sendMessage, addMessage]);

  // Handle received messages
  useEffect(() => {
    if (onMessage) {
      onMessage((data) => {
        try {
          const messageData = JSON.parse(data);
          
          switch (messageData.type) {
            case 'chat':
              addMessage(messageData.text, 'remote');
              break;
            case 'typing':
              setIsTyping(true);
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
              }, 3000);
              break;
            case 'file':
              addMessage(`Shared a file: ${messageData.fileName}`, 'remote', 'file');
              break;
            default:
              console.log('Unknown message type:', messageData.type);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
          // Treat as plain text message
          addMessage(data, 'remote');
        }
      });
    }
  }, [onMessage, addMessage]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(() => {
    if (sendMessage) {
      const typingData = {
        type: 'typing',
        timestamp: new Date().toISOString()
      };
      sendMessage(JSON.stringify(typingData));
    }
  }, [sendMessage]);

  // Handle input change
  const handleInputChange = useCallback((value) => {
    setNewMessage(value);
    
    // Send typing indicator
    if (value.length > 0) {
      sendTypingIndicator();
    }
  }, [sendTypingIndicator]);

  // Handle key press
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  }, [sendChatMessage]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Format timestamp
  const formatTimestamp = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Get message count
  const getMessageCount = useCallback(() => {
    return messages.length;
  }, [messages.length]);

  // Get unread count (for notifications)
  const getUnreadCount = useCallback(() => {
    // This could be enhanced to track actual unread messages
    return 0;
  }, []);

  return {
    // State
    messages,
    newMessage,
    isTyping,
    messagesEndRef,

    // Actions
    addMessage,
    sendChatMessage,
    handleInputChange,
    handleKeyPress,
    clearMessages,
    scrollToBottom,

    // Utilities
    formatTimestamp,
    getMessageCount,
    getUnreadCount,

    // Setters
    setNewMessage
  };
};