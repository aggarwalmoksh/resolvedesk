import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { StatusPage } from './PublicFrame';

export default function ErrorPage() {
  return <StatusPage title="Something went wrong" description="Try reopening your workspace.">
    <Helmet><title>Something went wrong · ResolveDesk</title></Helmet>
    <Link className="rd-primary" to="/app">Open workspace</Link>
    <Link className="rd-secondary" to="/contact">Contact support</Link>
  </StatusPage>;
}
