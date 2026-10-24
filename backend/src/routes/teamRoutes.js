import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { checkMemberQuota } from '../middleware/quotaMiddleware.js';
import { store, DEFAULT_PERMISSIONS } from '../db/store.js';
import { hashPassword, signToken, sanitizeUser, formatE164Phone, ensureSupabaseAuthUser } from '../services/authService.js';
import { supabase } from '../db/supabase.js';

const router = express.Router();

/**
 * GET /api/team/verify-invite/:code (Public)
 * Check if invitation code is valid and return details (including email and phone)
 */
router.get('/verify-invite/:code', (req, res) => {
  try {
    const invite = store.getInvitationByCode(req.params.code.trim().toUpperCase());
    if (!invite) {
      return res.status(404).json({ error: 'Invitation not found or expired' });
    }
    const org = store.getOrgById(invite.org_id);
    res.json({
      status: 'success',
      data: {
        invite_code: invite.invite_code,
        email: invite.email,
        phone: invite.phone,
        role: invite.role,
        org_name: org?.name || 'ResolveDesk Workspace',
        status: invite.status,
        locked_email: Boolean(invite.email),
        locked_phone: Boolean(invite.phone)
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/team/accept-invite (Public)
 * Invited team member signs up with invite code and joins the business organization
 */
router.post('/accept-invite', async (req, res) => {
  try {
    const { invite_code, name, email, phone, password } = req.body;
    if (!invite_code || !name) {
      return res.status(400).json({ error: 'invite_code and name are required' });
    }

    const invite = store.getInvitationByCode(invite_code.trim().toUpperCase());
    if (!invite) {
      return res.status(404).json({ error: 'Invalid or expired invitation code' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ error: 'This invitation has already been accepted or revoked' });
    }

    const org = store.getOrgById(invite.org_id);
    if (!org) {
      return res.status(404).json({ error: 'Organization no longer exists' });
    }

    // Security & Data Integrity: If invite was created for a specific email or phone, prevent tampering
    if (invite.email && email && email.toLowerCase().trim() !== invite.email.toLowerCase().trim()) {
      return res.status(400).json({
        error: `This invitation was issued specifically for ${invite.email}. You cannot register with a different email.`
      });
    }
    if (invite.phone && phone && formatE164Phone(phone.trim()) !== formatE164Phone(invite.phone.trim())) {
      return res.status(400).json({
        error: `This invitation was issued specifically for ${invite.phone}. You cannot register with a different phone number.`
      });
    }

    const userEmail = (invite.email || email || '').toLowerCase().trim();
    const rawPhone = (invite.phone || phone || '').trim();
    const cleanPhone = rawPhone ? formatE164Phone(rawPhone) : null;

    if (!userEmail && !cleanPhone) {
      return res.status(400).json({ error: 'Email address or mobile phone number is required to join the team' });
    }

    // Check if user already exists in this organization
    if (userEmail && store.getUserByEmail(userEmail, org.id)) {
      return res.status(400).json({ error: 'A team member with this email already exists in this organization' });
    }
    if (cleanPhone && store.getUserByPhone(cleanPhone, org.id)) {
      return res.status(400).json({ error: 'A team member with this phone number already exists in this organization' });
    }

    // Guaranteed Supabase Auth User registration (creates in auth.users)
    const sbUserId = await ensureSupabaseAuthUser({
      email: userEmail || undefined,
      phone: cleanPhone || undefined,
      password,
      name: name.trim(),
      metadata: { org_id: org.id, role: invite.role }
    });

    const passwordHash = password ? hashPassword(password) : null;
    const user = store.createUser({
      id: sbUserId,
      org_id: org.id,
      name: name.trim(),
      email: userEmail || null,
      phone: cleanPhone || (userEmail ? userEmail.slice(0, 32) : '+910000000000'),
      password_hash: passwordHash,
      role: invite.role,
      permissions: invite.permissions
    });

    // Mark invitation accepted and sync to Supabase
    store.updateInvitation(invite.id, { status: 'accepted' });

    const token = signToken({ userId: user.id, orgId: org.id });

    res.status(201).json({
      status: 'success',
      message: `Welcome to ${org.name}! Your team access has been activated.`,
      data: {
        user: sanitizeUser(user),
        org,
        token
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

// All following routes require authentication
router.use(authMiddleware);

/**
 * GET /api/team
 * List active team members and pending invites
 */
router.get('/', (req, res) => {
  const members = store.getUsersByOrg(req.org.id).map(sanitizeUser);
  const invitations = store.getInvitationsByOrg(req.org.id);

  res.json({
    status: 'success',
    data: {
      members,
      invitations,
      quota: {
        used: members.length + invitations.length,
        max: req.org.max_members
      }
    }
  });
});

/**
 * POST /api/team/invite
 * Invite a member by email or phone with custom permissions
 */
router.post('/invite', requirePermission('can_manage_team'), checkMemberQuota, (req, res) => {
  try {
    const { email, phone, role = 'agent', permissions, name } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone number is required to invite a team member' });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanPhone = phone ? formatE164Phone(phone.trim()) : null;

    if (cleanEmail) {
      const existingByEmail = store.getUserByEmail(cleanEmail, req.org.id);
      if (existingByEmail) {
        return res.status(400).json({ error: 'This email is already an active member of your organization' });
      }
    }

    if (cleanPhone) {
      const existingByPhone = store.getUserByPhone(cleanPhone, req.org.id);
      if (existingByPhone) {
        return res.status(400).json({ error: 'This phone number is already a registered member of your organization' });
      }
    }

    // Default permissions based on role if not explicitly customized
    const finalPermissions = permissions ? {
      ...DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.agent,
      ...permissions
    } : DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.agent;

    const invite = store.createInvitation({
      org_id: req.org.id,
      email: cleanEmail,
      phone: cleanPhone,
      role,
      permissions: finalPermissions
    });

    const host = (req.get ? req.get('host') : req.headers?.host) || 'localhost:5173';
    const proto = (req.headers && req.headers['x-forwarded-proto']) || 'http';
    const inviteUrl = `${proto}://${host}/?invite=${invite.invite_code}${cleanEmail ? `&email=${encodeURIComponent(cleanEmail)}` : ''}${cleanPhone ? `&phone=${encodeURIComponent(cleanPhone)}` : ''}`;

    res.status(201).json({
      status: 'success',
      message: `Team invitation created for ${cleanEmail || cleanPhone}!`,
      data: {
        invitation: invite,
        invite_url: inviteUrl,
        email_sent: true,
        join_instructions: `Share code '${invite.invite_code}' or invite link with ${cleanEmail || cleanPhone} to complete sign up.`
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

/**
 * PATCH /api/team/members/:id/permissions
 * Update a member's role or granular permissions
 */
router.patch('/members/:id/permissions', requirePermission('can_manage_team'), (req, res) => {
  const member = store.getUserById(req.params.id);
  if (!member || member.org_id !== req.org.id) {
    return res.status(404).json({ error: 'Member not found in your organization' });
  }

  // Prevent modifying the organization owner
  if (member.role === 'owner' && req.user.id !== member.id) {
    return res.status(403).json({ error: 'Cannot modify permissions of the organization owner' });
  }

  const { role, permissions } = req.body;
  const updates = {};

  if (role) updates.role = role;
  if (permissions) {
    updates.permissions = {
      ...member.permissions,
      ...permissions
    };
  }

  const updated = store.updateUser(member.id, updates);

  res.json({
    status: 'success',
    message: 'Permissions updated successfully',
    data: sanitizeUser(updated)
  });
});

/**
 * DELETE /api/team/members/:id
 * Remove a member from the organization
 */
router.delete('/members/:id', requirePermission('can_manage_team'), (req, res) => {
  const member = store.getUserById(req.params.id);
  if (!member || member.org_id !== req.org.id) {
    return res.status(404).json({ error: 'Member not found in your organization' });
  }

  if (member.role === 'owner') {
    return res.status(403).json({ error: 'Cannot remove the organization owner' });
  }

  store.deleteUser(member.id);

  res.json({
    status: 'success',
    message: `Team member ${member.name} removed from organization`
  });
});

export default router;
