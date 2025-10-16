import React from 'react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function LoadingIndicator({ 
  size = 'md',
  color = 'bg-white'
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const dotSize = sizeClasses[size];

  return (
    <div className="flex gap-1">
      <div className={`${dotSize} ${color} rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
      <div className={`${dotSize} ${color} rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
      <div className={`${dotSize} ${color} rounded-full animate-bounce`}></div>
    </div>
  );
}
