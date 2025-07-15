import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Plus, Users, Mic, MicOff, Settings, LogOut, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Button from '../shared/Button';
import Input from '../shared/Input';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  padding: var(--space-lg);
  
  @media (max-width: 768px) {
    padding: var(--space-md);
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2xl);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-2xl);
  padding: var(--space-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--space-md);
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  color: var(--white);
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);
`;

const UserInfo = styled.div`
  color: var(--white);
  font-weight: 500;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-2xl);
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-2xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-xl);
  height: fit-content;
`;

const SidebarSection = styled.div`
  margin-bottom: var(--space-xl);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--space-md);
`;

const SessionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

const SessionCard = styled(motion.div)`
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-200);
  cursor: pointer;
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-color);
  }
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-sm);
`;

const SessionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
`;

const SessionMeta = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
`;

const SessionDescription = styled.p`
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: var(--space-sm) 0;
  line-height: 1.4;
`;

const SessionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-md);
`;

const ParticipantCount = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
  color: var(--gray-600);
`;

const JoinButton = styled(Button)`
  padding: var(--space-sm) var(--space-md);
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--space-3xl) var(--space-xl);
  color: var(--gray-500);
`;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading sessions
    setTimeout(() => {
      setSessions([
        {
          id: '1',
          title: 'Tech Trends 2024',
          description: 'Discussing the latest trends in technology and their impact on society.',
          participants: 8,
          maxParticipants: 15,
          creator: 'John Doe',
          createdAt: new Date('2024-01-15T10:30:00'),
          isActive: true
        },
        {
          id: '2',
          title: 'Climate Change Solutions',
          description: 'Brainstorming innovative solutions for climate change challenges.',
          participants: 12,
          maxParticipants: 20,
          creator: 'Jane Smith',
          createdAt: new Date('2024-01-15T14:15:00'),
          isActive: true
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleCreateSession = () => {
    // TODO: Open create session modal
    console.log('Create new session');
  };

  const handleJoinSession = (sessionId) => {
    // TODO: Navigate to session
    console.log('Join session:', sessionId);
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardContainer>
      <Header>
        <Logo>
          <LogoIcon>GD</LogoIcon>
          <Title>Discussion Platform</Title>
        </Logo>
        
        <UserActions>
          <UserInfo>Welcome, {user?.username}!</UserInfo>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={handleLogout}
            style={{ color: 'white' }}
          >
            <LogOut size={16} />
          </Button>
        </UserActions>
      </Header>

      <MainContent>
        <Sidebar>
          <SidebarSection>
            <SectionTitle>Quick Actions</SectionTitle>
            <Button
              fullWidth
              onClick={handleCreateSession}
              leftIcon={<Plus size={16} />}
            >
              Create New Session
            </Button>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>Connection Status</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isConnected ? 'var(--success-color)' : 'var(--error-color)'
                }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>Recent Activity</SectionTitle>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
              No recent activity
            </p>
          </SidebarSection>
        </Sidebar>

        <main>
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={16} />}
                style={{ flex: 1 }}
              />
              <Button variant="outline" iconOnly>
                <Filter size={16} />
              </Button>
            </div>
          </div>

          <SectionTitle style={{ color: 'white', marginBottom: 'var(--space-lg)' }}>
            Active Sessions ({filteredSessions.length})
          </SectionTitle>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'white', padding: 'var(--space-3xl)' }}>
              Loading sessions...
            </div>
          ) : (
            <SessionsList>
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SessionHeader>
                      <SessionTitle>{session.title}</SessionTitle>
                      <SessionMeta>
                        Created by {session.creator}
                      </SessionMeta>
                    </SessionHeader>
                    
                    <SessionDescription>
                      {session.description}
                    </SessionDescription>
                    
                    <SessionFooter>
                      <ParticipantCount>
                        <Users size={14} />
                        {session.participants}/{session.maxParticipants} participants
                      </ParticipantCount>
                      
                      <JoinButton
                        size="sm"
                        onClick={() => handleJoinSession(session.id)}
                        disabled={session.participants >= session.maxParticipants}
                      >
                        {session.participants >= session.maxParticipants ? 'Full' : 'Join'}
                      </JoinButton>
                    </SessionFooter>
                  </SessionCard>
                ))
              ) : (
                <EmptyState>
                  <p>No sessions found matching your search.</p>
                </EmptyState>
              )}
            </SessionsList>
          )}
        </main>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;