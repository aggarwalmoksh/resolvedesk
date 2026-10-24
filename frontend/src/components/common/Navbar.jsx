import React, { useState } from 'react';
import { 
  Inbox, 
  Sparkles, 
  User, 
  ChevronDown, 
  ShieldCheck, 
  LogOut, 
  Compass,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { startProductTour } from '../../utils/tour';

export const Navbar = () => {
  const { user, org, personas, switchPersona, signOut, setIsProfileOpen } = useAuth();
  const { subscription } = useData();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Business Name */}
        <div id="tour-brand-header" className="flex items-center gap-4">
          <div 
            onClick={() => setIsProfileOpen(true)}
            className="relative group cursor-pointer flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#A0BDDB]/30 border border-[#A0BDDB]/60 flex items-center justify-center text-[#2B5484] shadow-sm group-hover:border-[#2B5484] transition-all">
              <Inbox className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif text-slate-900 tracking-tight font-bold">
                  ResolveDesk
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans truncate max-w-[200px]">
                {org?.name || 'Customer Operations Desk'}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-700 font-medium capitalize">
              {subscription?.plan?.name || 'Starter Plan'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({subscription?.usage?.bots?.current || 1}/{subscription?.usage?.bots?.max || 1} Bot • {subscription?.usage?.team_members?.current || 1}/{subscription?.usage?.team_members?.max || 3} Members)
            </span>
          </div>
        </div>

        {/* Right: Actions, Tour Trigger & Profile Dashboard */}
        <div className="flex items-center gap-3">
          
          {/* Driver.js Product Tour Trigger */}
          <button
            onClick={startProductTour}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all shadow-sm"
          >
            <Compass className="w-4 h-4 text-[#2B5484]" />
            <span>Interactive Tour</span>
          </button>

          {/* Business Profile Avatar Button */}
          <button
            id="tour-profile-btn"
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-[#A0BDDB] transition-all shadow-sm text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#A0BDDB]/30 border border-[#A0BDDB]/50 flex items-center justify-center text-[#2B5484] group-hover:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>

            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.name || 'Alex Morgan'}
              </div>
              <div className="text-[10px] text-[#2B5484] uppercase tracking-wider font-medium">
                {user?.role === 'owner' ? 'Owner / Admin' : 'Staff Agent'}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
          </button>

        </div>

      </div>
    </header>
  );
};
