import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  Users, 
  Bot, 
  CreditCard, 
  ArrowUpRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { stats, subscription } = useData();
  const { user } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      tourId: 'tour-nav-dashboard'
    },
    {
      id: 'complaints',
      label: 'Complaints Stack',
      icon: Inbox,
      badge: stats.pending > 0 ? stats.pending : null,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      tourId: 'tour-nav-complaints'
    },
    {
      id: 'team',
      label: 'Roles & Permissions',
      icon: Users,
      badge: `${stats.team_count}/${stats.max_members}`,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      tourId: 'tour-nav-team'
    },
    {
      id: 'bots',
      label: 'Telegram Bots',
      icon: Bot,
      badge: `${stats.active_bots}/${stats.max_bots}`,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      tourId: 'tour-nav-bots'
    },
    {
      id: 'subscription',
      label: 'Subscription Tier',
      icon: CreditCard,
      badge: 'Upgrade',
      badgeColor: 'bg-[#A0BDDB]/30 text-[#203F64] border-[#A0BDDB]/50',
      tourId: 'tour-nav-subscription'
    }
  ];

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex flex-col justify-between py-6 px-4 bg-white rounded-3xl border border-slate-200 md:min-h-[calc(100vh-6rem)] shadow-sm">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-3 block">
            Command Center
          </span>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={item.tourId}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#A0BDDB]/20 text-[#203F64] border border-[#A0BDDB]/50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#2B5484]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span 
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Subscription Status Card */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span>{subscription?.plan?.name || 'Starter Plan'}</span>
            <span className="font-mono text-[#2B5484] font-bold">
              ₹{subscription?.plan?.price_monthly || 399}/mo
            </span>
          </div>

          {/* Progress bar for bots */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Bots Connected</span>
              <span className="font-mono font-medium text-slate-700">
                {stats.active_bots} / {stats.max_bots}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#A0BDDB] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.active_bots / stats.max_bots) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setActiveTab('subscription')}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Manage Plan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
