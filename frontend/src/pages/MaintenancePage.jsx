import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { StatusPage } from './PublicFrame';

export default function MaintenancePage() {
  return <StatusPage title="Scheduled maintenance" description="Try your workspace again in a few minutes.">
    <Helmet><title>Maintenance · ResolveDesk</title></Helmet>
    <Link className="rd-primary" to="/app">Try workspace</Link>
    <Link className="rd-secondary" to="/contact">Contact support</Link>
  </StatusPage>;
}
