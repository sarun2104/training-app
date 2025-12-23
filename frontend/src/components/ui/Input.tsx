import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'ghost';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, variant = 'default', className, ...props }, ref) => {
    const variants = {
      default: `
        bg-white border border-apple-gray-3
        focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
      `,
      filled: `
        bg-apple-gray-1 border border-transparent
        focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
      `,
      ghost: `
        bg-transparent border-b-2 border-apple-gray-3 rounded-none
        focus:border-primary-500 focus:ring-0
      `,
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-body font-medium text-apple-gray-6 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray-4">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              `w-full px-4 py-3 
               rounded-apple-lg
               text-body text-apple-gray-6
               placeholder:text-apple-gray-4
               transition-all duration-200 ease-apple
               focus:outline-none`,
              variants[variant],
              icon && 'pl-12',
              error && 'border-apple-red focus:border-apple-red focus:ring-apple-red/10',
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="mt-2 text-caption text-apple-gray-4">{hint}</p>
        )}
        {error && (
          <p className="mt-2 text-caption text-apple-red flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component with same styling
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-body font-medium text-apple-gray-6 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            `w-full px-4 py-3 
             bg-white border border-apple-gray-3
             rounded-apple-lg
             text-body text-apple-gray-6
             placeholder:text-apple-gray-4
             transition-all duration-200 ease-apple
             focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
             resize-none`,
            error && 'border-apple-red focus:border-apple-red focus:ring-apple-red/10',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-2 text-caption text-apple-gray-4">{hint}</p>
        )}
        {error && (
          <p className="mt-2 text-caption text-apple-red">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
