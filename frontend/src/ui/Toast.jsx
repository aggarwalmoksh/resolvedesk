import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const undoRef = useRef(null);
  const commitRef = useRef(null);

  const clearTimer = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const showToast = useCallback((message, type = 'success') => {
    clearTimer();
    undoRef.current = null;
    commitRef.current = null;
    setToast({ id: Date.now(), message, type, undo: false });
    timer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  const showUndo = useCallback(({ message, duration = 8000, onUndo, onCommit }) => {
    clearTimer();
    if (commitRef.current) commitRef.current();
    let cancelled = false;
    undoRef.current = () => {
      cancelled = true;
      onUndo?.();
    };
    commitRef.current = () => {
      if (!cancelled) onCommit?.();
    };
    setToast({ id: Date.now(), message, type: 'undo', undo: true });
    timer.current = window.setTimeout(() => {
      if (!cancelled) onCommit?.();
      undoRef.current = null;
      commitRef.current = null;
      setToast(null);
    }, duration);
  }, []);

  const value = useMemo(() => ({ showToast, showUndo }), [showToast, showUndo]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed z-[60] left-1/2 -translate-x-1/2 bottom-[calc(16px+env(safe-area-inset-bottom))] flex items-center gap-3 px-4 py-2.5 surface shadow-lg text-[13px] text-ink max-w-[min(420px,calc(100vw-24px))]"
        >
          <span className="flex-1">{toast.message}</span>
          {toast.undo && (
            <button
              type="button"
              className="font-medium text-accent hit px-2"
              onClick={() => {
                undoRef.current?.();
                undoRef.current = null;
                commitRef.current = null;
                clearTimer();
                setToast(null);
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showToast: () => {}, showUndo: () => {} };
  return ctx;
}
