import React, { useState } from 'react';
import { 
  Check, 
  Crown, 
  Sparkles, 
  Zap, 
  Bot, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const SubscriptionView = () => {
  const { subscription, upgradePlan, stats } = useData();
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const [selectedBilling, setSelectedBilling] = useState('monthly'); // 'monthly' | 'annual'

  const plans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      price: selectedBilling === 'monthly' ? 399 : 349,
      period: '/mo',
      badge: 'Solo Founder & Small Teams',
      description: 'Ideal for small businesses transitioning from unorganized Telegram chat complaints.',
      maxBots: 1,
      maxMembers: 3,
      features: [
        'Link up to 1 Telegram Bot',
        'Invite up to 3 Team Partners',
        'Real-time Complaint Dashboard',
        'Auto-Categorization (Product, Delivery, Billing)',
        'Standard Telegram Two-Way Replies',
        'Live Audit History & Ticket Status'
      ]
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      price: selectedBilling === 'monthly' ? 599 : 499,
      period: '/mo',
      badge: 'Most Popular',
      popular: true,
      description: 'For growing businesses expanding with dedicated support staff and delivery partners.',
      maxBots: 3,
      maxMembers: 10,
      features: [
        'Link up to 3 Telegram Bots (Support, VIP, Orders)',
        'Invite up to 10 Team Members',
        'Granular Roles & Permission Toggles',
        'Two-Way Direct Telegram Replies',
        'Ticket Assignment & Priority Routing',
        'Staff Audit Log & Full Timeline',
        'Priority Webhook Ingestion Engine'
      ]
    },
    {
      id: 'scale',
      name: 'Pro Enterprise',
      price: selectedBilling === 'monthly' ? 999 : 849,
      period: '/mo',
      badge: 'High Volume Operations',
      description: 'For multi-channel operations and corporate teams managing dozens of high-traffic bots.',
      maxBots: 10,
      maxMembers: 25,
      features: [
        'Link up to 10 Telegram Bots',
        'Invite up to 25 Team Members',
        'Multi-Department Routing',
        'Custom Webhook Domain & Secret Tokens',
        'Priority SLA Support',
        'Advanced Analytics & Export Reports',
        'Automated Customer Acknowledgment Templates'
      ]
    }
  ];

  const currentPlanId = subscription?.plan?.id || 'starter';

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#A0BDDB]/30 border border-[#A0BDDB]/50 text-[#203F64] text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Subscription Plans in Indian Rupees (₹)</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif text-slate-900 tracking-tight font-bold">
          Scale Your Telegram Desk Seamlessly
        </h1>
        <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Upgrade your bot connections and team invite limits as your customer volume grows. Transparent pricing with instant provisioning.
        </p>

        {/* Billing Cadence Toggle */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 mt-2">
          <button
            onClick={() => setSelectedBilling('monthly')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedBilling === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setSelectedBilling('annual')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedBilling === 'annual'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Save 15%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div id="tour-plans-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {plans.map((p) => {
          const isCurrent = currentPlanId === p.id || (p.id === 'scale' && (currentPlanId === 'scale' || currentPlanId === 'enterprise'));

          return (
            <div
              key={p.id}
              className={`relative rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 ${
                p.popular
                  ? 'bg-white border-2 border-[#2B5484] shadow-xl md:-translate-y-2'
                  : 'bg-white border border-slate-200 shadow-sm hover:border-[#A0BDDB]'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#2B5484] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Crown className="w-3 h-3 text-[#A0BDDB]" />
                  <span>Most Popular</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-serif font-bold text-slate-900">
                    {p.name}
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {p.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-6 min-h-[32px] leading-relaxed">
                  {p.description}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                  <span className="text-4xl font-serif font-bold text-slate-900">
                    ₹{p.price}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{p.period}</span>
                </div>

                {/* Quota Highlights */}
                <div className="grid grid-cols-2 gap-2 mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Telegram Bots
                    </span>
                    <span className="text-sm font-serif font-bold text-slate-900">
                      {p.maxBots} {p.maxBots === 1 ? 'Bot' : 'Bots'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Team Invites
                    </span>
                    <span className="text-sm font-serif font-bold text-slate-900">
                      {p.maxMembers} Members
                    </span>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2.5 mb-8">
                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                    What's Included:
                  </span>
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2 cursor-default"
                  >
                    <Check className="w-4 h-4" />
                    <span>Current Active Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => upgradePlan(p.id)}
                    disabled={!isOwner}
                    className="w-full py-3.5 rounded-2xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all shadow-sm active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <span>{isOwner ? `Upgrade to ${p.name}` : 'Owner Action Required'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
