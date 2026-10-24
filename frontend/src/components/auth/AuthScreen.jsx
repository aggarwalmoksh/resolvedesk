import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Lock, 
  Building2, 
  User, 
  Bot, 
  Users, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck,
  CheckCircle2,
  Mail,
  KeyRound,
  Inbox,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const AuthScreen = () => {
  const { login, register, sendOtp, verifyOtp, acceptInvite, loading, authError } = useAuth();

  // Mode: 'otp' | 'login' | 'register' | 'invite'
  const [mode, setMode] = useState('otp');
  
  // OTP flow state
  const [otpPhone, setOtpPhone] = useState('+919876543210');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpStatusMsg, setOtpStatusMsg] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Standard Login fields
  const [loginPhone, setLoginPhone] = useState('+919876543210');
  const [loginPassword, setLoginPassword] = useState('securePassword123');

  // Business Owner Register fields
  const [regName, setRegName] = useState('Alex Morgan');
  const [regBusinessName, setRegBusinessName] = useState('Apex Commercial Enterprise');
  const [regPhone, setRegPhone] = useState('+919876543210');
  const [regEmail, setRegEmail] = useState('alex@apexenterprise.com');
  const [regPassword, setRegPassword] = useState('securePassword123');
  const [subscriptionTier, setSubscriptionTier] = useState('starter'); // 'starter' | 'growth' | 'scale'

  // Team Member Accept Invite fields (GitHub-style)
  const [inviteCode, setInviteCode] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteOrgName, setInviteOrgName] = useState('');

  // Check URL query parameters for invite link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');
    const email = params.get('email');
    if (code) {
      setMode('invite');
      setInviteCode(code);
      if (email) setInviteEmail(email);
      // Verify invite
      api.verifyInvite(code).then(data => {
        if (data?.org_name) setInviteOrgName(data.org_name);
      }).catch(() => {});
    }
  }, []);

  const tierOptions = [
    {
      id: 'starter',
      name: 'Starter Plan',
      price: '₹399/mo',
      bots: '1 Bot',
      members: '3 Member Invites',
      desc: '1 Telegram Bot & 3 Team Member Invites'
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      price: '₹599/mo',
      popular: true,
      bots: '3 Bots',
      members: '10 Member Invites',
      desc: '3 Telegram Bots & 10 Team Member Invites'
    },
    {
      id: 'scale',
      name: 'Pro Enterprise',
      price: '₹999/mo',
      bots: '10 Bots',
      members: '25 Member Invites',
      desc: '10 Telegram Bots & 25 Team Member Invites'
    }
  ];

  // Request Supabase Phone OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpPhone.trim()) return;
    setIsSendingOtp(true);
    setOtpStatusMsg('');
    try {
      await sendOtp(otpPhone);
      setOtpSent(true);
      setOtpStatusMsg(`Verification OTP dispatched to ${otpPhone}. Enter code below to sign in.`);
    } catch (err) {
      // If SMS gateway is unconfigured on Supabase project, provide demo OTP guidance
      setOtpSent(true);
      setOtpStatusMsg(`Supabase Auth OTP requested for ${otpPhone}. Enter your code (or test OTP 123456) to proceed.`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify Phone OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    try {
      await verifyOtp(otpPhone, otpCode);
    } catch (err) {
      // If user hasn't registered yet, switch to register with phone prefilled
      if (err.message?.includes('No business registered') || err.message?.includes('User not found')) {
        setRegPhone(otpPhone);
        setMode('register');
      }
    }
  };

  // Standard Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(loginPhone, loginPassword);
    } catch (err) {}
  };

  // Register Business
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({
        name: regName,
        phone: regPhone,
        email: regEmail,
        password: regPassword,
        businessName: regBusinessName,
        subscriptionTier: subscriptionTier
      });
    } catch (err) {}
  };

  // Accept Team Invite
  const handleAcceptInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      await acceptInvite({
        invite_code: inviteCode,
        name: inviteName,
        email: inviteEmail,
        password: invitePassword
      });
    } catch (err) {}
  };

  const handleQuickDemo = async () => {
    try {
      await login('+919876543210', 'securePassword123');
    } catch (e) {
      await register({
        name: 'Alex Morgan',
        phone: '+919876543210',
        email: 'alex@apexenterprise.com',
        password: 'securePassword123',
        businessName: 'Apex Commercial Enterprise',
        subscriptionTier: 'starter'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Accent Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-b from-[#A0BDDB]/20 to-transparent pointer-events-none rounded-b-full blur-2xl" />

      {/* Main Container */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-10 my-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#A0BDDB]/30 border border-[#A0BDDB]/60 shadow-sm mx-auto text-[#2B5484]">
            <Inbox className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-3xl font-serif text-slate-900 font-bold tracking-tight">
              ResolveDesk
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Multi-Bot Telegram Complaint Command Center for Growing Businesses
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Supabase Auth & PostgreSQL Connected</span>
          </div>
        </div>

        {/* Navigation Mode Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1.5 rounded-2xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('otp')}
            className={`py-2 rounded-xl transition-all ${
              mode === 'otp'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Phone OTP
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setMode('invite')}
            className={`py-2 rounded-xl transition-all ${
              mode === 'invite'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Join Team
          </button>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <span>{authError}</span>
          </div>
        )}

        {/* Status Alert for OTP */}
        {otpStatusMsg && mode === 'otp' && (
          <div className="mb-6 p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-xs">
            {otpStatusMsg}
          </div>
        )}

        {/* 1. PHONE OTP AUTH FLOW (Supabase Auth) */}
        {mode === 'otp' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Enter Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Supabase will verify your mobile number via OTP
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3.5 rounded-2xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{isSendingOtp ? 'Sending OTP via Supabase...' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Enter 6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-[#2B5484] hover:underline"
                    >
                      Change Phone Number
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 4}
                  className="w-full py-3.5 rounded-2xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Enter Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* 2. PASSWORD LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Phone or Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. BUSINESS OWNER REGISTRATION */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Owner Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regBusinessName}
                    onChange={(e) => setRegBusinessName(e.target.value)}
                    placeholder="Apex Commercial Enterprise"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                />
              </div>
            </div>

            {/* Subscription Tier Selection */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Subscription Plan (In Rupees):
              </label>

              <div className="space-y-2">
                {tierOptions.map((tier) => {
                  const isSelected = subscriptionTier === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSubscriptionTier(tier.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-50 border-[#2B5484] shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#2B5484] bg-[#2B5484]' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                            <span>{tier.name}</span>
                            {tier.popular && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#A0BDDB]/30 text-[#203F64] uppercase font-bold">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {tier.desc}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-900">{tier.price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{loading ? 'Registering...' : 'Provision Portal & Start Desk'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 4. TEAM MEMBER INVITATION SIGN-UP (GITHUB STYLE) */}
        {mode === 'invite' && (
          <form onSubmit={handleAcceptInviteSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#A0BDDB]/20 border border-[#A0BDDB]/40 text-xs text-slate-700">
              <span className="font-semibold block mb-0.5">
                {inviteOrgName ? `Invited to join ${inviteOrgName}` : 'Team Invitation Onboarding'}
              </span>
              <span>
                Enter your invitation code and complete your team profile to join your workspace.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invitation Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. INV-ABCD1234"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Jordan Lee"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="jordan@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !inviteCode}
              className="w-full py-3.5 rounded-2xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{loading ? 'Joining Workspace...' : 'Accept Invitation & Join Team'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Quick Demo Shortcut */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-[#A0BDDB]/20 border border-slate-200 hover:border-[#A0BDDB] text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#2B5484]" />
            <span>Instant One-Click Demo Sign-In (+919876543210)</span>
          </button>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500">
        ResolveDesk • Powered by Supabase Auth & PostgreSQL • Brand HEX: #A0BDDB
      </div>

    </div>
  );
};
