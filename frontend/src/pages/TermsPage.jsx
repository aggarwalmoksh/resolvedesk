import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PublicFrame } from './PublicFrame';

export default function TermsPage() {
  return (
    <PublicFrame>
      <Helmet>
        <title>Terms of Service — ResolveDesk</title>
        <meta
          name="description"
          content="Terms and conditions governing the usage of ResolveDesk customer operations and Telegram bot routing services."
        />
        <link rel="canonical" href="https://resolvedesk.com/terms" />
        <meta property="og:title" content="Terms of Service — ResolveDesk" />
        <meta
          property="og:description"
          content="Terms and conditions governing the usage of ResolveDesk customer operations and Telegram bot routing services."
        />
      </Helmet>

      

      <main className="rd-policy">
        <article>

          <h1>
            Terms of Service
          </h1>
          <p >
            Please read these terms carefully before accessing or using the ResolveDesk platform. By signing up or linking Telegram bot tokens, you agree to be bound by these provisions.
          </p>

          <section >
            <div>
              <h2>1. Use of Telegram Bot Platform</h2>
              <p >
                ResolveDesk connects to Telegram using official Bot API credentials provided by you. You represent that you possess lawful authority over any bot token added to your workspace and that your communication complies with Telegram's Terms of Service and Anti-Spam policies.
              </p>
            </div>

            <div>
              <h2>2. Workspace Roles and Access Control</h2>
              <p >
                The account owner is responsible for all activity conducted by invited team members. Invitations, assigned permissions, and seat quotas must remain within the limits defined by your active subscription tier.
              </p>
            </div>

            <div>
              <h2>3. Service Availability and Uptime</h2>
              <p >
                We target 99.9% availability for webhook processing and dashboard dispatch. Scheduled maintenance will be announced with prior notice. ResolveDesk is not liable for disruptions originating on Telegram's global infrastructure.
              </p>
            </div>

            <div>
              <h2>4. Prohibited Activities</h2>
              <p >
                You may not use ResolveDesk to distribute unsolicited mass messaging, transmit harmful payloads, or circumvent rate-limiting mechanisms enforced by the Telegram Bot API or our backend endpoints.
              </p>
            </div>

            <div>
              <h2>5. Governing Law and Amendments</h2>
              <p >
                These terms are governed by the laws of India. We reserve the right to revise terms with notice posted on this page. Inquiries can be sent to <span >legal@resolvedesk.com</span>.
              </p>
            </div>
          </section>
        </article>
      </main>
    </PublicFrame>
  );
}
