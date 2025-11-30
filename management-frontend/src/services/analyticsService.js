import api from './api';

// Note: These endpoints would need to be created in the backend
// For now, these are placeholder functions

export const getAnalyticsData = (params) => {
  // This would call a comprehensive analytics endpoint
  return api.get('/analytics', { params });
};

export const getMissedChatsData = (days = 10) => {
  return api.get('/analytics/missed-chats', { params: { days } });
};

export const getAverageReplyTime = () => {
  return api.get('/analytics/reply-time');
};

export const getResolvedTicketsData = () => {
  return api.get('/analytics/resolved-tickets');
};

export const getTotalChatsCount = (params) => {
  return api.get('/analytics/total-chats', { params });
};