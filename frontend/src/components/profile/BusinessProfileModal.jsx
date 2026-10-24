import React from 'react';
import { 
  X, 
  Building2, 
  Phone, 
  Mail, 
  Bot, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  LogOut, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const BusinessProfileModal = ({ isOpen, onClose, onNavigateTab }) => {
  const { user, org, signOut } = useAuth();
  const { bots, team, subscription, stats } = useData();

  if (!isOpen) return null;

  const currentPlan = subscription?.plan || {
    name: 'Starter Plan',
    currency: '₹',
    price_monthly: 399
  };

  const permissionsList = [
    { key: 'can_reply', label: 'Reply to Telegram Complaints', active: user?.role === 'owner' || user?.permissions?.can_reply },
    { key: 'can_update_status', label: 'Update Ticket Status (Triage)', active: user?.role === 'owner' || user?.permissions?.can_update_status },
    { key: 'can_assign', label: 'Assign Tickets to Team Members', active: user?.role === 'owner' || user?.permissions?.can_assign },
    { key: 'can_manage_bots', label: 'Connect & Configure Telegram Bots', active: user?.role === 'owner' || user?.permissions?.can_manage_bots },
    { key: 'can_view_analytics', label: 'View Analytics & KPI Graphs', active: user?.role === 'owner' || user?.permissions?.can_view_analytics },
    { key: 'can_manage_team', label: 'Invite Members & Edit RBAC Permissions', active: user?.role === 'owner' || user?.permissions?.can_manage_team }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 my-auto overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#A0BDDB]/25 border border-[#A0BDDB]/50 flex items-center justify-center text-[#2B5484]">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-serif text-slate-900 font-semibold tracking-tight">
                  {org?.name || 'ResolveDesk Business'}
                </h2>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Business
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized Business & Team Profile Dashboard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-6 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          
          {/* Section 1: Business Overview (Common to all users) */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2B5484]" />
                <span>Business Overview (Shared Workspace)</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Org ID: <code className="font-mono text-slate-700">{org?.id ? `${org.id.slice(0, 8)}...` : 'org-primary'}</code>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ResolveDesk unified complaint command center. Ingests, categorizes, and tracks high-volume customer inquiries arriving from connected Telegram bots with role-based member delegation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Business Phone: <strong>{org?.phone || user?.phone || '+91 98765 43210'}</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Support Email: <strong>support@resolvedesk.io</strong></span>
              </div>
            </div>
          </div>

          {/* Section 2: Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-[#2B5484]" />
                <span>Active Bots</span>
              </div>
              <div className="text-xl font-serif font-bold text-slate-900">
                {stats.active_bots} <span className="text-xs font-sans text-slate-400">/ {stats.max_bots}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#2B5484]" />
                <span>Team Members</span>
              </div>
              <div className="text-xl font-serif font-bold text-slate-900">
                {stats.team_count} <span className="text-xs font-sans text-slate-400">/ {stats.max_members}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#2B5484]" />
                <span>Subscription</span>
              </div>
              <div className="text-xl font-serif font-bold text-slate-900">
                ₹{currentPlan.price_monthly || 399} <span className="text-xs font-sans text-slate-400">/mo</span>
              </div>
            </div>
          </div>

          {/* Section 3: Current User Role & Effective Permissions */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Logged In Member
                </span>
                <div className="text-base font-semibold text-slate-900">
                  {user?.name || 'Alex Morgan'}
                </div>
                <div className="text-xs text-slate-500">
                  {user?.phone || '+91 98765 43210'} • <span className="capitalize font-medium text-[#2B5484]">{user?.role === 'owner' ? 'Business Owner' : user?.role || 'Team Member'}</span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user?.role === 'owner' 
                  ? 'bg-[#A0BDDB]/30 text-[#203F64] border border-[#A0BDDB]/50'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {user?.role === 'owner' ? 'Owner Access' : 'Partner Access'}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-700 block mb-2">
                Your Granted Permissions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {permissionsList.map((perm, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border ${
                      perm.active 
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${perm.active ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>{perm.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              if (onNavigateTab) onNavigateTab('subscription');
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-[#2B5484] bg-[#A0BDDB]/20 hover:bg-[#A0BDDB]/35 border border-[#A0BDDB]/40 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Manage Subscription & Limits</span>
          </button>

          <button
            onClick={() => {
              signOut();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
