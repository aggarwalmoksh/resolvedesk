import React from 'react';
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  Zap, 
  TrendingUp, 
  Truck, 
  CreditCard, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bot,
  Package,
  Headphones
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const DashboardView = ({ onSelectComplaint, onNavigateTab }) => {
  const { stats, complaints, categoriesBreakdown } = useData();

  const metricCards = [
    {
      label: 'Total Complaints',
      value: stats.total,
      icon: Inbox,
      change: 'All time intake',
      color: '#2B5484',
      bgGlow: 'bg-[#A0BDDB]/20 dark:bg-[#A0BDDB]/10',
      borderColor: 'border-slate-200 dark:border-slate-800'
    },
    {
      label: 'Pending Triage',
      value: stats.pending,
      icon: Clock,
      change: 'Requires attention',
      color: '#D97706',
      bgGlow: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-900/40'
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      icon: Zap,
      change: 'Being worked on',
      color: '#4F46E5',
      bgGlow: 'bg-indigo-50 dark:bg-indigo-950/30',
      borderColor: 'border-indigo-200 dark:border-indigo-900/40'
    },
    {
      label: 'Resolved & Closed',
      value: stats.closed,
      icon: CheckCircle2,
      change: `${stats.resolution_rate_percent}% resolution rate`,
      color: '#059669',
      bgGlow: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-900/40'
    }
  ];

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'product':
        return {
          title: 'Product & Item Quality',
          desc: 'Damaged items, missing parts, manufacturing defects',
          icon: Package,
          color: '#2B5484'
        };
      case 'delivery':
        return {
          title: 'Delivery & Logistics',
          desc: 'Late shipments, delayed couriers, address issues',
          icon: Truck,
          color: '#D97706'
        };
      case 'billing':
        return {
          title: 'Billing & Charges',
          desc: 'Refund requests, duplicate payments, invoices',
          icon: CreditCard,
          color: '#7C3AED'
        };
      case 'service':
        return {
          title: 'Customer Service',
          desc: 'Agent assistance, policy questions, general inquiries',
          icon: Headphones,
          color: '#059669'
        };
      default:
        return {
          title: 'General Inquiries',
          desc: 'Uncategorized customer requests & feedback',
          icon: Sparkles,
          color: '#64748B'
        };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 transition-colors">
      
      {/* Top Welcome Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-white dark:bg-[#0F172B] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A0BDDB]/20 dark:bg-[#A0BDDB]/10 border border-[#A0BDDB]/40 dark:border-[#A0BDDB]/30 text-[#2B5484] dark:text-[#A0BDDB] text-xs font-semibold uppercase tracking-wider mb-2">
              <Bot className="w-3.5 h-3.5" />
              <span>Live Telegram Ingestion Active</span>
            </div>
            <h1 className="text-3xl font-serif text-slate-900 dark:text-white tracking-tight font-bold">
              Customer Support Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
              Consolidated triage across all your connected Telegram bots. Ingests customer complaints in real-time with automatic categorization and role-based delegation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('complaints')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all shadow-sm active:scale-95"
            >
              <span>View Stack ({stats.pending} Pending)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div id="tour-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl bg-white dark:bg-[#0F172B] border ${card.borderColor} shadow-sm transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.label}
                </span>
                <div 
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.bgGlow}`}
                >
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#2B5484] dark:text-[#A0BDDB]" />
                  <span>{card.change}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown & Recent Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Category Distribution */}
        <div id="tour-categories-card" className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0F172B] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif text-slate-900 dark:text-white font-semibold tracking-tight">
                Category-Wise Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically categorized from incoming Telegram messages
              </p>
            </div>

            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
              {stats.total} Total Tickets
            </span>
          </div>

          <div className="space-y-4">
            {categoriesBreakdown.map((item, idx) => {
              const meta = getCategoryMeta(item.category);
              const Icon = meta.icon;

              return (
                <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-7 h-7 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block leading-tight">{meta.title}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{meta.desc}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{item.count}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">({item.percent}%)</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: meta.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Priority Triage Feed */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172B] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif text-slate-900 dark:text-white font-semibold tracking-tight">
              Recent Inquiries
            </h3>
            <button
              onClick={() => onNavigateTab('complaints')}
              className="text-xs text-[#2B5484] dark:text-[#A0BDDB] hover:underline font-semibold"
            >
              View All
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs">No customer complaints logged yet.</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Customer complaints sent to your Telegram bots will populate here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {complaints.slice(0, 5).map((comp) => {
                const isPending = comp.status === 'pending';
                return (
                  <div
                    key={comp.id}
                    onClick={() => onSelectComplaint(comp.id)}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-805 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-[#2B5484] dark:text-[#A0BDDB]">
                        {comp.ticket_number}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase border ${
                          isPending 
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' 
                            : comp.status === 'in_progress' 
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50' 
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                        }`}
                      >
                        {comp.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {comp.title || comp.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                      <span>{comp.customer?.name || 'Customer'}</span>
                      <span className="capitalize">{comp.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
