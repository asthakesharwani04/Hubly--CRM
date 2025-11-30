import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import ChatbotSettings from "../models/ChatbotSettings.js";
import { TICKET_STATUS, USER_ROLES } from "../config/constants.js";

/* MISSED CHAT HELPER */
const checkIfTicketIsMissed = async (ticket) => {
  try {
    const settings = await ChatbotSettings.findOne();
    if (!settings) return false;

    const ms =
      Number(settings?.missedChatTimer?.hours || 0) * 60 * 60 * 1000 +
      Number(settings?.missedChatTimer?.minutes || 0) * 60 * 1000 +
      Number(settings?.missedChatTimer?.seconds || 0) * 1000;

    if (ms === 0) return false;

    const messages = await Message.find({ ticketId: ticket._id }).sort({
      timestamp: 1,
    });
    if (!messages.length) return false;

    const firstCustomer = messages.find((m) => !m.senderId);
    if (!firstCustomer) return false;

    const firstCustomerTime = new Date(
      firstCustomer.timestamp || firstCustomer.createdAt
    ).getTime();

    const staffRepliedAfter = messages.some((m) => {
      if (!m.senderId) return false;
      const msgTime = new Date(m.timestamp || m.createdAt).getTime();
      return msgTime > firstCustomerTime;
    });

    if (staffRepliedAfter) return false;

    const now = Date.now();
    const elapsed = now - firstCustomerTime;
    return elapsed > ms;
  } catch (err) {
    return false;
  }
};

/* GET ALL TICKETS */
export const getAllTickets = async (req, res, next) => {
  try {
    const { limit = 20, lastId, status, search } = req.query;
    const query = {};

    if (status && Object.values(TICKET_STATUS).includes(status)) {
      query.status = status;
    }
    if (search) {
      query.ticketId = { $regex: search, $options: "i" };
    }
    if (lastId) {
      query._id = { $lt: lastId };
    }

    if (req.user.role === USER_ROLES.MEMBER) {
      query.assignedTo = req.user.id;
    }

    const tickets = await Ticket.find(query)
      .populate("assignedTo", "firstName lastName email role")
      .sort({ lastMessageAt: -1, _id: -1 })
      .limit(parseInt(limit));

    const ticketsWithLastMessage = await Promise.all(
      tickets.map(async (ticket) => {
        try {
          const lastMessage = await Message.findOne({ ticketId: ticket._id })
            .sort({ timestamp: -1 })
            .limit(1)
            .select("text");

          const isMissed = await checkIfTicketIsMissed(ticket);

          const ticketObj = ticket.toObject();
          ticketObj.lastMessage = lastMessage ? lastMessage.text : "";
          ticketObj.isMissed = isMissed;

          if (ticket.isMissed !== isMissed) {
            await Ticket.findByIdAndUpdate(ticket._id, { isMissed });
          }

          return ticketObj;
        } catch (err) {
          const ticketObj = ticket.toObject();
          ticketObj.lastMessage = "";
          ticketObj.isMissed = false;
          return ticketObj;
        }
      })
    );

    const hasMore = tickets.length === parseInt(limit);

    res.json({
      success: true,
      count: ticketsWithLastMessage.length,
      tickets: ticketsWithLastMessage,
      hasMore,
      lastId: tickets.length > 0 ? tickets[tickets.length - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

/* GET SINGLE TICKET */
export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "assignedTo",
      "firstName lastName email role"
    );

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    if (req.user.role === USER_ROLES.MEMBER) {
      const assignedToId =
        ticket.assignedTo?._id?.toString() || ticket.assignedTo?.toString();
      if (assignedToId !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this ticket",
        });
      }
    }

    const messages = await Message.find({ ticketId: ticket._id })
      .populate("senderId", "firstName lastName role")
      .sort({ timestamp: 1 });

    const isMissed = await checkIfTicketIsMissed(ticket);

    if (ticket.isMissed !== isMissed) {
      ticket.isMissed = isMissed;
      await ticket.save();
    }

    res.json({
      success: true,
      ticket: { ...ticket.toObject(), isMissed },
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/* CREATE TICKET */
export const createTicket = async (req, res, next) => {
  try {
    const { userName, userEmail, userPhone, initialMessage } = req.body;

    const admin = await User.findOne({ role: USER_ROLES.ADMIN });
    if (!admin) {
      return res.status(500).json({
        success: false,
        message: "No admin user found. Please create an admin account first.",
      });
    }

    const ticket = await Ticket.create({
      userName,
      userEmail,
      userPhone,
      assignedTo: admin._id,
      status: TICKET_STATUS.OPEN,
    });

    if (initialMessage && initialMessage.trim()) {
      try {
        const message = await Message.create({
          ticketId: ticket._id,
          senderId: null,
          text: initialMessage.trim(),
        });

        ticket.lastMessageAt = Date.now();
        await ticket.save();
      } catch (e) {}
    }

    res.status(201).json({
      success: true,
      message:
        "Ticket created successfully. Our team will get back to you soon.",
      ticket: {
        id: ticket._id,
        ticketId: ticket.ticketId,
        userName: ticket.userName,
        userEmail: ticket.userEmail,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* UPDATE TICKET */
export const updateTicket = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    if (req.user.role === USER_ROLES.MEMBER) {
      const assignedToId = ticket.assignedTo?.toString();
      if (assignedToId !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this ticket",
        });
      }
    }

    if (status && Object.values(TICKET_STATUS).includes(status)) {
      ticket.status = status;
    }

    await ticket.save();
    await ticket.populate("assignedTo", "firstName lastName email role");

    res.json({
      success: true,
      message: "Ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/* ASSIGN TICKET */
export const assignTicket = async (req, res, next) => {
  try {
    const memberId = req.body.assignedTo || req.body.userId;
    if (!memberId)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    const user = await User.findById(memberId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    ticket.assignedTo = memberId;
    await ticket.save();
    await ticket.populate("assignedTo", "firstName lastName email role");

    res.json({
      success: true,
      message: "Ticket assigned successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/* DELETE TICKET */
export const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    await Message.deleteMany({ ticketId: ticket._id });
    await ticket.deleteOne();

    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/* ANALYTICS / STATS */
export const getTicketStats = async (req, res, next) => {
  try {
    const scope = {};
    if (req.user.role === USER_ROLES.MEMBER) {
      scope.assignedTo = req.user.id;
    }

    const allForMissed = await Ticket.find(scope).select("_id isMissed");
    await Promise.all(
      allForMissed.map(async (t) => {
        const isMissed = await checkIfTicketIsMissed(t);
        if (t.isMissed !== isMissed) {
          await Ticket.findByIdAndUpdate(t._id, { isMissed });
        }
      })
    );

    const allTickets = await Ticket.countDocuments(scope);
    const resolvedTickets = await Ticket.countDocuments({
      ...scope,
      status: TICKET_STATUS.RESOLVED,
    });
    const unresolvedTickets = await Ticket.countDocuments({
      ...scope,
      status: { $ne: TICKET_STATUS.RESOLVED },
    });
    const missedTickets = await Ticket.countDocuments({
      ...scope,
      isMissed: true,
    });

    res.json({
      success: true,
      stats: {
        allTickets,
        resolvedTickets,
        unresolvedTickets,
        missedTickets,
      },
    });
  } catch (error) {
    next(error);
  }
};
