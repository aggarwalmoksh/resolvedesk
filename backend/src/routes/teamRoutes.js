import express from 'express';
import { clerkClient } from '@clerk/express';
import { authMiddleware, sanitizeUser } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { store, DEFAULT_PERMISSIONS } from '../db/store.js';
import { FRONTEND_URL } from '../config.js';

const router = express.Router();

router.get('/verify-invite/:code', async (req, res, next) => {
  try {
    const invite = await store.getInvitationByCode(req.params.code.trim().toUpperCase());
    if (!invite) return res.status(404).json({ error: 'Invitation not found or expired.' });
    const org = await store.getOrgById(invite.org_id);
    res.json({ status: 'success', data: { invite_code: invite.invite_code, email: invite.email, role: invite.role, org_name: org?.name || 'ResolveDesk workspace' } });
  } catch (error) { next(error); }
});

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const [members, invitations] = await Promise.all([store.getUsersByOrg(req.org.id), store.getInvitationsByOrg(req.org.id)]);
    res.json({ status: 'success', data: { members: members.map(sanitizeUser), invitations, quota: { used: members.length + invitations.length, max: req.org.max_members } } });
  } catch (error) { next(error); }
});

router.post('/invite', requirePermission('can_manage_team'), async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const role = ['admin', 'agent'].includes(req.body.role) ? req.body.role : 'agent';
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'A valid email address is required.' });
    const [members, invitations, existing] = await Promise.all([store.getUsersByOrg(req.org.id), store.getInvitationsByOrg(req.org.id), store.getUserByEmail(email, req.org.id)]);
    if (members.length + invitations.length >= req.org.max_members) return res.status(403).json({ error: 'Team member limit reached for this plan.' });
    if (existing) return res.status(409).json({ error: 'This person is already a member of your organization.' });
    const permissions = { ...(DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.agent), ...(req.body.permissions || {}) };
    const invitation = await store.createInvitation({ org_id: req.org.id, email, role, permissions });
    const redirectUrl = `${(FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')}/?invite=${encodeURIComponent(invitation.invite_code)}`;
    const clerkInvitation = await clerkClient.invitations.createInvitation({ emailAddress: email, redirectUrl, publicMetadata: { resolveDeskInviteCode: invitation.invite_code } });
    await store.updateInvitation(invitation.id, { clerk_invitation_id: clerkInvitation.id });
    res.status(201).json({ status: 'success', message: `Invitation email sent to ${email}.`, data: { invitation: { ...invitation, clerk_invitation_id: clerkInvitation.id }, email_sent: true } });
  } catch (error) { next(error); }
});

router.patch('/members/:id/permissions', requirePermission('can_manage_team'), async (req, res, next) => {
  try {
    const member = await store.getUserById(req.params.id);
    if (!member || member.org_id !== req.org.id) return res.status(404).json({ error: 'Member not found.' });
    if (member.role === 'owner' && member.id !== req.user.id) return res.status(403).json({ error: 'The organization owner cannot be modified.' });
    const role = ['admin', 'agent'].includes(req.body.role) ? req.body.role : member.role;
    const updated = await store.updateUser(member.id, { role, permissions: { ...member.permissions, ...(req.body.permissions || {}) } });
    res.json({ status: 'success', data: sanitizeUser(updated) });
  } catch (error) { next(error); }
});

router.delete('/members/:id', requirePermission('can_manage_team'), async (req, res, next) => {
  try {
    const member = await store.getUserById(req.params.id);
    if (!member || member.org_id !== req.org.id) return res.status(404).json({ error: 'Member not found.' });
    if (member.role === 'owner') return res.status(403).json({ error: 'The organization owner cannot be removed.' });
    await store.deleteUser(member.id);
    res.json({ status: 'success', message: 'Member access removed.' });
  } catch (error) { next(error); }
});

export default router;
