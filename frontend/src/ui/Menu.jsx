import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/cn';

/* ==========================================================================
   HOVER / CLICK MENU
   Direction-aware origin animation: 150ms ease-out-expo, exit 20% shorter (120ms)
   ========================================================================== */

export function HoverMenu({
  trigger,
  children,
  position = 'bottom-right',
  closeOnClickOutside = true,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open || !closeOnClickOutside) return undefined;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, closeOnClickOutside, close]);

  const positionClasses = {
    'bottom-right': 'top-full right-0 mt-1.5',
    'bottom-left': 'top-full left-0 mt-1.5',
    'top-right': 'bottom-full right-0 mb-1.5',
    'top-left': 'bottom-full left-0 mb-1.5',
  };

  const triggerEl = React.isValidElement(trigger)
    ? React.cloneElement(trigger, {
        onClick: (e) => {
          e.stopPropagation();
          toggle();
          trigger.props.onClick?.(e);
        },
      })
    : trigger;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {triggerEl}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: position.startsWith('top') ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: position.startsWith('top') ? 3 : -3 }}
            transition={{
              duration: 0.15,
              ease: [0.16, 1, 0.3, 1],
              exit: { duration: 0.12 },
            }}
            className={cn(
              'absolute z-50 min-w-[180px]',
              positionClasses[position] || positionClasses['bottom-right']
            )}
            onClick={close}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Menu({ children, className }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-border-default bg-surface-1 shadow-lg py-1 overflow-hidden',
        className
      )}
      role="menu"
    >
      {children}
    </div>
  );
}

export function MenuItem({ children, className, onClick, disabled, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left font-medium transition-colors duration-100',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2',
        className
      )}
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
}

export function MenuDivider({ className }) {
  return <hr className={cn('divider my-1', className)} role="separator" />;
}

export function MenuLabel({ children, className }) {
  return (
    <div className={cn('px-3 py-1.5 text-2xs font-medium text-text-tertiary uppercase tracking-wider', className)}>
      {children}
    </div>
  );
}
