import React, { useState } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <textarea
        className="message-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type here"
        disabled={disabled}
        rows={2}
      />
      <button 
        className="message-send-btn"
        onClick={handleSubmit}
        disabled={!message.trim() || disabled}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16l4-4-4-4"></path>
          <path d="M8 12h8"></path>
        </svg>
      </button>
    </div>
  );
};

export default MessageInput;