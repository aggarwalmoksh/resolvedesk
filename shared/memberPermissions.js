export const MEMBER_PERMISSIONS = {
  can_reply: 'Reply to customers',
  can_assign: 'Assign tickets',
  can_update_status: 'Change ticket status',
  can_manage_bots: 'Manage Telegram bots',
  can_manage_team: 'Invite teammates',
};

export function canEditMemberPermissions(actor, member) {
  if (!actor || !member || actor.id === member.id || member.role === 'owner') return false;
  return actor.role === 'owner' || (actor.role === 'admin' && member.role !== 'admin');
}

export function isMemberPermissionPatch(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.entries(value).every(([key, enabled]) =>
      Object.hasOwn(MEMBER_PERMISSIONS, key) && typeof enabled === 'boolean');
}
