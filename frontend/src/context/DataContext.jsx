import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user, token } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [bots, setBots] = useState([]);
  const [team, setTeam] = useState({
    members: [],
    invitations: [],
    quota: { current: 0, max: 3, remaining: 3 }
  });
  const [subscription, setSubscription] = useState({
    plan: {
      id: 'starter',
      name: 'Starter Plan',
      currency: '₹',
      price_monthly: 399,
      max_bots: 1,
      max_members: 3,
      description: 'Essential support for small businesses managing their first Telegram bot.'
    },
    usage: {
      bots: { current: 0, max: 1, available: 1 },
      team_members: { current: 1, max: 3, available: 2 }
    }
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Compute stats in real-time
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'pending').length;
  const in_progress = complaints.filter(c => c.status === 'in_progress').length;
  const closed = complaints.filter(c => c.status === 'closed' || c.status === 'resolved').length;
  const resolution_rate_percent = total > 0 ? Math.round((closed / total) * 100) : 0;

  const stats = {
    total,
    pending,
    in_progress,
    closed,
    resolution_rate_percent,
    active_bots: bots.length,
    max_bots: subscription?.plan?.max_bots || 1,
    team_count: team.members.length || 1,
    max_members: subscription?.plan?.max_members || 3
  };

  // Category breakdown
  const categoriesList = ['product', 'delivery', 'billing', 'service', 'other'];
  const categoriesBreakdown = categoriesList.map(cat => {
    const count = complaints.filter(c => c.category === cat).length;
    return {
      category: cat,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0
    };
  });

  // Fetch real data from backend API
  const refreshAll = async () => {
    if (!token) return;
    try {
      const [complaintsData, botsData, teamData, subData] = await Promise.allSettled([
        api.getComplaints(),
        api.getBots(),
        api.getTeam(),
        api.getSubscription()
      ]);

      if (complaintsData.status === 'fulfilled' && Array.isArray(complaintsData.value)) {
        setComplaints(complaintsData.value);
      }
      if (botsData.status === 'fulfilled' && botsData.value?.bots) {
        setBots(botsData.value.bots);
      }
      if (teamData.status === 'fulfilled' && teamData.value) {
        setTeam(teamData.value);
      }
      if (subData.status === 'fulfilled' && subData.value) {
        setSubscription(subData.value);
      }
    } catch (e) {
      console.warn('Backend sync note:', e.message);
    }
  };

  // Polling for live incoming Telegram messages
  useEffect(() => {
    if (!token) return;
    refreshAll();

    const interval = setInterval(() => {
      refreshAll();
    }, 4000);

    return () => clearInterval(interval);
  }, [token]);

  // Supabase Realtime Subscription for instant message updates
  useEffect(() => {
    if (!token) return;

    let channel = null;
    try {
      channel = supabase
        .channel('public:realtime_feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
          refreshAll();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'complaint_messages' }, () => {
          refreshAll();
        })
        .subscribe();
    } catch (e) {
      console.warn('Supabase Realtime subscription note:', e.message);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [token]);

  const selectedComplaint = complaints.find(c => c.id === selectedComplaintId) || null;

  // Status update
  const updateComplaintStatus = async (id, newStatus, userActor) => {
    try {
      await api.updateStatus(id, newStatus);
    } catch (e) {
      console.warn('Status update sync:', e.message);
    }

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;
      const history = c.messages || [];
      const auditMsg = {
        id: `audit-${Date.now()}`,
        sender_type: 'system',
        sender_name: 'System',
        message_text: `Status updated to '${newStatus.toUpperCase()}' by ${userActor?.name || 'Staff'}.`,
        created_at: new Date().toISOString()
      };
      return {
        ...c,
        status: newStatus,
        closed_at: (newStatus === 'closed' || newStatus === 'resolved') ? new Date().toISOString() : c.closed_at,
        messages: [...history, auditMsg]
      };
    }));

    if (newStatus === 'closed' || newStatus === 'resolved') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#A0BDDB', '#10B981', '#3B82F6']
        });
      } catch (e) {}
    }

    showToast(`Ticket status updated to ${newStatus.toUpperCase()}`);
  };

  // Ticket assignment
  const assignComplaint = async (id, assigneeId, assigneeName) => {
    try {
      await api.assignComplaint(id, assigneeId);
    } catch (e) {}

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;
      const auditMsg = {
        id: `audit-${Date.now()}`,
        sender_type: 'system',
        sender_name: 'System',
        message_text: assigneeId 
          ? `Complaint assigned to ${assigneeName}.`
          : `Complaint unassigned.`,
        created_at: new Date().toISOString()
      };
      return {
        ...c,
        assigned_to: assigneeId,
        assignee: assigneeId ? { id: assigneeId, name: assigneeName } : null,
        messages: [...(c.messages || []), auditMsg]
      };
    }));

    showToast(assigneeId ? `Assigned to ${assigneeName}` : 'Complaint unassigned');
  };

  // Reply to Telegram customer
  const replyToComplaint = async (id, text, senderName = 'Support Agent') => {
    try {
      await api.replyToComplaint(id, text);
    } catch (e) {}

    const newReply = {
      id: `msg-${Date.now()}`,
      sender_type: 'staff',
      sender_name: senderName,
      message_text: text,
      created_at: new Date().toISOString()
    };

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        status: c.status === 'pending' ? 'in_progress' : c.status,
        messages: [...(c.messages || []), newReply]
      };
    }));

    showToast('Reply dispatched directly to customer Telegram chat! 🚀');
  };

  // Update permissions for team member
  const updateMemberPermissions = async (memberId, permissions) => {
    try {
      await api.updatePermissions(memberId, permissions);
    } catch (e) {}

    setTeam(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === memberId ? { ...m, permissions } : m)
    }));

    showToast('Member permissions updated');
  };

  // Invite member by email (GitHub Style)
  const inviteMember = async ({ email, name, phone, role = 'agent', permissions }) => {
    try {
      const res = await api.inviteMember({ email, name, phone, role, permissions });
      refreshAll();
      showToast(res.message || `Invitation dispatched to ${email}!`);
      return res;
    } catch (e) {
      showToast(e.message || 'Failed to send invite', 'error');
      throw e;
    }
  };

  // Link new bot
  const linkBot = async ({ bot_token, bot_title }) => {
    try {
      await api.linkBot(bot_token, bot_title);
      await refreshAll();
      showToast('Telegram Bot linked and webhook activated! 🤖');
    } catch (err) {
      showToast(err.message || 'Failed to link bot', 'error');
      throw err;
    }
  };

  // Upgrade subscription
  const upgradePlan = async (planId) => {
    try {
      await api.upgradeSubscription(planId);
      await refreshAll();
      showToast(`Subscription plan upgraded!`);
    } catch (err) {
      showToast(err.message || 'Failed to upgrade plan', 'error');
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{
        complaints,
        selectedComplaint,
        selectedComplaintId,
        setSelectedComplaintId,
        bots,
        team,
        subscription,
        stats,
        categoriesBreakdown,
        loading,
        refreshAll,
        updateComplaintStatus,
        assignComplaint,
        replyToComplaint,
        updateMemberPermissions,
        inviteMember,
        linkBot,
        upgradePlan,
        showToast
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-xl text-xs font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#A0BDDB]" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
