import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  rounded?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  rounded = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = `
    relative inline-flex items-center justify-center 
    font-medium tracking-tight
    transition-all duration-300 ease-apple
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-primary-600 text-white 
      hover:bg-primary-700 
      shadow-apple hover:shadow-apple-md
      border border-primary-600/20
    `,
    secondary: `
      bg-apple-gray-1 text-apple-gray-6 
      hover:bg-apple-gray-2
      border border-apple-gray-3/50
      shadow-apple-sm hover:shadow-apple
    `,
    danger: `
      bg-apple-red text-white 
      hover:bg-red-600 
      shadow-apple hover:shadow-apple-md
      border border-red-600/20
    `,
    ghost: `
      text-primary-600 
      hover:bg-primary-50 
      hover:text-primary-700
    `,
    outline: `
      bg-transparent text-primary-600 
      border-2 border-primary-600 
      hover:bg-primary-600 hover:text-white
      shadow-none hover:shadow-apple
    `,
    glass: `
      bg-white/70 backdrop-blur-apple text-apple-gray-6
      border border-white/20
      shadow-apple-card hover:shadow-apple-card-hover
      hover:bg-white/90
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-[13px] gap-1.5',
    md: 'px-5 py-2.5 text-[15px] gap-2',
    lg: 'px-6 py-3 text-[17px] gap-2.5',
    xl: 'px-8 py-4 text-[17px] gap-3',
  };

  const roundedStyles = rounded ? 'rounded-full' : 'rounded-apple';

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        roundedStyles,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
