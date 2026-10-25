import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ComplaintsView } from './components/complaints/ComplaintsView';
import { ComplaintDetailModal } from './components/complaints/ComplaintDetailModal';
import { RolesPermissionsView } from './components/team/RolesPermissionsView';
import { BotsView } from './components/bots/BotsView';
import { SubscriptionView } from './components/subscription/SubscriptionView';
import { BusinessProfileModal } from './components/profile/BusinessProfileModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { useData } from './context/DataContext';
import { useAuth } from './context/AuthContext';
import { Inbox } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { selectedComplaint, setSelectedComplaintId } = useData();
  const { user, loading, isProfileOpen, setIsProfileOpen } = useAuth();

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080D1A] flex flex-col items-center justify-center text-slate-800 dark:text-slate-100 transition-colors">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md animate-pulse text-[#2B5484] dark:text-[#A0BDDB]">
            <Inbox className="w-7 h-7" />
          </div>
        </div>
        <p className="mt-4 text-xs font-serif text-slate-600 dark:text-slate-300 tracking-wider uppercase font-semibold">
          Loading ResolveDesk...
        </p>
      </div>
    );
  }

  // If user is not authenticated, show AuthScreen gateway
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080D1A] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-[#A0BDDB] selection:text-slate-900 transition-colors">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              onSelectComplaint={(id) => setSelectedComplaintId(id)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'complaints' && (
            <ComplaintsView
              onSelectComplaint={(id) => setSelectedComplaintId(id)}
            />
          )}

          {activeTab === 'team' && (
            <RolesPermissionsView
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'bots' && (
            <BotsView
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'subscription' && (
            <SubscriptionView />
          )}
        </main>
      </div>

      {/* Complaint Triage & Detail Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaintId(null)}
        />
      )}

      {/* Business Profile Modal / Profile Dashboard */}
      <BusinessProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Clean Minimal Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0B1120] transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2B5484] dark:bg-[#A0BDDB]" />
            <span className="font-serif text-slate-800 dark:text-slate-200 font-bold">ResolveDesk</span>
            <span>• Intelligent Telegram Complaint Command Center</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Clerk Auth & Supabase</span>
            <span>•</span>
            <span className="font-mono text-[#2B5484] dark:text-[#A0BDDB] font-medium">HEX: #A0BDDB</span>
            <span>•</span>
            <span>driver.js Onboarding</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
