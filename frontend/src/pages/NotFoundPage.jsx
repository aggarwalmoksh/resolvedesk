import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { StatusPage } from './PublicFrame';

export default function NotFoundPage() {
  return <StatusPage title="Page not found" description="This link may have changed or the page may have moved.">
    <Helmet><title>Page not found · ResolveDesk</title></Helmet>
    <Link className="rd-primary" to="/app">Open workspace</Link>
    <Link className="rd-secondary" to="/">Back to home</Link>
  </StatusPage>;
}
