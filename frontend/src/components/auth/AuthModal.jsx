import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Field, Input, OtpField, IconButton } from '../../ui/primitives';
import { createIdempotencyKey } from '../../services/api';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('credentials');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const key = useMemo(() => createIdempotencyKey(), [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (step === 'otp') return onClose();
      if (mode === 'login') {
        if (login) await login(phone, password, key);
        setStep('otp');
        return;
      }
      if (register) {
        await register({
          name: fullName,
          phone,
          email,
          password,
          businessName,
          subscriptionTier: 'starter',
        }, key);
      }
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-4">
      <div className="relative w-full max-w-md surface p-6">
        <IconButton className="absolute right-3 top-3" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </IconButton>
        <h3 className="text-[18px]">{mode === 'login' ? 'Sign in' : 'Register'}</h3>
        {error && <p className="mt-3 text-[13px] text-red-700">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {step === 'otp' ? (
            <Field label="Sign-in code" hint={'SMS should end with @resolvedesk.app #123456'}>
              <OtpField value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            </Field>
          ) : (
            <>
              {mode === 'register' && (
                <>
                  <Field label="Name"><Input required value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
                  <Field label="Organization"><Input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} /></Field>
                </>
              )}
              <Field label="Phone"><Input required value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
              <Field label="Password"><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
            </>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Working' : step === 'otp' ? 'Verify' : mode === 'login' ? 'Continue' : 'Create account'}
          </Button>
        </form>
        <button type="button" className="mt-3 text-[13px] text-accent" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Register a business' : 'Sign in instead'}
        </button>
      </div>
    </div>
  );
};
