import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../.data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');
import { supabase } from './supabase.js';

// Subscription plan definitions
export const PLANS = {
  starter: { id: 'starter', name: 'Starter Plan', currency: '₹', price: 399, price_monthly: 399, max_bots: 1, max_members: 3, description: 'Essential support for small businesses managing their first Telegram bot.' },
  growth: { id: 'growth', name: 'Growth Plan', currency: '₹', price: 599, price_monthly: 599, max_bots: 3, max_members: 10, description: 'For growing businesses with multiple bots and staff team members.' },
  scale: { id: 'scale', name: 'Pro Enterprise', currency: '₹', price: 999, price_monthly: 999, max_bots: 10, max_members: 25, description: 'High-volume businesses needing advanced delegation & multi-agent support.' },
  enterprise: { id: 'enterprise', name: 'Pro Enterprise', currency: '₹', price: 999, price_monthly: 999, max_bots: 10, max_members: 25, description: 'High-volume businesses needing advanced delegation & multi-agent support.' }
};

export const DEFAULT_PERMISSIONS = {
  owner: {
    can_reply: true,
    can_update_status: true,
    can_assign: true,
    can_manage_team: true,
    can_manage_bots: true
  },
  admin: {
    can_reply: true,
    can_update_status: true,
    can_assign: true,
    can_manage_team: true,
    can_manage_bots: true
  },
  agent: {
    can_reply: true,
    can_update_status: true,
    can_assign: false,
    can_manage_team: false,
    can_manage_bots: false
  }
};

class Store {
  constructor() {
    this.data = {
      organizations: [],
      users: [],
      bots: [],
      customers: [],
      complaints: [],
      complaint_messages: [],
      invitations: []
    };
    this.isLoaded = false;
    this.load();
  }

  load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...this.data, ...JSON.parse(raw) };
      } else {
        this.save();
      }
      this.isLoaded = true;
    } catch (err) {
      console.warn('⚠️ Warning: Failed to read local db.json, using in-memory store:', err.message);
      this.isLoaded = true;
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ Failed to persist store to file:', err.message);
    }
  }

  // Generic collection helper
  _coll(name) {
    if (!this.data[name]) this.data[name] = [];
    return this.data[name];
  }

  // Organizations
  createOrg({ id = null, name, phone, subscription_tier = 'starter' }) {
    const safePhone = (phone || '+910000000000').slice(0, 32);
    const plan = PLANS[subscription_tier] || PLANS.starter;
    const org = {
      id: id || crypto.randomUUID(),
      name,
      phone: safePhone,
      subscription_tier: plan.id,
      max_bots: plan.max_bots,
      max_members: plan.max_members,
      ticket_seq: 1000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this._coll('organizations').push(org);
    this.save();

    // Sync to Supabase PostgreSQL table
    if (supabase) {
      supabase.from('organizations').upsert({
        id: org.id,
        name: org.name,
        phone: (org.phone || '+910000000000').slice(0, 32),
        subscription_tier: org.subscription_tier,
        max_bots: org.max_bots,
        max_members: org.max_members,
        ticket_seq: org.ticket_seq,
        created_at: org.created_at,
        updated_at: org.updated_at
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.warn('⚠️ Supabase organizations sync note:', error.message);
        else console.log('⚡ [Supabase] Org synchronized:', org.name);
      }).catch(err => console.warn('Supabase org sync err:', err.message));
    }

    return org;
  }

  getOrgById(id) {
    return this._coll('organizations').find(o => o.id === id) || null;
  }

  updateOrg(id, updates) {
    const org = this.getOrgById(id);
    if (!org) return null;
    Object.assign(org, updates, { updated_at: new Date().toISOString() });
    this.save();

    if (supabase) {
      supabase.from('organizations').update({ ...updates, updated_at: org.updated_at }).eq('id', id)
        .then(({ error }) => { if (error) console.warn('Supabase org update note:', error.message); })
        .catch(err => console.warn('Supabase org update err:', err.message));
    }
    return org;
  }

  // Users
  createUser({ id = null, org_id, name, email = null, phone = null, password_hash, role = 'agent', permissions = null }) {
    const perms = permissions || DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.agent;
    const user = {
      id: id || crypto.randomUUID(),
      org_id,
      name,
      email: email ? email.toLowerCase().trim() : null,
      phone,
      password_hash: password_hash || null,
      role,
      permissions: { ...perms },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this._coll('users').push(user);
    this.save();

    if (supabase) {
      const org = this.getOrgById(user.org_id);
      const doUpsertUser = () => {
        supabase.from('users').upsert({
          id: user.id,
          org_id: user.org_id,
          name: user.name,
          phone: String(user.phone || user.email || '+910000000000').slice(0, 32),
          password_hash: user.password_hash,
          role: user.role,
          permissions: user.permissions,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        }, { onConflict: 'id' }).then(({ error }) => {
          if (error) console.warn('⚠️ Supabase users sync note:', error.message);
          else console.log('⚡ [Supabase] User synchronized:', user.name, user.phone);
        }).catch(err => console.warn('Supabase user sync err:', err.message));
      };

      if (org) {
        supabase.from('organizations').upsert({
          id: org.id,
          name: org.name,
          phone: (org.phone || '+910000000000').slice(0, 32),
          subscription_tier: org.subscription_tier,
          max_bots: org.max_bots,
          max_members: org.max_members,
          ticket_seq: org.ticket_seq,
          created_at: org.created_at,
          updated_at: org.updated_at
        }, { onConflict: 'id' }).then(() => doUpsertUser()).catch(() => doUpsertUser());
      } else {
        doUpsertUser();
      }
    }

    return user;
  }

  getUserById(id) {
    return this._coll('users').find(u => u.id === id) || null;
  }

  getUserByPhone(phone, orgId = null) {
    if (!phone) return null;
    const clean = String(phone).replace(/\D/g, '');
    if (clean.length < 5) return null;
    return this._coll('users').find(u => {
      if (!u.phone) return false;
      const uClean = String(u.phone).replace(/\D/g, '');
      const match = u.phone === phone || uClean === clean || 
        (clean.length >= 10 && uClean.length >= 10 && (clean.slice(-10) === uClean.slice(-10)));
      return orgId ? match && u.org_id === orgId : match;
    }) || null;
  }

  getUserByEmail(email, orgId = null) {
    if (!email) return null;
    const clean = email.toLowerCase().trim();
    return this.data.users.find(u => {
      const matchEmail = u.email && u.email.toLowerCase().trim() === clean;
      return orgId ? matchEmail && u.org_id === orgId : matchEmail;
    }) || null;
  }

  getUsersByOrg(orgId) {
    return this._coll('users').filter(u => u.org_id === orgId && u.is_active);
  }

  updateUser(id, updates) {
    const user = this.getUserById(id);
    if (!user) return null;
    Object.assign(user, updates, { updated_at: new Date().toISOString() });
    this.save();

    if (supabase) {
      supabase.from('users').update({ ...updates, updated_at: user.updated_at }).eq('id', id)
        .then(({ error }) => { if (error) console.warn('Supabase user update note:', error.message); })
        .catch(err => console.warn('Supabase user update err:', err.message));
    }
    return user;
  }

  deleteUser(id) {
    const idx = this._coll('users').findIndex(u => u.id === id);
    if (idx !== -1) {
      this._coll('users').splice(idx, 1);
      this.save();

      if (supabase) {
        supabase.from('users').delete().eq('id', id)
          .then(({ error }) => { if (error) console.warn('Supabase user delete note:', error.message); })
          .catch(err => console.warn('Supabase user delete err:', err.message));
      }
      return true;
    }
    return false;
  }

  // Bots
  createBot({ id = null, org_id, bot_token, bot_username, bot_title, secret_token, webhook_url }) {
    const bot = {
      id: id || crypto.randomUUID(),
      org_id,
      bot_token,
      bot_username,
      bot_title: bot_title || bot_username,
      secret_token,
      webhook_url,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this._coll('bots').push(bot);
    this.save();

    if (supabase) {
      const org = this.getOrgById(bot.org_id);
      const doUpsertBot = () => {
        supabase.from('bots').upsert({
          id: bot.id,
          org_id: bot.org_id,
          bot_token: bot.bot_token,
          bot_username: bot.bot_username,
          bot_title: bot.bot_title,
          secret_token: bot.secret_token,
          webhook_url: bot.webhook_url,
          status: bot.status,
          created_at: bot.created_at,
          updated_at: bot.updated_at
        }, { onConflict: 'bot_token' }).then(({ error }) => {
          if (error) console.warn('⚠️ Supabase bots sync note:', error.message);
          else console.log('⚡ [Supabase] Bot synchronized:', bot.bot_username);
        }).catch(err => console.warn('Supabase bot sync err:', err.message));
      };

      if (org) {
        supabase.from('organizations').upsert({
          id: org.id,
          name: org.name,
          phone: (org.phone || '+910000000000').slice(0, 32),
          subscription_tier: org.subscription_tier,
          max_bots: org.max_bots,
          max_members: org.max_members,
          ticket_seq: org.ticket_seq,
          created_at: org.created_at,
          updated_at: org.updated_at
        }, { onConflict: 'id' }).then(() => doUpsertBot()).catch(() => doUpsertBot());
      } else {
        doUpsertBot();
      }
    }

    return bot;
  }

  getBotById(id) {
    return this._coll('bots').find(b => b.id === id) || null;
  }

  getBotByToken(token) {
    return this._coll('bots').find(b => b.bot_token === token) || null;
  }

  async ensurePrimaryBot(botToken, secretToken = '', publicBaseUrl = '') {
    if (!botToken) return null;
    let bot = this._coll('bots').find(b => b.bot_token === botToken);
    let org = this._coll('organizations')[0];

    if (!org) {
      org = this.createOrg({
        name: 'ResolveDesk Primary Support',
        phone: '+1000000000',
        subscription_tier: 'scale'
      });
    } else if (supabase && org) {
      try {
        await supabase.from('organizations').upsert({
          id: org.id,
          name: org.name,
          phone: (org.phone || '+910000000000').slice(0, 32),
          subscription_tier: org.subscription_tier,
          max_bots: org.max_bots,
          max_members: org.max_members,
          ticket_seq: org.ticket_seq,
          created_at: org.created_at,
          updated_at: org.updated_at
        }, { onConflict: 'id' });
      } catch (err) {}
    }

    // Check if bot already exists in Supabase
    if (supabase) {
      try {
        const { data: remoteBot } = await supabase.from('bots').select('*').eq('bot_token', botToken).maybeSingle();
        if (remoteBot) {
          if (bot) {
            const oldId = bot.id;
            bot.id = remoteBot.id;
            bot.org_id = remoteBot.org_id;
            if (oldId !== remoteBot.id) {
              for (const c of this._coll('complaints')) {
                if (c.bot_id === oldId) {
                  c.bot_id = remoteBot.id;
                  c.org_id = remoteBot.org_id;
                }
              }
            }
          } else {
            this._coll('bots').push(remoteBot);
            bot = remoteBot;
          }
          this.save();
          console.log(`🤖 [Bot Registry] Synced bot @${bot.bot_username} from Supabase (ID: ${bot.id})`);
          return bot;
        }
      } catch (e) {
        console.warn('Supabase remote bot lookup note:', e.message);
      }
    }

    if (!bot) {
      let botUsername = 'TestBusiness001bot';
      let botTitle = 'Primary Telegram Bot';
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        const data = await res.json();
        if (data.ok && data.result) {
          botUsername = data.result.username || botUsername;
          botTitle = data.result.first_name || botTitle;
        }
      } catch (e) {}

      bot = {
        id: crypto.randomUUID(),
        org_id: org.id,
        bot_token: botToken,
        bot_username: botUsername,
        bot_title: botTitle,
        secret_token: secretToken || '',
        webhook_url: publicBaseUrl ? `${publicBaseUrl.replace(/\/+$/, '')}/telegram/webhook` : '',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this._coll('bots').push(bot);
      this.save();

      if (supabase) {
        const { error } = await supabase.from('bots').upsert({
          id: bot.id,
          org_id: bot.org_id,
          bot_token: bot.bot_token,
          bot_username: bot.bot_username,
          bot_title: bot.bot_title,
          secret_token: bot.secret_token,
          webhook_url: bot.webhook_url,
          status: bot.status,
          created_at: bot.created_at,
          updated_at: bot.updated_at
        }, { onConflict: 'bot_token' });
        if (error) console.warn('⚠️ Supabase bot sync note:', error.message);
        else console.log(`⚡ [Supabase] Bot synchronized: @${bot.bot_username}`);
      }
    } else if (supabase) {
      const { error } = await supabase.from('bots').upsert({
        id: bot.id,
        org_id: bot.org_id,
        bot_token: bot.bot_token,
        bot_username: bot.bot_username,
        bot_title: bot.bot_title,
        secret_token: bot.secret_token,
        webhook_url: bot.webhook_url,
        status: bot.status,
        created_at: bot.created_at,
        updated_at: bot.updated_at
      }, { onConflict: 'bot_token' });
      if (error) console.warn('⚠️ Supabase bot sync note:', error.message);
      else console.log(`⚡ [Supabase] Bot synchronized: @${bot.bot_username}`);
    }

    return bot;
  }

  getBotsByOrg(orgId) {
    return this._coll('bots').filter(b => b.org_id === orgId);
  }

  updateBot(id, updates) {
    const bot = this.getBotById(id);
    if (!bot) return null;
    Object.assign(bot, updates, { updated_at: new Date().toISOString() });
    this.save();

    if (supabase) {
      supabase.from('bots').update({ ...updates, updated_at: bot.updated_at }).eq('id', id)
        .then(({ error }) => { if (error) console.warn('Supabase bot update note:', error.message); })
        .catch(err => console.warn('Supabase bot update err:', err.message));
    }
    return bot;
  }

  deleteBot(id) {
    const idx = this._coll('bots').findIndex(b => b.id === id);
    if (idx !== -1) {
      this._coll('bots').splice(idx, 1);
      this.save();

      if (supabase) {
        supabase.from('bots').delete().eq('id', id)
          .then(({ error }) => { if (error) console.warn('Supabase bot delete note:', error.message); })
          .catch(err => console.warn('Supabase bot delete err:', err.message));
      }
      return true;
    }
    return false;
  }

  // Customers
  async getOrCreateCustomer({ org_id, telegram_user_id, username, first_name, last_name, phone }) {
    let customer = this._coll('customers').find(c => c.org_id === org_id && String(c.telegram_user_id) === String(telegram_user_id));
    if (!customer) {
      customer = {
        id: crypto.randomUUID(),
        org_id,
        telegram_user_id: Number(telegram_user_id),
        username: username || null,
        first_name: first_name || null,
        last_name: last_name || null,
        phone: phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this._coll('customers').push(customer);
      this.save();

      if (supabase) {
        try {
          const { error } = await supabase.from('customers').upsert({
            id: customer.id,
            org_id: customer.org_id,
            telegram_user_id: customer.telegram_user_id,
            username: customer.username,
            first_name: customer.first_name,
            last_name: customer.last_name,
            phone: customer.phone,
            created_at: customer.created_at,
            updated_at: customer.updated_at
          });
          if (error) console.warn('⚠️ Supabase customer sync note:', error.message);
          else console.log('⚡ [Supabase] Customer synchronized:', customer.telegram_user_id);
        } catch (err) {
          console.warn('Supabase customer sync err:', err.message);
        }
      }
    } else {
      if (username || first_name || last_name || phone) {
        Object.assign(customer, {
          username: username || customer.username,
          first_name: first_name || customer.first_name,
          last_name: last_name || customer.last_name,
          phone: phone || customer.phone,
          updated_at: new Date().toISOString()
        });
        this.save();

        if (supabase) {
          try {
            const { error } = await supabase.from('customers').update({
              username: customer.username,
              first_name: customer.first_name,
              last_name: customer.last_name,
              phone: customer.phone,
              updated_at: customer.updated_at
            }).eq('id', customer.id);
            if (error) console.warn('Supabase customer update note:', error.message);
          } catch (err) {
            console.warn('Supabase customer update err:', err.message);
          }
        }
      }
    }
    return customer;
  }

  getCustomerById(id) {
    return this._coll('customers').find(c => c.id === id) || null;
  }

  // Complaints / Tickets
  getNextTicketNumber(orgId) {
    const org = this.getOrgById(orgId);
    const seq = org ? ++org.ticket_seq : Math.floor(1000 + Math.random() * 9000);
    this.save();
    return `#TICK-${seq}`;
  }

  async createComplaint({ org_id, bot_id, customer_id, title, description, category = 'other', priority = 'medium' }) {
    const ticketNumber = this.getNextTicketNumber(org_id);
    const complaint = {
      id: crypto.randomUUID(),
      org_id,
      bot_id,
      customer_id,
      ticket_number: ticketNumber,
      title: title || 'Customer Complaint',
      description,
      category,
      priority,
      status: 'pending',
      assigned_to: null,
      closed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this._coll('complaints').push(complaint);
    this.save();

    if (supabase) {
      try {
        // 1. Guarantee Bot exists in Supabase to satisfy foreign key complaints_bot_id_fkey
        const bot = this.getBotById(complaint.bot_id);
        if (bot) {
          await supabase.from('bots').upsert({
            id: bot.id,
            org_id: bot.org_id,
            bot_token: bot.bot_token,
            bot_username: bot.bot_username,
            bot_title: bot.bot_title,
            secret_token: bot.secret_token,
            webhook_url: bot.webhook_url,
            status: bot.status,
            created_at: bot.created_at,
            updated_at: bot.updated_at
          }, { onConflict: 'bot_token' });
        }

        // 2. Guarantee Customer exists in Supabase
        const customer = this.getCustomerById(complaint.customer_id);
        if (customer) {
          await supabase.from('customers').upsert({
            id: customer.id,
            org_id: customer.org_id,
            telegram_user_id: customer.telegram_user_id,
            username: customer.username,
            first_name: customer.first_name,
            last_name: customer.last_name,
            phone: customer.phone,
            created_at: customer.created_at,
            updated_at: customer.updated_at
          });
        }

        // 3. Upsert Complaint
        const { error } = await supabase.from('complaints').upsert({
          id: complaint.id,
          org_id: complaint.org_id,
          bot_id: complaint.bot_id,
          customer_id: complaint.customer_id,
          ticket_number: complaint.ticket_number,
          title: complaint.title,
          description: complaint.description,
          category: complaint.category,
          priority: complaint.priority,
          status: complaint.status,
          created_at: complaint.created_at,
          updated_at: complaint.updated_at
        });
        if (error) console.warn('⚠️ Supabase complaint sync note:', error.message);
        else console.log('⚡ [Supabase] Complaint ticket synchronized:', complaint.ticket_number);
      } catch (err) {
        console.warn('Supabase complaint sync err:', err.message);
      }
    }

    return complaint;
  }

  getActiveComplaintForCustomer(orgId, customerId) {
    return this._coll('complaints').find(c => 
      c.org_id === orgId && 
      c.customer_id === customerId && 
      c.status !== 'closed' && 
      c.status !== 'resolved'
    ) || null;
  }

  getComplaintById(id, orgId = null) {
    return this._coll('complaints').find(c => c.id === id && (!orgId || c.org_id === orgId)) || null;
  }

  getComplaints(orgId, filters = {}) {
    let list = this._coll('complaints').filter(c => c.org_id === orgId);

    if (filters.status) {
      list = list.filter(c => c.status === filters.status);
    }
    if (filters.category) {
      list = list.filter(c => c.category === filters.category);
    }
    if (filters.assigned_to) {
      list = list.filter(c => c.assigned_to === filters.assigned_to);
    }
    if (filters.bot_id) {
      list = list.filter(c => c.bot_id === filters.bot_id);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(c => 
        c.ticket_number.toLowerCase().includes(q) || 
        c.title.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }

  async updateComplaint(id, updates, orgId = null) {
    const complaint = this.getComplaintById(id, orgId);
    if (!complaint) return null;
    
    if (updates.status && (updates.status === 'closed' || updates.status === 'resolved') && !complaint.closed_at) {
      updates.closed_at = new Date().toISOString();
    } else if (updates.status && (updates.status === 'pending' || updates.status === 'in_progress')) {
      updates.closed_at = null;
    }

    Object.assign(complaint, updates, { updated_at: new Date().toISOString() });
    this.save();

    if (supabase) {
      try {
        // If assigned_to is set, ensure assigned user exists in Supabase to satisfy complaints_assigned_to_fkey
        if (complaint.assigned_to) {
          const assignee = this.getUserById(complaint.assigned_to);
          if (assignee) {
            const aOrg = this.getOrgById(assignee.org_id);
            if (aOrg) {
              await supabase.from('organizations').upsert({
                id: aOrg.id,
                name: aOrg.name,
                phone: aOrg.phone,
                subscription_tier: aOrg.subscription_tier,
                max_bots: aOrg.max_bots,
                max_members: aOrg.max_members,
                ticket_seq: aOrg.ticket_seq,
                created_at: aOrg.created_at,
                updated_at: aOrg.updated_at
              }, { onConflict: 'id' });
            }
            await supabase.from('users').upsert({
              id: assignee.id,
              org_id: assignee.org_id,
              name: assignee.name,
              phone: assignee.phone || (assignee.email ? assignee.email : 'N/A'),
              password_hash: assignee.password_hash,
              role: assignee.role,
              permissions: assignee.permissions,
              is_active: assignee.is_active,
              created_at: assignee.created_at,
              updated_at: assignee.updated_at
            }, { onConflict: 'id' });
          }
        }

        const cleanUpdates = { ...updates, updated_at: complaint.updated_at };
        if (cleanUpdates.assigned_to === '') cleanUpdates.assigned_to = null;

        const { error } = await supabase.from('complaints').update(cleanUpdates).eq('id', id);
        if (error) console.warn('Supabase complaint update note:', error.message);
      } catch (err) {
        console.warn('Supabase complaint update err:', err.message);
      }
    }

    return complaint;
  }

  // Complaint Messages
  async addMessage({ complaint_id, sender_type, sender_id, sender_name, message_text, telegram_message_id = null }) {
    if (!complaint_id) {
      console.warn('⚠️ addMessage called with null complaint_id, skipping message persistence.');
      return null;
    }

    const msg = {
      id: crypto.randomUUID(),
      complaint_id,
      sender_type,
      sender_id: String(sender_id),
      sender_name: sender_name || null,
      message_text,
      telegram_message_id,
      created_at: new Date().toISOString()
    };
    this._coll('complaint_messages').push(msg);
    this.save();

    if (supabase) {
      try {
        const complaint = this.getComplaintById(msg.complaint_id);
        if (complaint) {
          // 1. Guarantee bot and its organization exist in Supabase
          const bot = this.getBotById(complaint.bot_id);
          if (bot) {
            try {
              const bOrg = this.getOrgById(bot.org_id);
              if (bOrg) {
                await supabase.from('organizations').upsert({
                  id: bOrg.id,
                  name: bOrg.name,
                  phone: bOrg.phone,
                  subscription_tier: bOrg.subscription_tier,
                  max_bots: bOrg.max_bots,
                  max_members: bOrg.max_members,
                  ticket_seq: bOrg.ticket_seq,
                  created_at: bOrg.created_at,
                  updated_at: bOrg.updated_at
                }, { onConflict: 'id' });
              }
              await supabase.from('bots').upsert({
                id: bot.id,
                org_id: bot.org_id,
                bot_token: bot.bot_token,
                bot_username: bot.bot_username,
                bot_title: bot.bot_title,
                secret_token: bot.secret_token,
                webhook_url: bot.webhook_url,
                status: bot.status,
                created_at: bot.created_at,
                updated_at: bot.updated_at
              }, { onConflict: 'bot_token' });
            } catch (e) {}
          }

          // 2. Guarantee customer exists in Supabase
          const customer = this.getCustomerById(complaint.customer_id);
          if (customer) {
            try {
              await supabase.from('customers').upsert({
                id: customer.id,
                org_id: customer.org_id,
                telegram_user_id: customer.telegram_user_id,
                username: customer.username,
                first_name: customer.first_name,
                last_name: customer.last_name,
                phone: customer.phone,
                created_at: customer.created_at,
                updated_at: customer.updated_at
              }, { onConflict: 'id' });
            } catch (e) {}
          }

          // 3. Guarantee complaint exists in Supabase
          const { error: cErr } = await supabase.from('complaints').upsert({
            id: complaint.id,
            org_id: complaint.org_id,
            bot_id: complaint.bot_id,
            customer_id: complaint.customer_id,
            ticket_number: complaint.ticket_number,
            title: complaint.title,
            description: complaint.description,
            category: complaint.category,
            priority: complaint.priority,
            status: complaint.status,
            created_at: complaint.created_at,
            updated_at: complaint.updated_at
          }, { onConflict: 'id' });
          if (cErr) console.warn('⚠️ Supabase parent complaint sync note:', cErr.message);
        }

        // 4. Upsert message into Supabase
        const { error } = await supabase.from('complaint_messages').upsert({
          id: msg.id,
          complaint_id: msg.complaint_id,
          sender_type: msg.sender_type,
          sender_id: msg.sender_id,
          sender_name: msg.sender_name,
          message_text: msg.message_text,
          telegram_message_id: msg.telegram_message_id,
          created_at: msg.created_at
        }, { onConflict: 'id' });
        if (error) console.warn('⚠️ Supabase complaint_messages sync note:', error.message);
        else console.log('⚡ [Supabase] Message synchronized for complaint:', complaint?.ticket_number || complaint_id);
      } catch (err) {
        console.warn('Supabase message sync err:', err.message);
      }
    }

    return msg;
  }

  getMessagesByComplaint(complaintId) {
    return this._coll('complaint_messages')
      .filter(m => m.complaint_id === complaintId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  // Invitations
  createInvitation({ org_id, email = null, phone = null, role = 'agent', permissions }) {
    const invite = {
      id: crypto.randomUUID(),
      org_id,
      email: email ? email.toLowerCase().trim() : null,
      phone: phone ? phone.trim() : null,
      role,
      permissions: permissions || DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.agent,
      invite_code: `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      status: 'pending', // pending, accepted, revoked
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    this._coll('invitations').push(invite);
    this.save();

    if (supabase) {
      const org = this.getOrgById(invite.org_id);
      const doUpsertInvite = () => {
        supabase.from('invitations').upsert({
          id: invite.id,
          org_id: invite.org_id,
          phone: String(invite.phone || invite.email || '+910000000000').slice(0, 32),
          role: invite.role,
          permissions: invite.permissions,
          invite_code: invite.invite_code,
          status: invite.status,
          created_at: invite.created_at,
          expires_at: invite.expires_at
        }, { onConflict: 'invite_code' }).then(({ error }) => {
          if (error) console.warn('⚠️ Supabase invitations sync note:', error.message);
          else console.log('⚡ [Supabase] Invitation synchronized:', invite.invite_code);
        }).catch(err => console.warn('Supabase invitation sync err:', err.message));
      };

      if (org) {
        supabase.from('organizations').upsert({
          id: org.id,
          name: org.name,
          phone: org.phone,
          subscription_tier: org.subscription_tier,
          max_bots: org.max_bots,
          max_members: org.max_members,
          ticket_seq: org.ticket_seq,
          created_at: org.created_at,
          updated_at: org.updated_at
        }, { onConflict: 'id' }).then(() => doUpsertInvite()).catch(() => doUpsertInvite());
      } else {
        doUpsertInvite();
      }
    }

    return invite;
  }

  getInvitationByCode(code) {
    return this._coll('invitations').find(i => i.invite_code === code && i.status === 'pending') || null;
  }

  getInvitationsByOrg(orgId) {
    return this._coll('invitations').filter(i => i.org_id === orgId && i.status === 'pending');
  }

  updateInvitation(id, updates) {
    const invite = this._coll('invitations').find(i => i.id === id);
    if (!invite) return null;
    Object.assign(invite, updates);
    this.save();

    if (supabase) {
      supabase.from('invitations').update(updates).eq('id', id)
        .then(({ error }) => { if (error) console.warn('Supabase invitation update note:', error.message); })
        .catch(err => console.warn('Supabase invitation update err:', err.message));
    }

    return invite;
  }

  
  async syncWithSupabase() {
    if (!supabase) return;
    try {
      // 1. Sync organizations both ways
      const { data: remoteOrgs } = await supabase.from('organizations').select('*');
      if (remoteOrgs && remoteOrgs.length > 0) {
        for (const rOrg of remoteOrgs) {
          const lOrg = this._coll('organizations').find(o => o.id === rOrg.id || o.name === rOrg.name);
          if (lOrg) {
            Object.assign(lOrg, rOrg);
          } else {
            this._coll('organizations').push(rOrg);
          }
        }
      }

      // Guarantee every local organization is in Supabase to satisfy FK bots_org_id_fkey
      for (const org of this._coll('organizations')) {
        try {
          await supabase.from('organizations').upsert({
            id: org.id,
            name: org.name,
            phone: org.phone,
            subscription_tier: org.subscription_tier,
            max_bots: org.max_bots,
            max_members: org.max_members,
            ticket_seq: org.ticket_seq,
            created_at: org.created_at,
            updated_at: org.updated_at
          }, { onConflict: 'id' });
        } catch (e) {}
      }

      // Guarantee every local user is in Supabase to satisfy FK complaints_assigned_to_fkey
      for (const u of this._coll('users')) {
        try {
          await supabase.from('users').upsert({
            id: u.id,
            org_id: u.org_id,
            name: u.name,
            phone: String(u.phone || u.email || '+910000000000').slice(0, 32),
            password_hash: u.password_hash,
            role: u.role,
            permissions: u.permissions,
            is_active: u.is_active,
            created_at: u.created_at,
            updated_at: u.updated_at
          }, { onConflict: 'id' });
        } catch (e) {}
      }

      // Guarantee every invitation is in Supabase
      for (const inv of this._coll('invitations')) {
        try {
          await supabase.from('invitations').upsert({
            id: inv.id,
            org_id: inv.org_id,
            phone: String(inv.phone || inv.email || '+910000000000').slice(0, 32),
            role: inv.role,
            permissions: inv.permissions,
            invite_code: inv.invite_code,
            status: inv.status,
            created_at: inv.created_at,
            expires_at: inv.expires_at
          }, { onConflict: 'invite_code' });
        } catch (e) {}
      }

      // 2. Sync bots & remap complaint bot IDs
      const { data: remoteBots } = await supabase.from('bots').select('*');
      if (remoteBots && remoteBots.length > 0) {
        for (const rBot of remoteBots) {
          const lBot = this._coll('bots').find(b => b.bot_token === rBot.bot_token || b.bot_username === rBot.bot_username || b.id === rBot.id);
          if (lBot) {
            const oldId = lBot.id;
            Object.assign(lBot, rBot);
            if (oldId !== rBot.id) {
              for (const c of this._coll('complaints')) {
                if (c.bot_id === oldId) {
                  c.bot_id = rBot.id;
                  c.org_id = rBot.org_id;
                }
              }
            }
          } else {
            this._coll('bots').push(rBot);
          }
        }
      }

      // 3. Sync customers & remap complaint customer IDs
      const { data: remoteCusts } = await supabase.from('customers').select('*');
      if (remoteCusts && remoteCusts.length > 0) {
        for (const rCust of remoteCusts) {
          const lCust = this._coll('customers').find(c => String(c.telegram_user_id) === String(rCust.telegram_user_id) || c.id === rCust.id);
          if (lCust) {
            const oldCustId = lCust.id;
            Object.assign(lCust, rCust);
            if (oldCustId !== rCust.id) {
              for (const c of this._coll('complaints')) {
                if (c.customer_id === oldCustId) {
                  c.customer_id = rCust.id;
                }
              }
            }
          } else {
            this._coll('customers').push(rCust);
          }
        }
      }

      // 4. Ensure local complaints are in Supabase
      for (const complaint of this._coll('complaints')) {
        const botExists = this._coll('bots').some(b => b.id === complaint.bot_id);
        const custExists = this._coll('customers').some(c => c.id === complaint.customer_id);
        if (botExists && custExists) {
          try {
            await supabase.from('complaints').upsert({
              id: complaint.id,
              org_id: complaint.org_id,
              bot_id: complaint.bot_id,
              customer_id: complaint.customer_id,
              ticket_number: complaint.ticket_number,
              title: complaint.title,
              description: complaint.description,
              category: complaint.category,
              priority: complaint.priority,
              status: complaint.status,
              created_at: complaint.created_at,
              updated_at: complaint.updated_at
            }, { onConflict: 'id' });
          } catch (e) {}
        }
      }

      this.save();
      console.log('⚡ [Supabase] Store synchronized with Supabase PostgreSQL.');
    } catch (err) {
      console.warn('⚠️ Supabase initial sync notice:', err.message);
    }
  }

  async syncAllToSupabase() {
    if (!supabase) return;
    try {
      for (const org of this._coll('organizations')) {
        await supabase.from('organizations').upsert({
          id: org.id,
          name: org.name,
          phone: org.phone,
          subscription_tier: org.subscription_tier,
          max_bots: org.max_bots,
          max_members: org.max_members,
          ticket_seq: org.ticket_seq,
          created_at: org.created_at,
          updated_at: org.updated_at
        }, { onConflict: 'id' });
      }

      for (const u of this._coll('users')) {
        await supabase.from('users').upsert({
          id: u.id,
          org_id: u.org_id,
          name: u.name,
          phone: u.phone || (u.email ? u.email : 'N/A'),
          password_hash: u.password_hash,
          role: u.role,
          permissions: u.permissions,
          is_active: u.is_active,
          created_at: u.created_at,
          updated_at: u.updated_at
        }, { onConflict: 'id' });
      }

      for (const inv of this._coll('invitations')) {
        await supabase.from('invitations').upsert({
          id: inv.id,
          org_id: inv.org_id,
          phone: inv.phone || (inv.email ? inv.email : 'N/A'),
          role: inv.role,
          permissions: inv.permissions,
          invite_code: inv.invite_code,
          status: inv.status,
          created_at: inv.created_at,
          expires_at: inv.expires_at
        }, { onConflict: 'invite_code' });
      }

      for (const bot of this._coll('bots')) {
        await supabase.from('bots').upsert({
          id: bot.id,
          org_id: bot.org_id,
          bot_token: bot.bot_token,
          bot_username: bot.bot_username,
          bot_title: bot.bot_title,
          secret_token: bot.secret_token,
          webhook_url: bot.webhook_url,
          status: bot.status,
          created_at: bot.created_at,
          updated_at: bot.updated_at
        }, { onConflict: 'bot_token' });
      }

      for (const customer of this._coll('customers')) {
        await supabase.from('customers').upsert({
          id: customer.id,
          org_id: customer.org_id,
          telegram_user_id: customer.telegram_user_id,
          username: customer.username,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          created_at: customer.created_at,
          updated_at: customer.updated_at
        });
      }

      for (const complaint of this._coll('complaints')) {
        await supabase.from('complaints').upsert({
          id: complaint.id,
          org_id: complaint.org_id,
          bot_id: complaint.bot_id,
          customer_id: complaint.customer_id,
          ticket_number: complaint.ticket_number,
          title: complaint.title,
          description: complaint.description,
          category: complaint.category,
          priority: complaint.priority,
          status: complaint.status,
          created_at: complaint.created_at,
          updated_at: complaint.updated_at
        });
      }

      for (const msg of this._coll('complaint_messages')) {
        if (!msg.complaint_id) continue;
        const parentComplaint = this._coll('complaints').find(c => c.id === msg.complaint_id);
        if (!parentComplaint) continue;
        const botExists = this._coll('bots').some(b => b.id === parentComplaint.bot_id);
        if (!botExists) continue;
        await supabase.from('complaint_messages').upsert({
          id: msg.id,
          complaint_id: msg.complaint_id,
          sender_type: msg.sender_type,
          sender_id: msg.sender_id,
          sender_name: msg.sender_name,
          message_text: msg.message_text,
          telegram_message_id: msg.telegram_message_id,
          created_at: msg.created_at
        });
      }
      console.log('⚡ [Supabase] Full state reconciliation complete.');
    } catch (err) {
      console.warn('⚠️ Supabase syncAll note:', err.message);
    }
  }
}

export const store = new Store();
