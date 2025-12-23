import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showClose = true,
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw] max-h-[90vh]',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop with blur */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div
          className={cn(
            `relative w-full 
             bg-white/95 backdrop-blur-apple
             rounded-apple-2xl 
             shadow-apple-xl
             border border-white/20
             animate-scale-in`,
            sizes[size]
          )}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-start justify-between px-6 py-5 border-b border-apple-gray-2/60">
              <div>
                {title && (
                  <h3 className="text-title-2 text-apple-gray-6">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="mt-1 text-body text-apple-gray-4">
                    {subtitle}
                  </p>
                )}
              </div>
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 -mt-1 rounded-full 
                           text-apple-gray-4 hover:text-apple-gray-6 
                           hover:bg-apple-gray-1
                           transition-all duration-200 ease-apple"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Footer for action buttons
export const ModalFooter: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      'flex items-center justify-end gap-3 px-6 py-4 bg-apple-gray-1/50 border-t border-apple-gray-2/60 rounded-b-apple-2xl -mx-6 -mb-5 mt-5',
      className
    )}>
      {children}
    </div>
  );
};
