import mongoose from 'mongoose';

const aiFeedbackSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  triggerMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  feedbackType: {
    type: String,
    enum: ['response', 'summary', 'analysis', 'suggestion', 'moderation'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    model: {
      type: String,
      default: 'gpt-3.5-turbo'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    processingTime: {
      type: Number
    },
    tokenUsage: {
      type: Number
    }
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  relevanceScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 5
  }
}, {
  timestamps: true
});

export default mongoose.model('AIFeedback', aiFeedbackSchema);