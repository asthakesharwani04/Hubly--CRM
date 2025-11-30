import React, { useState } from 'react';
import Dropdown from '../common/Dropdown';
import Modal from '../common/Modal';
import './ChatDetails.css';

const ChatDetails = ({ 
  ticket, 
  teamMembers, 
  onAssign, 
  onStatusChange,
  currentUser 
}) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingAssign, setPendingAssign] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);

  if (!ticket) {
    return (
      <div className="chat-details chat-details-empty">
        <p>Select a chat to view details</p>
      </div>
    );
  }

  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const handleAssignChange = (memberId) => {
    if (memberId !== ticket.assignedTo?._id) {
      setPendingAssign(memberId);
      setShowAssignModal(true);
    }
  };

  const confirmAssign = () => {
    onAssign(ticket._id, pendingAssign);
    setShowAssignModal(false);
    setPendingAssign(null);
  };

  const handleStatusChange = (status) => {
    if (status === 'resolved' && ticket.status !== 'resolved') {
      setPendingStatus(status);
      setShowStatusModal(true);
    } else {
      onStatusChange(ticket._id, status);
    }
  };

  const confirmStatusChange = () => {
    onStatusChange(ticket._id, pendingStatus);
    setShowStatusModal(false);
    setPendingStatus(null);
  };

  const teamOptions = teamMembers.map(member => ({
    value: member._id,
    label: `${member.firstName} ${member.lastName}`,
    firstName: member.firstName,
    lastName: member.lastName
  }));

  const statusOptions = [
    { value: 'resolved', label: 'Resolved' },
    { value: 'unresolved', label: 'Unresolved' }
  ];

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="chat-details">
      <div className="chat-details-header">
        <div className="chat-details-avatar">
          {getInitials(ticket.userName?.split(' ')[0], ticket.userName?.split(' ')[1])}
        </div>
        <span className="chat-details-title">Chat</span>
      </div>

      <div className="chat-details-section">
        <h4 className="chat-details-section-title">Details</h4>
        
        <div className="chat-details-row">
          <div className="chat-details-icon">
            <img src="/member-icon.png" alt="" />
          </div>
          <span className="chat-details-value">{ticket.userName}</span>
         
        </div>

        <div className="chat-details-row">
          <div className="chat-details-icon">
            <img src="/phone-icon.svg" alt="" />
          </div>
          <span className="chat-details-value">{ticket.userPhone}</span>
        </div>

        <div className="chat-details-row">
          <div className="chat-details-icon">
           <img src="/message-icon.svg" alt="" />
          </div>
          <span className="chat-details-value">{ticket.userEmail}</span>
        </div>
      </div>

      <div className="chat-details-section">
        <h4 className="chat-details-section-title">Teammates</h4>
        <Dropdown
          options={teamOptions}
          value={ticket.assignedTo?._id}
          onChange={handleAssignChange}
          disabled={!isAdmin}
          renderOption={(option) => (
            <div className="dropdown-option-avatar">
              <div className="avatar">{getInitials(option.firstName, option.lastName)}</div>
              <span>{option.label}</span>
            </div>
          )}
          renderSelected={(option) => (
            <div className="dropdown-option-avatar">
              <div className="avatar">{getInitials(option.firstName, option.lastName)}</div>
              <span>{option.label}</span>
            </div>
          )}
        />
      </div>

      <div className="chat-details-section">
         <h4 className="chat-details-section-title">Ticket Status</h4>
        <Dropdown
          options={statusOptions}
          value={ticket.status === 'resolved' ? 'resolved' : 'unresolved'}
          onChange={handleStatusChange}
          icon={<img src="/ticket-icon.png" alt="" style={{ width: '18px', height: '18px' }} />}
          placeholder="Ticket status"
        />
      </div>

      {/* Assign Confirmation Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onConfirm={confirmAssign}
        confirmText="Confirm"
        size="small"
      >
        <p className="modal-description">
          Chat would be assigned to Different team member
        </p>
      </Modal>

      {/* Status Change Confirmation Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={confirmStatusChange}
        confirmText="Confirm"
        size="small"
      >
        <p className="modal-description">
          Chat will be closed
        </p>
      </Modal>
    </div>
  );
};

export default ChatDetails;