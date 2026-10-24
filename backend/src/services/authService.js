import crypto from 'crypto';
import { store, DEFAULT_PERMISSIONS } from '../db/store.js';
import { supabase } from '../db/supabase.js';

const JWT_SECRET = process.env.SECRET_TOKEN || 'resolvedesk_saas_default_secret_key_2026';

// In-memory OTP Cache (key -> { code, expiresAt })
// key can be E.164 phone OR lowercase email
const otpCache = new Map();

// ─── JWT ──────────────────────────────────────────────────────────────────────

export function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

// ─── Password Hashing ─────────────────────────────────────────────────────────

export function hashPassword(password) {
  if (!password) return null;
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatE164Phone(phone) {
  if (!phone) return phone;
  const digits = String(phone).replace(/[^0-9+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

/**
 * Robust Supabase Auth User creation & adoption.
 * Prioritizes email auth (which works 100% free without external SMS provider).
 * Guarantees a record in Supabase auth.users table.
 */
export async function ensureSupabaseAuthUser({ email, phone, password, name, metadata = {} }) {
  if (!supabase) return null;

  const userMetadata = { name, phone: phone || undefined, ...metadata };

  // 1. If email is provided, create primarily using email (no SMS provider required)
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: password || undefined,
        email_confirm: true,
        user_metadata: userMetadata
      });

      if (!authError && authData?.user) {
        console.log('⚡ [Supabase Auth] Created auth.user via email:', authData.user.id);
        return authData.user.id;
      }

      if (authError) {
        const isExists =
          authError.message?.toLowerCase().includes('already') ||
          authError.message?.toLowerCase().includes('duplicate') ||
          authError.message?.toLowerCase().includes('exists') ||
          authError.code === '422';

        if (isExists) {
          try {
            const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
            const existingUser = listData?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
            if (existingUser) {
              console.log('⚡ [Supabase Auth] Adopting existing auth.user:', existingUser.id);
              return existingUser.id;
            }
          } catch (fetchErr) {
            console.warn('⚠️ [Supabase Auth] Could not list users:', fetchErr.message);
          }
        }
        console.warn('⚠️ [Supabase Auth] createUser notice:', authError.message);
      }
    } catch (err) {
      console.warn('⚠️ [Supabase Auth] Email user creation error:', err.message);
    }
  }

  // 2. If phone is provided and no email, attempt phone creation or fallback to synthetic email
  if (phone) {
    const cleanPhone = formatE164Phone(phone);
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        phone: cleanPhone,
        password: password || undefined,
        phone_confirm: true,
        user_metadata: userMetadata
      });

      if (!authError && authData?.user) {
        console.log('⚡ [Supabase Auth] Created auth.user via phone:', authData.user.id);
        return authData.user.id;
      }

      // If unsupported phone provider (no SMS gateway configured in Supabase), create with synthetic email
      if (authError && authError.message?.toLowerCase().includes('unsupported phone provider')) {
        const cleanDigits = cleanPhone.replace(/\D/g, '');
        const synthEmail = `user_${cleanDigits}@resolvedesk.local`;
        console.log(`ℹ️  [Supabase Auth] Creating auth.user with email ${synthEmail} (no SMS provider configured)`);
        const { data: synthData, error: synthErr } = await supabase.auth.admin.createUser({
          email: synthEmail,
          password: password || undefined,
          email_confirm: true,
          user_metadata: userMetadata
        });
        if (!synthErr && synthData?.user) {
          console.log('⚡ [Supabase Auth] Created auth.user via fallback email:', synthData.user.id);
          return synthData.user.id;
        }
      }
    } catch (err) {
      console.warn('⚠️ [Supabase Auth] Phone user creation error:', err.message);
    }
  }

  return null;
}

// ─── REGISTER OWNER ───────────────────────────────────────────────────────────

export async function registerOwner({ name, phone, email, password, businessName, subscriptionTier = 'starter' }) {
  if (!phone || !name || !businessName) {
    throw new Error('Name, phone, and business name are required');
  }

  const cleanPhone = formatE164Phone(phone.trim());
  const cleanEmail = email ? email.toLowerCase().trim() : null;

  const existingByPhone = store.getUserByPhone(cleanPhone) || store.getUserByPhone(phone.trim());
  if (existingByPhone) {
    throw new Error('A user with this phone number already exists');
  }

  if (cleanEmail && store.getUserByEmail(cleanEmail)) {
    throw new Error('A user with this email already exists');
  }

  // 1. Create Supabase Auth user (guaranteed — will adopt if already exists)
  const supabaseAuthUserId = await ensureSupabaseAuthUser({
    email: cleanEmail,
    phone: cleanPhone,
    password,
    name: name.trim(),
    metadata: { business_name: businessName, role: 'owner', subscription_tier: subscriptionTier }
  });

  // 2. Create Organization (ensures non-null phone)
  const org = store.createOrg({
    name: businessName,
    phone: cleanPhone,
    subscription_tier: subscriptionTier
  });

  // 3. Create Owner User in local store
  const passwordHash = password ? hashPassword(password) : null;
  const user = store.createUser({
    id: supabaseAuthUserId,
    org_id: org.id,
    name: name.trim(),
    phone: cleanPhone,
    email: cleanEmail,
    password_hash: passwordHash,
    role: 'owner',
    permissions: DEFAULT_PERMISSIONS.owner
  });

  const token = signToken({ userId: user.id, orgId: org.id });

  return {
    user: sanitizeUser(user),
    org,
    token
  };
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export async function loginUser({ phone, email, identifier, password }) {
  const rawId = (identifier || phone || email || '').trim();
  if (!rawId) throw new Error('Phone number or email address is required');
  if (!password) throw new Error('Password is required');

  const isEmail = rawId.includes('@');
  let user = null;
  let sbSession = null;

  if (isEmail) {
    const cleanEmail = rawId.toLowerCase();
    user = store.getUserByEmail(cleanEmail);

    // Try Supabase Email + Password login
    if (supabase) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (!authErr && authData?.session) {
          sbSession = authData.session;
          if (!user && authData.user) {
            user = store.getUserById(authData.user.id) || store.getUserByEmail(cleanEmail);
          }
          console.log('⚡ [Supabase Auth] Email password sign-in successful');
        }
      } catch (err) { /* silent fallback */ }
    }

    if (!user) throw new Error('User not found with this email address');

  } else {
    const cleanPhone = formatE164Phone(rawId);
    user = store.getUserByPhone(cleanPhone) || store.getUserByPhone(rawId);

    // Try Supabase Phone + Password login
    if (supabase) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          phone: cleanPhone,
          password
        });
        if (!authErr && authData?.session) {
          sbSession = authData.session;
          if (!user && authData.user) {
            user = store.getUserById(authData.user.id) || store.getUserByPhone(cleanPhone);
          }
        }
      } catch (err) { /* silent fallback */ }
    }

    if (!user) throw new Error('User not found with this phone number');
  }

  // Verify local password hash if exists
  if (user.password_hash && !sbSession) {
    if (!verifyPassword(password, user.password_hash)) {
      throw new Error('Invalid credentials');
    }
  } else if (user.password_hash && sbSession) {
    if (!verifyPassword(password, user.password_hash)) {
      user.password_hash = hashPassword(password);
      store.updateUser(user.id, { password_hash: user.password_hash });
    }
  } else if (!user.password_hash && !sbSession) {
    throw new Error('Invalid credentials');
  }

  let org = store.getOrgById(user.org_id);
  if (!org) {
    org = store._coll('organizations')[0];
    if (org) { user.org_id = org.id; store.save(); }
  }
  if (!org) throw new Error('Organization not found for this user');

  const token = signToken({ userId: user.id, orgId: user.org_id });

  return {
    user: sanitizeUser(user),
    org,
    token,
    supabaseSession: sbSession
  };
}

// ─── EMAIL OTP (Free — Supabase native sends email) ──────────────────────────

/**
 * Send Email OTP using Supabase's free built-in email OTP.
 * Handles free tier rate limit gracefully with instant internal fallback.
 * Universal test code 123456 always accepted.
 */
export async function sendEmailOtp(email) {
  if (!email || !email.includes('@')) throw new Error('Valid email address is required');
  const cleanEmail = email.toLowerCase().trim();

  // Generate 6-digit internal fallback code
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpCache.set(cleanEmail, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  console.log(`\n================== 📧 EMAIL OTP DISPATCH ==================`);
  console.log(`📧 Recipient Email : ${cleanEmail}`);
  console.log(`🔑 Verification OTP : ${code}`);
  console.log(`ℹ️  Test OTP Code   : 123456 (Always accepted)`);
  console.log(`===========================================================\n`);

  let nativeSent = false;
  let rateLimited = false;

  if (supabase) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined
        }
      });
      if (!error) {
        nativeSent = true;
        console.log(`✅ [Supabase] Email OTP dispatched to ${cleanEmail}`);
      } else {
        if (error.message?.toLowerCase().includes('rate limit')) {
          rateLimited = true;
          console.log(`⚠️ [Supabase Email OTP] Supabase free tier rate limit reached. Internal code ${code} active.`);
        } else {
          console.log(`ℹ️  [Supabase Email OTP] Notice: ${error.message}`);
        }
      }
    } catch (err) {
      console.log(`ℹ️  [Supabase Email OTP] Exception: ${err.message}`);
    }
  }

  let userMsg = `Verification OTP sent to ${cleanEmail}. Check your inbox (and spam folder).`;
  if (rateLimited) {
    userMsg = `Supabase email rate limit reached (3/hr). Use code ${code} or test OTP 123456.`;
  } else if (!nativeSent) {
    userMsg = `Verification code generated for ${cleanEmail}. Use code ${code} or test OTP 123456.`;
  }

  return {
    status: 'success',
    message: userMsg,
    email: cleanEmail,
    otpCode: code,
    testOtp: '123456',
    nativeSent,
    rateLimited
  };
}

/**
 * Verify Email OTP.
 * Accepts: Supabase native email OTP, internal cached code, or universal test code 123456.
 */
export async function verifyEmailOtp(email, token) {
  if (!email || !token) throw new Error('Email address and OTP code are required');
  const cleanEmail = email.toLowerCase().trim();
  const cleanToken = String(token).trim();

  let sbVerified = false;
  let sbUser = null;
  let sbSession = null;

  // 1. Try Supabase native email OTP verification
  if (supabase) {
    try {
      let { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email'
      });
      // Fallback: in some Supabase configurations, email OTP is verified with type 'magiclink'
      if (error || !data?.user) {
        const mlRes = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'magiclink'
        });
        if (!mlRes.error && mlRes.data?.user) {
          data = mlRes.data;
          error = null;
        }
      }
      if (!error && data?.user) {
        sbVerified = true;
        sbUser = data.user;
        sbSession = data.session;
        console.log('⚡ [Supabase Auth] Email OTP verified:', sbUser.id);
      }
    } catch (e) { /* silent */ }
  }

  // 2. Check internal cache or universal test code
  const cached = otpCache.get(cleanEmail);
  const isCacheMatch = cached && cached.code === cleanToken && cached.expiresAt > Date.now();
  const isTestOtp = cleanToken === '123456';

  if (!sbVerified && !isCacheMatch && !isTestOtp) {
    throw new Error('Invalid or expired OTP code. Check your email or use test code 123456.');
  }

  // Clear used OTP
  otpCache.delete(cleanEmail);

  // 3. Find or create local user
  let user = store.getUserByEmail(cleanEmail) ||
             (sbUser ? store.getUserById(sbUser.id) : null);

  if (!user) {
    // Check pending invite for this email
    const pendingInvite = store._coll('invitations').find(
      i => i.email?.toLowerCase() === cleanEmail && i.status === 'pending'
    );

    if (pendingInvite) {
      const inviteOrg = store.getOrgById(pendingInvite.org_id);

      const sbId = sbUser?.id || await ensureSupabaseAuthUser({
        email: cleanEmail,
        name: 'Team Member',
        metadata: { org_id: pendingInvite.org_id, role: pendingInvite.role }
      });

      user = store.createUser({
        id: sbId,
        org_id: pendingInvite.org_id,
        name: 'Team Member',
        email: cleanEmail,
        role: pendingInvite.role,
        permissions: pendingInvite.permissions
      });
      store.updateInvitation(pendingInvite.id, { status: 'accepted' });
      console.log(`🎉 [Auto-Join] Joined team under ${inviteOrg?.name || 'Workspace'} via email invite`);

    } else {
      // Create new standalone workspace for this email
      const sbId = sbUser?.id || await ensureSupabaseAuthUser({
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        metadata: { role: 'owner' }
      });

      const newOrg = store.createOrg({
        name: `${cleanEmail.split('@')[0]} Workspace`,
        phone: '+910000000000',
        subscription_tier: 'starter'
      });
      user = store.createUser({
        id: sbId,
        org_id: newOrg.id,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: '+910000000000',
        role: 'owner',
        permissions: DEFAULT_PERMISSIONS.owner
      });
      console.log(`🎉 [Auto-Provision] Created workspace for ${cleanEmail}`);
    }
  } else if (sbUser && user.id !== sbUser.id) {
    store.updateUser(user.id, { supabase_id: sbUser.id });
  }

  let org = store.getOrgById(user.org_id);
  if (!org) {
    org = store._coll('organizations')[0];
    if (org) { user.org_id = org.id; store.save(); }
  }

  const sessionToken = signToken({ userId: user.id, orgId: user.org_id });

  return {
    user: sanitizeUser(user),
    org,
    token: sessionToken,
    supabaseSession: sbSession
  };
}

// ─── PHONE OTP ────────────────────────────────────────────────────────────────

export async function sendPhoneOtp(phone) {
  if (!phone) throw new Error('Phone number is required');
  const cleanPhone = formatE164Phone(phone.trim());

  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpCache.set(cleanPhone, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  console.log(`\n================== 📱 PHONE OTP DISPATCH ==================`);
  console.log(`📞 Recipient Phone : ${cleanPhone}`);
  console.log(`🔑 Verification OTP : ${code}`);
  console.log(`ℹ️  Test OTP Code   : 123456 (Always accepted)`);
  console.log(`===========================================================\n`);

  if (supabase) {
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: cleanPhone });
      if (!error) {
        console.log(`✅ [Supabase] SMS OTP dispatched to ${cleanPhone}`);
      } else if (!error.message?.includes('Unsupported phone provider')) {
        console.log(`ℹ️  [SMS Gateway] Notice: ${error.message}`);
      }
    } catch (err) { /* silent */ }
  }

  return {
    status: 'success',
    message: `Verification code generated for ${cleanPhone}. Enter code ${code} or test OTP 123456.`,
    phone: cleanPhone,
    otpCode: code,
    testOtp: '123456'
  };
}

export async function verifyPhoneOtp(phone, token) {
  if (!phone || !token) throw new Error('Phone number and OTP code are required');
  const cleanPhone = formatE164Phone(phone.trim());
  const cleanToken = String(token).trim();

  let sbVerified = false;
  let sbUser = null;
  let sbSession = null;

  // 1. Try Supabase native SMS verification
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: cleanPhone,
        token: cleanToken,
        type: 'sms'
      });
      if (!error && data?.user) {
        sbVerified = true;
        sbUser = data.user;
        sbSession = data.session;
      }
    } catch (e) { /* silent */ }
  }

  // 2. Check internal cache or test code
  const cached = otpCache.get(cleanPhone);
  const isCacheMatch = cached && cached.code === cleanToken && cached.expiresAt > Date.now();
  const isTestOtp = cleanToken === '123456';

  if (!sbVerified && !isCacheMatch && !isTestOtp) {
    throw new Error('Invalid or expired OTP code. Use test code 123456 or the code sent to your phone.');
  }

  otpCache.delete(cleanPhone);

  // 3. Find or create local user
  let user = store.getUserByPhone(cleanPhone) ||
             store.getUserByPhone(phone.trim()) ||
             (sbUser ? store.getUserById(sbUser.id) : null);

  if (!user) {
    const pendingInvite = store._coll('invitations').find(
      i => (i.phone === cleanPhone || (i.phone && cleanPhone.endsWith(i.phone.replace(/\D/g, '')))) && i.status === 'pending'
    );

    if (pendingInvite) {
      const inviteOrg = store.getOrgById(pendingInvite.org_id);
      const sbId = sbUser?.id || await ensureSupabaseAuthUser({
        phone: cleanPhone,
        name: 'Team Member',
        metadata: { org_id: pendingInvite.org_id, role: pendingInvite.role }
      });
      user = store.createUser({
        id: sbId,
        org_id: pendingInvite.org_id,
        name: 'Team Member',
        phone: cleanPhone,
        role: pendingInvite.role,
        permissions: pendingInvite.permissions
      });
      store.updateInvitation(pendingInvite.id, { status: 'accepted' });
      console.log(`🎉 [Auto-Join] Joined team under ${inviteOrg?.name || 'Workspace'} via pending invite`);
    } else {
      const sbId = sbUser?.id || await ensureSupabaseAuthUser({
        phone: cleanPhone,
        name: 'Business Owner',
        metadata: { role: 'owner' }
      });
      const newOrg = store.createOrg({
        name: `${cleanPhone} Workspace`,
        phone: cleanPhone,
        subscription_tier: 'starter'
      });
      user = store.createUser({
        id: sbId,
        org_id: newOrg.id,
        name: 'Business Owner',
        phone: cleanPhone,
        role: 'owner',
        permissions: DEFAULT_PERMISSIONS.owner
      });
      console.log(`🎉 [Auto-Provision] Created workspace for ${cleanPhone}`);
    }
  }

  let org = store.getOrgById(user.org_id);
  if (!org) {
    org = store._coll('organizations')[0];
    if (org) { user.org_id = org.id; store.save(); }
  }

  const sessionToken = signToken({ userId: user.id, orgId: user.org_id });

  return {
    user: sanitizeUser(user),
    org,
    token: sessionToken,
    supabaseSession: sbSession
  };
}

// ─── Sanitize ─────────────────────────────────────────────────────────────────

export function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}
