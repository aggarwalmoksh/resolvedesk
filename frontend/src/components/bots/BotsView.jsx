import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  CheckCircle2, AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Trash2, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const BotsView = ({ onNavigateTab }) => {
  const { bots, linkBot, deleteBot, activateBot, subscription, stats } = useData();
  const { can } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [botTitle, setBotTitle] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const canManageBots = can('can_manage_bots');
  const maxBots = stats.max_bots || 1;
  const isQuotaFull = bots.length >= maxBots;

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteBot = async (bot) => {
    if (!canManageBots) return;
    const botName = bot.bot_username ? `@${bot.bot_username}` : (bot.bot_title || 'this bot');
    const confirmed = window.confirm(
      `Are you sure you want to delete ${botName}? This will permanently delete the bot from Supabase and deregister its Telegram webhook.`
    );
    if (!confirmed) return;

    try {
      await deleteBot(bot.id);
    } catch (e) {}
  };

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    if (!botToken.trim() || !botTitle.trim()) return;

    if (isQuotaFull) {
      alert("Bot limit reached for your current plan! Upgrade subscription to link additional bots.");
      return;
    }

    linkBot({ bot_token: botToken, bot_title: botTitle });
    setBotToken('');
    setBotTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-serif text-slate-900 dark:text-white tracking-tight font-bold">
              Telegram Bot Hub
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#A0BDDB]/30 dark:bg-[#A0BDDB]/20 text-[#203F64] dark:text-[#A0BDDB] border border-[#A0BDDB]/50 dark:border-[#A0BDDB]/40">
              {bots.length} of {maxBots} Bots Linked
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Connect your Telegram bots using BotFather tokens. All customer complaints sent to these bots are automatically ingested and triaged in ResolveDesk.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!canManageBots}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Link New Telegram Bot</span>
        </button>
      </div>

      {/* Quota Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172B] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#A0BDDB]/20 dark:bg-[#A0BDDB]/10 border border-[#A0BDDB]/40 dark:border-[#A0BDDB]/30 flex items-center justify-center text-[#2B5484] dark:text-[#A0BDDB]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#2B5484] dark:text-[#A0BDDB]">
              Bot Quota Allocation ({subscription?.plan?.name || 'Starter'})
            </div>
            <div className="text-lg font-serif text-slate-900 dark:text-white font-semibold">
              {bots.length} of {maxBots} Bots Currently Connected
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isQuotaFull 
                ? "You have reached your bot limit. Upgrade your plan to link additional bots!" 
                : `${maxBots - bots.length} bot slot(s) remaining.`}
            </p>
          </div>
        </div>

        {isQuotaFull && (
          <button
            onClick={() => onNavigateTab && onNavigateTab('subscription')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all shadow-sm"
          >
            <span>Upgrade Subscription</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bots.map((bot) => (
          <div
            key={bot.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#0F172B] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-[#A0BDDB] dark:hover:border-[#A0BDDB]/70 transition-all duration-200"
          >
            {/* Card Top */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#2B5484] dark:text-[#A0BDDB]">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-slate-900 dark:text-white">
                    {bot.bot_title || 'Telegram Bot'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>@{bot.bot_username || 'TelegramBot'}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                      {bot.masked_token || '••••••••'}
                    </span>
                  </div>
                </div>
              </div>

              {bot.status === 'paused' || bot.status === 'suspended' ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 text-[11px] font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Paused (Plan Limit)</span>
                  </span>
                  <button
                    onClick={() => activateBot && activateBot(bot.id)}
                    className="px-2.5 py-1 rounded-xl bg-[#2B5484] hover:bg-[#203F64] text-white text-[11px] font-semibold transition-all shadow-xs"
                    title="Activate this bot within your plan quota"
                  >
                    Activate
                  </button>
                  {canManageBots && (
                    <button
                      onClick={() => handleDeleteBot(bot)}
                      className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors shadow-xs"
                      title={`Delete @${bot.bot_username || 'bot'} permanently`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Webhook</span>
                  </span>
                  {canManageBots && (
                    <button
                      onClick={() => handleDeleteBot(bot)}
                      className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors shadow-xs"
                      title={`Delete @${bot.bot_username || 'bot'} permanently`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Webhook Endpoint Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Webhook Ingestion URL</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">SSL Encrypted</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs text-slate-800 dark:text-slate-200 font-mono truncate">
                  {bot.webhook_url}
                </code>
                <button
                  onClick={() => handleCopy(bot.webhook_url, bot.id)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Copy Webhook URL"
                >
                  {copiedId === bot.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
              <span className="text-[11px]">
                Linked: {new Date(bot.created_at).toLocaleDateString()}
              </span>
              {bot.status === 'paused' || bot.status === 'suspended' ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                  ⏸️ Ingestion paused
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                  ⚡ Listening for messages
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Setup Guide Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172B] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        <h3 className="text-base font-serif text-slate-900 dark:text-white font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#2B5484] dark:text-[#A0BDDB]" />
          <span>How To Create & Connect Your Telegram Bot</span>
        </h3>
        <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside leading-relaxed">
          <li>Open Telegram and search for the official <strong>@BotFather</strong>.</li>
          <li>Send the command <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono">/newbot</code> and follow the prompts to name your bot.</li>
          <li>Copy the HTTP API Token provided by BotFather (e.g. <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono">1234567890:ABCdefGHIjkl...</code>).</li>
          <li>Paste the token here into ResolveDesk. The system automatically sets the webhook and ingests customer complaints!</li>
        </ol>
      </div>

      {/* Link Bot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0F172B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl overflow-hidden transition-colors">
            <h3 className="text-xl font-serif text-slate-900 dark:text-white font-bold mb-1">
              Link Telegram Bot
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Connect a dedicated bot for customer support, complaints, or logistics
            </p>

            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bot Name / Purpose
                </label>
                <input
                  type="text"
                  required
                  value={botTitle}
                  onChange={(e) => setBotTitle(e.target.value)}
                  placeholder="e.g. Primary Support Desk Bot"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#2B5484] dark:focus:border-[#A0BDDB] focus:bg-white dark:focus:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Telegram Bot API Token (from @BotFather)
                </label>
                <input
                  type="password"
                  required
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz_123456"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#2B5484] dark:focus:border-[#A0BDDB] focus:bg-white dark:focus:bg-slate-800"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Never share tokens publicly. Tokens are securely encrypted.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all shadow-sm active:scale-95"
                >
                  Connect & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
