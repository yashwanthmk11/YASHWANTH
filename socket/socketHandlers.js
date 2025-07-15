import Session from '../models/Session.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected with socket ID: ${socket.id}`);

    // Join user to their session room if they have one
    if (socket.user.currentSession) {
      socket.join(socket.user.currentSession.toString());
    }

    // Handle joining a session
    socket.on('join-session', async (sessionId) => {
      try {
        const session = await Session.findById(sessionId);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Check if user is participant
        const isParticipant = session.participants.some(
          p => p.user.toString() === socket.user._id.toString()
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Join the session room
        socket.join(sessionId);
        socket.currentSession = sessionId;

        // Notify others in the session
        socket.to(sessionId).emit('user-joined', {
          user: {
            id: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.avatar
          }
        });

        socket.emit('session-joined', { sessionId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle leaving a session
    socket.on('leave-session', async (sessionId) => {
      try {
        socket.leave(sessionId);
        
        // Notify others in the session
        socket.to(sessionId).emit('user-left', {
          user: {
            id: socket.user._id,
            username: socket.user.username
          }
        });

        socket.currentSession = null;
        socket.emit('session-left', { sessionId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to leave session' });
      }
    });

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { sessionId, content, replyTo } = data;

        // Verify user is in session
        if (!socket.rooms.has(sessionId)) {
          socket.emit('error', { message: 'Not in session' });
          return;
        }

        // Create message in database
        const message = await Message.create({
          session: sessionId,
          sender: socket.user._id,
          content,
          replyTo: replyTo || null
        });

        await message.populate('sender', 'username email avatar');
        if (replyTo) {
          await message.populate('replyTo');
        }

        // Broadcast to session participants
        io.to(sessionId).emit('new-message', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message reactions
    socket.on('toggle-reaction', async (data) => {
      try {
        const { messageId, emoji } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
          r => r.user.toString() === socket.user._id.toString() && r.emoji === emoji
        );

        if (existingReaction) {
          // Remove reaction
          message.reactions = message.reactions.filter(
            r => !(r.user.toString() === socket.user._id.toString() && r.emoji === emoji)
          );
        } else {
          // Add reaction
          message.reactions.push({ user: socket.user._id, emoji });
        }

        await message.save();
        await message.populate('reactions.user', 'username');

        // Broadcast reaction update to session
        if (socket.currentSession) {
          io.to(socket.currentSession).emit('reaction-updated', {
            messageId,
            reactions: message.reactions
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to toggle reaction' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (sessionId) => {
      socket.to(sessionId).emit('user-typing', {
        userId: socket.user._id,
        username: socket.user.username
      });
    });

    socket.on('typing-stop', (sessionId) => {
      socket.to(sessionId).emit('user-stopped-typing', {
        userId: socket.user._id
      });
    });

    // WebRTC Signaling for Voice Communication
    socket.on('voice-offer', (data) => {
      const { sessionId, targetUserId, offer } = data;
      socket.to(sessionId).emit('voice-offer', {
        from: socket.user._id,
        fromUsername: socket.user.username,
        targetUserId,
        offer
      });
    });

    socket.on('voice-answer', (data) => {
      const { sessionId, targetUserId, answer } = data;
      socket.to(sessionId).emit('voice-answer', {
        from: socket.user._id,
        fromUsername: socket.user.username,
        targetUserId,
        answer
      });
    });

    socket.on('voice-ice-candidate', (data) => {
      const { sessionId, targetUserId, candidate } = data;
      socket.to(sessionId).emit('voice-ice-candidate', {
        from: socket.user._id,
        targetUserId,
        candidate
      });
    });

    socket.on('voice-status-change', async (data) => {
      try {
        const { sessionId, isVoiceActive } = data;

        // Update voice status in database
        const session = await Session.findById(sessionId);
        if (session) {
          const participant = session.participants.find(
            p => p.user.toString() === socket.user._id.toString()
          );
          if (participant) {
            participant.isVoiceActive = isVoiceActive;
            await session.save();
          }
        }

        // Broadcast voice status change
        socket.to(sessionId).emit('user-voice-status-changed', {
          userId: socket.user._id,
          username: socket.user.username,
          isVoiceActive
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to update voice status' });
      }
    });

    // Handle AI agent requests
    socket.on('ai-request', async (data) => {
      try {
        const { sessionId, query } = data;

        // Verify user is in session
        if (!socket.rooms.has(sessionId)) {
          socket.emit('error', { message: 'Not in session' });
          return;
        }

        // Emit to session that AI is processing
        io.to(sessionId).emit('ai-processing', {
          user: socket.user.username,
          query
        });

        // Note: The actual AI processing should be handled by the API endpoint
        // This is just for real-time notifications
      } catch (error) {
        socket.emit('error', { message: 'Failed to process AI request' });
      }
    });

    // Handle session updates
    socket.on('session-update', async (data) => {
      try {
        const { sessionId, update } = data;
        
        // Verify user has permission to update session
        const session = await Session.findById(sessionId);
        if (!session || session.creator.toString() !== socket.user._id.toString()) {
          socket.emit('error', { message: 'Permission denied' });
          return;
        }

        // Broadcast session update to all participants
        socket.to(sessionId).emit('session-updated', update);
      } catch (error) {
        socket.emit('error', { message: 'Failed to update session' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        console.log(`User ${socket.user.username} disconnected`);

        // Update user status
        await User.findByIdAndUpdate(socket.user._id, {
          isOnline: false,
          lastSeen: new Date()
        });

        // Notify session participants if user was in a session
        if (socket.currentSession) {
          socket.to(socket.currentSession).emit('user-disconnected', {
            userId: socket.user._id,
            username: socket.user.username
          });
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // Update user online status
    socket.on('connect', async () => {
      try {
        await User.findByIdAndUpdate(socket.user._id, {
          isOnline: true,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    });
  });
};