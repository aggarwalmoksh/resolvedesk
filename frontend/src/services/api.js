const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://resolvedesk-backend-nlt0.onrender.com/api');
let clerkSessionToken = null;
export const getAuthToken = () => clerkSessionToken;
export const setAuthToken = (token) => { clerkSessionToken = token || null; };

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(clerkSessionToken ? { Authorization: `Bearer ${clerkSessionToken}` } : {}), ...options.headers } });
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
  getComplaints: (filters = {}) => request(`/complaints?${new URLSearchParams(filters).toString()}`),
  getComplaint: (id) => request(`/complaints/${id}`),
  updateStatus: (id, status) => request(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  assignComplaint: (id, assigned_to) => request(`/complaints/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ assigned_to }) }),
  replyToComplaint: (id, text) => request(`/complaints/${id}/reply`, { method: 'POST', body: JSON.stringify({ text }) }),
  getTeam: () => request('/team'),
  inviteMember: (payload) => request('/team/invite', { method: 'POST', body: JSON.stringify(payload) }),
  verifyInvite: (code) => request(`/team/verify-invite/${encodeURIComponent(code)}`),
  updatePermissions: (id, permissions) => request(`/team/members/${id}/permissions`, { method: 'PATCH', body: JSON.stringify(permissions) }),
  getSubscription: () => request('/subscription'),
  upgradeSubscription: (plan_id) => request('/subscription/upgrade', { method: 'POST', body: JSON.stringify({ plan_id }) })
};
