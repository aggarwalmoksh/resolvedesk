import React, { useState } from 'react';
import { Inbox, Phone, Lock, Building, User, Mail, ShieldCheck, Sparkles, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [phone, setPhone] = useState('+919876543210');
  const [password, setPassword] = useState('securePassword123');
  const [businessName, setBusinessName] = useState('Apex Commercial Enterprise');
  const [fullName, setFullName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex@apexenterprise.com');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        await login(phone, password);
      } else {
        await register({
          name: fullName,
          phone,
          email,
          password,
          businessName,
          subscriptionTier: 'starter'
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#A0BDDB]/30 border border-[#A0BDDB]/60 flex items-center justify-center text-[#2B5484]">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-serif text-slate-900 font-bold">
              {mode === 'login' ? 'Sign In to Portal' : 'Register Business'}
            </h3>
            <p className="text-xs text-slate-500">
              ResolveDesk Operations Center
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Apex Commercial Enterprise"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2B5484]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl text-xs font-semibold text-slate-900 bg-[#A0BDDB] hover:bg-[#8FAECF] transition-all shadow-sm active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Portal' : 'Register Business'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-xs text-[#2B5484] hover:underline"
          >
            {mode === 'login' ? "Don't have an account? Register your business" : 'Already registered? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
