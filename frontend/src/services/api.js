const getApiBase = () => {
  // In development (Vite dev server), route through the local proxy '/api' to eliminate CORS issues
  if (import.meta.env.DEV) {
    return '/api';
  }

  // In production over HTTPS (e.g. Cloudflare Workers), prevent mixed-content blocks
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    const configured = import.meta.env.VITE_API_URL;
    if (configured && configured.startsWith('https://')) {
      return configured;
    }
    return 'https://resolvedesk-backend-nlt0.onrender.com/api';
  }

  return import.meta.env.VITE_API_URL || 'https://resolvedesk-backend-nlt0.onrender.com/api';
};

const API_BASE = getApiBase();

let clerkSessionToken = null;
let tokenGetter = null;

export const getAuthToken = () => clerkSessionToken;
export const setAuthToken = (token) => { clerkSessionToken = token || null; };
export const setTokenGetter = (fn) => { tokenGetter = fn; };

async function request(path, options = {}) {
  let token = clerkSessionToken;
  if (tokenGetter) {
    try {
      const fresh = await tokenGetter();
      if (fresh) {
        token = fresh;
        clerkSessionToken = fresh;
      }
    } catch {}
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Request failed.');
  return body.data;
}

export const api = {
  getMe: () => request('/auth/me'),
  onboardBusiness: (businessName) => request('/auth/onboard-business', { method: 'POST', body: JSON.stringify({ businessName }) }),
  completeInvitation: (inviteCode) => request('/auth/complete-invitation', { method: 'POST', body: JSON.stringify({ inviteCode }) }),
  getBots: () => request('/bots'),
  linkBot: (bot_token, bot_title) => request('/bots', { method: 'POST', body: JSON.stringify({ bot_token, bot_title }) }),
  activateBot: (id) => request(`/bots/${id}/activate`, { method: 'POST' }),
  pauseBot: (id) => request(`/bots/${id}/pause`, { method: 'POST' }),
  deleteBot: (id) => request(`/bots/${id}`, { method: 'DELETE' }),
  getComplaints: (filters = {}) => request(`/complaints?${new URLSearchParams(filters).toString()}`),
  getComplaint: (id) => request(`/complaints/${id}`),
  updateStatus: (id, status) => request(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  assignComplaint: (id, assigned_to) => request(`/complaints/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ assigned_to }) }),
  replyToComplaint: (id, text) => request(`/complaints/${id}/reply`, { method: 'POST', body: JSON.stringify({ text }) }),
  getTeam: () => request('/team'),
  inviteMember: (payload) => request('/team/invite', { method: 'POST', body: JSON.stringify(payload) }),
  verifyInvite: (code) => request(`/team/verify-invite/${encodeURIComponent(code)}`),
  updatePermissions: (id, permissions) => request(`/team/members/${id}/permissions`, { method: 'PATCH', body: JSON.stringify({ permissions }) }),
  deleteMember: (id) => request(`/team/members/${id}`, { method: 'DELETE' }),
  getSubscription: () => request('/subscription'),
  upgradeSubscription: (plan_id) => request('/subscription/upgrade', { method: 'POST', body: JSON.stringify({ plan_id }) })
};
