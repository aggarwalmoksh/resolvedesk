import React, { useEffect, useRef, useState } from 'react';
import { Check, Send } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORY_LABEL, STATUS_LABEL, timeAgo } from '../../lib/format';
import { DropdownSelect } from '../../workspace/Dropdown';
import { WorkspaceDialog } from '../../workspace/controls';

export function ComplaintDetailSheet({ complaint, open, onClose }) {
  return open && complaint ? <Conversation key={complaint.id} complaint={complaint} onClose={onClose} /> : null;
}

function Conversation({ complaint, onClose }) {
  const { team, updateComplaintStatus, assignComplaint, replyToComplaint, fetchComplaintDetails } = useData();
  const { user, can } = useAuth();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const end = useRef(null);
  const { id, messages = [], status } = complaint;
  const customer = complaint.customer?.name || 'Telegram customer';
  const closed = ['closed', 'resolved'].includes(status);

  useEffect(() => { fetchComplaintDetails(id); }, [id, fetchComplaintDetails]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [messages.length]);

  async function perform(action, operation) {
    if (busy) return;
    setBusy(action);
    setError('');
    try { await operation(); }
    catch (err) { setError(err.message); }
    finally { setBusy(''); }
  }

  function send(event) {
    event.preventDefault();
    if (text.trim()) perform('reply', async () => {
      await replyToComplaint(id, text.trim(), user?.name);
      setText('');
    });
  }

  const firstMessage = complaint.customer_message || complaint.description;
  const showFirst = firstMessage && !messages.some(message => message.sender_type === 'customer' && (message.message_text || message.text) === firstMessage);

  return <WorkspaceDialog title={complaint.title || customer} drawer onClose={onClose}>
    <div className="rd-conversation-meta"><div><strong>{customer}</strong><small>{complaint.ticket_number} · {CATEGORY_LABEL[complaint.category] || 'Other'}</small></div>
      {can('can_update_status') ? <button className="rd-secondary" disabled={Boolean(busy)} onClick={() => perform('status', () => updateComplaintStatus(id, closed ? 'in_progress' : 'resolved', user))}>
        <Check aria-hidden /> {closed ? 'Reopen' : 'Resolve'}
      </button> : <span>{STATUS_LABEL[status]}</span>}
    </div>
    <div className="rd-assignment"><span>{STATUS_LABEL[status]}</span>
      {can('can_assign') ? <div className="rd-assignment-field">Assignee
        <DropdownSelect label="Assignee" disabled={Boolean(busy)} value={complaint.assigned_to || ''}
          options={[[ '', 'Unassigned'], ...team.members.map(member => [member.id, member.name || member.email])]}
          onChange={assigneeId => {
            const member = team.members.find(item => item.id === assigneeId);
            perform('assignment', () => assignComplaint(id, member?.id || null, member?.name));
          }} />
      </div>
        : <span>{complaint.assignee?.name || 'Unassigned'}</span>}
    </div>
    <div className="rd-thread" aria-label="Conversation">
      {showFirst && <div className="rd-message"><small>{customer} · {timeAgo(complaint.created_at)}</small><p>{firstMessage}</p></div>}
      {messages.map((message, index) => <div key={message.id || index} className="rd-message" data-sender={message.sender_type}>
        <small>{message.sender_name || (message.sender_type === 'customer' ? customer : 'Support')} · {timeAgo(message.created_at)}</small>
        <p>{message.message_text || message.text || message.message}</p>
      </div>)}
      <div ref={end} />
    </div>
    {error && <p className="rd-form-error" role="alert">{error}</p>}
    {can('can_reply') && <form className="rd-composer" onSubmit={send}>
      <textarea aria-label="Telegram reply" rows={3} placeholder="Reply to the customer on Telegram…" value={text} onChange={event => setText(event.target.value)}
        onKeyDown={event => { if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) send(event); }} />
      <button className="rd-primary" disabled={Boolean(busy) || !text.trim()}>{busy === 'reply' ? 'Sending…' : 'Send reply'} <Send aria-hidden /></button>
    </form>}
  </WorkspaceDialog>;
}
