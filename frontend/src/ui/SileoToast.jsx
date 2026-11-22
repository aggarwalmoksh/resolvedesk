import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

const ToastContext = createContext({
  showToast: () => {},
  showUndo: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, variant = 'brand') => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, variant, type: 'standard' }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const showUndo = useCallback(({ message, duration = 6000, onUndo, onCommit }) => {
    const id = ++counterRef.current;
    let committed = false;

    const timer = setTimeout(() => {
      committed = true;
      onCommit?.();
      removeToast(id);
    }, duration);

    const handleUndo = () => {
      if (committed) return;
      clearTimeout(timer);
      onUndo?.();
      removeToast(id);
    };

    setToasts((prev) => [
      ...prev,
      { id, message, variant: 'neutral', type: 'undo', onUndo: handleUndo },
    ]);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, showUndo }}>
      {children}

      {/* Toast container: Bottom right */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.96 }}
              transition={{
                duration: 0.24,
                ease: [0.16, 1, 0.3, 1],
                exit: { duration: 0.18 },
              }}
              className="pointer-events-auto w-full rounded-[var(--radius-lg)] border border-border-default bg-surface-1 shadow-lg p-3.5 flex items-center justify-between gap-3 text-sm text-text-primary"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    toast.variant === 'error' && 'bg-danger-500',
                    toast.variant === 'success' && 'bg-success-500',
                    toast.variant === 'brand' && 'bg-brand-500',
                    toast.variant === 'neutral' && 'bg-text-tertiary'
                  )}
                />
                <span className="truncate font-medium text-xs sm:text-sm">{toast.message}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {toast.type === 'undo' && (
                  <button
                    type="button"
                    onClick={toast.onUndo}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline px-1 py-0.5"
                  >
                    Undo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-text-tertiary hover:text-text-primary p-0.5 rounded-sm"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
