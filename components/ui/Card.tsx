import React, { ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-card/50 rounded-3xl shadow-soft p-6 overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;