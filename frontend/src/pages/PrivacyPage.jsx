import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PublicFrame } from './PublicFrame';

export default function PrivacyPage() {
  return (
    <PublicFrame>
      <Helmet>
        <title>Privacy Policy — ResolveDesk</title>
        <meta
          name="description"
          content="ResolveDesk privacy policy regarding Telegram customer data ingestion, token security, and multi-tenant isolation."
        />
        <link rel="canonical" href="https://resolvedesk.com/privacy" />
        <meta property="og:title" content="Privacy Policy — ResolveDesk" />
        <meta
          property="og:description"
          content="ResolveDesk privacy policy regarding Telegram customer data ingestion, token security, and multi-tenant isolation."
        />
      </Helmet>

      

      <main className="rd-policy">
        <article>

          <h1>
            Privacy Policy
          </h1>
          <p >
            This Privacy Policy governs the manner in which ResolveDesk collects, uses, maintains, and protects user information collected from customers, workspace operators, and Telegram message endpoints.
          </p>

          <section >
            <div>
              <h2>1. Data Ingestion via Telegram Bot API</h2>
              <p >
                ResolveDesk operates as a processor of incoming customer inquiries. When you register a Telegram Bot Token with your workspace:
              </p>
              <ul >
                <li>We register a secured webhook endpoint with Telegram API over TLS 1.3.</li>
                <li>We process customer message payloads (message text, sender username, chat identifier, timestamp).</li>
                <li>Bot tokens are encrypted at rest with AES-256-GCM before storage in our database.</li>
              </ul>
            </div>

            <div>
              <h2>2. Authentication and Account Data</h2>
              <p >
                Account creation and sign-in are managed through Clerk. We store your business name, operator name, email address, and assigned role permissions. We do not store plain-text passwords or credit card numbers on our servers.
              </p>
            </div>

            <div>
              <h2>3. Multi-Tenant Isolation</h2>
              <p >
                All customer records, support tickets, and bot configurations are strictly partitioned by organization ID. Team members can only access data belonging to the workspace they were invited to by an authorized administrator.
              </p>
            </div>

            <div>
              <h2>4. Data Retention and Deletion</h2>
              <p >
                Workspaces may permanently remove bot connections or purge customer ticket histories at any time. When a bot is deleted, associated webhook registrations are unregistered with Telegram and all staged records are scheduled for hard deletion.
              </p>
            </div>

            <div>
              <h2>5. Contact Information</h2>
              <p >
                If you have questions about this privacy statement or security audits, contact us at <span >privacy@resolvedesk.com</span> or submit an inquiry through our <Link to="/contact" >Contact page</Link>.
              </p>
            </div>
          </section>
        </article>
      </main>
    </PublicFrame>
  );
}
