import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowUpRight, Mail, MessageCircle } from 'lucide-react';
import { PublicFrame } from './PublicFrame';

const email = 'support@resolvedesk.com';

export default function ContactPage() {
  function compose(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(data.get('subject'));
    const body = encodeURIComponent(`${data.get('message')}\n\n${data.get('email')}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return <PublicFrame>
    <Helmet><title>Contact ResolveDesk</title></Helmet>
    <main className="rd-contact">
      <div><h1>Contact support</h1><p>Ask about your workspace, Telegram setup, or billing.</p>
        <a href={`mailto:${email}`}><Mail aria-hidden /> {email}</a>
        <a href="https://t.me/ResolveDeskSupportBot"><MessageCircle aria-hidden /> Telegram support <ArrowUpRight aria-hidden /></a>
      </div>
      <form className="rd-panel rd-form" onSubmit={compose}>
        <label>Your email<input name="email" type="email" required /></label>
        <label>Subject<input name="subject" required /></label>
        <label>Message<textarea name="message" rows={5} required /></label>
        <button className="rd-primary">Open email draft <ArrowUpRight aria-hidden /></button>
      </form>
    </main>
  </PublicFrame>;
}
