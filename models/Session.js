import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isVoiceActive: {
      type: Boolean,
      default: false
    }
  }],
  maxParticipants: {
    type: Number,
    default: 10,
    min: 2,
    max: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sessionCode: {
    type: String,
    unique: true,
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  voiceSettings: {
    isVoiceEnabled: {
      type: Boolean,
      default: true
    },
    muteAll: {
      type: Boolean,
      default: false
    }
  },
  aiSettings: {
    isAiEnabled: {
      type: Boolean,
      default: true
    },
    aiModel: {
      type: String,
      default: 'gpt-3.5-turbo'
    }
  },
  endedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Generate session code before saving
sessionSchema.pre('save', function(next) {
  if (!this.sessionCode) {
    this.sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

export default mongoose.model('Session', sessionSchema);