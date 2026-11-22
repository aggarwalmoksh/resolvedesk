import React, { Suspense } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MotionConfig, motion, useReducedMotion } from 'motion/react';
import { Activity, CreditCard, Inbox, Radio, Settings2, ShieldCheck, UsersRound } from 'lucide-react';
import { ComplaintDetailSheet } from '../components/complaints/ComplaintDetailModal';
import { AuthScreen } from '../components/auth/AuthScreen';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ease, WorkspaceSkeleton } from '../workspace/controls';
import '../workspace/workspace.css';

const destinations = [
  ['/app/inbox', 'Inbox', Inbox],
  ['/app/insights', 'Insights', Activity],
  ['/app/bots', 'Channels', Radio],
  ['/app/team', 'Team', UsersRound],
  ['/app/permissions', 'Roles & permissions', ShieldCheck, true],
  ['/app/billing', 'Billing', CreditCard],
];

export function AppShell() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { user, org, loading: authLoading, isSignedIn, signingOut, authError, refresh } = useAuth();
  const { selectedComplaint, setSelectedComplaintId, loading } = useData();
  const reduce = useReducedMotion();
  const segment = pathname.split('/')[2];
  const section = segment === 'dashboard' ? 'insights' : segment || 'insights';
  const onNavigateTab = (tab) => navigate(`/app/${({ dashboard: 'insights', complaints: 'inbox', subscription: 'billing' })[tab] || tab}`);

  if (signingOut) return <div className="rd-auth-transition" />;
  if (authLoading && !isSignedIn) return <AuthScreen />;
  if (authLoading) return (
    <main className="rd-auth-transition" role="status">
      <img className="rd-mark" src="/favicon.svg" alt="" />
      <h1>Checking your workspace<span aria-hidden="true">…</span></h1>
      <span className="rd-auth-transition-progress" aria-hidden="true" />
    </main>
  );
  if (!user && !authError) return <AuthScreen />;
  if (user && /^\/app\/sign-(?:in|up)(?:\/|$)/.test(pathname)) {
    const period = new URLSearchParams(search).get('period');
    return <Navigate to={period === 'monthly' || period === 'annual' ? `/app/billing?period=${period}` : '/app'} replace />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="rd-workspace">
        <aside className="rd-sidebar">
          <NavLink className="rd-brand" to="/app/insights">
            <img className="rd-mark" src="/favicon.svg" alt="" />
            <span>ResolveDesk<small>{org?.name || 'Support workspace'}</small></span>
          </NavLink>
          <nav aria-label="Workspace">
            {destinations.filter(([, , , restricted]) => !restricted || ['admin', 'owner'].includes(user?.role)).map(([path, label, Icon]) => (
              <NavLink end to={path} key={path} className={({ isActive }) => (isActive || (path === '/app/insights' && section === 'insights') ? 'rd-nav-current' : '')}>
                <Icon aria-hidden /><span>{label}</span>
              </NavLink>
            ))}
          </nav>
          {user && <NavLink className="rd-account" aria-label="Your account" to="/app/profile">
            <span className="rd-initial">{(user.name || user.email || 'Account').slice(0, 1).toUpperCase()}</span>
            <span><strong>{user.name || user.email}</strong><small>{user.role}</small></span>
            <Settings2 aria-hidden />
          </NavLink>}
        </aside>
        <main className="rd-main">
          <Suspense fallback={<WorkspaceSkeleton page={section} />}>
            {authError && <div className="rd-notice" role="alert">
              {authError} <button type="button" onClick={refresh}>Retry</button>
            </div>}
            {user && loading ? <WorkspaceSkeleton page={section} /> : user && (
              <motion.div key={pathname} className="rd-page"
                initial={reduce ? false : { opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25, ease }}>
                <Outlet context={{ onNavigateTab, onSelectComplaint: setSelectedComplaintId }} />
              </motion.div>
            )}
          </Suspense>
        </main>
        <ComplaintDetailSheet complaint={selectedComplaint} open={Boolean(selectedComplaint)} onClose={() => setSelectedComplaintId(null)} />
      </div>
    </MotionConfig>
  );
}
