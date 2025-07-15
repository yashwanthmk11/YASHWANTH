import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../shared/Button';
import Input from '../shared/Input';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
`;

const RegisterCard = styled(motion.div)`
  background: var(--white);
  border-radius: var(--radius-2xl);
  padding: var(--space-3xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 450px;
  
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

const PasswordStrength = styled.div`
  margin-top: var(--space-sm);
`;

const StrengthBar = styled.div`
  height: 4px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-sm);
`;

const StrengthFill = styled(motion.div)`
  height: 100%;
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  
  ${props => {
    if (props.strength <= 1) return 'background: var(--error-color); width: 25%;';
    if (props.strength <= 2) return 'background: var(--warning-color); width: 50%;';
    if (props.strength <= 3) return 'background: var(--info-color); width: 75%;';
    return 'background: var(--success-color); width: 100%;';
  }}
`;

const StrengthText = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
`;

const TermsSection = styled.div`
  font-size: 0.875rem;
  color: var(--gray-600);
  line-height: 1.5;
`;

const TermsLink = styled(Link)`
  color: var(--primary-color);
  font-weight: 500;
  
  &:hover {
    color: var(--primary-dark);
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  margin-top: var(--space-xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--gray-200);
  color: var(--gray-600);
  font-size: 0.875rem;
`;

const LoginLink = styled(Link)`
  color: var(--primary-color);
  font-weight: 600;
  margin-left: var(--space-xs);
  transition: color var(--transition-normal);
  
  &:hover {
    color: var(--primary-dark);
  }
`;

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { register, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts
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

  // Calculate password strength
  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 6) strength++;
      if (password.match(/[a-z]/)) strength++;
      if (password.match(/[A-Z]/)) strength++;
      if (password.match(/[0-9]/)) strength++;
      if (password.match(/[^a-zA-Z0-9]/)) strength++;
      return strength;
    };

    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      errors.username = 'Username must be less than 20 characters';
    }
    
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
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

    const result = await register(formData.username, formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  return (
    <RegisterContainer>
      <RegisterCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoSection>
          <LogoIcon>
            GD
          </LogoIcon>
          <Title>Create Account</Title>
          <Subtitle>Join our discussion platform today</Subtitle>
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
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Choose a username"
            leftIcon={<User size={16} />}
            error={formErrors.username}
            helperText={formErrors.username}
            maxLength={20}
            showCharacterCount
            required
            autoComplete="username"
          />

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
              placeholder="Create a password"
              leftIcon={<Lock size={16} />}
              showPasswordToggle
              error={formErrors.password}
              helperText={formErrors.password}
              required
              autoComplete="new-password"
            />
            {formData.password && (
              <PasswordStrength>
                <StrengthBar>
                  <StrengthFill
                    strength={passwordStrength}
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </StrengthBar>
                <StrengthText>
                  Password strength: {getStrengthText()}
                </StrengthText>
              </PasswordStrength>
            )}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            leftIcon={<Lock size={16} />}
            showPasswordToggle
            error={formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            success={formData.confirmPassword && formData.password === formData.confirmPassword}
            required
            autoComplete="new-password"
          />

          <TermsSection>
            By creating an account, you agree to our{' '}
            <TermsLink to="/terms">Terms of Service</TermsLink> and{' '}
            <TermsLink to="/privacy">Privacy Policy</TermsLink>.
          </TermsSection>

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            fullWidth
            leftIcon={!loading && <UserPlus size={16} />}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Form>

        <LoginPrompt>
          Already have an account?
          <LoginLink to="/login">
            Sign in here
          </LoginLink>
        </LoginPrompt>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;