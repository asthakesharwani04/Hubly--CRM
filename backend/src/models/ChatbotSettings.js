import mongoose from 'mongoose';

const chatbotSettingsSchema = new mongoose.Schema({
  // Header Color 
  headerColor: {
    type: String,
    default: '#334755',
    trim: true
  },
  
  // Custom Background Color
  backgroundColor: {
    type: String,
    default: '#EEEEEE',
    trim: true
  },
  
  // Customize Message 
  customMessages: {
    message1: {
      type: String,
      default: 'How can I help you?',
      maxlength: [200, 'Message cannot exceed 200 characters']
    },
    message2: {
      type: String,
      default: 'Ask me anything!',
      maxlength: [200, 'Message cannot exceed 200 characters']
    }
  },
  
  // Introduction Form 
  introductionForm: {
    nameLabel: {
      type: String,
      default: 'Your name'
    },
    namePlaceholder: {
      type: String,
      default: 'Your name'
    },
    phoneLabel: {
      type: String,
      default: 'Your Phone'
    },
    phonePlaceholder: {
      type: String,
      default: '+1 (000) 000-0000'
    },
    emailLabel: {
      type: String,
      default: 'Your Email'
    },
    emailPlaceholder: {
      type: String,
      default: 'example@gmail.com'
    }
  },

  welcomeMessage: {
    type: String,
    default: '👋 Want to chat about Hubly? I\'m an chatbot here to help you find your way.',
    maxlength: [500, 'Welcome message cannot exceed 500 characters']
  },
  
  missedChatTimer: {
    hours: {
      type: Number,
      default: 0,
      min: 0,
      max: 23
    },
    minutes: {
      type: Number,
      default: 10,
      min: 0,
      max: 59
    },
    seconds: {
      type: Number,
      default: 0,
      min: 0,
      max: 59
    }
  }
}, {
  timestamps: true
});

// Method to get total missed chat time in minutes
chatbotSettingsSchema.methods.getMissedChatTimeInMinutes = function() {
  return (this.missedChatTimer.hours * 60) + this.missedChatTimer.minutes + (this.missedChatTimer.seconds / 60);
};

export default mongoose.model('ChatbotSettings', chatbotSettingsSchema);