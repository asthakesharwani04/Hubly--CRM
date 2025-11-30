import ChatbotSettings from '../models/ChatbotSettings.js';

// Get chatbot settings
// @route   GET /api/settings/chatbot
// @access  Public (needed for landing page widget)
export const getChatbotSettings = async (req, res, next) => {
  try {
    let settings = await ChatbotSettings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await ChatbotSettings.create({});
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
};

// Update chatbot settings
// @route   PUT /api/settings/chatbot
// @access  Private (Admin only)
export const updateChatbotSettings = async (req, res, next) => {
  try {
    const {
      headerColor,
      backgroundColor,
      customMessages,
      introductionForm,
      welcomeMessage,
      missedChatTimer
    } = req.body;

    let settings = await ChatbotSettings.findOne();

    // If no settings exist, create new
    if (!settings) {
      settings = await ChatbotSettings.create(req.body);
    } else {
      // Update existing settings - ALLOW EMPTY STRINGS
      if (headerColor !== undefined) settings.headerColor = headerColor;
      if (backgroundColor !== undefined) settings.backgroundColor = backgroundColor;
      
      if (customMessages !== undefined) {
        // Explicitly allow empty strings for messages
        if (customMessages.message1 !== undefined) {
          settings.customMessages.message1 = customMessages.message1;
        }
        if (customMessages.message2 !== undefined) {
          settings.customMessages.message2 = customMessages.message2;
        }
      }
      
      if (introductionForm !== undefined) {
        settings.introductionForm = {
          ...settings.introductionForm,
          ...introductionForm
        };
      }
      
      if (welcomeMessage !== undefined) settings.welcomeMessage = welcomeMessage;
      
      if (missedChatTimer !== undefined) {
        if (missedChatTimer.hours !== undefined) settings.missedChatTimer.hours = missedChatTimer.hours;
        if (missedChatTimer.minutes !== undefined) settings.missedChatTimer.minutes = missedChatTimer.minutes;
        if (missedChatTimer.seconds !== undefined) settings.missedChatTimer.seconds = missedChatTimer.seconds;
      }

      await settings.save();
    }

    res.json({
      success: true,
      message: 'Chatbot settings updated successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

// Reset chatbot settings to default
// @route   POST /api/settings/chatbot/reset
// @access  Private (Admin only)
export const resetChatbotSettings = async (req, res, next) => {
  try {
    await ChatbotSettings.deleteMany({});
    const settings = await ChatbotSettings.create({});

    res.json({
      success: true,
      message: 'Chatbot settings reset to default',
      settings
    });
  } catch (error) {
    next(error);
  }
};