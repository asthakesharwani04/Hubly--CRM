import express from 'express';
import {
  getChatbotSettings,
  updateChatbotSettings,
  resetChatbotSettings
} from '../controllers/settingsController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route (needed for landing page widget)
router.get('/chatbot', getChatbotSettings);

// Admin only routes
router.put('/chatbot', protect, adminOnly, updateChatbotSettings);
router.post('/chatbot/reset', protect, adminOnly, resetChatbotSettings);

export default router;