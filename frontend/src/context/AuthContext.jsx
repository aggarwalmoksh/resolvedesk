import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [token, setToken] = useState(getAuthToken() || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Business Personas for testing Granular Roles & Permissions
  const personas = [
    {
      id: 'usr-owner',
      name: 'Alex Morgan (Owner)',
      role: 'owner',
      phone: '+919876543210',
      badge: 'Business Founder & Owner',
      permissions: {
        can_reply: true,
        can_update_status: true,
        can_assign: true,
        can_manage_bots: true,
        can_view_analytics: true,
        can_manage_team: true
      }
    },
    {
      id: 'usr-partner',
      name: 'Samir Rao (Partner)',
      role: 'agent',
      phone: '+919876543211',
      badge: 'Operations Partner',
      permissions: {
        can_reply: true,
        can_update_status: true,
        can_assign: false,
        can_manage_bots: false,
        can_view_analytics: true,
        can_manage_team: false
      }
    },
    {
      id: 'usr-agent',
      name: 'Jordan Lee (Support Agent)',
      role: 'agent',
      phone: '+919876543299',
      badge: 'Customer Care Specialist',
      permissions: {
        can_reply: true,
        can_update_status: false,
        can_assign: false,
        can_manage_bots: false,
        can_view_analytics: false,
        can_manage_team: false
      }
    }
  ];

  // Initialize session verification on load
  useEffect(() => {
    let mounted = true;

    const checkExistingAuth = async () => {
      setLoading(true);
      const existingToken = getAuthToken();

      if (existingToken) {
        try {
          const meData = await api.getMe();
          if (mounted && meData?.user) {
            setUser(meData.user);
            setOrg(meData.org);
            setToken(existingToken);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Existing token expired or invalid:', e.message);
          setAuthToken(null);
          setToken(null);
        }
      }

      // Check Supabase session
      try {
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (mounted && sbSession?.user) {
          setSession(sbSession);
        }
      } catch (err) {}

      if (mounted) {
        setLoading(false);
      }
    };

    checkExistingAuth();

    // Listen for Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession && !getAuthToken()) {
        try {
          const meData = await api.getMe();
          if (meData?.user) {
            setUser(meData.user);
            setOrg(meData.org);
          }
        } catch (e) {}
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (phone, password) => {
    setAuthError(null);
    try {
      const data = await api.login(phone, password);
      setUser(data.user);
      setOrg(data.org);
      setToken(data.token);

      // Set Supabase session if returned
      if (data.supabaseSession?.access_token) {
        try {
          await supabase.auth.setSession({
            access_token: data.supabaseSession.access_token,
            refresh_token: data.supabaseSession.refresh_token
          });
        } catch (e) { /* non-blocking */ }
      }

      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // Smart OTP: works with both email and phone
  const sendOtp = async (identifier) => {
    setAuthError(null);
    try {
      return await api.sendOtp(identifier);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const verifyOtp = async (identifier, tokenCode) => {
    setAuthError(null);
    try {
      const data = await api.verifyOtp(identifier, tokenCode);
      setUser(data.user);
      setOrg(data.org);
      setToken(data.token);

      // Set Supabase session if returned (email OTP flow)
      if (data.supabaseSession?.access_token) {
        try {
          await supabase.auth.setSession({
            access_token: data.supabaseSession.access_token,
            refresh_token: data.supabaseSession.refresh_token
          });
        } catch (e) { /* non-blocking */ }
      }

      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const register = async (payload) => {
    setAuthError(null);
    try {
      const data = await api.register(payload);
      setUser(data.user);
      setOrg(data.org);
      setToken(data.token);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const acceptInvite = async (payload) => {
    setAuthError(null);
    try {
      const data = await api.acceptInvite(payload);
      setUser(data.user);
      setOrg(data.org);
      setToken(data.token);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setOrg(null);
    setSession(null);
    setIsProfileOpen(false);
  };

  const switchPersona = (personaId) => {
    const target = personas.find(p => p.id === personaId);
    if (!target) return;

    setUser(prev => ({
      ...prev,
      name: target.name,
      role: target.role,
      phone: target.phone,
      permissions: target.permissions
    }));
  };

  // RBAC Permission checking helper
  const can = (permissionKey) => {
    if (!user) return false;
    if (user.role === 'owner') return true;
    return Boolean(user.permissions && user.permissions[permissionKey]);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        org,
        token,
        loading,
        authError,
        isProfileOpen,
        setIsProfileOpen,
        login,
        sendOtp,
        verifyOtp,
        register,
        acceptInvite,
        signOut,
        personas,
        switchPersona,
        can
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
