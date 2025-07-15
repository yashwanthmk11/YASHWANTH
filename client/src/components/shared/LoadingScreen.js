import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: var(--white);
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: var(--space-xl);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const LoadingText = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--space-lg);
  text-align: center;
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid var(--white);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const DotsContainer = styled.div`
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-xl);
`;

const Dot = styled(motion.div)`
  width: 8px;
  height: 8px;
  background: var(--white);
  border-radius: 50%;
  opacity: 0.6;
`;

const LoadingScreen = () => {
  return (
    <LoadingContainer>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <LogoIcon
          as={motion.div}
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          GD
        </LogoIcon>
        
        <LoadingText>Group Discussion Platform</LoadingText>
        
        <Spinner />
        
        <DotsContainer>
          {[0, 1, 2].map((index) => (
            <Dot
              key={index}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </DotsContainer>
      </motion.div>
    </LoadingContainer>
  );
};

export default LoadingScreen;