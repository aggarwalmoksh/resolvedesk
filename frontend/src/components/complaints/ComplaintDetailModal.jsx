import React, { useState } from 'react';
import { 
  X, 
  Send, 
  User, 
  Bot, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Tag, 
  Phone, 
  Calendar,
  MessageSquare,
  AlertCircle,
  Sparkles,
  History
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const ComplaintDetailModal = ({ complaint: initialComplaint, onClose }) => {
  const { complaints, updateComplaintStatus, assignComplaint, replyToComplaint, team } = useData();
  const { user, can } = useAuth();

  // Find reactive complaint from live context so new messages show instantly
  const complaint = complaints.find(c => c.id === initialComplaint?.id) || initialComplaint;

  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionNotice, setPermissionNotice] = useState(null);

  if (!complaint) return null;

  const canReply = can('can_reply');
  const canUpdateStatus = can('can_update_status');
  const canAssign = can('can_assign');

  const handleStatusChange = (newStatus) => {
    if (!canUpdateStatus) {
      setPermissionNotice("Permission Denied: Your assigned role cannot update complaint status.");
      setTimeout(() => setPermissionNotice(null), 3500);
      return;
    }
    updateComplaintStatus(complaint.id, newStatus, user);
  };

  const handleAssigneeChange = (assigneeId) => {
    if (!canAssign) {
      setPermissionNotice("Permission Denied: Your assigned role cannot assign complaints.");
      setTimeout(() => setPermissionNotice(null), 3500);
      return;
    }
    const member = team.members.find(m => m.id === assigneeId);
    assignComplaint(complaint.id, assigneeId, member?.name || 'Staff');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    if (!canReply) {
      setPermissionNotice("Permission Denied: Your assigned role cannot reply directly to customers.");
      setTimeout(() => setPermissionNotice(null), 3500);
      return;
    }

    setIsSubmitting(true);
    await replyToComplaint(complaint.id, replyText, user?.name || 'Staff');
    setReplyText('');
    setIsSubmitting(false);
  };

  // Professional Business Quick Response Presets
  const quickReplies = [
    "Hello! We are looking into this right now and will assist you shortly.",
    "Sincere apologies for the delay! We have escalated this to our dispatch team immediately.",
    "We have reviewed your order and processed a full refund/replacement for you."
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="font-mono text-xs font-bold text-[#2B5484] bg-[#A0BDDB]/25 px-2.5 py-1 rounded-full border border-[#A0BDDB]/40">
                {complaint.ticket_number}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize border border-slate-200">
                {complaint.category} Issue
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                Bot: @{complaint.bot?.username || 'SupportBot'}
              </span>
            </div>

            <h2 className="text-2xl font-serif text-slate-900 font-bold tracking-tight">
              Customer Complaint from {complaint.customer?.name || 'Customer'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Notice Banner */}
        {permissionNotice && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center gap-2 text-rose-700 text-xs font-semibold animate-pulse">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{permissionNotice}</span>
          </div>
        )}

        {/* Modal Body: Two Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          {/* Left 2 Cols: Message History & Reply Composer */}
          <div className="lg:col-span-2 p-6 flex flex-col justify-between space-y-6">
            
            {/* Conversation Thread */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <MessageSquare className="w-3.5 h-3.5 text-[#2B5484]" />
                  <span>Telegram Message Thread</span>
                </span>
                <span>{complaint.messages?.length || 0} Events Logged</span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {complaint.messages && complaint.messages.length > 0 ? (
                  complaint.messages.map((msg, idx) => {
                    const isCustomer = msg.sender_type === 'customer';
                    const isStaff = msg.sender_type === 'staff';
                    const isSystem = msg.sender_type === 'system';

                    if (isSystem) {
                      return (
                        <div key={idx} className="flex items-center justify-center gap-2 my-2 text-[11px] text-slate-500 bg-slate-100 py-1.5 px-3 rounded-full border border-slate-200">
                          <History className="w-3 h-3 text-[#2B5484]" />
                          <span>{msg.message_text}</span>
                          <span className="text-slate-400">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-700">
                            {isCustomer ? `${msg.sender_name} (Telegram Customer)` : `${msg.sender_name} (Support Staff)`}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isStaff
                              ? 'bg-[#A0BDDB]/25 text-slate-900 border border-[#A0BDDB]/50 rounded-tr-none font-medium'
                              : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none'
                          }`}
                        >
                          {msg.message_text}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                    No messages logged yet. Incoming Telegram messages will appear here.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Response Presets */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-500 font-semibold block">
                Quick Response Templates (Sent via Bot):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickReplies.map((qr, qIdx) => (
                  <button
                    key={qIdx}
                    type="button"
                    onClick={() => setReplyText(qr)}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors truncate max-w-xs"
                  >
                    "{qr.substring(0, 38)}..."
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Composer */}
            <form onSubmit={handleSendReply} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    canReply 
                      ? "Type reply to customer (dispatched instantly via Telegram bot)..." 
                      : "You do not have permission to reply directly to customers (RBAC restricted)."
                  }
                  disabled={!canReply}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white disabled:opacity-40 disabled:cursor-not-allowed resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {canReply ? "⚡ Directly delivered to customer's Telegram chat" : "🔒 Replying disabled for current role"}
                </span>

                <button
                  type="submit"
                  disabled={!canReply || isSubmitting || !replyText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply via Bot</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Col: Triage, Status, Assignee */}
          <div className="p-6 bg-slate-50/70 space-y-6">
            
            {/* Status Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Complaint Status
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-200/60 p-1 rounded-2xl">
                {['pending', 'in_progress', 'closed'].map((st) => {
                  const isActive = complaint.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                        isActive
                          ? st === 'pending'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : st === 'in_progress'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assignee Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Assigned Team Member
              </label>
              <select
                value={complaint.assigned_to || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                disabled={!canAssign}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] disabled:opacity-50"
              >
                <option value="">-- Unassigned (Available in Pool) --</option>
                {team.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Details */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Customer Information
              </label>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="font-semibold text-slate-800">
                    {complaint.customer?.name || 'Customer'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Telegram Handle:</span>
                  <span className="font-mono text-[#2B5484]">
                    @{complaint.customer?.username || 'none'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Telegram User ID:</span>
                  <span className="font-mono text-slate-600">
                    {complaint.customer?.telegram_user_id || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Logged At:</span>
                  <span className="text-slate-600">
                    {new Date(complaint.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
