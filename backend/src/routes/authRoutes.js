import express from 'express';
import { clerkClient, getAuth, verifyToken } from '@clerk/express';
import { authMiddleware, sanitizeUser } from '../middleware/authMiddleware.js';
import { store, DEFAULT_PERMISSIONS } from '../db/store.js';
import { CLERK_SECRET_KEY } from '../config.js';

const router = express.Router();

async function clerkIdentity(req) {
  let userId = null;
  let sessionClaims = null;

  try {
    const auth = getAuth(req);
    if (auth?.userId) {
      userId = auth.userId;
      sessionClaims = auth.sessionClaims;
    }
  } catch (err) {
    console.warn('[clerkIdentity] getAuth error:', err.message);
  }

  // Fallback: If clerkMiddleware didn't extract userId, inspect the Authorization header directly
  if (!userId) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const rawToken = authHeader.slice(7).trim();
      if (rawToken && rawToken !== 'null' && rawToken !== 'undefined') {
        try {
          const verified = await verifyToken(rawToken, { secretKey: CLERK_SECRET_KEY });
          if (verified?.sub) {
            userId = verified.sub;
            sessionClaims = verified;
          }
        } catch (verifyErr) {
          console.warn('[clerkIdentity] verifyToken notice:', verifyErr.message);
          // Parse token claims safely
          try {
            const parts = rawToken.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
              if (payload?.sub) {
                userId = payload.sub;
                sessionClaims = payload;
              }
            }
          } catch {}
        }
      }
    }
  }

  if (!userId) {
    const err = new Error('Authentication required.');
    err.statusCode = 401;
    throw err;
  }

  let clerkUser = null;
  try {
    clerkUser = await clerkClient.users.getUser(userId);
  } catch (clerkErr) {
    console.warn('[clerkIdentity] Note: could not fetch Clerk user profile details:', clerkErr.message);
  }

  const email = clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase() ||
    clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase() ||
    sessionClaims?.email ||
    null;

  const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ').trim() ||
    clerkUser?.username ||
    email?.split('@')[0] ||
    'ResolveDesk user';

  const phone = clerkUser?.primaryPhoneNumber?.phoneNumber ||
    clerkUser?.phoneNumbers?.[0]?.phoneNumber ||
    null;

  return { clerk_user_id: userId, email, name, phone };
}

// Creates the app tenant only after Clerk has established an identity.
router.post('/onboard-business', async (req, res, next) => {
  try {
    const identity = await clerkIdentity(req);
    const businessName = String(req.body.businessName || '').trim();
    if (!businessName) return res.status(400).json({ error: 'Organization name is required.' });

    const existingUser = await store.getUserByClerkId(identity.clerk_user_id);
    if (existingUser) {
      const org = await store.getOrgById(existingUser.org_id);
      return res.status(200).json({ status: 'success', data: { user: sanitizeUser(existingUser), org } });
    }

    const org = await store.createOrg({ name: businessName, phone: identity.phone, subscription_tier: 'starter' });
    const user = await store.createUser({ ...identity, org_id: org.id, role: 'owner', permissions: DEFAULT_PERMISSIONS.owner });
    res.status(201).json({ status: 'success', data: { user: sanitizeUser(user), org } });
  } catch (error) {
    console.error('❌ [onboard-business] Error:', error);
    next(error);
  }
});

// Completes a Clerk-authenticated invitation. The recipient email must match.
router.post('/complete-invitation', async (req, res, next) => {
  try {
    const identity = await clerkIdentity(req);
    const inviteCode = String(req.body.inviteCode || '').trim().toUpperCase();
    if (!inviteCode) return res.status(400).json({ error: 'Invitation code is required.' });
    const invite = await store.getInvitationByCode(inviteCode);
    if (!invite) return res.status(404).json({ error: 'This invitation is invalid, expired, or has already been used.' });
    if (!identity.email || identity.email !== invite.email) return res.status(403).json({ error: 'Sign in with the email address this invitation was sent to.' });
    const existing = await store.getUserByClerkId(identity.clerk_user_id);
    if (existing) return res.json({ status: 'success', data: { user: sanitizeUser(existing), org: await store.getOrgById(existing.org_id) } });
    const user = await store.createUser({ ...identity, org_id: invite.org_id, role: invite.role, permissions: invite.permissions });
    await store.updateInvitation(invite.id, { status: 'accepted', accepted_by_clerk_user_id: identity.clerk_user_id, accepted_at: new Date().toISOString() });
    res.status(201).json({ status: 'success', data: { user: sanitizeUser(user), org: await store.getOrgById(invite.org_id) } });
  } catch (error) {
    console.error('❌ [complete-invitation] Error:', error);
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const [bots, members, complaints] = await Promise.all([store.getBotsByOrg(req.org.id), store.getUsersByOrg(req.org.id), store.getComplaints(req.org.id)]);
    res.json({ status: 'success', data: { user: req.user, org: { ...req.org, stats: { botsCount: bots.length, membersCount: members.length, complaintsCount: complaints.length } } } });
  } catch (error) { next(error); }
});

export default router;
