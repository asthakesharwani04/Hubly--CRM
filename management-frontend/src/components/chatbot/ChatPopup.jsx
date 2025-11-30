import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ChatPopup = ({ settings, onClose, formSubmitted, onFormSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const [userMessages, setUserMessages] = useState([]); // ✅ Track all user messages
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(formSubmitted);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // ✅ Handle sending messages - add to array
  const handleSendMessage = () => {
    if (message.trim() && !submitted) {
      setUserMessages(prev => [...prev, message.trim()]);
      setMessage(''); // Clear input after sending
    }
  };

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: formData.name,
          userPhone: formData.phone,
          userEmail: formData.email,
          initialMessage: userMessages[0] || 'New conversation started'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        onFormSubmit();
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.phone && formData.email;
  const hasUserSentMessage = userMessages.length > 0; // ✅ Check if user has sent any message

  const hasMessage1 = 
    settings.customMessages?.message1 && 
    typeof settings.customMessages.message1 === 'string' && 
    settings.customMessages.message1.trim() !== '';
    
  const hasMessage2 = 
    settings.customMessages?.message2 && 
    typeof settings.customMessages.message2 === 'string' && 
    settings.customMessages.message2.trim() !== '';
    
  const hasAnyCustomMessage = hasMessage1 || hasMessage2;

  return (
    <div className="chat-popup">
      {/* Header */}
      <div className="chat-popup-header" style={{ backgroundColor: settings.headerColor }}>
        <div className="chat-popup-header-content">
          <div className="chat-popup-avatar-wrapper">
            <img src="/robot-avatar.png" alt="Hubly" className="chat-popup-avatar" />
            <span className="chat-popup-status"></span>
          </div>
          <span className="chat-popup-title">Hubly</span>
        </div>
      </div>

      <div className="chat-popup-body" style={{ backgroundColor: settings.backgroundColor }}>
        <div className="chat-messages">
          {/* ✅ Show user's first message */}
          {hasUserSentMessage && (
            <div className="chat-message chat-message-user">
              <div className="chat-message-bubble">{userMessages[0]}</div>
            </div>
          )}

          {/* ✅ Show custom messages ONLY after user sends first message */}
          {hasUserSentMessage && hasAnyCustomMessage && (
            <div className="chat-message chat-message-bot">
              <img src="/robot-avatar.png" alt="" className="chat-message-avatar" />
              <div className="chat-message-bubbles">
                {hasMessage1 && (
                  <div className="chat-message-bubble">
                    {settings.customMessages.message1}
                  </div>
                )}
                {hasMessage2 && (
                  <div className="chat-message-bubble">
                    {settings.customMessages.message2}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ Show intro form ONLY after user sends first message */}
          {hasUserSentMessage && !submitted && (
            <div className="chat-intro-form">
              <div className="chat-message-bot">
                <img src="/robot-avatar.png" alt="" className="chat-message-avatar" />
                <div className="chat-form-card">
                  <h4 className="chat-form-title">Introduction Form</h4>
                  
                  <div className="chat-form-group">
                    <label>{settings.introductionForm?.nameLabel || 'Your name'}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={settings.introductionForm?.namePlaceholder || 'Your name'}
                    />
                  </div>

                  <div className="chat-form-group">
                    <label>{settings.introductionForm?.phoneLabel || 'Your Phone'}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={settings.introductionForm?.phonePlaceholder || '+1 (000) 000-0000'}
                    />
                  </div>

                  <div className="chat-form-group">
                    <label>{settings.introductionForm?.emailLabel || 'Your Email'}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={settings.introductionForm?.emailPlaceholder || 'example@gmail.com'}
                    />
                  </div>

                  {error && <p className="chat-form-error">{error}</p>}

                  <button
                    className="chat-form-submit"
                    onClick={handleFormSubmit}
                    disabled={!isFormValid || isSubmitting}
                    style={{ 
                      backgroundColor: isFormValid ? settings.headerColor : '#999999'
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Thank You!'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Show thank you message after form submission */}
          {submitted && (
            <div className="chat-message chat-message-bot">
              <img src="/robot-avatar.png" alt="" className="chat-message-avatar" />
              <div className="chat-message-bubbles">
                <div className="chat-message-bubble">
                  Thank you! Our team will get back to you soon.
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* ✅ "Start a conversation" - Only show when no message sent */}
        {!hasUserSentMessage && !submitted && (
          <div className="chat-empty-state">
            <p>Start a conversation</p>
          </div>
        )}
      </div>

      <div className="chat-popup-footer">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && message.trim() && !submitted) {
              handleSendMessage();
            }
          }}
          placeholder="Write a message"
          className="chat-popup-input"
          disabled={submitted}
        />
        <button 
          className="chat-popup-send" 
          disabled={submitted || !message.trim()}
          onClick={handleSendMessage}
        >
         <img src="/send-icon.png" alt="" />
        </button>
      </div>
    </div>
  );
};

export default ChatPopup;