import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Users, MessageSquare, Bot, Settings, 
  ArrowLeft, Phone, PhoneOff, Send, Smile 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Button from '../shared/Button';
import Input from '../shared/Input';

const SessionContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: var(--space-lg);
  color: var(--white);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const SessionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
`;

const BackButton = styled(Button)`
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SessionTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const ParticipantCount = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
  opacity: 0.8;
`;

const MainContent = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: var(--space-lg);
  padding: var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
`;

const Sidebar = styled.aside`
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-2xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-xl);
  height: fit-content;
  
  @media (max-width: 1024px) {
    order: ${props => props.order || 0};
  }
`;

const SidebarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
`;

const ParticipantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
`;

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-lg);
  background: ${props => props.isCurrentUser ? 'var(--primary-color)' : 'var(--gray-100)'};
  color: ${props => props.isCurrentUser ? 'var(--white)' : 'var(--gray-700)'};
`;

const VoiceIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.isActive ? 'var(--success-color)' : 'var(--gray-400)'};
`;

const ChatArea = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-2xl);
  display: flex;
  flex-direction: column;
  height: 600px;
  box-shadow: var(--shadow-xl);
`;

const ChatHeader = styled.div`
  padding: var(--space-lg);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: var(--space-lg);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  background: ${props => props.isOwn ? 'var(--primary-color)' : 'var(--gray-100)'};
  color: ${props => props.isOwn ? 'var(--white)' : 'var(--gray-900)'};
  font-size: 0.875rem;
  line-height: 1.4;
`;

const MessageMeta = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-top: var(--space-xs);
`;

const ChatInput = styled.div`
  padding: var(--space-lg);
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: var(--space-sm);
`;

const VoiceControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

const VoiceButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto;
  
  ${props => props.active && `
    background: var(--success-color);
    
    &:hover {
      background: #22c55e;
    }
  `}
`;

const AIPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

const AIResponse = styled.div`
  background: var(--info-color);
  color: var(--white);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  line-height: 1.4;
`;

const SessionView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    joinSession, 
    leaveSession, 
    sendMessage, 
    messages, 
    sessionParticipants, 
    isConnected 
  } = useSocket();

  const [messageText, setMessageText] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [aiQuery, setAiQuery] = useState('');

  useEffect(() => {
    // Simulate loading session data
    setSessionData({
      id: sessionId,
      title: 'Tech Trends 2024',
      description: 'Discussing the latest trends in technology',
      participants: sessionParticipants
    });

    // Join the session
    if (isConnected && sessionId) {
      joinSession(sessionId);
    }

    return () => {
      leaveSession();
    };
  }, [sessionId, isConnected, joinSession, leaveSession]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText('');
    }
  };

  const handleLeaveSession = () => {
    leaveSession();
    navigate('/dashboard');
  };

  const toggleMicrophone = () => {
    setIsMicActive(!isMicActive);
    // TODO: Implement WebRTC voice functionality
  };

  const handleAIQuery = (e) => {
    e.preventDefault();
    if (aiQuery.trim()) {
      // TODO: Send AI query
      console.log('AI Query:', aiQuery);
      setAiQuery('');
    }
  };

  const mockMessages = [
    {
      id: '1',
      sender: { username: 'John Doe' },
      content: 'Welcome to the discussion! What are your thoughts on AI development?',
      isOwn: false,
      createdAt: new Date()
    },
    {
      id: '2',
      sender: { username: user?.username },
      content: 'I think AI is advancing rapidly and we need to consider ethical implications.',
      isOwn: true,
      createdAt: new Date()
    }
  ];

  const mockParticipants = [
    { id: '1', username: 'John Doe', isVoiceActive: true },
    { id: '2', username: user?.username, isVoiceActive: isMicActive },
    { id: '3', username: 'Jane Smith', isVoiceActive: false }
  ];

  return (
    <SessionContainer>
      <Header>
        <HeaderContent>
          <SessionInfo>
            <BackButton
              variant="outline"
              size="sm"
              onClick={handleLeaveSession}
              leftIcon={<ArrowLeft size={16} />}
            >
              Leave
            </BackButton>
            <div>
              <SessionTitle>{sessionData?.title || 'Loading...'}</SessionTitle>
              <ParticipantCount>
                <Users size={14} />
                {mockParticipants.length} participants
              </ParticipantCount>
            </div>
          </SessionInfo>
          
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <Button variant="ghost" size="sm" iconOnly style={{ color: 'white' }}>
              <Settings size={16} />
            </Button>
          </div>
        </HeaderContent>
      </Header>

      <MainContent>
        <Sidebar>
          <SidebarTitle>
            <Users size={16} />
            Participants
          </SidebarTitle>
          <ParticipantsList>
            {mockParticipants.map((participant) => (
              <ParticipantItem
                key={participant.id}
                isCurrentUser={participant.username === user?.username}
              >
                <VoiceIndicator isActive={participant.isVoiceActive} />
                {participant.username}
              </ParticipantItem>
            ))}
          </ParticipantsList>

          <div style={{ marginTop: 'var(--space-xl)' }}>
            <SidebarTitle>Voice Controls</SidebarTitle>
            <VoiceControls>
              <VoiceButton
                variant={isMicActive ? 'success' : 'outline'}
                onClick={toggleMicrophone}
                active={isMicActive}
              >
                {isMicActive ? <Mic size={24} /> : <MicOff size={24} />}
              </VoiceButton>
              <p style={{ 
                textAlign: 'center', 
                fontSize: '0.75rem', 
                color: 'var(--gray-600)' 
              }}>
                {isMicActive ? 'Mic On' : 'Mic Off'}
              </p>
            </VoiceControls>
          </div>
        </Sidebar>

        <ChatArea>
          <ChatHeader>
            <SidebarTitle style={{ margin: 0 }}>
              <MessageSquare size={16} />
              Discussion
            </SidebarTitle>
          </ChatHeader>
          
          <ChatMessages>
            {mockMessages.map((message) => (
              <Message key={message.id} isOwn={message.isOwn}>
                <MessageBubble isOwn={message.isOwn}>
                  {message.content}
                </MessageBubble>
                <MessageMeta>
                  {message.sender.username} • {message.createdAt.toLocaleTimeString()}
                </MessageMeta>
              </Message>
            ))}
          </ChatMessages>
          
          <ChatInput>
            <form 
              onSubmit={handleSendMessage} 
              style={{ display: 'flex', gap: 'var(--space-sm)', width: '100%' }}
            >
              <Input
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button type="submit" iconOnly>
                <Send size={16} />
              </Button>
            </form>
          </ChatInput>
        </ChatArea>

        <Sidebar order={3}>
          <SidebarTitle>
            <Bot size={16} />
            AI Assistant
          </SidebarTitle>
          
          <AIPanel>
            <AIResponse>
              Hello! I'm here to help facilitate your discussion. Feel free to ask me questions or request summaries of the conversation.
            </AIResponse>
            
            <form onSubmit={handleAIQuery}>
              <Input
                placeholder="Ask the AI assistant..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                size="sm"
              />
              <Button
                type="submit"
                size="sm"
                fullWidth
                style={{ marginTop: 'var(--space-sm)' }}
              >
                Ask AI
              </Button>
            </form>
          </AIPanel>
        </Sidebar>
      </MainContent>
    </SessionContainer>
  );
};

export default SessionView;