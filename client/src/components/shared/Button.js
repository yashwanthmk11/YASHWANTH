import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const buttonVariants = {
  primary: css`
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: var(--white);
    border: none;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--primary-dark), var(--secondary-color));
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }
  `,
  
  secondary: css`
    background: var(--white);
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
    
    &:hover:not(:disabled) {
      background: var(--primary-color);
      color: var(--white);
      transform: translateY(-1px);
    }
  `,
  
  outline: css`
    background: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
    
    &:hover:not(:disabled) {
      background: var(--primary-color);
      color: var(--white);
    }
  `,
  
  ghost: css`
    background: transparent;
    color: var(--gray-700);
    border: none;
    
    &:hover:not(:disabled) {
      background: var(--gray-100);
    }
  `,
  
  danger: css`
    background: var(--error-color);
    color: var(--white);
    border: none;
    
    &:hover:not(:disabled) {
      background: #ef4444;
      transform: translateY(-1px);
    }
  `,
  
  success: css`
    background: var(--success-color);
    color: var(--white);
    border: none;
    
    &:hover:not(:disabled) {
      background: #22c55e;
      transform: translateY(-1px);
    }
  `
};

const buttonSizes = {
  sm: css`
    padding: var(--space-sm) var(--space-md);
    font-size: 0.875rem;
    border-radius: var(--radius-md);
  `,
  
  md: css`
    padding: var(--space-md) var(--space-lg);
    font-size: 1rem;
    border-radius: var(--radius-lg);
  `,
  
  lg: css`
    padding: var(--space-lg) var(--space-xl);
    font-size: 1.125rem;
    border-radius: var(--radius-xl);
  `,
  
  xl: css`
    padding: var(--space-xl) var(--space-2xl);
    font-size: 1.25rem;
    border-radius: var(--radius-xl);
  `
};

const StyledButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  transition: all var(--transition-normal);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  /* Apply variant styles */
  ${props => buttonVariants[props.variant] || buttonVariants.primary}
  
  /* Apply size styles */
  ${props => buttonSizes[props.size] || buttonSizes.md}
  
  /* Full width */
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  /* Loading state */
  ${props => props.loading && css`
    cursor: not-allowed;
    opacity: 0.7;
  `}
  
  /* Disabled state */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    transform: none !important;
  }
  
  /* Focus state */
  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  
  /* Icon only */
  ${props => props.iconOnly && css`
    padding: ${props.size === 'sm' ? 'var(--space-sm)' : 
              props.size === 'lg' ? 'var(--space-lg)' : 
              props.size === 'xl' ? 'var(--space-xl)' : 'var(--space-md)'};
    border-radius: var(--radius-full);
    aspect-ratio: 1;
  `}
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    ${props => props.responsive && css`
      padding: var(--space-sm) var(--space-md);
      font-size: 0.875rem;
    `}
  }
`;

const LoadingSpinner = styled.div`
  width: 1em;
  height: 1em;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconOnly = false,
  responsive = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  ...props
}) => {
  const handleClick = (e) => {
    if (loading || disabled) return;
    onClick?.(e);
  };

  return (
    <StyledButton
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      iconOnly={iconOnly}
      responsive={responsive}
      onClick={handleClick}
      type={type}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      {...props}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {leftIcon && <span>{leftIcon}</span>}
          {!iconOnly && children}
          {rightIcon && <span>{rightIcon}</span>}
        </>
      )}
    </StyledButton>
  );
};

export default Button;