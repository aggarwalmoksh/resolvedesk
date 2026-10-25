import crypto from 'crypto';
import { supabase } from './supabase.js';

export const PLANS = {
  starter: { id: 'starter', name: 'Starter Plan', currency: '₹', price_monthly: 399, max_bots: 1, max_members: 3 },
  growth: { id: 'growth', name: 'Growth Plan', currency: '₹', price_monthly: 599, max_bots: 3, max_members: 10 },
  scale: { id: 'scale', name: 'Pro Enterprise', currency: '₹', price_monthly: 999, max_bots: 10, max_members: 25 },
  enterprise: { id: 'enterprise', name: 'Pro Enterprise', currency: '₹', price_monthly: 999, max_bots: 10, max_members: 25 }
};

export const DEFAULT_PERMISSIONS = {
  owner: { can_reply: true, can_update_status: true, can_assign: true, can_manage_team: true, can_manage_bots: true },
  admin: { can_reply: true, can_update_status: true, can_assign: true, can_manage_team: true, can_manage_bots: true },
  agent: { can_reply: true, can_update_status: true, can_assign: false, can_manage_team: false, can_manage_bots: false }
};

function db() {
  if (!supabase) throw new Error('Database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  return supabase;
}
function checked(error, operation) { if (error) throw new Error(`${operation}: ${error.message}`); }

class SupabaseStore {
  async createOrg({ name, phone = null, subscription_tier = 'starter' }) { const plan = PLANS[subscription_tier] || PLANS.starter; const { data, error } = await db().from('organizations').insert({ name, phone, subscription_tier: plan.id, max_bots: plan.max_bots, max_members: plan.max_members }).select().single(); checked(error, 'Could not create organization'); return data; }
  async getOrgById(id) { if (!id) return null; const { data, error } = await db().from('organizations').select('*').eq('id', id).maybeSingle(); checked(error, 'Could not load organization'); return data; }
  async updateOrg(id, updates) { const { data, error } = await db().from('organizations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().maybeSingle(); checked(error, 'Could not update organization'); return data; }

  async createUser({ clerk_user_id, org_id, name, email = null, phone = null, role = 'agent', permissions }) { const { data, error } = await db().from('users').insert({ clerk_user_id, org_id, name, email: email?.toLowerCase() || null, phone, role, permissions: permissions || DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.agent, is_active: true }).select().single(); checked(error, 'Could not create member'); return data; }
  async getUserById(id) { if (!id) return null; const { data, error } = await db().from('users').select('*').eq('id', id).maybeSingle(); checked(error, 'Could not load member'); return data; }
  async getUserByClerkId(clerkId) { if (!clerkId) return null; const { data, error } = await db().from('users').select('*').eq('clerk_user_id', clerkId).maybeSingle(); checked(error, 'Could not load member'); return data; }
  async getUserByEmail(email, orgId = null) { if (!email) return null; let query = db().from('users').select('*').eq('email', email.toLowerCase()); if (orgId) query = query.eq('org_id', orgId); const { data, error } = await query.maybeSingle(); checked(error, 'Could not load member'); return data; }
  async getUsersByOrg(orgId) { const { data, error } = await db().from('users').select('*').eq('org_id', orgId).eq('is_active', true).order('created_at'); checked(error, 'Could not load members'); return data || []; }
  async updateUser(id, updates) { const { data, error } = await db().from('users').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().maybeSingle(); checked(error, 'Could not update member'); return data; }
  async deleteUser(id) { const { error } = await db().from('users').delete().eq('id', id); checked(error, 'Could not remove member'); return true; }

  async getBotsByOrg(orgId) { const { data, error } = await db().from('bots').select('*').eq('org_id', orgId).order('created_at'); checked(error, 'Could not load bots'); return data || []; }
  async getBotById(id) { const { data, error } = await db().from('bots').select('*').eq('id', id).maybeSingle(); checked(error, 'Could not load bot'); return data; }
  async getBotByToken(token) { const { data, error } = await db().from('bots').select('*').eq('bot_token', token).maybeSingle(); checked(error, 'Could not load bot'); return data; }
  async createBot(values) { const { data, error } = await db().from('bots').insert({ ...values, status: 'active' }).select().single(); checked(error, 'Could not link bot'); return data; }
  async updateBot(id, updates) { const { data, error } = await db().from('bots').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().maybeSingle(); checked(error, 'Could not update bot'); return data; }
  async deleteBot(id) { const { error } = await db().from('bots').delete().eq('id', id); checked(error, 'Could not unlink bot'); return true; }

  async getOrCreateCustomer(values) { const { data: current, error: readError } = await db().from('customers').select('*').eq('org_id', values.org_id).eq('telegram_user_id', Number(values.telegram_user_id)).maybeSingle(); checked(readError, 'Could not load customer'); if (current) return current; const { data, error } = await db().from('customers').insert({ ...values, telegram_user_id: Number(values.telegram_user_id) }).select().single(); checked(error, 'Could not create customer'); return data; }
  async getCustomerById(id) { const { data, error } = await db().from('customers').select('*').eq('id', id).maybeSingle(); checked(error, 'Could not load customer'); return data; }
  async getActiveComplaintForCustomer(orgId, customerId) { const { data, error } = await db().from('complaints').select('*').eq('org_id', orgId).eq('customer_id', customerId).in('status', ['pending', 'in_progress']).order('created_at', { ascending: false }).limit(1).maybeSingle(); checked(error, 'Could not load complaint'); return data; }
  async createComplaint(values) { const ticket_number = `TICK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`; const { data, error } = await db().from('complaints').insert({ ...values, ticket_number, status: 'pending' }).select().single(); checked(error, 'Could not create complaint'); return data; }
  async getComplaints(orgId, filters = {}) { let query = db().from('complaints').select('*, customers(*), bots(*), assignee:users!complaints_assigned_to_fkey(*)').eq('org_id', orgId).order('updated_at', { ascending: false }); for (const key of ['status', 'category', 'assigned_to', 'bot_id']) if (filters[key]) query = query.eq(key, filters[key]); if (filters.search) { const term = `%${filters.search}%`; query = query.or(`ticket_number.ilike.${term},title.ilike.${term},description.ilike.${term}`); } const { data, error } = await query; checked(error, 'Could not load complaints'); return data || []; }
  async getComplaintById(id, orgId = null) { let query = db().from('complaints').select('*, customers(*), bots(*), assignee:users!complaints_assigned_to_fkey(*)').eq('id', id); if (orgId) query = query.eq('org_id', orgId); const { data, error } = await query.maybeSingle(); checked(error, 'Could not load complaint'); return data; }
  async updateComplaint(id, updates, orgId) { let query = db().from('complaints').update({ ...updates, updated_at: new Date().toISOString(), ...(updates.status && ['closed', 'resolved'].includes(updates.status) ? { closed_at: new Date().toISOString() } : {}) }).eq('id', id); if (orgId) query = query.eq('org_id', orgId); const { data, error } = await query.select().maybeSingle(); checked(error, 'Could not update complaint'); return data; }
  async addMessage(values) { const { data, error } = await db().from('complaint_messages').insert({ ...values, sender_id: String(values.sender_id) }).select().single(); checked(error, 'Could not save message'); return data; }
  async getMessagesByComplaint(id) { const { data, error } = await db().from('complaint_messages').select('*').eq('complaint_id', id).order('created_at'); checked(error, 'Could not load messages'); return data || []; }

  async createInvitation({ org_id, email, role = 'agent', permissions, clerk_invitation_id = null }) { const invite_code = `INV-${crypto.randomBytes(12).toString('hex').toUpperCase()}`; const { data, error } = await db().from('invitations').insert({ org_id, email: email?.toLowerCase(), role, permissions: permissions || DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.agent, invite_code, clerk_invitation_id }).select().single(); checked(error, 'Could not create invitation'); return data; }
  async getInvitationByCode(code) { const { data, error } = await db().from('invitations').select('*').eq('invite_code', code).eq('status', 'pending').gt('expires_at', new Date().toISOString()).maybeSingle(); checked(error, 'Could not load invitation'); return data; }
  async getInvitationsByOrg(orgId) { const { data, error } = await db().from('invitations').select('*').eq('org_id', orgId).eq('status', 'pending').order('created_at'); checked(error, 'Could not load invitations'); return data || []; }
  async updateInvitation(id, updates) { const { data, error } = await db().from('invitations').update(updates).eq('id', id).select().maybeSingle(); checked(error, 'Could not update invitation'); return data; }
}

export const store = new SupabaseStore();
