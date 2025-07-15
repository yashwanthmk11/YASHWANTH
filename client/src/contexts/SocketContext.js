import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionParticipants, setSessionParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [voiceConnections, setVoiceConnections] = useState(new Map());
  
  const messageListeners = useRef(new Set());
  const eventListeners = useRef(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        autoConnect: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  // Session management
  const joinSession = (sessionId) => {
    if (socket && sessionId) {
      socket.emit('join-session', sessionId);
      setCurrentSession(sessionId);
    }
  };

  const leaveSession = () => {
    if (socket && currentSession) {
      socket.emit('leave-session', currentSession);
      setCurrentSession(null);
      setSessionParticipants([]);
      setMessages([]);
      setTypingUsers(new Set());
    }
  };

  // Message handling
  const sendMessage = (content, replyTo = null) => {
    if (socket && currentSession) {
      socket.emit('send-message', {
        sessionId: currentSession,
        content,
        replyTo
      });
    }
  };

  const addReaction = (messageId, emoji) => {
    if (socket) {
      socket.emit('toggle-reaction', { messageId, emoji });
    }
  };

  // Typing indicators
  const startTyping = () => {
    if (socket && currentSession) {
      socket.emit('typing-start', currentSession);
    }
  };

  const stopTyping = () => {
    if (socket && currentSession) {
      socket.emit('typing-stop', currentSession);
    }
  };

  // Voice communication
  const updateVoiceStatus = (isVoiceActive) => {
    if (socket && currentSession) {
      socket.emit('voice-status-change', {
        sessionId: currentSession,
        isVoiceActive
      });
    }
  };

  const sendVoiceOffer = (targetUserId, offer) => {
    if (socket && currentSession) {
      socket.emit('voice-offer', {
        sessionId: currentSession,
        targetUserId,
        offer
      });
    }
  };

  const sendVoiceAnswer = (targetUserId, answer) => {
    if (socket && currentSession) {
      socket.emit('voice-answer', {
        sessionId: currentSession,
        targetUserId,
        answer
      });
    }
  };

  const sendIceCandidate = (targetUserId, candidate) => {
    if (socket && currentSession) {
      socket.emit('voice-ice-candidate', {
        sessionId: currentSession,
        targetUserId,
        candidate
      });
    }
  };

  // AI agent requests
  const sendAIRequest = (query) => {
    if (socket && currentSession) {
      socket.emit('ai-request', {
        sessionId: currentSession,
        query
      });
    }
  };

  // Event listeners management
  const addEventListener = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      
      // Store listener for cleanup
      if (!eventListeners.current.has(event)) {
        eventListeners.current.set(event, new Set());
      }
      eventListeners.current.get(event).add(callback);
    }
  };

  const removeEventListener = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
      
      // Remove from stored listeners
      if (eventListeners.current.has(event)) {
        eventListeners.current.get(event).delete(callback);
      }
    }
  };

  // Setup default event listeners
  useEffect(() => {
    if (!socket) return;

    // Session events
    socket.on('session-joined', (data) => {
      console.log('Joined session:', data.sessionId);
    });

    socket.on('session-left', (data) => {
      console.log('Left session:', data.sessionId);
    });

    socket.on('user-joined', (data) => {
      setSessionParticipants(prev => [...prev, data.user]);
    });

    socket.on('user-left', (data) => {
      setSessionParticipants(prev => 
        prev.filter(p => p.id !== data.user.id)
      );
    });

    // Message events
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('reaction-updated', (data) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, reactions: data.reactions }
            : msg
        )
      );
    });

    // Typing events
    socket.on('user-typing', (data) => {
      setTypingUsers(prev => new Set([...prev, data.username]));
    });

    socket.on('user-stopped-typing', (data) => {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.username);
        return updated;
      });
    });

    // Voice events
    socket.on('voice-offer', (data) => {
      // Handle incoming voice offers for WebRTC
      console.log('Voice offer received:', data);
    });

    socket.on('voice-answer', (data) => {
      // Handle voice answers for WebRTC
      console.log('Voice answer received:', data);
    });

    socket.on('voice-ice-candidate', (data) => {
      // Handle ICE candidates for WebRTC
      console.log('ICE candidate received:', data);
    });

    socket.on('user-voice-status-changed', (data) => {
      setSessionParticipants(prev =>
        prev.map(p =>
          p.id === data.userId
            ? { ...p, isVoiceActive: data.isVoiceActive }
            : p
        )
      );
    });

    // AI events
    socket.on('ai-processing', (data) => {
      console.log('AI processing:', data);
    });

    socket.on('user-disconnected', (data) => {
      setSessionParticipants(prev =>
        prev.filter(p => p.id !== data.userId)
      );
    });

    // Cleanup function
    return () => {
      socket.off('session-joined');
      socket.off('session-left');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('new-message');
      socket.off('reaction-updated');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
      socket.off('voice-offer');
      socket.off('voice-answer');
      socket.off('voice-ice-candidate');
      socket.off('user-voice-status-changed');
      socket.off('ai-processing');
      socket.off('user-disconnected');
    };
  }, [socket]);

  const value = {
    socket,
    isConnected,
    currentSession,
    sessionParticipants,
    messages,
    typingUsers,
    voiceConnections,
    
    // Session methods
    joinSession,
    leaveSession,
    
    // Message methods
    sendMessage,
    addReaction,
    setMessages,
    
    // Typing methods
    startTyping,
    stopTyping,
    
    // Voice methods
    updateVoiceStatus,
    sendVoiceOffer,
    sendVoiceAnswer,
    sendIceCandidate,
    
    // AI methods
    sendAIRequest,
    
    // Event management
    addEventListener,
    removeEventListener
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};