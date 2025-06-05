// Message Input Component
import React, { useRef } from 'react';
import styled from 'styled-components';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';

const InputContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 15px;
  background: white;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 12px 12px;
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-end;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 8px 15px;
  border: 1px solid #e0e0e0;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: #2196F3;
    background: white;
  }
`;

const TextInput = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  max-height: 100px;
  min-height: 20px;
  padding: 0;
  
  &::placeholder {
    color: #999;
  }

  &:disabled {
    color: #999;
    cursor: not-allowed;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.primary ? '#2196F3' : '#f5f5f5'};
  color: ${props => props.primary ? 'white' : '#666'};

  &:hover:not(:disabled) {
    background: ${props => props.primary ? '#1976D2' : '#e0e0e0'};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 16px;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const EmojiButton = styled(ActionButton)`
  margin-right: 5px;
`;

const AttachButton = styled(ActionButton)`
  margin-right: 5px;
`;

const MessageInput = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  onFileSelect,
  disabled = false,
  placeholder = "Type a message..."
}) => {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
    
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  const handleSendClick = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  const handleFileClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    // Reset file input
    e.target.value = '';
  };

  const handleEmojiClick = () => {
    // This could be enhanced with an emoji picker
    const emojis = ['😊', '😂', '👍', '❤️', '🎉', '🤔', '😢', '😮'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    onChange(value + randomEmoji);
  };

  return (
    <InputContainer>
      <InputWrapper>
        {onFileSelect && (
          <>
            <AttachButton
              onClick={handleFileClick}
              disabled={disabled}
              title="Attach file"
            >
              <FiPaperclip />
            </AttachButton>
            <FileInput
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
          </>
        )}

        <EmojiButton
          onClick={handleEmojiClick}
          disabled={disabled}
          title="Add emoji"
        >
          <FiSmile />
        </EmojiButton>

        <TextInput
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
        />
      </InputWrapper>

      <ActionButton
        primary
        onClick={handleSendClick}
        disabled={disabled || !value.trim()}
        title="Send message"
      >
        <FiSend />
      </ActionButton>
    </InputContainer>
  );
};

export default MessageInput;