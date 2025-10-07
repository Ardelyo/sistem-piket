import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', isLoading = false, className = '', ...props }) => {
  const baseClasses = 'font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 shadow-md hover:shadow-lg';

  const variantClasses = {
    primary: 'bg-accent text-white hover:bg-accent-dark',
    secondary: 'bg-card text-primary hover:bg-card/70 border border-primary/20',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-9',
    md: 'px-5 py-2.5 text-base h-12',
    lg: 'px-7 py-3 text-lg h-14',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : children}
    </button>
  );
};

export default Button;