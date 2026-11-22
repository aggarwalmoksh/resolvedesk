import React, { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ComplaintsView } from './components/complaints/ComplaintsView';
import { ComplaintDetailSheet } from './components/complaints/ComplaintDetailModal';
import { RolesPermissionsView } from './components/team/RolesPermissionsView';
import { BotsView } from './components/bots/BotsView';
import { SubscriptionView } from './components/subscription/SubscriptionView';
import { BusinessProfileSheet } from './components/profile/BusinessProfileModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { useData } from './context/DataContext';
import { useAuth } from './context/AuthContext';
import { useDelayedFlag } from './hooks/useDelayedFlag';
import { runViewTransition } from './hooks/useViewTransition';
import { PageSkeleton } from './ui/Skeleton';
import { Skel } from './ui/Skeleton';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { selectedComplaint, setSelectedComplaintId, loading } = useData();
  const { user, loading: authLoading, isProfileOpen, setIsProfileOpen } = useAuth();
  const showBoot = useDelayedFlag(authLoading, 300);
  const showPageSkel = useDelayedFlag(Boolean(user) && loading, 300);

  const navigate = (tab) => {
    runViewTransition(() => setActiveTab(tab));
  };

  if (authLoading) {
    if (!showBoot) return <div className="min-h-dvh bg-paper" />;
    return (
      <div className="min-h-dvh bg-paper app-shell grid place-items-center">
        <div className="w-full max-w-sm space-y-3 px-6">
          <Skel className="h-8 w-40 mx-auto" />
          <Skel className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-dvh bg-paper text-ink app-shell flex flex-col md:flex-row overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={navigate} />

      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        <Navbar onOpenProfile={() => setIsProfileOpen(true)} />
        <main
          className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8"
          style={{ viewTransitionName: 'page-main' }}
        >
          <div className="mx-auto w-full max-w-[1120px]">
            {showPageSkel ? (
              <PageSkeleton />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardView
                    onSelectComplaint={(id) => setSelectedComplaintId(id)}
                    onNavigateTab={navigate}
                  />
                )}
                {activeTab === 'complaints' && (
                  <ComplaintsView onSelectComplaint={(id) => setSelectedComplaintId(id)} />
                )}
                {activeTab === 'team' && (
                  <RolesPermissionsView onNavigateTab={navigate} />
                )}
                {activeTab === 'bots' && (
                  <BotsView onNavigateTab={navigate} />
                )}
                {activeTab === 'subscription' && <SubscriptionView />}
              </>
            )}
          </div>
        </main>
      </div>

      <ComplaintDetailSheet
        complaint={selectedComplaint}
        open={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaintId(null)}
      />
      <BusinessProfileSheet
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNavigateTab={navigate}
      />
    </div>
  );
}
