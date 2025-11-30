import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import ChatList from '../components/contactCenter/ChatList';
import ChatBox from '../components/contactCenter/ChatBox';
import ChatDetails from '../components/contactCenter/ChatDetails';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './ContactCenter.css';

const ContactCenter = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    console.log('Current user from useAuth:', user);
    fetchTickets();
    fetchTeamMembers();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      if (res.data.success) {
        setTickets(res.data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setTeamMembers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
      setTeamMembers([]);
    }
  };

  const fetchMessages = async (ticketId) => {
    setMessagesLoading(true);
    try {
      const res = await api.get(`/messages/${ticketId}`);
      if (res.data.success) {
        setMessages(res.data.messages || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // ✅ FIXED: Fetch fresh ticket data including isMissed status
  const handleSelectChat = async (ticket) => {
    try {
      setMessagesLoading(true);
      
      // Fetch fresh ticket data from backend (this triggers missed chat check)
      const ticketRes = await api.get(`/tickets/${ticket._id}`);
      
      if (ticketRes.data.success) {
        const freshTicket = ticketRes.data.ticket;
        
        // Update selected ticket with fresh data including isMissed
        setSelectedTicket(freshTicket);
        
        // Update the ticket in the list as well
        setTickets(prev => prev.map(t => 
          t._id === freshTicket._id ? { ...t, isMissed: freshTicket.isMissed } : t
        ));
        
        // Messages are already included in the response
        if (ticketRes.data.messages) {
          setMessages(ticketRes.data.messages);
        }
      }
    } catch (err) {
      console.error('Failed to select chat:', err);
      // Fallback to basic behavior
      setSelectedTicket(ticket);
      fetchMessages(ticket._id);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!selectedTicket) return;
    
    try {
      const res = await api.post('/messages', {
        ticketId: selectedTicket._id,
        text
      });
      
      if (res.data.success) {
        const newMessageFromServer = res.data.message || res.data.data || {};

        const newMessage = {
          ...newMessageFromServer,
          senderId: newMessageFromServer.senderId || {
            _id: user?._id,
            firstName: user?.firstName,
            lastName: user?.lastName,
          },
        };

        setMessages(prev => [...prev, newMessage]);

        // Update ticket's lastMessageAt
        setTickets(prev => prev.map(t => 
          t._id === selectedTicket._id 
            ? { ...t, lastMessageAt: new Date().toISOString() }
            : t
        ));
        
        // ✅ After sending message, refresh ticket to check if still missed
        await refreshSelectedTicket(selectedTicket._id);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleAssign = async (ticketId, memberId) => {
    try {
      const res = await api.patch(`/tickets/${ticketId}/assign`, {
        assignedTo: memberId
      });
      
      if (res.data.success) {
        const updatedTicket = res.data.data || res.data.ticket;
        
        setTickets(prev => prev.map(t => 
          t._id === ticketId ? updatedTicket : t
        ));
        
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket(updatedTicket);
        }
        
        await refreshSelectedTicket(ticketId);
      }
    } catch (err) {
      console.error('Failed to assign ticket:', err);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    try {
      const res = await api.put(`/tickets/${ticketId}`, { status });
      
      if (res.data.success) {
        const updatedTicket = res.data.data || res.data.ticket;
        
        setTickets(prev => prev.map(t => 
          t._id === ticketId ? updatedTicket : t
        ));
        
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // ✅ Helper function to refresh ticket data from server
  const refreshSelectedTicket = async (ticketId) => {
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      if (res.data.success) {
        const freshTicket = res.data.ticket;
        setSelectedTicket(freshTicket);
        
        // Also update in tickets list
        setTickets(prev => prev.map(t => 
          t._id === ticketId ? { ...t, isMissed: freshTicket.isMissed } : t
        ));
      }
    } catch (err) {
      console.error('Failed to refresh ticket:', err);
    }
  };

  const canInteractWithTicket = () => {
    if (!selectedTicket) return false;
    
    const assignedToId = (selectedTicket.assignedTo?._id || selectedTicket.assignedTo)?.toString();
    const userId = (user?._id || user?.id)?.toString();
    
    return assignedToId === userId;
  };

  if (loading) {
    return (
      <div className="contact-center-layout">
        <Sidebar />
        <div className="contact-center-loading">
          <Loader size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="contact-center-layout">
      <Sidebar />
      <div className="contact-center-content">
        <div className="contact-center-header">
          <h1>Contact Center</h1>
        </div>
        <div className="contact-center-main">
          <ChatList
            chats={tickets}
            selectedChat={selectedTicket}
            onSelectChat={handleSelectChat}
            currentUserId={user?.id || user?._id}
            currentUserRole={user?.role}
          />
          <ChatBox
            ticket={selectedTicket}
            messages={messages}
            onSendMessage={handleSendMessage}
            isResolved={selectedTicket?.status === 'resolved'}
            isMissed={selectedTicket?.isMissed}
            isAccessible={canInteractWithTicket()}
            currentUser={user}
          />
          <ChatDetails
            ticket={selectedTicket}
            teamMembers={teamMembers}
            onAssign={handleAssign}
            onStatusChange={handleStatusChange}
            currentUser={user}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactCenter;