import { createContext, useState } from 'react';
import api from "../services/api";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const selectTicket = async (ticketOrId) => {
  try {
    setLoadingMessages(true);

    // accept either an id or a ticket object
    const id =
      typeof ticketOrId === "string"
        ? ticketOrId
        : ticketOrId && (ticketOrId._id || ticketOrId.id || ticketOrId.ticketId);

    if (!id) {
      console.warn("selectTicket: no id provided", ticketOrId);
      return;
    }

    // 1) fetch fresh ticket (this runs getTicketById and missed-check on backend)
    const ticketResp = await api.get(`/tickets/${id}`);
    if (!ticketResp.data?.success) {
      console.error("Failed to fetch ticket:", ticketResp.data);
      return;
    }
    const freshTicket = ticketResp.data.ticket;

    // 2) fetch messages for this ticket
    const msgsResp = await api.get(`/messages/${id}`);
    const msgs = msgsResp.data?.messages || [];

    // 3) update context
    setSelectedTicket(freshTicket);
    setMessages(msgs);
  } catch (err) {
    console.error("selectTicket error:", err);
  } finally {
    setLoadingMessages(false);
  }
};

  const clearSelectedTicket = () => {
    setSelectedTicket(null);
    setMessages([]);
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const value = {
    selectedTicket,
    selectTicket,
    clearSelectedTicket,
    messages,
    setMessages,
    addMessage,
    loadingMessages,
    setLoadingMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};