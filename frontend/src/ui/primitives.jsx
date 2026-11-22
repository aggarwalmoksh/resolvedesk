import React, { forwardRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/cn';

/* ==========================================================================
   BUTTONS
   Press feedback: scale(0.97), 10% Coral CTA for primary, Fitts' law (min 44px)
   ========================================================================== */

export const Button = forwardRef(function Button(
  {
    as = 'button',
    variant = 'primary',
    size = 'md',
    className,
    disabled,
    loading,
    type = 'button',
    children,
    iconStart,
    iconEnd,
    onClick,
    ...props
  },
  ref
) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  };

  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    icon: 'btn-icon',
    'icon-sm': 'btn-icon-sm',
  };

  const Comp = as === 'button' ? motion.button : motion.div;

  return (
    <Comp
      ref={ref}
      type={as === 'button' ? type : undefined}
      disabled={disabled || loading}
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onClick={disabled || loading ? undefined : onClick}
      className={cn('btn', variants[variant], sizes[size], className)}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin text-current opacity-80"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
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
          <span>Loading</span>
        </span>
      ) : (
        <>
          {iconStart && <span className="shrink-0" aria-hidden="true">{iconStart}</span>}
          {children}
          {iconEnd && <span className="shrink-0" aria-hidden="true">{iconEnd}</span>}
        </>
      )}
    </Comp>
  );
});

export const IconButton = forwardRef(function IconButton(
  { className, children, 'aria-label': ariaLabel, disabled, onClick, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onClick={onClick}
      className={cn(
        'btn btn-ghost btn-icon text-text-secondary hover:text-text-primary rounded-[var(--radius-md)]',
        className
      )}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </motion.button>
  );
});

/* ==========================================================================
   CARDS
   Formula: Inner radius = Outer radius - Padding
   Card radius = 16px (radius-lg), p-5 (20px) -> inner elements ~ 8-10px
   ========================================================================== */

export function Card({ className, children, interactive, onClick, ...props }) {
  if (interactive || onClick) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className={cn('card cursor-pointer', className)}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('px-5 py-4 border-b border-border-default', className)}>
      {children}
    </div>
  );
}

export function CardContent({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn('px-5 py-3.5 border-t border-border-default bg-surface-2/40', className)}>
      {children}
    </div>
  );
}

/* ==========================================================================
   FORM INPUTS
   Shake on error, clear focus rings
   ========================================================================== */

export function Label({ className, children, htmlFor, required }) {
  return (
    <label htmlFor={htmlFor} className={cn('label text-xs font-medium text-text-secondary uppercase tracking-wider', className)}>
      {children}
      {required && <span className="text-danger-500 ml-1" aria-hidden="true">*</span>}
    </label>
  );
}

export function Field({ className, label, hint, error, children, required }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {error && (
        <p className="text-xs text-danger-500 flex items-center gap-1.5 animate-shake" role="alert">
          <span className="h-1 w-1 rounded-full bg-danger-500" />
          {error}
        </p>
      )}
      {hint && !error && <p className="hint">{hint}</p>}
    </div>
  );
}

export const Input = forwardRef(function Input(
  { className, error, disabled, id, label, hint, required, ...props },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
      <input
        ref={ref}
        id={inputId}
        disabled={disabled}
        className={cn('input', error && 'input-error animate-shake', className)}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {error && (
        <p className="text-xs text-danger-500 flex items-center gap-1.5" role="alert">
          <span className="h-1 w-1 rounded-full bg-danger-500" />
          {error}
        </p>
      )}
      {hint && !error && <p className="hint">{hint}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { className, error, disabled, id, label, hint, required, ...props },
  ref
) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && <Label htmlFor={textareaId} required={required}>{label}</Label>}
      <textarea
        ref={ref}
        id={textareaId}
        disabled={disabled}
        className={cn('textarea', error && 'input-error animate-shake', className)}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {error && (
        <p className="text-xs text-danger-500 flex items-center gap-1.5" role="alert">
          <span className="h-1 w-1 rounded-full bg-danger-500" />
          {error}
        </p>
      )}
      {hint && !error && <p className="hint">{hint}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { className, options = [], error, disabled, id, label, required, ...props },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && <Label htmlFor={selectId} required={required}>{label}</Label>}
      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        className={cn('select', error && 'input-error', className)}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
});

/* ==========================================================================
   BADGE
   Small, non-distracting semantic markers
   ========================================================================== */

export function Badge({ variant = 'neutral', className, children }) {
  const variants = {
    brand: 'badge-brand',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    neutral: 'badge-neutral',
  };

  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}

/* ==========================================================================
   AVATAR
   Circular with initials fallback and optional status dot
   ========================================================================== */

export function Avatar({ name = '', size = 'md', src, status, className }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-text-tertiary',
    away: 'bg-warning-500',
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover border border-border-default', sizes[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 font-medium flex items-center justify-center border border-brand-200/40 dark:border-brand-800/40',
            sizes[size]
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-surface-1',
            statusColors[status] || statusColors.online
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/* ==========================================================================
   TOGGLE / SWITCH
   Micro-animated with squash and stretch
   ========================================================================== */

export function Toggle({ checked, onChange, disabled, label, className }) {
  return (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          checked ? 'bg-brand-500' : 'bg-surface-3'
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
    </label>
  );
}

/* ==========================================================================
   EMPTY STATE
   Clean layout, NO icon background box
   ========================================================================== */

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      {Icon && (
        <Icon className="h-10 w-10 text-text-tertiary mb-3.5" strokeWidth={1.25} aria-hidden="true" />
      )}
      {title && <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>}
      {description && <p className="text-sm text-text-secondary max-w-sm mb-5 text-balance">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

/* ==========================================================================
   DIVIDERS & SEPARATORS
   ========================================================================== */

export function Divider({ className, vertical }) {
  return (
    <hr
      className={cn(vertical ? 'divider-vertical h-5' : 'divider my-4', className)}
      aria-hidden="true"
    />
  );
}

export function SeparatorText({ className, children }) {
  return (
    <div className={cn('flex items-center gap-3 text-xs font-medium text-text-tertiary uppercase tracking-wider', className)}>
      <div className="flex-1 divider" />
      <span>{children}</span>
      <div className="flex-1 divider" />
    </div>
  );
}
