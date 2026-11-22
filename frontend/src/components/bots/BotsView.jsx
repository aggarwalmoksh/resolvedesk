import React, { useState } from 'react';
import { ArrowRight, MessageCircle, Plus, Radio, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { countInProgressBy } from '../../lib/ticketCounts';
import { PageHeading, WorkspaceDialog } from '../../workspace/controls';

export function BotsView() {
  const { bots, complaints, complaintError, linkBot, activateBot, pauseBot, deleteBot } = useData();
  const { can, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const manage = can('can_manage_bots');
  const showCounts = ['admin', 'owner'].includes(user?.role);
  const inProgressByBot = showCounts ? countInProgressBy(complaints, 'bot_id') : null;
  const active = bots.filter(bot => bot.status === 'active').length;

  async function connect(event) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const token = data.get('token').trim();
    const title = data.get('title').trim();
    setError('');
    if (!/^\d+:[\w-]{35}$/.test(token) || !title) {
      setError('Enter a bot name and the full token from BotFather.');
      return;
    }
    setBusy(true);
    try { await linkBot({ bot_token: token, bot_title: title }); setOpen(false); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <>
    <PageHeading title="Telegram channels" description="Manage the bots that feed your complaint inbox."
      action={manage && <button className="rd-primary" onClick={() => { setError(''); setOpen(true); }}><Plus aria-hidden /> Connect bot</button>} />
    <div className="rd-channel-grid">
      <section className="rd-panel rd-channel-directory">
        <div className="rd-panel-heading"><div><h2>Connected bots</h2><p>{active} active · {bots.length} connected</p></div></div>
        {bots.length ? <ul>{bots.map(bot => {
          const online = bot.status === 'active';
          return <li key={bot.id}><Radio aria-hidden /><div><strong>{bot.bot_title || bot.bot_username}</strong><small>@{bot.bot_username}</small>
            {showCounts && <small className="rd-ticket-count">
              {complaintError ? 'Ticket count unavailable' : `${inProgressByBot.get(bot.id) ?? 0} in progress`}
            </small>}</div>
            <span className="rd-row-status" data-status={online ? 'resolved' : 'pending'}><i />{bot.status}</span>
            {manage && <><button className="rd-secondary" onClick={() => online ? pauseBot(bot.id) : activateBot(bot.id)}>{online ? 'Pause' : 'Activate'}</button>
              <button className="rd-icon-button" aria-label={`Remove ${bot.bot_title || bot.bot_username}`} onClick={() => deleteBot(bot.id)}><Trash2 aria-hidden /></button></>}
          </li>;
        })}</ul> : <div className="rd-empty"><MessageCircle aria-hidden /><h2>No Telegram bots connected</h2></div>}
      </section>
      <section className="rd-panel rd-channel-flow"><h2>How complaints arrive</h2><ol><li><span>1</span>Customer messages your bot</li><li><span>2</span>ResolveDesk opens a case</li><li><span>3</span>Your team replies from Inbox</li></ol>
        <a href="https://t.me/BotFather" target="_blank" rel="noreferrer">Open BotFather <ArrowRight aria-hidden /></a>
      </section>
    </div>
    {open && <WorkspaceDialog title="Connect a Telegram bot" onClose={() => !busy && setOpen(false)}>
      <form className="rd-form" onSubmit={connect}>
        <label>Bot name<input name="title" autoComplete="off" required placeholder="Enter a bot name" autoFocus /></label>
        <label>BotFather token<input name="token" type="password" autoComplete="new-password" placeholder="Paste your BotFather token" required /></label>
        {error && <p className="rd-form-error" role="alert">{error}</p>}
        <button className="rd-primary" disabled={busy}>{busy ? 'Connecting…' : 'Connect bot'}</button>
      </form>
    </WorkspaceDialog>}
  </>;
}
