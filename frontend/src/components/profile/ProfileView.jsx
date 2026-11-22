import React from 'react';
import { useClerk } from '@clerk/react';
import { ArrowUpRight, Building2, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../lib/format';
import { PageHeading } from '../../workspace/controls';

export function ProfileView() {
  const { user, org, clerkUser, signOut } = useAuth();
  const { openUserProfile } = useClerk();
  const displayName = clerkUser?.fullName || user.name || user.email || 'Your account';
  const email = clerkUser?.primaryEmailAddress?.emailAddress || user.email;

  return <>
    <PageHeading title="Your account" description="Manage your profile and sign-in settings." />
    <div className="rd-account-grid">
      <section className="rd-panel rd-account-identity">
        <div className="rd-account-cover" aria-hidden="true" />
        <div className="rd-account-identity-content">
          {clerkUser?.hasImage ? <img className="rd-profile-avatar" src={clerkUser.imageUrl} alt="" /> :
            <span className="rd-profile-avatar rd-initial" aria-hidden="true">{initials(displayName)}</span>}
          <h2>{displayName}</h2>
          {email && <p>{email}</p>}
          <button type="button" className="rd-primary" onClick={() => openUserProfile()}>
            <UserRound aria-hidden /> Manage profile <ArrowUpRight aria-hidden />
          </button>
        </div>
      </section>
      <div className="rd-account-details">
        <section className="rd-panel rd-account-card">
          <h2><Building2 aria-hidden /> Workspace access</h2>
          <dl><div><dt>Workspace</dt><dd>{org?.name || 'ResolveDesk'}</dd></div>
            <div><dt>Role</dt><dd className="capitalize">{user.role}</dd></div></dl>
        </section>
        <section className="rd-panel rd-account-card">
          <h2><ShieldCheck aria-hidden /> Sign-in and security</h2>
          <dl>
            <div><dt>Sign-in provider</dt><dd>Clerk</dd></div>
            {clerkUser?.primaryEmailAddress?.verification?.status === 'verified' &&
              <div><dt>Primary email</dt><dd>Verified</dd></div>}
          </dl>
          <div className="rd-account-actions">
            <button type="button" className="rd-secondary" onClick={signOut}><LogOut aria-hidden /> Sign out</button>
          </div>
        </section>
      </div>
    </div>
  </>;
}
