'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, X } from 'lucide-react';

// ==========================================
// 1. BUTTON
// ==========================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/90',
      secondary:
        'bg-secondary bg-gradient-accent hover:opacity-95 text-white shadow-sm transition-all duration-200',
      outline:
        'border border-border bg-card text-foreground hover:bg-muted shadow-sm',
      ghost:
        'bg-transparent hover:bg-muted text-foreground',
      danger:
        'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
      md: 'text-sm px-4 py-2.5 gap-2 font-medium',
      lg: 'text-base px-5 py-3 gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" strokeWidth={1.5} />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ==========================================
// 2. INPUT
// ==========================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={generatedId} className="block text-xs font-bold text-foreground tracking-wide uppercase">
            {label}
          </label>
        )}
        <input
          id={generatedId}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 text-base sm:text-sm min-h-[44px] bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/75 transition-all focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/25',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-destructive font-semibold">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground font-medium">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ==========================================
// 3. BADGE
// ==========================================
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'purple' | 'danger' | 'champagne';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700',
    success: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
    warning: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700',
    info: 'bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-200 border-sky-300 dark:border-sky-700',
    purple: 'bg-violet-100 dark:bg-violet-950/80 text-violet-900 dark:text-violet-200 border-violet-300 dark:border-violet-700',
    danger: 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700',
    champagne: 'bg-[var(--champagne-bg)] text-[var(--champagne-text)] border-[#C9A96E] font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// ==========================================
// 4. CARD
// ==========================================
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-6 text-card-foreground transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ==========================================
// 5. MODAL / DIALOG
// ==========================================
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          'w-full bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border p-5 sm:p-6 space-y-4 max-h-[90dvh] sm:max-h-[90vh] overflow-y-auto text-card-foreground animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 pb-safe sm:pb-6',
          maxWidths[maxWidth]
        )}
      >
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-card-foreground">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition touch-target flex items-center justify-center"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// ==========================================
// 6. SKELETON
// ==========================================
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn('skeleton-box rounded-lg', className)} />;
};

// ==========================================
// 7. EMPTY STATE
// ==========================================
export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card rounded-2xl border border-dashed border-border text-card-foreground">
      <div className="w-14 h-14 rounded-2xl bg-muted text-secondary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="text-base font-bold text-card-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="secondary" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};

// ==========================================
// 8. TOAST NOTIFICATIONS
// ==========================================
export * from './Toast';
