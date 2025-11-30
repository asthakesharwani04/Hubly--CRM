import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import TeamTable from '../components/team/TeamTable';
import AddMemberModal from '../components/team/AddMemberModal';
import DeleteModal from '../components/team/DeleteModal';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './Team.css';

const Team = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setEditMember(null);
    setShowAddModal(true);
  };

  const handleEditMember = (member) => {
    setEditMember(member);
    setShowAddModal(true);
  };

  const handleDeleteMember = (member) => {
    setDeleteMember(member);
    setShowDeleteModal(true);
  };

  const handleSaveMember = async (memberData) => {
    try {
      if (editMember) {
        // Update existing member
        const res = await api.put(`/users/${editMember._id}`, memberData);
        if (res.data.success) {
          setMembers(prev => prev.map(m => 
            m._id === editMember._id ? res.data.data : m
          ));
          
          // If user edited themselves, update auth context
          if (editMember._id === (user?.id || user?._id)) {
            console.log('User updated their own profile');
          }
        }
      } else {
        // Add new member
        const res = await api.post('/users', memberData);
        if (res.data.success) {
          setMembers(prev => [...prev, res.data.data]);
        }
      }
      setShowAddModal(false);
      setEditMember(null);
    } catch (err) {
      console.error('Failed to save member:', err);
      alert(err.response?.data?.message || 'Failed to save member');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await api.delete(`/users/${deleteMember._id}`);
      if (res.data.success) {
        setMembers(prev => prev.filter(m => m._id !== deleteMember._id));
        
        // ✅ Show success message with ticket reassignment info
        const message = res.data.message || 'User deleted successfully';
        alert(message);
      }
      setShowDeleteModal(false);
      setDeleteMember(null);
    } catch (err) {
      console.error('Failed to delete member:', err);
      alert(err.response?.data?.message || 'Failed to delete member');
    }
  };

  const isAdmin = user?.role === 'admin';
  const currentUserId = user?.id || user?._id;

  if (loading) {
    return (
      <div className="team-layout">
        <Sidebar />
        <div className="team-loading">
          <Loader size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="team-layout">
      <Sidebar />
      <div className="team-content">
        <div className="team-header">
          <h1>Team</h1>
        </div>
        <div className="team-main">
          <TeamTable
            members={members}
            onEdit={handleEditMember}
            onDelete={handleDeleteMember}
            currentUserId={currentUserId}
            currentUserRole={user?.role}
          />
          
          {/*Only admin can add new team members */}
          {isAdmin && (
            <button className="team-add-btn" onClick={handleAddMember}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Add Team members
            </button>
          )}
        </div>
      </div>

      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditMember(null);
        }}
        onSave={handleSaveMember}
        editMember={editMember}
        currentUserRole={user?.role}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteMember(null);
        }}
        onConfirm={handleConfirmDelete}
        memberName={deleteMember ? `${deleteMember.firstName} ${deleteMember.lastName}` : ''}
      />
    </div>
  );
};

export default Team;