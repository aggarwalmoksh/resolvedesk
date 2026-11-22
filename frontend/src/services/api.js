const getApiBase = () => {
  if (import.meta.env.DEV) return '/api';
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    const configured = import.meta.env.VITE_API_URL;
    if (configured && configured.startsWith('https://')) return configured;
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

export function createIdempotencyKey() {
  return crypto.randomUUID();
}

async function request(path, options = {}) {
  const { idempotencyKey, headers: extraHeaders, ...rest } = options;
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
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      ...extraHeaders,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || 'Request failed.');
    error.code = body.code;
    throw error;
  }
  return body.data;
}

export const api = {
  getMe: () => request('/auth/me'),
  onboardBusiness: (businessName, idempotencyKey) =>
    request('/auth/onboard-business', { method: 'POST', body: JSON.stringify({ businessName }), idempotencyKey }),
  getPendingInvitations: () => request('/auth/pending-invitations'),
  completeInvitation: (inviteCode, idempotencyKey) =>
    request('/auth/complete-invitation', { method: 'POST', body: JSON.stringify({ inviteCode }), idempotencyKey }),
  getBots: () => request('/bots'),
  linkBot: (bot_token, bot_title, idempotencyKey) =>
    request('/bots', { method: 'POST', body: JSON.stringify({ bot_token, bot_title }), idempotencyKey }),
  activateBot: (id) => request(`/bots/${id}/activate`, { method: 'POST' }),
  pauseBot: (id) => request(`/bots/${id}/pause`, { method: 'POST' }),
  deleteBot: (id) => request(`/bots/${id}`, { method: 'DELETE' }),
  getComplaints: (filters = {}) => request(`/complaints?${new URLSearchParams(filters).toString()}`),
  getComplaint: (id) => request(`/complaints/${id}`),
  updateStatus: (id, status) => request(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  assignComplaint: (id, assigned_to) => request(`/complaints/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ assigned_to }) }),
  replyToComplaint: (id, text, idempotencyKey) =>
    request(`/complaints/${id}/reply`, { method: 'POST', body: JSON.stringify({ text }), idempotencyKey }),
  getTeam: () => request('/team'),
  inviteMember: (payload, idempotencyKey) =>
    request('/team/invite', { method: 'POST', body: JSON.stringify(payload), idempotencyKey }),
  verifyInvite: (code) => request(`/team/verify-invite/${encodeURIComponent(code)}`),
  updatePermissions: (id, permissions) =>
    request(`/team/members/${id}/permissions`, { method: 'PATCH', body: JSON.stringify({ permissions }) }),
  revokeInvitation: (id) => request(`/team/invitations/${id}`, { method: 'DELETE' }),
  deleteMember: (id) => request(`/team/members/${id}`, { method: 'DELETE' }),
  getSubscription: () => request('/subscription'),
  upgradeSubscription: (plan_id, billing_period, idempotencyKey) =>
    request('/subscription/upgrade', { method: 'POST', body: JSON.stringify({ plan_id, billing_period }), idempotencyKey }),
};
