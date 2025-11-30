import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const AddMemberModal = ({ isOpen, onClose, onSave, editMember = null, currentUserRole = 'member' }) => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phone: '',
    role: 'member'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editMember) {
      setFormData({
        userName: `${editMember.firstName} ${editMember.lastName}`,
        email: editMember.email,
        phone: editMember.phone || '',
        role: editMember.role
      });
    } else {
      setFormData({
        userName: '',
        email: '',
        phone: '',
        role: 'member'
      });
    }
    setError('');
  }, [editMember, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.userName || !formData.email) {
      setError('Please fill in required fields');
      return;
    }

    const nameParts = formData.userName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    onSave({
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      ...(editMember && { _id: editMember._id })
    });
  };

  const isAdmin = currentUserRole === 'admin';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editMember ? 'Edit Team member' : 'Add Team members'}
      onConfirm={handleSubmit}
      confirmText="Save"
      size="medium"
    >
      <p className="modal-description">
        {isAdmin 
          ? "Talk with colleagues in a group chat. Messages in this group are only visible to it's participants. New teammates may only be invited by the administrators."
          : "Update your profile information. You can change your name and phone number."}
      </p>

      <div className="modal-form-group">
        <label>User name</label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          placeholder="User name"
        />
      </div>

      <div className="modal-form-group">
        <label>Email ID</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email ID"
          disabled={!!editMember}
        />
      </div>

      <div className="modal-form-group">
        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (000) 000-0000"
        />
      </div>

      {/* ✅ Only admin can see and change role */}
      {isAdmin && (
        <div className="modal-form-group">
          <label>Designation</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}

      {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
    </Modal>
  );
};

export default AddMemberModal;