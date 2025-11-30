import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null = customer message, ObjectId = staff message
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ ticketId: 1, timestamp: 1 });

export default mongoose.model('Message', messageSchema);