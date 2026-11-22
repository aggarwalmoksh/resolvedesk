import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { MEMBER_PERMISSIONS, canEditMemberPermissions } from '../../../../shared/memberPermissions';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PageHeading } from '../../workspace/controls';

export function PermissionsView() {
  const { user } = useAuth();
  const { team, updateMemberPermissions } = useData();
  const [saving, setSaving] = useState({});
  const [error, setError] = useState('');

  if (!['admin', 'owner'].includes(user?.role)) return <Navigate to="/app/team" replace />;

  async function change(member, key, enabled) {
    setSaving(previous => ({ ...previous, [member.id]: true }));
    setError('');
    try { await updateMemberPermissions(member.id, { [key]: enabled }); }
    catch (err) { setError(err.message); }
    finally { setSaving(previous => ({ ...previous, [member.id]: false })); }
  }

  return <>
    <PageHeading title="Roles and permissions" description="Set which actions each team member can perform. Changes save automatically." />
    {error && <p className="rd-form-error" role="alert">{error}</p>}
    <section className="rd-panel rd-permissions-matrix">
      <table aria-label="Workspace member permissions">
        <thead><tr><th scope="col">Member</th><th scope="col">Role</th>
          {Object.entries(MEMBER_PERMISSIONS).map(([key, label]) => <th key={key} scope="col">{label}</th>)}
        </tr></thead>
        <tbody>{team.members.map(member => {
          const name = member.name || member.email;
          const editable = canEditMemberPermissions(user, member);
          return <tr key={member.id} aria-busy={Boolean(saving[member.id])}>
            <th scope="row">{name}<small>{member.email}</small></th>
            <td className="capitalize">{member.role}</td>
            {Object.entries(MEMBER_PERMISSIONS).map(([key, label]) => <td key={key}>
              <input type="checkbox" aria-label={`${label} for ${name}`}
                checked={member.role === 'owner' || member.permissions?.[key] === true}
                disabled={!editable || Boolean(saving[member.id])}
                onChange={event => change(member, key, event.target.checked)} />
            </td>)}
          </tr>;
        })}</tbody>
      </table>
    </section>
  </>;
}
