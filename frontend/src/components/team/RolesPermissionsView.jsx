import React, { useState } from 'react';
import { Clipboard, Mail, Send, Trash2, UserPlus } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { countInProgressBy } from '../../lib/ticketCounts';
import { initials } from '../../lib/format';
import { DropdownSelect } from '../../workspace/Dropdown';
import { PageHeading, WorkspaceDialog } from '../../workspace/controls';

export function RolesPermissionsView() {
  const { team, complaints, complaintError, inviteMember, deleteMember, revokeInvitation, showToast } = useData();
  const { user, can } = useAuth();
  const [open, setOpen] = useState(false);
  const [resending, setResending] = useState(null);
  const [revoking, setRevoking] = useState(null);
  const [revokeBusy, setRevokeBusy] = useState(false);
  const [revokeError, setRevokeError] = useState('');
  const [role, setRole] = useState('agent');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const manage = can('can_manage_team');
  const showCounts = ['admin', 'owner'].includes(user?.role);
  const inProgressByMember = showCounts ? countInProgressBy(complaints, 'assigned_to') : null;

  async function invite(event) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try { await inviteMember({ email: data.get('email').trim(), role: data.get('role') }); setOpen(false); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <>
    <PageHeading title="Workspace team" description="See who handles complaints and manage access."
      action={manage && <button className="rd-primary" onClick={() => { setError(''); setRole('agent'); setOpen(true); }}><UserPlus aria-hidden /> Invite member</button>} />
    <section className="rd-panel rd-team">
      <div className="rd-panel-heading"><div><h2>Members</h2><p>{team.members.length} active · {team.quota.max} seats</p></div></div>
      <ul>{team.members.map(member => <li key={member.id}>
        <span className="rd-initial">{initials(member.name || member.email || 'Member')}</span>
        <div><strong>{member.name || member.email}</strong><small>{member.email}</small>
          {showCounts && <small className="rd-ticket-count">
            {complaintError ? 'Ticket count unavailable' : `${inProgressByMember.get(member.id) ?? 0} in progress`}
          </small>}</div>
        <span className="rd-team-role">{member.role}</span>
        {user.role === 'owner' && member.id !== user.id && <button className="rd-icon-button" aria-label={`Remove ${member.name || member.email}`} onClick={() => deleteMember(member.id)}><Trash2 aria-hidden /></button>}
      </li>)}</ul>
    </section>
    {showCounts && team.invitations.length > 0 && <section className="rd-panel rd-team">
      <div className="rd-panel-heading"><div><h2>Pending invitations</h2></div></div>
      <ul>{team.invitations.map(invitation => <li key={invitation.id}>
        <Mail aria-hidden /><div><strong>{invitation.email}</strong></div><span className="rd-team-role">{invitation.role}</span>
        {manage && (invitation.role !== 'admin' || user.role === 'owner') && <button type="button" className="rd-icon-button"
          title="Resend invitation email" aria-label={`Resend invitation email to ${invitation.email}`}
          disabled={resending === invitation.id} onClick={async () => {
            setResending(invitation.id);
            try { await inviteMember({ email: invitation.email, role: invitation.role }); }
            catch { /* The data provider reports delivery errors. */ }
            finally { setResending(null); }
          }}><Send aria-hidden /></button>}
        <button type="button" className="rd-icon-button" title="Copy invite link" aria-label={`Copy invite for ${invitation.email}`}
          onClick={async () => {
            const url = new URL('/app/sign-up', window.location.origin);
            url.searchParams.set('invite', invitation.invite_code);
            try { await navigator.clipboard.writeText(url.href); showToast('Invite link copied'); }
            catch { showToast('Could not copy invite link', 'error'); }
          }}><Clipboard aria-hidden /></button>
        <button type="button" className="rd-icon-button" title="Delete invitation" aria-label={`Delete invitation for ${invitation.email}`}
          onClick={() => { setRevoking(invitation); setRevokeError(''); }}><Trash2 aria-hidden /></button>
      </li>)}</ul>
    </section>}
    {revoking && <WorkspaceDialog title="Delete invitation?" onClose={() => !revokeBusy && setRevoking(null)}>
      <div className="rd-form">
        <p>The invitation link for {revoking.email} will stop working.</p>
        {revokeError && <p className="rd-form-error" role="alert">{revokeError}</p>}
        <button type="button" className="rd-primary" disabled={revokeBusy} onClick={async () => {
          setRevokeBusy(true);
          setRevokeError('');
          try { await revokeInvitation(revoking.id); setRevoking(null); }
          catch (err) { setRevokeError(err.message); }
          finally { setRevokeBusy(false); }
        }}>{revokeBusy ? 'Deleting…' : 'Delete invitation'}</button>
      </div>
    </WorkspaceDialog>}
    {open && <WorkspaceDialog title="Invite a teammate" onClose={() => !busy && setOpen(false)}>
      <form className="rd-form" onSubmit={invite}>
        <label>Work email<input name="email" type="email" required autoFocus placeholder="name@company.com" /></label>
        <div className="rd-dropdown-field">Role
          <DropdownSelect label="Role" name="role" value={role} onChange={setRole} disabled={busy}
            options={user.role === 'owner' ? [['agent', 'Agent'], ['admin', 'Admin']] : [['agent', 'Agent']]} />
        </div>
        {error && <p className="rd-form-error" role="alert">{error}</p>}
        <button className="rd-primary" disabled={busy}>{busy ? 'Inviting…' : 'Send invitation'}</button>
      </form>
    </WorkspaceDialog>}
  </>;
}
