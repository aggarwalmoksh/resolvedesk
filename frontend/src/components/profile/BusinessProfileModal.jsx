import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Users, Bot, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../ui/primitives';

export const BusinessProfileSheet = ({ open, onClose, onNavigateTab }) => {
  const { user, org, signOut } = useAuth();

  if (!open) return null;

  const handleNav = (tab) => {
    onClose();
    onNavigateTab?.(tab);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30"
            aria-hidden="true"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="relative w-full max-w-sm bg-surface-1 shadow-xl flex flex-col h-full border-l border-border-default z-10 p-5 justify-between"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-default pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Building2 className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {org?.name || 'Workspace'}
                    </h3>
                    <p className="text-[11px] text-text-tertiary">Organization Console</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded text-text-tertiary hover:text-text-primary"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Navigation Shortcuts */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleNav('team')}
                  className="w-full flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition text-left"
                >
                  <Users className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
                  <span>Manage Team Members</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('bots')}
                  className="w-full flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition text-left"
                >
                  <Bot className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
                  <span>Configure Bots</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('billing')}
                  className="w-full flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition text-left"
                >
                  <CreditCard className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
                  <span>Subscription & Limits</span>
                </button>
              </div>
            </div>

            {/* Footer Sign out */}
            <div className="pt-4 border-t border-border-default">
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="w-full text-xs text-danger-500 hover:bg-danger-50 justify-start"
                iconStart={<LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />}
              >
                Sign out
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
