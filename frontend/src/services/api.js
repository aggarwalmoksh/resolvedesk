/**
 * ResolveDesk API Client & Live Supabase Data Layer
 */

import { supabase } from './supabaseClient';

const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('resolvedesk_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('resolvedesk_token', token);
  else localStorage.removeItem('resolvedesk_token');
};

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// API Helpers
export const api = {
  // Auth
  async login(phone, password) {
    // 1. First try Supabase Native Auth if credentials look like email or phone
    try {
      let emailOrPhone = phone.trim();
      const isEmail = emailOrPhone.includes('@');
      const authPayload = isEmail 
        ? { email: emailOrPhone, password } 
        : { phone: emailOrPhone.startsWith('+') ? emailOrPhone : `+91${emailOrPhone.replace(/\D/g, '')}`, password };
      
      const { data: sbData, error: sbErr } = await supabase.auth.signInWithPassword(authPayload);
      if (!sbErr && sbData?.session) {
        console.log('⚡ Supabase Native Auth sign-in successful');
      }
    } catch (e) {
      // Non-blocking fallback to backend API
    }

    // 2. Authenticate with SaaS Backend
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid phone number or password');
    }

    setAuthToken(data.data.token);
    return data.data;
  },

  async register(payload) {
    // 1. Try Supabase Native Auth signUp
    try {
      const cleanPhone = (payload.phone || '').replace(/\D/g, '');
      const email = payload.email || `user_${cleanPhone}@resolvedesk.io`;
      await supabase.auth.signUp({
        email,
        password: payload.password,
        options: {
          data: {
            name: payload.name,
            phone: payload.phone,
            business_name: payload.businessName,
            role: 'owner',
            subscription_tier: payload.subscriptionTier || 'starter'
          }
        }
      });
    } catch (e) {
      console.warn('Supabase auth signup notice:', e.message);
    }

    // 2. Register with SaaS Backend
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    setAuthToken(data.data.token);
    return data.data;
  },

  // Supabase Phone OTP Auth
  async sendPhoneOtp(phone) {
    const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.replace(/\D/g, '')}`;
    
    // Call Supabase native client directly
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });
      if (!error) {
        return { status: 'success', message: `OTP sent to ${formattedPhone}`, data };
      }
    } catch (err) {}

    // Backend endpoint fallback
    const res = await fetch(`${API_BASE}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formattedPhone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return data;
  },

  async verifyPhoneOtp(phone, token) {
    const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.replace(/\D/g, '')}`;

    // 1. Try verify with Supabase client
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: token.trim(),
        type: 'sms'
      });
      if (!error && data?.session) {
        console.log('⚡ Supabase OTP verification succeeded');
      }
    } catch (err) {}

    // 2. Verify with backend endpoint to establish org session
    const res = await fetch(`${API_BASE}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formattedPhone, token: token.trim() })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid OTP code');

    if (data.data?.token) {
      setAuthToken(data.data.token);
    }
    return data.data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) {
      throw new Error('Session expired');
    }
    const data = await res.json();
    return data.data;
  },

  // Bots
  async getBots() {
    try {
      const res = await fetch(`${API_BASE}/bots`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch (e) {
      console.warn('Error fetching bots from API:', e.message);
    }

    // Direct Supabase fallback
    try {
      const { data: sbBots } = await supabase.from('bots').select('*');
      if (sbBots && sbBots.length > 0) {
        return {
          bots: sbBots.map(b => ({
            id: b.id,
            bot_username: b.bot_username,
            bot_title: b.bot_title || b.bot_username,
            masked_token: b.bot_token ? `${b.bot_token.substring(0, 4)}...${b.bot_token.substring(b.bot_token.length - 4)}` : '••••••••',
            webhook_url: b.webhook_url,
            status: b.status || 'active',
            created_at: b.created_at
          })),
          quota: { used: sbBots.length, max: 1 }
        };
      }
    } catch (e) {}

    return { bots: [], quota: { used: 0, max: 1 } };
  },

  async linkBot(bot_token, bot_title) {
    const res = await fetch(`${API_BASE}/bots`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bot_token, bot_title })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to link bot');
    return data.data;
  },

  // Complaints & Messages
  async getComplaints(filters = {}) {
    try {
      const qs = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE}/complaints${qs ? '?' + qs : ''}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
    } catch (e) {
      console.warn('API getComplaints note:', e.message);
    }

    // Direct Supabase fallback if backend is momentarily unreachable
    try {
      const { data: sbComplaints } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
      const { data: sbMessages } = await supabase.from('complaint_messages').select('*').order('created_at', { ascending: true });

      if (sbComplaints) {
        return sbComplaints.map(c => ({
          ...c,
          messages: sbMessages ? sbMessages.filter(m => m.complaint_id === c.id) : []
        }));
      }
    } catch (e) {}

    return [];
  },

  async getComplaint(id) {
    const res = await fetch(`${API_BASE}/complaints/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Complaint not found');
    const data = await res.json();
    return data.data;
  },

  async updateStatus(id, status, note = '') {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update status');
    return data.data;
  },

  async assignComplaint(id, assigned_to) {
    const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ assigned_to })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to assign complaint');
    return data.data;
  },

  async replyToComplaint(id, text) {
    const res = await fetch(`${API_BASE}/complaints/${id}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reply to complaint');
    return data.data;
  },

  // Team & Email Invitations (GitHub Style)
  async getTeam() {
    try {
      const res = await fetch(`${API_BASE}/team`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch (e) {}

    return {
      members: [],
      invitations: [],
      quota: { current: 0, max: 3, remaining: 3 }
    };
  },

  async inviteMember(payload) {
    const res = await fetch(`${API_BASE}/team/invite`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send email invite');
    return data;
  },

  async verifyInvite(code) {
    const res = await fetch(`${API_BASE}/team/verify-invite/${encodeURIComponent(code)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid invitation code');
    return data.data;
  },

  async acceptInvite(payload) {
    const res = await fetch(`${API_BASE}/team/accept-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to accept invitation');
    if (data.data?.token) {
      setAuthToken(data.data.token);
    }
    return data.data;
  },

  async updatePermissions(memberId, permissions) {
    const res = await fetch(`${API_BASE}/team/members/${memberId}/permissions`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ permissions })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update permissions');
    return data.data;
  },

  // Subscription in Rupees: ₹399, ₹599, ₹999
  async getSubscription() {
    try {
      const res = await fetch(`${API_BASE}/subscription`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch (e) {}

    return {
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
    };
  },

  async upgradeSubscription(plan_id) {
    const res = await fetch(`${API_BASE}/subscription/upgrade`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ plan_id })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upgrade plan');
    return data.data;
  }
};
