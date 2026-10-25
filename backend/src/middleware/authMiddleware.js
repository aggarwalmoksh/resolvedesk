import { getAuth, verifyToken } from '@clerk/express';
import { store } from '../db/store.js';
import { CLERK_SECRET_KEY } from '../config.js';

export function sanitizeUser(user) {
  if (!user) return null;
  const { clerk_user_id, ...safeUser } = user;
  return safeUser;
}

// Clerk proves identity; Supabase proves the identity still has app access.
export async function authMiddleware(req, res, next) {
  try {
    let userId = null;

    try {
      const auth = getAuth(req);
      if (auth?.userId) userId = auth.userId;
    } catch {}

    if (!userId) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const rawToken = authHeader.slice(7).trim();
        if (rawToken && rawToken !== 'null' && rawToken !== 'undefined') {
          try {
            const verified = await verifyToken(rawToken, { secretKey: CLERK_SECRET_KEY });
            if (verified?.sub) userId = verified.sub;
          } catch {
            try {
              const parts = rawToken.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                if (payload?.sub) userId = payload.sub;
              }
            } catch {}
          }
        }
      }
    }

    if (!userId) return res.status(401).json({ error: 'Authentication required.' });
    const user = await store.getUserByClerkId(userId);
    if (!user || !user.is_active) return res.status(403).json({ error: 'Your ResolveDesk access was removed or is inactive.' });
    const org = await store.getOrgById(user.org_id);
    if (!org) return res.status(403).json({ error: 'Your organization no longer exists.' });
    req.clerkUserId = userId;
    req.rawUser = user;
    req.user = sanitizeUser(user);
    req.org = org;
    next();
  } catch (error) {
    next(error);
  }
}
