import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ClerkProvider } from '@clerk/react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './ui/SileoToast';
import Lenis from 'lenis';
import './index.css';

// Eager: tiny shell components
import { AppShell } from './layouts/AppShell';
import { PageLoader } from './ui/PageLoader';

// Lazy: route-level code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const RefundPage = lazy(() => import('./pages/RefundPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));

// App routes (authenticated)
const DashboardView = lazy(() => import('./components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const ComplaintsView = lazy(() => import('./components/complaints/ComplaintsView').then(m => ({ default: m.ComplaintsView })));
const PermissionsView = lazy(() => import('./components/team/PermissionsView').then(m => ({ default: m.PermissionsView })));
const RolesPermissionsView = lazy(() => import('./components/team/RolesPermissionsView').then(m => ({ default: m.RolesPermissionsView })));
const BotsView = lazy(() => import('./components/bots/BotsView').then(m => ({ default: m.BotsView })));
const SubscriptionView = lazy(() => import('./components/subscription/SubscriptionView').then(m => ({ default: m.SubscriptionView })));
const ProfileView = lazy(() => import('./components/profile/ProfileView').then(m => ({ default: m.ProfileView })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });

    let frame;
    function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return children;
}

function PublicLayout() {
  return (
    <SmoothScroll>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </SmoothScroll>
  );
}

function LandingRoute() {
  const { search, hash } = useLocation();
  return new URLSearchParams(search).has('invite')
    ? <Navigate replace to={{ pathname: '/app', search, hash }} />
    : <LandingPage />;
}

const authCardElements = {
  rootBox: 'rd-clerk-root',
  cardBox: 'rd-clerk-box',
  card: 'rd-clerk-card',
  footer: 'rd-clerk-footer',
  formButtonPrimary: 'rd-clerk-primary',
  socialButtonsBlockButton: 'rd-clerk-social',
  footerActionLink: 'rd-clerk-link',
};

function AuthenticatedLayout() {
  const clerkAppearance = {
    variables: {
      colorPrimary: '#ddbcf7',
      colorPrimaryForeground: '#281834',
      colorBackground: '#1c2923',
      colorForeground: '#eaf4ed',
      colorMuted: '#24352d',
      colorMutedForeground: '#afc4b8',
      colorInput: '#14211b',
      colorInputForeground: '#eaf4ed',
      colorNeutral: '#eaf4ed',
      colorRing: '#86cba5',
      borderRadius: '10px',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    signIn: { elements: authCardElements },
    signUp: { elements: authCardElements },
    userProfile: { elements: { headerTitle: { color: '#eaf4ed' }, pageScrollBox: { minWidth: 0 } } },
  };

  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={clerkAppearance}
      signInUrl="/app/sign-in"
      signUpUrl="/app/sign-up"
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
    >
      <AuthProvider>
        <DataProvider>
          <ScrollToTop />
          <AppShell />
        </DataProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}

export default function Root() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public marketing & legal pages */}
              <Route element={<PublicLayout />}>
                <Route index element={<LandingRoute />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="refund" element={<RefundPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Route>

              {/* Authenticated app */}
              <Route path="app" element={<AuthenticatedLayout />}>
                <Route index element={
                  <DashboardView />
                } />
                <Route path="sign-in/*" />
                <Route path="sign-up/*" />
                <Route path="insights" element={<DashboardView />} />
                <Route path="dashboard" element={<DashboardView />} />
                <Route path="inbox" element={
                  <ComplaintsView />
                } />
                <Route path="permissions" element={<PermissionsView />} />
                <Route path="team" element={
                  <RolesPermissionsView />
                } />
                <Route path="bots" element={
                  <BotsView />
                } />
                <Route path="billing" element={
                  <SubscriptionView />
                } />
                <Route path="profile" element={
                  <ProfileView />
                } />
              </Route>

              {/* Error pages */}
              <Route path="error" element={
                <Suspense fallback={<PageLoader />}>
                  <ErrorPage />
                </Suspense>
              } />
              <Route path="maintenance" element={
                <Suspense fallback={<PageLoader />}>
                  <MaintenancePage />
                </Suspense>
              } />
              <Route path="*" element={
                <Suspense fallback={<PageLoader />}>
                  <NotFoundPage />
                </Suspense>
              } />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}