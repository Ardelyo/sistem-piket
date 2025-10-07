

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'border-white' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-t-transparent ${color}`} />
    </div>
  );
};

export default Spinner;