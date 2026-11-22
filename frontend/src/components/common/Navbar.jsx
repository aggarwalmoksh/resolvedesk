import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HoverMenu, MenuItem, MenuDivider } from '../../ui/Menu';
import { Avatar } from '../../ui/primitives';
import { cn } from '../../lib/cn';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  inbox: 'Inbox',
  team: 'Team',
  bots: 'Bots',
  billing: 'Billing',
  profile: 'Settings',
};

export const Navbar = ({ onOpenProfile, activeTab }) => {
  const navigate = useNavigate();
  const { user, org, signOut } = useAuth();
  const userDisplayName = user?.name || user?.email?.split('@')[0] || 'User';
  const pageTitle = PAGE_TITLES[activeTab] || 'Dashboard';

  return (
    <header
      className="sticky top-0 z-30 h-14 border-b border-border-default bg-surface-1 px-4 sm:px-6 lg:px-8 flex items-center justify-between"
      role="banner"
    >
      {/* Left: Page title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-text-tertiary hidden sm:inline">{org?.name || 'Workspace'}</span>
        <span className="text-xs text-text-tertiary hidden sm:inline">/</span>
        <h1 className="text-sm font-semibold text-text-primary truncate">{pageTitle}</h1>
      </div>

      {/* Right: User menu */}
      <HoverMenu
        position="bottom-right"
        trigger={
          <button
            type="button"
            className={cn(
              'flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1',
              'hover:bg-surface-2 transition-colors',
              'min-h-[36px]'
            )}
            aria-haspopup="true"
          >
            <Avatar size="sm" name={userDisplayName} />
            <span className="hidden sm:block text-xs font-medium text-text-primary truncate max-w-[120px]">
              {userDisplayName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-text-tertiary hidden sm:block" strokeWidth={1.5} aria-hidden="true" />
          </button>
        }
      >
        <div className="w-52 rounded-[var(--radius-lg)] border border-border-default bg-surface-1 shadow-lg overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-border-default">
            <p className="text-xs font-semibold text-text-primary truncate">{userDisplayName}</p>
            <p className="text-[11px] text-text-tertiary truncate">{user?.email || ''}</p>
          </div>
          <div className="py-1">
            <MenuItem
              onClick={() => navigate('/app/profile')}
              className="px-3.5 py-2 text-xs flex items-center gap-2.5 text-text-secondary hover:text-text-primary hover:bg-surface-2"
            >
              <User className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span>Workspace Settings</span>
            </MenuItem>
            <MenuDivider />
            <MenuItem
              onClick={signOut}
              className="px-3.5 py-2 text-xs flex items-center gap-2.5 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span>Sign out</span>
            </MenuItem>
          </div>
        </div>
      </HoverMenu>
    </header>
  );
};
