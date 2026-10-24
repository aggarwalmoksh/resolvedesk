import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Inbox, 
  Clock, 
  Zap, 
  CheckCircle2, 
  Package, 
  Truck, 
  CreditCard,
  User,
  ArrowUpDown
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ComplaintsView = ({ onSelectComplaint }) => {
  const { complaints } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter complaints
  const filtered = complaints.filter(c => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCustomer = c.customer?.name?.toLowerCase().includes(q) || c.customer?.username?.toLowerCase().includes(q);
      const matchTicket = c.ticket_number?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      const matchText = c.messages?.some(m => m.message_text.toLowerCase().includes(q));
      if (!matchCustomer && !matchTicket && !matchDesc && !matchText) return false;
    }

    // Status
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;

    // Category
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-serif text-slate-900 tracking-tight font-bold">
              Complaints Stack
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#A0BDDB]/30 text-[#203F64] border border-[#A0BDDB]/50">
              {filtered.length} of {complaints.length} Tickets
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time customer inquiries ingested from Telegram bots. Click any ticket to inspect conversation thread, update triage status, or reply.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, ticket #, or message text..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2B5484] focus:bg-white"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Dropdown/Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            {['all', 'pending', 'in_progress', 'closed'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Category Selector */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#2B5484]"
          >
            <option value="all">All Categories</option>
            <option value="product">Product & Items</option>
            <option value="delivery">Delivery & Logistics</option>
            <option value="billing">Billing & Charges</option>
            <option value="service">Customer Service</option>
            <option value="other">Other Inquiries</option>
          </select>
        </div>
      </div>

      {/* Stacked Complaints List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-slate-800">No complaints match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1">Try clearing filters or send a test message to your Telegram bot.</p>
          </div>
        ) : (
          filtered.map((c) => {
            const isPending = c.status === 'pending';
            const isInProgress = c.status === 'in_progress';
            const latestMsg = c.messages?.[c.messages.length - 1];
            const firstMsg = c.messages?.[0]?.message_text || c.description;

            return (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c.id)}
                className="group relative p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#A0BDDB] transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md"
              >
                {/* Left Side: Ticket Number + Customer info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center font-mono text-xs font-bold text-[#2B5484] flex-shrink-0 group-hover:bg-[#A0BDDB]/10 transition-colors">
                    <span>{c.ticket_number}</span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-[#2B5484] transition-colors">
                        {c.customer?.name || 'Customer'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        @{c.customer?.username || 'user'}
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize border border-slate-200">
                        {c.category} Issue
                      </span>
                      <span className="text-[10px] text-slate-400">
                        via @{c.bot?.username || 'Bot'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl leading-relaxed">
                      "{firstMsg || 'No message content'}"
                    </p>

                    {/* Latest activity preview */}
                    {latestMsg && (
                      <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="text-[#2B5484] font-semibold">Latest update:</span>
                        <span className="line-clamp-1 italic text-slate-500">{latestMsg.message_text}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Handler & Status */}
                <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
                  <div className="text-left md:text-right">
                    <div className="flex items-center md:justify-end gap-1.5 text-xs text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.assignee?.name || 'Unassigned'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${
                      isPending
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : isInProgress
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
