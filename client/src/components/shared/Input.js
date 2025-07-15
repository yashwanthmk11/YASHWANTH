import React, { useState, forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  width: 100%;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: var(--space-md);
  font-size: 1rem;
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-lg);
  background: var(--white);
  color: var(--gray-900);
  transition: all var(--transition-normal);
  
  &::placeholder {
    color: var(--gray-400);
  }
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  /* Icon padding */
  ${props => props.hasLeftIcon && css`
    padding-left: 3rem;
  `}
  
  ${props => props.hasRightIcon && css`
    padding-right: 3rem;
  `}
  
  /* State styles */
  ${props => props.error && css`
    border-color: var(--error-color);
    
    &:focus {
      border-color: var(--error-color);
      box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
    }
  `}
  
  ${props => props.success && css`
    border-color: var(--success-color);
    
    &:focus {
      border-color: var(--success-color);
      box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
    }
  `}
  
  ${props => props.disabled && css`
    background: var(--gray-100);
    cursor: not-allowed;
    opacity: 0.7;
  `}
  
  /* Size variants */
  ${props => props.size === 'sm' && css`
    padding: var(--space-sm) var(--space-md);
    font-size: 0.875rem;
  `}
  
  ${props => props.size === 'lg' && css`
    padding: var(--space-lg) var(--space-xl);
    font-size: 1.125rem;
  `}
  
  /* Responsive */
  @media (max-width: 768px) {
    font-size: 16px; /* Prevent zoom on iOS */
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  pointer-events: none;
  
  ${props => props.position === 'left' && css`
    left: var(--space-md);
  `}
  
  ${props => props.position === 'right' && css`
    right: var(--space-md);
    cursor: pointer;
    pointer-events: auto;
  `}
  
  ${props => props.clickable && css`
    cursor: pointer;
    pointer-events: auto;
    color: var(--gray-500);
    
    &:hover {
      color: var(--gray-700);
    }
  `}
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: var(--space-xs);
  
  ${props => props.required && css`
    &::after {
      content: ' *';
      color: var(--error-color);
    }
  `}
`;

const HelperText = styled(motion.div)`
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  
  ${props => props.error && css`
    color: var(--error-color);
  `}
  
  ${props => props.success && css`
    color: var(--success-color);
  `}
  
  ${props => !props.error && !props.success && css`
    color: var(--gray-500);
  `}
`;

const CharacterCount = styled.span`
  font-size: 0.75rem;
  color: var(--gray-400);
  margin-left: auto;
  
  ${props => props.error && css`
    color: var(--error-color);
  `}
`;

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  helperText,
  disabled = false,
  required = false,
  size = 'md',
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  maxLength,
  showCharacterCount = false,
  id,
  name,
  autoComplete,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasLeftIcon = Boolean(leftIcon);
  const hasRightIcon = Boolean(rightIcon) || (type === 'password' && showPasswordToggle);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle size={16} />;
    if (success) return <CheckCircle size={16} />;
    return null;
  };

  const characterCount = value?.length || 0;
  const isOverLimit = maxLength && characterCount > maxLength;

  return (
    <InputWrapper>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      
      <InputContainer>
        {leftIcon && (
          <IconWrapper position="left">
            {leftIcon}
          </IconWrapper>
        )}
        
        <StyledInput
          ref={ref}
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          error={error}
          success={success}
          size={size}
          hasLeftIcon={hasLeftIcon}
          hasRightIcon={hasRightIcon}
          maxLength={maxLength}
          autoComplete={autoComplete}
          required={required}
          {...props}
        />
        
        {hasRightIcon && (
          <IconWrapper position="right">
            {type === 'password' && showPasswordToggle ? (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            ) : (
              rightIcon || getStatusIcon()
            )}
          </IconWrapper>
        )}
      </InputContainer>
      
      <AnimatePresence>
        {(helperText || (showCharacterCount && maxLength)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            {helperText && (
              <HelperText error={error} success={success}>
                {getStatusIcon()}
                {helperText}
              </HelperText>
            )}
            
            {showCharacterCount && maxLength && (
              <CharacterCount error={isOverLimit}>
                {characterCount}/{maxLength}
              </CharacterCount>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </InputWrapper>
  );
});

Input.displayName = 'Input';

export default Input;