import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const documents = [['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/refund', 'Refunds'], ['/contact', 'Contact']];

export function PublicFrame({ children }) {
  return <div className="rd-public">
    <header className="rd-public-header">
      <Link to="/" className="rd-brand"><img className="rd-mark" src="/favicon.svg" alt="" />ResolveDesk</Link>
      <nav aria-label="Help and policies">{documents.map(([path, title]) => <NavLink key={path} to={path}>{title}</NavLink>)}</nav>
    </header>
    {children}
  </div>;
}

export function StatusPage({ title, description, children }) {
  return <PublicFrame><main className="rd-status-page"><div className="rd-status-stripe" aria-hidden />
    <div><h1>{title}</h1><p>{description}</p><div className="rd-status-actions">{children}</div></div>
  </main></PublicFrame>;
}
