import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { USER_ROLES } from '../config/constants.js';

/**
 * ticketService.js
 * 
 * PURPOSE: Business logic layer for ticket operations
 * 
 * This service handles complex ticket operations that are used across multiple
 * controllers or need to be reused. It separates business logic from route handlers.
 * 
 * USE CASES:
 * 1. Reassigning tickets when team members are deleted
 * 2. Checking for missed chats based on timer settings
 * 3. Calculating ticket statistics
 * 4. Any complex ticket operations that need to be reused
 */

// Reassign all tickets from a deleted user to admin
// USED IN: Team management when deleting a team member (teamController.js)
export const reassignTicketsToAdmin = async (deletedUserId) => {
  try {
    const admin = await User.findOne({ role: USER_ROLES.ADMIN });

    if (!admin) {
      throw new Error('No admin found to reassign tickets');
    }

    const result = await Ticket.updateMany(
      { assignedTo: deletedUserId },
      { assignedTo: admin._id }
    );

    return {
      success: true,
      ticketsReassigned: result.modifiedCount
    };
  } catch (error) {
    throw error;
  }
};

// Check for missed chats based on timer setting
// USED IN: Background job or cron that runs periodically
export const checkMissedChats = async (timerInMinutes) => {
  try {
    const cutoffTime = new Date(Date.now() - timerInMinutes * 60 * 1000);

    const result = await Ticket.updateMany(
      {
        status: { $ne: 'resolved' },
        lastMessageAt: { $lt: cutoffTime },
        isMissed: false
      },
      { isMissed: true }
    );

    return {
      success: true,
      missedChatsMarked: result.modifiedCount
    };
  } catch (error) {
    throw error;
  }
};

// Get comprehensive ticket statistics
// USED IN: Dashboard, reports, or any place needing ticket stats
export const getTicketStatistics = async (userId = null, role = null) => {
  try {
    const query = {};

    // If not admin, filter by assigned tickets
    if (role === USER_ROLES.MEMBER) {
      query.assignedTo = userId;
    }

    const totalTickets = await Ticket.countDocuments(query);
    const resolvedTickets = await Ticket.countDocuments({ 
      ...query, 
      status: 'resolved' 
    });
    const openTickets = await Ticket.countDocuments({ 
      ...query, 
      status: 'open' 
    });
    const inProgressTickets = await Ticket.countDocuments({ 
      ...query, 
      status: 'in_progress' 
    });
    const missedChats = await Ticket.countDocuments({ 
      ...query, 
      isMissed: true 
    });

    return {
      totalTickets,
      resolvedTickets,
      openTickets,
      inProgressTickets,
      missedChats,
      unresolvedTickets: totalTickets - resolvedTickets
    };
  } catch (error) {
    throw error;
  }
};