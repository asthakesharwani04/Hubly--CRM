import express from 'express';
import {
  getMessagesByTicket,
  sendMessage
} from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes (for admin/member only)
router.get('/:ticketId', protect, getMessagesByTicket);
router.post('/', protect, sendMessage);

export default router;