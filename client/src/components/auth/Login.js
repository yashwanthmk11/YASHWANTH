import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../shared/Button';
import Input from '../shared/Input';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
`;

const LoginCard = styled(motion.div)`
  background: var(--white);
  border-radius: var(--radius-2xl);
  padding: var(--space-3xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 400px;
  
  @media (max-width: 768px) {
    padding: var(--space-xl);
    max-width: 100%;
    margin: var(--space-md);
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: var(--space-2xl);
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
  color: var(--white);
  font-size: 1.5rem;
  font-weight: bold;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--space-sm);
`;

const Subtitle = styled.p`
  color: var(--gray-600);
  font-size: 0.875rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid var(--error-color);
  border-radius: var(--radius-lg);
  color: var(--error-color);
  font-size: 0.875rem;
`;

const ForgotPassword = styled(Link)`
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: right;
  transition: color var(--transition-normal);
  
  &:hover {
    color: var(--primary-dark);
  }
`;

const SignupPrompt = styled.div`
  text-align: center;
  margin-top: var(--space-xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--gray-200);
  color: var(--gray-600);
  font-size: 0.875rem;
`;

const SignupLink = styled(Link)`
  color: var(--primary-color);
  font-weight: 600;
  margin-left: var(--space-xs);
  transition: color var(--transition-normal);
  
  &:hover {
    color: var(--primary-dark);
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts or form changes
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  useEffect(() => {
    if (error) {
      // Clear error after 5 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <LoginContainer>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoSection>
          <LogoIcon>
            GD
          </LogoIcon>
          <Title>Welcome Back</Title>
          <Subtitle>Sign in to your account to continue</Subtitle>
        </LogoSection>

        {error && (
          <ErrorMessage
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle size={16} />
            {error}
          </ErrorMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            leftIcon={<Mail size={16} />}
            error={formErrors.email}
            helperText={formErrors.email}
            required
            autoComplete="email"
          />

          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              leftIcon={<Lock size={16} />}
              showPasswordToggle
              error={formErrors.password}
              helperText={formErrors.password}
              required
              autoComplete="current-password"
            />
            <ForgotPassword to="/forgot-password" style={{ display: 'block', marginTop: 'var(--space-sm)' }}>
              Forgot your password?
            </ForgotPassword>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            fullWidth
            leftIcon={!loading && <LogIn size={16} />}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Form>

        <SignupPrompt>
          Don't have an account?
          <SignupLink to="/register">
            Sign up for free
          </SignupLink>
        </SignupPrompt>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;