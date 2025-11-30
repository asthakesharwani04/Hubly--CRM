import { 
  getAverageReplyTime, 
  getMissedChatsOverTime, 
  getResolvedTicketsData, 
  getTotalChats 
} from '../services/analyticsService.js';

// Get all analytics data
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, weeks = 10 } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    // Get all analytics data
    const [
      replyTime,
      missedChats,
      resolvedTickets,
      totalChats
    ] = await Promise.all([
      getAverageReplyTime(userId, role),
      getMissedChatsOverTime(parseInt(weeks), userId, role),
      getResolvedTicketsData(userId, role),
      getTotalChats(startDate, endDate, userId, role)
    ]);

    res.json({
      success: true,
      data: {
        avgReplyTime: replyTime.averageReplyTimeSeconds,
        missedChats: missedChats,
        resolvedPercentage: resolvedTickets.percentage,
        totalChats: totalChats.totalChats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get missed chats data
// @route   GET /api/analytics/missed-chats
// @access  Private
export const getMissedChats = async (req, res, next) => {
  try {
    const { weeks = 10 } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    const data = await getMissedChatsOverTime(parseInt(weeks), userId, role);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Get average reply time
// @route   GET /api/analytics/reply-time
// @access  Private
export const getReplyTime = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const data = await getAverageReplyTime(userId, role);

    res.json({
      success: true,
      averageReplyTimeSeconds: data.averageReplyTimeSeconds,
      replyCount: data.replyCount
    });
  } catch (error) {
    next(error);
  }
};

// Get resolved tickets data
// @route   GET /api/analytics/resolved-tickets
// @access  Private
export const getResolvedTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const data = await getResolvedTicketsData(userId, role);

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error);
  }
};

// Get total chats count
// @route   GET /api/analytics/total-chats
// @access  Private
export const getTotalChatsCount = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    const data = await getTotalChats(startDate, endDate, userId, role);

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error);
  }
};