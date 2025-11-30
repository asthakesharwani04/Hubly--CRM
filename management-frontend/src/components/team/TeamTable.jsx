import React, { useState } from 'react';
import './TeamTable.css';

const TeamTable = ({ members, onEdit, onDelete, currentUserId, currentUserRole }) => {
  const [sortOrder, setSortOrder] = useState('asc');

  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  // ✅ Sort by firstName, then by lastName if firstName is the same
  const sortedMembers = [...members].sort((a, b) => {
    const firstA = (a.firstName || '').toLowerCase();
    const firstB = (b.firstName || '').toLowerCase();

    if (firstA !== firstB) {
      return sortOrder === 'asc'
        ? firstA.localeCompare(firstB)
        : firstB.localeCompare(firstA);
    }

    const lastA = (a.lastName || '').toLowerCase();
    const lastB = (b.lastName || '').toLowerCase();

    return sortOrder === 'asc'
      ? lastA.localeCompare(lastB)
      : lastB.localeCompare(lastA);
  });

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // ✅ Check if current user can edit/delete this member
  const canModifyMember = (member) => {
    const isAdmin = currentUserRole === 'admin';
    const isSelf = member._id === currentUserId;
    const targetIsAdmin = member.role === 'admin';

    // Admin cannot be deleted/edited
    if (targetIsAdmin) return { canEdit: false, canDelete: false };

    // Admin can edit and delete any member (except admin)
    if (isAdmin) return { canEdit: true, canDelete: true };

    // Member can only edit themselves, but NOT delete
    if (isSelf) return { canEdit: true, canDelete: false };

    // No access to other members
    return { canEdit: false, canDelete: false };
  };

  return (
    <div className="team-table-container">
      <table className="team-table">
        <thead>
          <tr>
            <th className="team-table-sortable" onClick={toggleSort}>
              Full Name
              <img src="/up-down.svg" alt="" />
            </th>
            <th>Phone</th>
            <th>Email</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedMembers.map((member) => {
            const { canEdit, canDelete } = canModifyMember(member);
            
            return (
              <tr key={member._id}>
                <td>
                  <div className="team-member-info">
                    <div className="team-member-avatar">
                      {getInitials(member.firstName, member.lastName)}
                    </div>
                    <span className="team-member-name">
                      {member.firstName} {member.lastName}
                    </span>
                  </div>
                </td>
                <td>{member.phone || '+1 (000) 000-0000'}</td>
                <td>{member.email}</td>
                <td>
                  <span className={`team-role-badge ${member.role === 'admin' ? 'team-role-admin' : 'team-role-member'}`}>
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </td>
                <td className="team-actions">
                  {canEdit && (
                    <button 
                      className="team-action-btn"
                      onClick={() => onEdit(member)}
                      title="Edit member"
                    >
                      <img src="/edit.svg" alt="" />
                    </button>
                  )}
                  {canDelete && (
                    <button 
                      className="team-action-btn team-action-delete"
                      onClick={() => onDelete(member)}
                      title="Delete member"
                    >
                      <img src="/delete.svg" alt="" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {members.length === 0 && (
        <div className="team-table-empty">
          <p>No team members found</p>
        </div>
      )}
    </div>
  );
};

export default TeamTable;