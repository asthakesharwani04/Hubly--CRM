import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Profile form
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Chatbot settings
  const [chatbotSettings, setChatbotSettings] = useState({
    headerColor: '#334755',
    backgroundColor: '#EEEEEE',
    customMessages: {
      message1: 'How can I help you?',
      message2: 'Ask me anything!'
    },
    introductionForm: {
      nameLabel: 'Your name',
      namePlaceholder: 'Your name',
      phoneLabel: 'Your Phone',
      phonePlaceholder: '+1 (000) 000-0000',
      emailLabel: 'Your Email',
      emailPlaceholder: 'example@gmail.com'
    },
    welcomeMessage: "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.",
    missedChatTimer: { hours: 0, minutes: 10, seconds: 0 }
  });

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }));
    }
    fetchChatbotSettings();
  }, [user]);

  const fetchChatbotSettings = async () => {
    try {
      const res = await api.get('/settings/chatbot');
      if (res.data.success) {
        setChatbotSettings(res.data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch chatbot settings:', err);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleProfileSave = async () => {
    setError('');

    // Validation
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    // If password fields are filled, validate them
    const isChangingPassword = profileData.password || profileData.confirmPassword;
    
    if (isChangingPassword) {
      if (!profileData.password) {
        setError('Please provide new password');
        return;
      }
      if (profileData.password.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }
      if (profileData.password !== profileData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    setSaving(true);
    try {
      // Update profile (name)
      await api.put('/auth/profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName
      });

      // Change password if provided
      if (isChangingPassword) {
        await api.put('/auth/change-password', {
          newPassword: profileData.password
        });
        
        // Password changed successfully - logout user
        alert('Password changed successfully. You will be logged out and redirected to login page.');
        logout();
        navigate('/login');
        return;
      }

      // Only profile updated
      alert('Profile updated successfully');
      setProfileData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChatbotChange = (field, value) => {
    setChatbotSettings(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleChatbotSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings/chatbot', chatbotSettings);
      if (res.data.success) {
        alert('Chatbot settings saved successfully');
      }
    } catch (err) {
      console.error('Failed to save chatbot settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const colorOptions = ['#FFFFFF', '#334755', '#4A90A4', '#EEEEEE'];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="settings-layout">
      <Sidebar />
      <div className="settings-content">
        <div className="settings-header">
          <h1>{activeTab === 'profile' ? 'Settings' : 'Chat Bot'}</h1>
        </div>

        {activeTab === 'profile' && (
          <div className="settings-section">
            <div className="settings-tabs">
              <button 
                className="settings-tab settings-tab-active"
                onClick={() => setActiveTab('profile')}
              >
                Edit Profile
              </button>
            </div>

            <div className="settings-form">
              <div className="settings-form-group">
                <label>First name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="settings-form-group">
                <label>Last name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="settings-form-group">
                <label>Email</label>
                <div className="settings-input-with-icon">
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    disabled
                  />
                  <span className="settings-info-icon" title="Email cannot be changed">
                    <img src="/info.svg" alt="" />
                  </span>
                </div>
              </div>

              {/* Current Password field removed */}

              <div className="settings-form-group">
                <label>New Password</label>
                <div className="settings-input-with-icon">
                  <input
                    type="password"
                    name="password"
                    value={profileData.password}
                    onChange={handleProfileChange}
                    placeholder="Enter new password"
                  />
                  <span className="settings-info-icon" title="User will be logged out immediately">
                    <img src="/info.svg" alt="" />
                  </span>
                </div>
              </div>

              <div className="settings-form-group">
                <label>Confirm New Password</label>
                <div className="settings-input-with-icon">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={profileData.confirmPassword}
                    onChange={handleProfileChange}
                    placeholder="Confirm new password"
                  />
                  <span className="settings-info-icon" title="User will be logged out immediately">
                    <img src="/info.svg" alt="" />
                  </span>
                </div>
              </div>

              {error && (
                <div style={{ 
                  color: '#ef4444', 
                  fontSize: '14px', 
                  padding: '12px', 
                  background: '#fef2f2', 
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  {error}
                </div>
              )}

              <div className="settings-form-actions">
                <button 
                  className="settings-save-btn"
                  onClick={handleProfileSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
