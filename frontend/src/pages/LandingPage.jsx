import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Bot,
  Zap,
} from 'lucide-react';
import { BillingPeriod, PlanCards } from '../components/subscription/PlanCards';
import { ComplaintInsights } from '../components/dashboard/DashboardView';
import { cn } from '../lib/cn';

function createDemoComplaints() {
  const today = new Date();
  const assignees = ['Alex', 'Sam', 'Morgan'];
  const categories = ['delivery', 'billing', 'product', 'service'];
  return Array.from({ length: 30 }, (_, day) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - day, 12);
    return Array.from({ length: 2 + (day * 7 + day * day) % 9 }, (_, index) => {
      const assignee = (day + index) % 4;
      return {
        id: `demo-${day}-${index}`,
        created_at: date.toISOString(),
        category: categories[(day + index * 3) % categories.length],
        status: index % 3 === 0 ? 'pending' : 'resolved',
        assigned_to: assignees[assignee],
        assignee: assignees[assignee] ? { name: assignees[assignee] } : null,
      };
    });
  }).flat();
}

const FEATURES = [
  {
    id: 'bots',
    title: 'Telegram Bot Hub',
    description: 'Connect multiple customer-facing Telegram bots into one synchronized queue with zero webhook hassle.',
    badge: 'Multi-Bot Sync',
    stat: 'Instant Inbound Capture',
    visual: {
      items: [
        { name: 'Support Bot', handle: '@support_desk_bot', status: 'Live', count: '142 tickets' },
        { name: 'Sales Inquiries', handle: '@orders_telli_bot', status: 'Live', count: '89 tickets' },
        { name: 'VIP Concierge', handle: '@vip_concierge_bot', status: 'Live', count: '31 tickets' },
      ],
    },
  },
  {
    id: 'routing',
    title: 'Intelligent Ticket Routing',
    description: 'Classify issues by topic and automatically route them to available agents before SLA breaches occur.',
    badge: 'Automated Dispatch',
    stat: 'SLA-Protected Queues',
    visual: {
      lanes: [
        { label: 'High Priority', tag: 'Billing', urgency: 'Urgent', color: 'danger' },
        { label: 'Technical Issue', tag: 'Product', urgency: 'Normal', color: 'brand' },
        { label: 'Delivery Delay', tag: 'Logistics', urgency: 'Normal', color: 'warning' },
      ],
    },
  },
  {
    id: 'collaboration',
    title: 'Collaborative Workspace',
    description: 'Assign conversations, leave private internal notes, and hand off threads without losing conversation history.',
    badge: 'Team Alignment',
    stat: 'Zero Collisions',
    visual: {
      members: [
        { name: 'Sarah Chen', role: 'Support Lead', tickets: 18 },
        { name: 'Marcus Bell', role: 'Operations', tickets: 12 },
        { name: 'Priya Patel', role: 'Billing Specialist', tickets: 9 },
      ],
    },
  },
  {
    id: 'analytics',
    title: 'Operational Telemetry',
    description: 'Track resolution velocity, message spikes, and customer satisfaction metrics with real-time reporting.',
    badge: 'Live Metrics',
    stat: 'Real-time Telemetry',
  },
];

export default function LandingPage() {
  const [demoComplaints] = useState(createDemoComplaints);
  const [annualBilling, setAnnualBilling] = useState(false);
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const featureSectionRef = useRef(null);

  // Snappy Sticky Scroll Feature Section (Quick responsive steps)
  useEffect(() => {
    const handleScroll = () => {
      if (!featureSectionRef.current) return;
      const rect = featureSectionRef.current.getBoundingClientRect();
      const sectionHeight = featureSectionRef.current.offsetHeight - window.innerHeight;

      if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(scrolled / Math.max(1, sectionHeight), 0.999));
        const index = Math.floor(progress * FEATURES.length);
        setActiveFeatureIdx(Math.min(index, FEATURES.length - 1));
      } else if (rect.top > 0) {
        setActiveFeatureIdx(0);
      } else if (rect.bottom < window.innerHeight) {
        setActiveFeatureIdx(FEATURES.length - 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="rd-landing min-h-screen bg-surface-0 text-text-primary selection:bg-accent-500/15 selection:text-text-primary">
      <Helmet>
        <title>ResolveDesk — Telegram Support, Streamlined</title>
        <meta
          name="description"
          content="Consolidate Telegram bots, customer issues, and your support operations into one synchronized workspace."
        />
      </Helmet>

      {/* Navigation Header — Crisp, NO theme toggle */}
      <header className="sticky top-0 z-40 border-b border-border-default glass-nav">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 tracking-tight group">
            <img className="rd-mark" src="/favicon.svg" alt="" />
            <span className="text-base font-semibold tracking-tight text-text-primary">
              ResolveDesk
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-text-secondary md:flex font-medium">
            <a href="#features" className="transition hover:text-text-primary">Features</a>
            <a href="#how-it-works" className="transition hover:text-text-primary">Workflow</a>
            <a href="#pricing" className="transition hover:text-text-primary">Pricing</a>
            <Link to="/contact" className="transition hover:text-text-primary">Enterprise</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/app/sign-in"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition px-3 py-2 min-h-[44px] flex items-center"
            >
              Sign in
            </Link>
            {/* 10% Coral Accent CTA Button */}
            <Link
              to="/app/sign-up"
              className="btn btn-primary btn-sm min-h-[40px] px-4 shadow-sm"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-28 border-b border-border-default">
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8 text-center">
          {/* Specific Headline — NO sloppy badges, NO italics */}
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-text-primary text-balance leading-[1.12] max-w-4xl mx-auto">
            Turn fragmented Telegram chats into structured support resolutions.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-text-secondary leading-relaxed text-pretty max-w-2xl mx-auto">
            Route incoming complaints from your Telegram bots directly into one collaborative workspace. Assign teammates, resolve issues, and eliminate dropped tickets.
          </p>

          {/* Hero CTAs: Primary (Coral 10%) + Secondary (Teal/Stone) */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/app/sign-up"
              className="btn btn-primary min-h-[46px] px-6 text-sm font-medium shadow-sm"
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              className="btn btn-secondary min-h-[46px] px-5 text-sm font-medium"
            >
              Explore Features
            </a>
          </div>

          <section className="rd-panel rd-demo mt-16 mx-auto max-w-5xl text-left" aria-label="Interactive ResolveDesk demo">
            <header><Activity aria-hidden /> ResolveDesk demo <span>Sample workspace</span></header>
            <div className="rd-page"><ComplaintInsights complaints={demoComplaints} all demo /></div>
          </section>
        </div>
      </section>

      {/* =====================================================================
          SCROLL-LOCK STICKY FEATURE SHOWCASE
          Tight height (160vh) so each feature advances with gentle scrolling!
          ===================================================================== */}
      <section
        id="features"
        ref={featureSectionRef}
        className="relative"
        style={{ height: '160vh' }}
      >
        <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden border-b border-border-default bg-surface-0">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 w-full py-10">
            {/* Top Indicator */}
            <div className="flex items-center justify-between border-b border-border-default pb-4 mb-8">
              <div>
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Engineered Capabilities
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mt-1">
                  Features that give your team clarity
                </h2>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-text-secondary">
                <span className="tabular font-medium text-brand-600">
                  {activeFeatureIdx + 1}
                </span>
                <span>/</span>
                <span className="tabular">{FEATURES.length}</span>
              </div>
            </div>

            {/* Split: Feature Text (Left) + Interactive Visual (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Feature Description */}
              <div className="lg:col-span-5 space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeatureIdx}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    <span className="badge badge-brand text-xs">
                      {FEATURES[activeFeatureIdx].badge}
                    </span>

                    <h3 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">
                      {FEATURES[activeFeatureIdx].title}
                    </h3>

                    <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                      {FEATURES[activeFeatureIdx].description}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-brand-600">
                      <Activity className="h-4 w-4" strokeWidth={1.5} />
                      <span>{FEATURES[activeFeatureIdx].stat}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Stepper Dots */}
                <div className="flex gap-2 pt-4">
                  {FEATURES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveFeatureIdx(idx)}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-200',
                        idx === activeFeatureIdx
                          ? 'w-8 bg-brand-500'
                          : 'w-2 bg-border-strong hover:bg-text-tertiary'
                      )}
                      aria-label={`Jump to feature ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Visual Stage */}
              <div className="lg:col-span-7">
                <div className="card p-6 sm:p-8 bg-surface-1 border border-border-default min-h-[340px] flex items-center justify-center shadow-md">
                  <AnimatePresence mode="wait">
                    {/* Visual 1: Bots */}
                    {activeFeatureIdx === 0 && (
                      <motion.div
                        key="bot-visual"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full space-y-3"
                      >
                        {FEATURES[0].visual.items.map((bot, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-[var(--radius-md)] border border-border-default bg-surface-0 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Bot className="h-5 w-5 text-brand-500" strokeWidth={1.5} />
                              <div>
                                <p className="text-sm font-medium text-text-primary">{bot.name}</p>
                                <p className="text-xs font-mono text-text-tertiary">{bot.handle}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="badge badge-success text-[10px]">{bot.status}</span>
                              <p className="text-xs font-mono text-text-secondary mt-1">{bot.count}</p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Visual 2: Routing */}
                    {activeFeatureIdx === 1 && (
                      <motion.div
                        key="routing-visual"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full space-y-3"
                      >
                        {FEATURES[1].visual.lanes.map((lane, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-[var(--radius-md)] border border-border-default bg-surface-0 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Zap className="h-5 w-5 text-accent-500" strokeWidth={1.5} />
                              <div>
                                <p className="text-sm font-medium text-text-primary">{lane.label}</p>
                                <p className="text-xs text-text-tertiary">Category: {lane.tag}</p>
                              </div>
                            </div>
                            <span className={cn('badge', lane.color === 'danger' ? 'badge-danger' : lane.color === 'warning' ? 'badge-warning' : 'badge-brand')}>
                              {lane.urgency}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Visual 3: Collaboration */}
                    {activeFeatureIdx === 2 && (
                      <motion.div
                        key="collab-visual"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full space-y-3"
                      >
                        {FEATURES[2].visual.members.map((m, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-[var(--radius-md)] border border-border-default bg-surface-0 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-medium">
                                {m.name[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-text-primary">{m.name}</p>
                                <p className="text-xs text-text-tertiary">{m.role}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono text-text-secondary">{m.tickets} active</span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Visual 4: Analytics — Real, Rich Telemetry Graph */}
                    {activeFeatureIdx === 3 && (
                      <motion.div
                        key="analytics-visual"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-border-default pb-3">
                          <div>
                            <p className="text-xs font-semibold text-text-primary">Resolution Speed</p>
                            <p className="text-[11px] text-text-tertiary">Real-time Telegram SLA telemetry</p>
                          </div>
                          <span className="badge badge-success text-[10px]">98.6% On-Time</span>
                        </div>

                        {/* Rich SVG Telemetry Chart */}
                        <div className="relative h-32 w-full pt-1">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="telemetryGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Subtle grid lines */}
                            <line x1="0" y1="25" x2="300" y2="25" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                            <line x1="0" y1="50" x2="300" y2="50" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                            <line x1="0" y1="75" x2="300" y2="75" stroke="var(--border-subtle)" strokeDasharray="3 3" />

                            {/* Filled Area */}
                            <path
                              d="M 0 75 Q 50 65, 100 45 T 200 30 T 300 15 L 300 100 L 0 100 Z"
                              fill="url(#telemetryGrad)"
                            />
                            {/* Line */}
                            <path
                              d="M 0 75 Q 50 65, 100 45 T 200 30 T 300 15"
                              fill="none"
                              stroke="var(--brand-500)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                            {/* Data points */}
                            <circle cx="100" cy="45" r="3.5" fill="var(--surface-1)" stroke="var(--brand-500)" strokeWidth="2" />
                            <circle cx="200" cy="30" r="3.5" fill="var(--surface-1)" stroke="var(--brand-500)" strokeWidth="2" />
                            <circle cx="300" cy="15" r="3.5" fill="var(--accent-500)" stroke="var(--surface-1)" strokeWidth="2" />
                          </svg>
                        </div>

                        {/* Metric stats row */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-default text-xs">
                          <div className="p-2 rounded-[var(--radius-sm)] bg-surface-0 border border-border-default">
                            <p className="text-[10px] text-text-tertiary">Avg Response</p>
                            <p className="font-semibold text-text-primary mt-0.5">3m 42s</p>
                          </div>
                          <div className="p-2 rounded-[var(--radius-sm)] bg-surface-0 border border-border-default">
                            <p className="text-[10px] text-text-tertiary">Peak Inbound</p>
                            <p className="font-semibold text-text-primary mt-0.5">240 / hr</p>
                          </div>
                          <div className="p-2 rounded-[var(--radius-sm)] bg-surface-0 border border-border-default">
                            <p className="text-[10px] text-text-tertiary">CSAT Score</p>
                            <p className="font-semibold text-brand-600 mt-0.5">4.9 / 5.0</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Workflow Steps */}
      <section id="how-it-works" className="py-24 border-b border-border-default">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
              Implementation
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mt-2">
              Ready in three simple steps
            </h2>
            <p className="text-sm text-text-secondary mt-3">
              No custom coding required. Link your bot token and start triaging messages immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Paste Bot Token',
                desc: 'Generate a token with @BotFather and paste it into ResolveDesk to securely hook updates.',
              },
              {
                step: '2',
                title: 'Invite Teammates',
                desc: 'Assign roles to agents and admins so tickets get claimed without collision or overlap.',
              },
              {
                step: '3',
                title: 'Resolve from Inbox',
                desc: 'Reply directly to customer Telegram accounts right from the central web console.',
              },
            ].map((s) => (
              <div key={s.step} className="card p-6 bg-surface-1 border border-border-default space-y-3">
                <span className="h-7 w-7 rounded-md bg-surface-2 text-text-primary flex items-center justify-center font-mono text-xs font-semibold border border-border-default">
                  {s.step}
                </span>
                <h3 className="text-base font-semibold text-text-primary">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          PRICING TIERS
          Shared plan cards
      */}
      <section id="pricing" className="py-24 border-b border-border-default bg-surface-0">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="rd-pricing-heading">
            <div><h2>Plans for your support desk</h2><p>Choose the right capacity for your Telegram channels and team.</p></div>
            <BillingPeriod annual={annualBilling} onChange={setAnnualBilling} />
          </div>
          <PlanCards annual={annualBilling} renderAction={plan => {
            const contact = plan.custom;
            return <Link className={plan.id === 'growth' ? 'rd-primary' : 'rd-secondary'}
              to={contact ? '/contact' : plan.id === 'growth' ? `/app/sign-up?period=${annualBilling ? 'annual' : 'monthly'}` : '/app/sign-up'}>
              {contact ? 'Talk to sales' : plan.id === 'starter' ? 'Get started free' : annualBilling ? 'Choose annual Growth' : 'Choose monthly Growth'}
            </Link>;
          }} />
        </div>
      </section>

      {/* Final Action Call */}
      <section className="py-20 border-b border-border-default bg-surface-1 text-center">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary">
            Ready to organize your Telegram support?
          </h2>
          <p className="mt-3 text-sm text-text-secondary max-w-md mx-auto">
            Set up your workspace in under two minutes. No migrations, no disruption to active bots.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/app/sign-up" className="btn btn-primary px-7 min-h-[46px] text-sm font-medium shadow-sm">
              Create Your Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-10 bg-surface-0 text-xs text-text-tertiary">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            ResolveDesk · Streamlined Telegram Support Hub · {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-text-primary transition">Privacy</Link>
            <Link to="/terms" className="hover:text-text-primary transition">Terms</Link>
            <Link to="/refund" className="hover:text-text-primary transition">Refund</Link>
            <Link to="/contact" className="hover:text-text-primary transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
