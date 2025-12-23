import React, { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'bordered' | 'gradient';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  children, 
  className, 
  variant = 'default',
  hover = false,
  padding = 'md',
  ...props 
}) => {
  const variants = {
    default: 'bg-white border border-apple-gray-2/60 shadow-apple-card',
    glass: 'bg-white/70 backdrop-blur-apple border border-white/30 shadow-apple-card',
    elevated: 'bg-white shadow-apple-lg border border-apple-gray-2/30',
    bordered: 'bg-white border-2 border-apple-gray-2',
    gradient: 'bg-gradient-to-br from-white to-apple-gray-1 border border-apple-gray-2/40 shadow-apple-card',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-7',
  };

  const hoverStyles = hover 
    ? 'transition-all duration-300 ease-apple hover:shadow-apple-card-hover hover:-translate-y-1 cursor-pointer' 
    : '';

  return (
    <div
      className={cn(
        'rounded-apple-xl overflow-hidden',
        variants[variant],
        hoverStyles,
        className
      )}
      {...props}
    >
      {title && (
        <div className="px-5 py-4 border-b border-apple-gray-2/60">
          <h3 className="text-body font-semibold text-apple-gray-6">{title}</h3>
        </div>
      )}
      <div className={cn(!title && paddings[padding])}>{children}</div>
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={cn(
        'px-5 py-4 border-b border-apple-gray-2/60', 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement> & { padding?: 'none' | 'sm' | 'md' | 'lg' }> = ({
  children,
  className,
  padding = 'md',
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'px-4 py-3',
    md: 'px-5 py-4',
    lg: 'px-7 py-5',
  };

  return (
    <div className={cn(paddings[padding], className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={cn(
        'px-5 py-4 bg-apple-gray-1/50 border-t border-apple-gray-2/60', 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};
