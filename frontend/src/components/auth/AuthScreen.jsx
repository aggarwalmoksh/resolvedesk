import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/react';
import { AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../ui/primitives';

function AuthCardPlaceholder({ signUp }) {
  return <div className="rd-auth-placeholder" role="status">
    <span className="sr-only">{signUp ? 'Loading sign-up form' : 'Loading sign-in form'}</span>
    <div className="rd-auth-placeholder-body" aria-hidden="true">
      <i /><i /><i />
      <div><i /><i /></div>
      <div><i /><i /></div>
      <i />
    </div>
    <div className="rd-auth-placeholder-footer" aria-hidden="true"><i /><i /></div>
  </div>;
}

export const AuthScreen = () => {
  const { clerkUser, workspaceRequired, onboardBusiness, completeInvitation, signOut } = useAuth();
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const inviteCode = params.get('invite');
  const period = params.get('period');
  const billingRedirect = period === 'monthly' || period === 'annual' ? `/app/billing?period=${period}` : '/app';
  const onSignIn = /^\/app\/sign-in(?:\/|$)/.test(pathname);
  const onSignUp = /^\/app\/sign-up(?:\/|$)/.test(pathname);
  const isSignUp = onSignUp || (!onSignIn && Boolean(inviteCode || /^#\/?sign-?up(?:\/|$)/.test(hash)));
  const [invitation, setInvitation] = useState(null);
  const [pendingInvitations, setPendingInvitations] = useState(null);
  const [pendingError, setPendingError] = useState('');
  const checkingInvitations = Boolean(clerkUser && workspaceRequired && !pendingInvitations && !pendingError);
  const canSetUp = Boolean(clerkUser && workspaceRequired && !inviteCode && pendingInvitations?.length === 0);
  const signupRedirect = inviteCode
    ? `/app?invite=${encodeURIComponent(inviteCode)}`
    : billingRedirect;
  const [organization, setOrganization] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showInviteJoin, setShowInviteJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (!inviteCode) return;
    let current = true;
    api.verifyInvite(inviteCode)
      .then(info => { if (current) setInvitation(info); })
      .catch(err => { if (current) setError(err.message); });
    return () => { current = false; };
  }, [inviteCode]);

  useEffect(() => {
    if (!clerkUser || !workspaceRequired) return;
    let current = true;
    api.getPendingInvitations().then(async invites => {
      if (!current) return;
      setPendingInvitations(invites);
      if (inviteCode && invites.length === 1 && invites[0].invite_code === inviteCode) {
        setBusy(true);
        try {
          await completeInvitation(inviteCode);
          navigate('/app', { replace: true });
        } catch (err) {
          if (current) setError(err.message);
        } finally {
          if (current) setBusy(false);
        }
      }
    }).catch(err => { if (current) setPendingError(err.message); });
    return () => { current = false; };
  }, [clerkUser?.id, workspaceRequired, inviteCode, completeInvitation, navigate]);

  async function acceptInvite(code) {
    setBusy(true);
    setError('');
    try {
      await completeInvitation(code);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const handleOnboard = async (e) => {
    e.preventDefault();
    if (!organization.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await onboardBusiness(organization.trim());
      navigate(billingRedirect, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to setup workspace');
    } finally {
      setBusy(false);
    }
  };

  if (!clerkUser && !onSignIn && !onSignUp) {
    return <Navigate to={{ pathname: isSignUp ? '/app/sign-up' : '/app/sign-in', search }} replace />;
  }

  return (
    <div className="rd-signin">
      <div className="rd-signin-intro">
        <a href="/">ResolveDesk</a>
        <h1>{invitation ? `You’re invited to ${invitation.org_name}` : canSetUp ? 'Set up your support desk' : isSignUp ? 'Start your support workspace' : 'Pick up the conversation'}</h1>
        <p>{invitation ? (onSignIn ? `Sign in with ${invitation.email} to join the workspace.` : `Sign up with ${invitation.email} to join the workspace.`) : 'Manage customer complaints from Telegram in one workspace.'}</p>
      </div>
      <div className="rd-signin-form">
        {/* Global Error Banner (if any) */}
        {error && (
          <div className="w-full mb-4 p-3 rounded-[var(--radius-md)] bg-danger-50 border border-danger-500/20 text-xs text-danger-600 flex items-center gap-2 animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{error}</span>
          </div>
        )}

        {/* Workspace Onboarding Step (when logged into Clerk but needs a workspace) */}
        {checkingInvitations ? (
          <Card className="w-full p-7"><p role="status">Checking workspace invitations…</p></Card>
        ) : clerkUser && pendingInvitations?.length ? (
          <Card className="w-full p-7 space-y-4">
            <h2>{busy ? 'Joining your workspace…' : 'Choose a workspace invitation'}</h2>
            {pendingInvitations.map(item => <div key={item.invite_code} className="flex flex-wrap items-center justify-between gap-2">
              <div><strong>{item.org_name}</strong><p className="capitalize">{item.role}</p></div>
              <button type="button" className="rd-secondary" disabled={busy} onClick={() => acceptInvite(item.invite_code)}>Accept invitation</button>
            </div>)}
          </Card>
        ) : clerkUser && (inviteCode || pendingError) ? (
          <Card className="w-full p-7 space-y-4">
            <h2>Unable to join the workspace</h2>
            <p>{pendingError || 'Sign in with the email address that received the invitation.'}</p>
            <Button variant="secondary" onClick={signOut}>Sign out</Button>
          </Card>
        ) : canSetUp ? (
          <Card className="w-full p-7 bg-surface-1 shadow-md border border-border-default space-y-5 animate-scale-in">
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold text-text-primary tracking-tight">
                Create your workspace
              </h1>
              <p className="text-xs text-text-secondary">
                Enter your company or organization name to activate your Telegram support console.
              </p>
            </div>

            <form onSubmit={handleOnboard} className="space-y-4 pt-2">
              <Input
                label="Workspace Name"
                placeholder="e.g. Acme Support Team"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
                autoFocus
                disabled={busy}
              />
              <Button type="submit" loading={busy} className="rd-primary w-full">
                Activate Workspace
              </Button>
            </form>
          </Card>
        ) : (
          /* Authentication Screen — Single clean card rendered by Clerk directly */
          <div className="w-full flex flex-col items-center">
            <div className="w-full flex justify-center">
              {isSignUp ? (
                <SignUp
                  fallback={<AuthCardPlaceholder signUp />}
                  routing="path"
                  path="/app/sign-up"
                  initialValues={invitation ? { emailAddress: invitation.email } : undefined}
                  oauthFlow="popup"
                  signInUrl={`/app/sign-in${search}`}
                  forceRedirectUrl={signupRedirect}
                />
              ) : (
                <SignIn
                  fallback={<AuthCardPlaceholder />}
                  routing="path"
                  path="/app/sign-in"
                  oauthFlow="popup"
                  signUpUrl={`/app/sign-up${search}`}
                  signUpForceRedirectUrl={signupRedirect}
                  forceRedirectUrl={signupRedirect}
                />
              )}
            </div>

            {/* Discreet Team Invitation Link */}
            {!inviteCode && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setShowInviteJoin(!showInviteJoin)}
                  className="text-xs text-text-tertiary hover:text-text-primary transition"
                >
                  {showInviteJoin ? 'Cancel invitation code' : 'Have a team invitation code?'}
                </button>

                <AnimatePresence>
                  {showInviteJoin && (
                    <motion.form
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        const code = joinCode.trim().toUpperCase();
                        if (code) window.location.assign(`/app?invite=${encodeURIComponent(code)}`);
                      }}
                      className="rd-panel rd-form mt-3 text-left"
                    >
                      <Input
                        label="Invitation Code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="INV-XXXXXX"
                        className="font-mono text-xs uppercase"
                        required
                        autoFocus
                      />
                      <Button type="submit" variant="secondary" size="sm" className="w-full">
                        Redeem Invitation
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Minimal Footer */}
        <p className="rd-auth-footer mt-12 text-center text-xs text-text-tertiary">
          ResolveDesk · Telegram Support Hub
        </p>
      </div>
    </div>
  );
};
