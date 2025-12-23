import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  className,
  icon,
}) => {
  const variants = {
    default: 'bg-apple-gray-1 text-apple-gray-5 border-apple-gray-2',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    danger: 'bg-red-50 text-apple-red border-red-100',
    info: 'bg-blue-50 text-blue-600 border-blue-100',
    primary: 'bg-primary-50 text-primary-600 border-primary-100',
    secondary: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-mini',
    md: 'px-2.5 py-1 text-caption',
    lg: 'px-3 py-1.5 text-body',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border transition-colors',
        rounded ? 'rounded-full' : 'rounded-apple-sm',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

// Dot indicator
export const StatusDot: React.FC<{
  status: 'online' | 'offline' | 'away' | 'busy';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}> = ({ status, size = 'md', pulse = false }) => {
  const colors = {
    online: 'bg-apple-green',
    offline: 'bg-apple-gray-4',
    away: 'bg-apple-orange',
    busy: 'bg-apple-red',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <span className="relative inline-flex">
      <span className={cn('rounded-full', colors[status], sizes[size])} />
      {pulse && (
        <span
          className={cn(
            'absolute inset-0 rounded-full animate-ping opacity-75',
            colors[status]
          )}
        />
      )}
    </span>
  );
};
