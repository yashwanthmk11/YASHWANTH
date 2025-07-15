import Session from '../models/Session.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

// Create a new session
export const createSession = async (req, res) => {
  try {
    const { title, description, maxParticipants, isPrivate, tags } = req.body;

    const session = await Session.create({
      title,
      description,
      creator: req.user.id,
      maxParticipants,
      isPrivate,
      tags,
      participants: [{
        user: req.user.id,
        joinedAt: new Date(),
        isVoiceActive: false
      }]
    });

    // Update user's current session
    await User.findByIdAndUpdate(req.user.id, {
      currentSession: session._id
    });

    await session.populate('creator', 'username email avatar');
    await session.populate('participants.user', 'username email avatar isOnline');

    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating session',
      error: error.message
    });
  }
};

// Get all active sessions
export const getSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = {
      isActive: true,
      isPrivate: false,
      ...(search && {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      })
    };

    const sessions = await Session.find(query)
      .populate('creator', 'username email avatar')
      .populate('participants.user', 'username email avatar isOnline')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions',
      error: error.message
    });
  }
};

// Get session by ID or code
export const getSession = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const session = await Session.findOne({
      $or: [
        { _id: identifier },
        { sessionCode: identifier.toUpperCase() }
      ],
      isActive: true
    })
      .populate('creator', 'username email avatar')
      .populate('participants.user', 'username email avatar isOnline');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching session',
      error: error.message
    });
  }
};

// Join a session
export const joinSession = async (req, res) => {
  try {
    const { identifier } = req.params;
    const userId = req.user.id;

    const session = await Session.findOne({
      $or: [
        { _id: identifier },
        { sessionCode: identifier.toUpperCase() }
      ],
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if session is full
    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Session is full'
      });
    }

    // Check if user is already in session
    const isParticipant = session.participants.some(
      p => p.user.toString() === userId
    );

    if (isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this session'
      });
    }

    // Add user to session
    session.participants.push({
      user: userId,
      joinedAt: new Date(),
      isVoiceActive: false
    });

    await session.save();

    // Update user's current session
    await User.findByIdAndUpdate(userId, {
      currentSession: session._id
    });

    // Create system message
    await Message.create({
      session: session._id,
      sender: userId,
      content: `${req.user.username} joined the session`,
      messageType: 'system'
    });

    await session.populate('creator', 'username email avatar');
    await session.populate('participants.user', 'username email avatar isOnline');

    res.json({
      success: true,
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining session',
      error: error.message
    });
  }
};

// Leave a session
export const leaveSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Remove user from session
    session.participants = session.participants.filter(
      p => p.user.toString() !== userId
    );

    // If session is empty, mark as inactive
    if (session.participants.length === 0) {
      session.isActive = false;
      session.endedAt = new Date();
    }

    await session.save();

    // Update user's current session
    await User.findByIdAndUpdate(userId, {
      currentSession: null
    });

    // Create system message
    await Message.create({
      session: session._id,
      sender: userId,
      content: `${req.user.username} left the session`,
      messageType: 'system'
    });

    res.json({
      success: true,
      message: 'Left session successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving session',
      error: error.message
    });
  }
};

// End a session (creator only)
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is the creator
    if (session.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the session creator can end the session'
      });
    }

    session.isActive = false;
    session.endedAt = new Date();
    await session.save();

    // Update all participants' current session
    const participantIds = session.participants.map(p => p.user);
    await User.updateMany(
      { _id: { $in: participantIds } },
      { currentSession: null }
    );

    // Create system message
    await Message.create({
      session: session._id,
      sender: userId,
      content: 'Session ended by creator',
      messageType: 'system'
    });

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error ending session',
      error: error.message
    });
  }
};

// Update voice status
export const updateVoiceStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { isVoiceActive } = req.body;
    const userId = req.user.id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Find and update participant's voice status
    const participant = session.participants.find(
      p => p.user.toString() === userId
    );

    if (!participant) {
      return res.status(400).json({
        success: false,
        message: 'You are not a participant in this session'
      });
    }

    participant.isVoiceActive = isVoiceActive;
    await session.save();

    res.json({
      success: true,
      message: 'Voice status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating voice status',
      error: error.message
    });
  }
};