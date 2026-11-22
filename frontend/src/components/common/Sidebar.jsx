import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard, Inbox, Users, Bot, CreditCard, Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/cn';
import { Avatar } from '../../ui/primitives';

const NAV_ITEMS = [
  { id: 'dashboard', path: '/app',         icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'inbox',     path: '/app/inbox',   icon: Inbox,           label: 'Inbox' },
  { id: 'team',      path: '/app/team',    icon: Users,           label: 'Team' },
  { id: 'bots',      path: '/app/bots',    icon: Bot,             label: 'Bots' },
  { id: 'billing',   path: '/app/billing', icon: CreditCard,      label: 'Billing' },
  { id: 'profile',   path: '/app/profile', icon: Settings,        label: 'Settings' },
];

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNav = (item) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-[220px] lg:w-[240px] border-r border-border-default bg-surface-1 shrink-0"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="px-5 h-16 flex items-center border-b border-border-default">
          <a href="/app" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white text-xs font-semibold shadow-xs">
              R
            </div>
            <span className="text-base font-semibold text-text-primary tracking-tight">
              ResolveDesk
            </span>
          </a>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => handleNav(item)}
                className={cn(
                  'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors',
                  isActive
                    ? 'text-brand-600 dark:text-brand-300 bg-brand-50/70 dark:bg-brand-900/20 font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                )}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-brand-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User mini */}
        <div className="px-3 pb-4 pt-2 border-t border-border-default">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm hover:bg-surface-2 transition-colors text-left"
            onClick={() => handleNav(NAV_ITEMS[5])}
          >
            <Avatar size="sm" name={user?.name || user?.email || 'U'} />
            <span className="text-xs text-text-secondary truncate">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border-default bg-surface-1/95 backdrop-blur-md px-2 pb-safe-b"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)' }}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-14">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => handleNav(item)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] rounded-lg transition-colors',
                  isActive
                    ? 'text-brand-600 dark:text-brand-300 font-medium'
                    : 'text-text-tertiary'
                )}
                whileTap={{ scale: 0.92 }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-[10px]">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
