import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PublicFrame } from './PublicFrame';

export default function RefundPage() {
  return (
    <PublicFrame>
      <Helmet>
        <title>Refund & Cancellation Policy — ResolveDesk</title>
        <meta
          name="description"
          content="ResolveDesk transparent refund, downgrade, and cancellation policies for monthly and annual subscription plans."
        />
        <link rel="canonical" href="https://resolvedesk.com/refund" />
        <meta property="og:title" content="Refund & Cancellation Policy — ResolveDesk" />
        <meta
          property="og:description"
          content="Transparent refund, downgrade, and cancellation policies for ResolveDesk plans."
        />
      </Helmet>

      

      <main className="rd-policy">
        <article>

          <h1>
            Refund & Cancellation Policy
          </h1>
          <p >
            We strive for total clarity in our billing. This policy details how plan cancellations, downgrades, and refund requests are processed for all ResolveDesk workspaces.
          </p>

          <section >
            <div>
              <h2>1. 14-Day Satisfaction Guarantee</h2>
              <p >
                If you upgrade to any paid tier (Starter, Growth, or Scale) and find that the platform does not meet your operational workflow needs, you may request a 100% full refund within 14 calendar days of your initial payment.
              </p>
            </div>

            <div>
              <h2>2. Subscription Cancellation</h2>
              <p >
                You can cancel your subscription at any time directly through the Billing tab in your ResolveDesk settings. Upon cancellation:
              </p>
              <ul >
                <li>Your plan remains active until the end of the current paid billing cycle.</li>
                <li>No automated renewals will be charged thereafter.</li>
                <li>Your bots, history, and tickets remain accessible in read-only mode or under Starter limits.</li>
              </ul>
            </div>

            <div>
              <h2>3. Plan Upgrades & Proration</h2>
              <p >
                When you upgrade from a lower tier to a higher tier mid-cycle, the unused portion of your current billing period is automatically credited toward the new tier, prorated to the exact day.
              </p>
            </div>

            <div>
              <h2>4. Requesting a Refund</h2>
              <p >
                To initiate a refund under our 14-day policy, please email <span >billing@resolvedesk.com</span> with your workspace organization name and payment receipt ID. Refunds are typically processed back to the original payment source within 3–5 business days.
              </p>
            </div>
          </section>
        </article>
      </main>
    </PublicFrame>
  );
}
