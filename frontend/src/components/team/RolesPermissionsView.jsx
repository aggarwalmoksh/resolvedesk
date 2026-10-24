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
  Copy,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const RolesPermissionsView = ({ onNavigateTab }) => {
  const { team, updateMemberPermissions, inviteMember, subscription } = useData();
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

  const handleToggle = (memberId, permKey) => {
    if (!isOwner) return;
    const member = team.members.find(m => m.id === memberId);
    if (!member || member.role === 'owner') return;

    const currentPerms = member.permissions || {};
    const updated = {
      ...currentPerms,
      [permKey]: !currentPerms[permKey]
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
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-serif text-slate-900 tracking-tight font-bold">
              Roles & Granular Permissions
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#A0BDDB]/30 text-[#203F64] border border-[#A0BDDB]/50">
              {team.members.length} Active Members
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
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
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <Check className="w-4 h-4" />
              <span>Email Invitation Sent!</span>
            </div>
            <p className="text-xs text-emerald-700">
              An invitation email has been dispatched to <strong>{lastInviteResult.invitation?.email}</strong>. They can also join instantly using this invitation code or link:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-emerald-300 font-bold text-emerald-900">
                {lastInviteResult.invitation?.invite_code}
              </code>
            </div>
          </div>

          <button
            onClick={() => handleCopyLink(lastInviteResult.invitation?.invite_code)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-white hover:bg-slate-50 border border-emerald-300 transition-colors shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedCode === lastInviteResult.invitation?.invite_code ? 'Link Copied!' : 'Copy Invitation Link'}</span>
          </button>
        </div>
      )}

      {/* Quota Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#A0BDDB]/20 border border-[#A0BDDB]/40 flex items-center justify-center text-[#2B5484]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#2B5484]">
              Team Invite Quota ({subscription?.plan?.name || 'Starter'})
            </div>
            <div className="text-lg font-serif text-slate-900 font-semibold">
              {team.members.length} Active Member(s) • Quota: {quota.max} Max
            </div>
            <p className="text-xs text-slate-500">
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
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-serif text-slate-900 font-bold tracking-tight">
            Organization Team Members
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
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
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
              >
                {/* Member Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-serif font-bold text-sm shadow-sm">
                      {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {member.name || 'Team Member'}
                        </span>
                        {isMemberOwner && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#A0BDDB]/30 text-[#203F64] border border-[#A0BDDB]/50">
                            <Crown className="w-3 h-3 text-[#2B5484]" />
                            <span>Owner</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        {member.email && <span>{member.email}</span>}
                        {member.email && member.phone && <span>•</span>}
                        {member.phone && <span>{member.phone}</span>}
                      </div>
                    </div>
                  </div>

                  <span className={`self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-xl capitalize ${
                    isMemberOwner 
                      ? 'bg-white border border-slate-200 text-slate-800' 
                      : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                  }`}>
                    {member.role || 'Agent'}
                  </span>
                </div>

                {/* Permissions Checkbox Grid */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
                    Assigned Privileges:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {permissionList.map((perm) => {
                      const isGranted = isMemberOwner || Boolean(perms[perm.key]);

                      return (
                        <label
                          key={perm.key}
                          onClick={() => !isMemberOwner && handleToggle(member.id, perm.key)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs transition-all ${
                            isMemberOwner 
                              ? 'bg-white border-slate-200 text-slate-700 cursor-default'
                              : isOwner 
                              ? 'cursor-pointer hover:border-[#A0BDDB] bg-white border-slate-200' 
                              : 'bg-white border-slate-200 opacity-70 cursor-default'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isGranted}
                            disabled={isMemberOwner || !isOwner}
                            readOnly
                            className="mt-0.5 rounded text-[#2B5484] focus:ring-[#A0BDDB]"
                          />
                          <div>
                            <span className={`font-semibold block ${isGranted ? 'text-slate-900' : 'text-slate-400'}`}>
                              {perm.label}
                            </span>
                            <span className="text-[10px] text-slate-400 block leading-tight">
                              {perm.desc}
                            </span>
                          </div>
                        </label>
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
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif text-slate-900 font-bold tracking-tight">
                Pending Invitations (GitHub-Style)
              </h3>
              <p className="text-xs text-slate-500">
                Team invitations sent via email awaiting member sign up
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {team.invitations.map((invite) => (
              <div
                key={invite.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#2B5484]" />
                    <span className="text-xs font-semibold text-slate-900">
                      {invite.email || invite.phone || 'Invited Member'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 capitalize">
                      {invite.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Invite Code: <code className="font-mono text-slate-800 font-bold">{invite.invite_code}</code>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(invite.invite_code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xl overflow-hidden">
            <h3 className="text-xl font-serif text-slate-900 font-bold mb-1">
              Invite Team Member by Email
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Send an email invitation (like GitHub). They will receive an invitation link to create their password and join your workspace.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Member Email Address (Required)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="partner@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Member Full Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+919876543211"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                  />
                </div>
              </div>

              {/* Preset Permissions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Configure Initial Permissions:
                </label>
                <div className="space-y-2">
                  {permissionList.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(newPermissions[perm.key])}
                        onChange={(e) => setNewPermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                        className="rounded text-[#2B5484] focus:ring-[#A0BDDB]"
                      />
                      <span className="font-semibold text-slate-800">{perm.label}</span>
                      <span className="text-[10px] text-slate-400">({perm.desc})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
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
