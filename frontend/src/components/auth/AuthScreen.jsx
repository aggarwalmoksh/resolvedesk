import React, { useEffect, useMemo, useState } from 'react';
import { SignIn, SignUp, AuthenticateWithRedirectCallback } from '@clerk/react';
import { Building2, Inbox, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AuthScreen = () => {
  const { clerkUser, loading, onboardBusiness, completeInvitation, refresh } = useAuth();
  const inviteCode = useMemo(() => new URLSearchParams(window.location.search).get('invite'), []);
  const [hash, setHash] = useState(() => window.location.hash || '');
  const [mode, setMode] = useState(inviteCode ? 'signup' : 'signin');
  const [organization, setOrganization] = useState('');
  const [invite, setInvite] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Track URL hash changes (Clerk hash routing emits #signup, #signin, #/sso-callback)
  useEffect(() => {
    const handleHash = () => {
      const current = window.location.hash || '';
      setHash(current);
      if (current.includes('signup') || current.includes('sign-up')) {
        setMode('signup');
      } else if (current.includes('signin') || current.includes('sign-in')) {
        setMode('signin');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const isSignUp = useMemo(() => {
    return Boolean(inviteCode || hash.includes('sign-up') || hash.includes('signup') || mode === 'signup');
  }, [inviteCode, hash, mode]);

  const isSsoCallback = useMemo(() => {
    return hash.includes('sso-callback');
  }, [hash]);

  // When returning from an SSO provider (Google), ensure refresh runs once authentication completes
  useEffect(() => {
    if (isSsoCallback) {
      const timer = setTimeout(() => {
        refresh?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSsoCallback, refresh]);

  useEffect(() => {
    if (inviteCode) {
      api.verifyInvite(inviteCode).then(setInvite).catch(e => setError(e.message));
    }
  }, [inviteCode]);

  useEffect(() => {
    if (!clerkUser || !inviteCode) return;
    setBusy(true);
    completeInvitation(inviteCode).catch(e => setError(e.message)).finally(() => setBusy(false));
  }, [clerkUser?.id, inviteCode]);

  if (isSsoCallback) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-[#080D1A] text-slate-700 dark:text-slate-200">
        <AuthenticateWithRedirectCallback signInForceRedirectUrl="/" signUpForceRedirectUrl="/" />
        <div className="text-center">
          <Loader2 className="w-7 h-7 mx-auto animate-spin text-[#2B5484] dark:text-[#A0BDDB]" />
          <p className="mt-3 text-sm">Completing authentication…</p>
        </div>
      </div>
    );
  }

  if (loading || busy) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-[#080D1A] text-slate-700 dark:text-slate-200">
        <div className="text-center">
          <Loader2 className="w-7 h-7 mx-auto animate-spin text-[#2B5484] dark:text-[#A0BDDB]" />
          <p className="mt-3 text-sm">Setting up your secure workspace…</p>
        </div>
      </div>
    );
  }

  if (clerkUser && !inviteCode) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-[#080D1A] p-5">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              await onboardBusiness(organization);
            } catch (err) {
              setError(err.message);
            } finally {
              setBusy(false);
            }
          }}
          className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F172B] border border-slate-200 dark:border-slate-800 p-8 shadow-xl"
        >
          <Building2 className="w-10 h-10 text-[#2B5484] dark:text-[#A0BDDB]" />
          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">Create your workspace</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">One last step, {clerkUser.firstName || 'there'}.</p>
          <label className="block mt-6 text-sm font-semibold text-slate-700 dark:text-slate-200">Organization name</label>
          <input
            autoFocus
            required
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="e.g. Acme Support or Retail Desk"
            className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm outline-none focus:border-[#2B5484] dark:focus:border-[#A0BDDB] focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-[#A0BDDB]/30 transition-all shadow-xs"
          />
          {error && <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
          <button className="mt-6 w-full rounded-xl bg-[#2B5484] dark:bg-[#3B6A9F] hover:bg-[#1e426b] dark:hover:bg-[#2B5484] py-3 text-sm font-semibold text-white shadow-sm transition-all active:scale-95">
            Create workspace
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080D1A] grid place-items-center p-5">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#A0BDDB]/40 text-[#2B5484] dark:text-[#A0BDDB]">
            <Inbox />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">ResolveDesk</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Secure customer-support operations.</p>
          {invite && (
            <p className="mt-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-3 py-2 text-sm text-sky-800 dark:text-sky-300">
              You’re joining <strong>{invite.org_name}</strong>.
            </p>
          )}
        </div>

        {error && <p className="mb-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-3 text-sm text-rose-700 dark:text-rose-400">{error}</p>}

        <div className="rounded-3xl bg-white dark:bg-[#0F172B] p-3 shadow-xl border border-slate-200 dark:border-slate-800">
          {isSignUp ? (
            <SignUp routing="hash" signInUrl="#signin" fallbackRedirectUrl="/" />
          ) : (
            <SignIn routing="hash" signUpUrl="#signup" fallbackRedirectUrl="/" />
          )}
        </div>

        {!inviteCode && (
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => {
                const nextMode = isSignUp ? 'signin' : 'signup';
                setMode(nextMode);
                window.location.hash = nextMode === 'signup' ? '#signup' : '#signin';
              }}
              className="w-full text-sm text-[#2B5484] dark:text-[#A0BDDB] hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const code = joinCode.trim().toUpperCase();
                if (code) window.location.assign(`/?invite=${encodeURIComponent(code)}`);
              }}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172B] p-3.5 shadow-xs"
            >
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Joining an existing business?</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Invitation code"
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 uppercase font-mono outline-none focus:border-[#2B5484] dark:focus:border-[#A0BDDB] focus:bg-white dark:focus:bg-slate-950"
                />
                <button className="rounded-xl bg-slate-900 dark:bg-[#2B5484] px-4 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-[#1e426b] transition-all shadow-xs">
                  Join
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
