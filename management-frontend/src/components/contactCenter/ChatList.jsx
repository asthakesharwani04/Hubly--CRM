import React from 'react';
import './ChatList.css';

const ChatList = ({ chats = [], selectedChat, onSelectChat, currentUserId, currentUserRole }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getLastMessage = (chat) => {
    if (chat.lastMessage) return chat.lastMessage;
    return 'No messages yet';
  };

  // ✅ Access rules: Can user VIEW this chat in the list?
  const canViewChat = (chat) => {
    // Admin can VIEW all chats
    if (currentUserRole === 'admin') return true;
    
    // Members can only VIEW chats assigned to them
    const assignedToId = (chat.assignedTo?._id || chat.assignedTo)?.toString();
    const userId = currentUserId?.toString();
    return assignedToId === userId;
  };

  // ✅ Access rules: Can user INTERACT (send messages) with this chat?
  const canInteractWithChat = (chat) => {
    const assignedToId = (chat.assignedTo?._id || chat.assignedTo)?.toString();
    const userId = currentUserId?.toString();
    
    // Debug logging
    console.log('ChatList - Access check:', {
      ticketId: chat._id,
      ticketNumber: chat.ticketId,
      assignedToId: assignedToId,
      currentUserId: userId,
      currentUserRole: currentUserRole,
      isAdmin: currentUserRole === 'admin',
      idsMatch: assignedToId === userId,
      canInteract: assignedToId === userId
    });
    
    // Both admin and members can only interact with chats assigned to them
    return assignedToId === userId;
  };

  // Debug: Log all chats being displayed
  console.log('ChatList - Rendering chats:', {
    totalChats: chats.length,
    currentUserId,
    currentUserRole,
    chats: chats.map(c => ({
      id: c._id,
      ticketId: c.ticketId,
      userName: c.userName,
      assignedTo: c.assignedTo?._id || c.assignedTo,
      canView: canViewChat(c),
      canInteract: canInteractWithChat(c)
    }))
  });

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Chats</h3>
      </div>
      <div className="chat-list-items">
        {chats.length === 0 ? (
          <div className="chat-list-empty">
            <p>No chats available</p>
          </div>
        ) : (
          chats.map((chat) => {
            const canView = canViewChat(chat);
            const canInteract = canInteractWithChat(chat);

            // Don't show chats that user can't view
            if (!canView) return null;

            return (
              <div
                key={chat._id}
                className={`chat-list-item 
                  ${selectedChat?._id === chat._id ? 'chat-list-item-active' : ''} 
                  ${!canInteract ? 'chat-list-item-disabled' : ''} 
                  ${chat.isMissed ? 'chat-list-item-missed' : ''}`
                  .replace(/\s+/g, ' ')
                }
                onClick={() => onSelectChat(chat)}
              >
                <div
                  className={`chat-list-item-indicator ${
                    chat.isMissed ? 'chat-list-item-missed' : ''
                  }`}
                ></div>
                <div className="chat-list-avatar">
                  {getInitials(chat.userName)}
                </div>
                <div className="chat-list-content">
                  <div className="chat-list-name">{chat.userName || 'Chat'}</div>
                  <div className="chat-list-preview">
                    {!canInteract && currentUserRole === 'admin' 
                      ? `Assigned to ${chat.assignedTo?.firstName || 'team member'}` 
                      : getLastMessage(chat)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;