import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail,
  ShieldCheck, 
  Check, 
  X, 
  AlertCircle, 
  Crown, 
  Sparkles,
  Trash2, 
  Copy,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const RolesPermissionsView = ({ onNavigateTab }) => {
  const { team, updateMemberPermissions, deleteMember, inviteMember, subscription } = useData();
  const { user } = useAuth();

  const isOwner = user?.role === 'owner';
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('agent');
  const [copiedCode, setCopiedCode] = useState(null);
  const [lastInviteResult, setLastInviteResult] = useState(null);

  const [newPermissions, setNewPermissions] = useState({
    can_reply: true,
    can_update_status: true,
    can_assign: false,
    can_manage_bots: false,
    can_view_analytics: true,
    can_manage_team: false
  });

  const quota = team.quota || { current: team.members.length, max: 3, remaining: 0 };
  const isQuotaFull = quota.current >= quota.max;

  const handleDeleteMember = async (member) => {
    if (!isOwner || member.role === 'owner') return;
    const memberName = member.name || member.email || 'this agent';
    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberName}? This will strictly delete their account from Supabase and Clerk.`
    );
    if (!confirmed) return;

    try {
      await deleteMember(member.id);
    } catch (e) {}
  };

  const handleToggle = (memberId, permKey) => {
    if (!isOwner) return;
    const member = team.members.find(m => m.id === memberId);
    if (!member || member.role === 'owner') return;

    const currentPerms = member.permissions || {};
    const updated = {
      ...currentPerms,
      [permKey]: !Boolean(currentPerms[permKey])
    };
    updateMemberPermissions(memberId, updated);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    if (isQuotaFull) {
      alert("Member invite quota reached for your current plan! Upgrade subscription to invite more partners.");
      return;
    }

    try {
      const res = await inviteMember({
        email: newEmail.trim(),
        name: newName.trim(),
        phone: newPhone.trim(),
        role: newRole,
        permissions: newPermissions
      });

      setLastInviteResult(res?.data || null);
      setNewEmail('');
      setNewName('');
      setNewPhone('');
      setIsInviteModalOpen(false);
    } catch (err) {}
  };

  const handleCopyLink = (code) => {
    const inviteUrl = `${window.location.origin}/?invite=${code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const permissionList = [
    { key: 'can_reply', label: 'Reply to Customer', desc: 'Send Telegram messages directly to customer chat' },
    { key: 'can_update_status', label: 'Update Status', desc: 'Change ticket between Pending, In Progress, Closed' },
    { key: 'can_assign', label: 'Assign Tickets', desc: 'Assign complaints to staff members' },
    { key: 'can_manage_bots', label: 'Manage Bots', desc: 'Link and unlink Telegram bot tokens' },
    { key: 'can_view_analytics', label: 'View Analytics', desc: 'Inspect dashboard metrics & category graphs' }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-serif text-slate-900 dark:text-white tracking-tight font-bold">
              Roles & Granular Permissions
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#A0BDDB]/30 dark:bg-[#A0BDDB]/20 text-[#203F64] dark:text-[#A0BDDB] border border-[#A0BDDB]/50 dark:border-[#A0BDDB]/40">
              {team.members.length} Active Members
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            As the business owner, you can invite team members and business partners by email (GitHub-style) and configure exact permissions: who can reply, who can update status, and who can assign tickets.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          disabled={!isOwner}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member by Email</span>
        </button>
      </div>

      {/* GitHub-style Last Invite Confirmation Card if generated */}
      {lastInviteResult && (
        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <Check className="w-4 h-4" />
              <span>Email Invitation Sent!</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              An invitation email has been dispatched to <strong>{lastInviteResult.invitation?.email}</strong>. They can also join instantly using this invitation code or link:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <code className="text-xs font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded border border-emerald-300 dark:border-emerald-700 font-bold text-emerald-900 dark:text-emerald-300">
                {lastInviteResult.invitation?.invite_code}
              </code>
            </div>
          </div>

          <button
            onClick={() => handleCopyLink(lastInviteResult.invitation?.invite_code)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-emerald-300 dark:border-emerald-700 transition-colors shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedCode === lastInviteResult.invitation?.invite_code ? 'Link Copied!' : 'Copy Invitation Link'}</span>
          </button>
        </div>
      )}

      {/* Quota Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172B] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#A0BDDB]/20 dark:bg-[#A0BDDB]/10 border border-[#A0BDDB]/40 dark:border-[#A0BDDB]/30 flex items-center justify-center text-[#2B5484] dark:text-[#A0BDDB]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#2B5484] dark:text-[#A0BDDB]">
              Team Invite Quota ({subscription?.plan?.name || 'Starter'})
            </div>
            <div className="text-lg font-serif text-slate-900 dark:text-white font-semibold">
              {team.members.length} Active Member(s) • Quota: {quota.max} Max
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isQuotaFull 
                ? "You have reached your team invite limit. Upgrade your subscription to add more members!" 
                : `${Math.max(0, quota.max - team.members.length)} invite slot(s) remaining.`}
            </p>
          </div>
        </div>

        {isQuotaFull && (
          <button
            onClick={() => onNavigateTab && onNavigateTab('subscription')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all shadow-sm"
          >
            <span>Upgrade Subscription</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Team Members List */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0F172B] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
        <div>
          <h2 className="text-xl font-serif text-slate-900 dark:text-white font-bold tracking-tight">
            Organization Team Members
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Owner has complete administrative control. Click checkboxes to customize permissions for each partner or agent.
          </p>
        </div>

        <div className="space-y-4">
          {team.members.map((member) => {
            const isMemberOwner = member.role === 'owner';
            const perms = member.permissions || {};

            return (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4 transition-colors"
              >
                {/* Member Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-serif font-bold text-sm shadow-sm">
                      {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {member.name || 'Team Member'}
                        </span>
                        {isMemberOwner && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#A0BDDB]/30 dark:bg-[#A0BDDB]/20 text-[#203F64] dark:text-[#A0BDDB] border border-[#A0BDDB]/50 dark:border-[#A0BDDB]/40">
                            <Crown className="w-3 h-3 text-[#2B5484] dark:text-[#A0BDDB]" />
                            <span>Owner</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        {member.email && <span>{member.email}</span>}
                        {member.email && member.phone && <span>•</span>}
                        {member.phone && <span>{member.phone}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-xl capitalize ${
                      isMemberOwner 
                        ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200' 
                        : 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    }`}>
                      {member.role || 'Agent'}
                    </span>

                    {isOwner && !isMemberOwner && (
                      <button
                        onClick={() => handleDeleteMember(member)}
                        className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors shadow-xs"
                        title={`Remove ${member.name || member.email || 'agent'} permanently`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissions Checkbox Grid */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
                    Assigned Privileges:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {permissionList.map((perm) => {
                      const isGranted = isMemberOwner || Boolean(perms[perm.key]);

                      return (
                        <div
                          key={perm.key}
                          onClick={() => !isMemberOwner && handleToggle(member.id, perm.key)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs transition-all select-none ${
                            isMemberOwner 
                              ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-default'
                              : isOwner 
                              ? 'cursor-pointer hover:border-[#A0BDDB] dark:hover:border-[#A0BDDB]/70 bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 active:scale-[0.99]' 
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 opacity-70 cursor-default'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isGranted}
                            disabled={isMemberOwner || !isOwner}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-[#2B5484] focus:ring-[#A0BDDB] pointer-events-none"
                          />
                          <div>
                            <span className={`font-semibold block ${isGranted ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                              {perm.label}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight">
                              {perm.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations Section (GitHub Style) */}
      {team.invitations && team.invitations.length > 0 && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0F172B] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif text-slate-900 dark:text-white font-bold tracking-tight">
                Pending Invitations (GitHub-Style)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Team invitations sent via email awaiting member sign up
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {team.invitations.map((invite) => (
              <div
                key={invite.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#2B5484] dark:text-[#A0BDDB]" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {invite.email || invite.phone || 'Invited Member'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 capitalize">
                      {invite.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Invite Code: <code className="font-mono text-slate-800 dark:text-slate-200 font-bold">{invite.invite_code}</code>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(invite.invite_code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode === invite.invite_code ? 'Copied!' : 'Copy Invite Link'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl overflow-hidden transition-colors">
            <h3 className="text-xl font-serif text-slate-900 dark:text-white font-bold mb-1">
              Invite Team Member by Email
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Send an email invitation (like GitHub). They will receive an invitation link to create their password and join your workspace.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Member Email Address (Required)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="partner@company.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#2B5484] dark:focus:border-[#A0BDDB] focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Member Full Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#2B5484] dark:focus:border-[#A0BDDB] focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+919876543211"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#2B5484] dark:focus:border-[#A0BDDB] focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>
              </div>

              {/* Preset Permissions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Configure Initial Permissions:
                </label>
                <div className="space-y-2">
                  {permissionList.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(newPermissions[perm.key])}
                        onChange={(e) => setNewPermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                        className="rounded text-[#2B5484] focus:ring-[#A0BDDB]"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{perm.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">({perm.desc})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all shadow-sm active:scale-95 flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
