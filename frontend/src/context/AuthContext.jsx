import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/react';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const {
    isLoaded,
    isSignedIn,
    getToken,
    signOut: clerkSignOut,
  } = useClerkAuth();

  const { user: clerkUser } = useUser();

  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      if (!isSignedIn && !clerkUser) {
        setAuthToken(null);
        setUser(null);
        setOrg(null);
        setAuthError(null);
        return null;
      }

      const token = await getToken();
      if (!token) return null;
      setAuthToken(token);

      const data = await api.getMe();
      if (data?.user) {
        setUser(data.user);
        setOrg(data.org);
        setAuthError(null);
        return data;
      }
      return null;
    } catch (error) {
      console.warn('[Auth refresh notice]:', error.message);
      // Keep the Clerk token for authenticated onboarding requests if not onboarded.
      setUser(null);
      setOrg(null);
      setAuthError(error.message || 'Authentication failed.');
      return null;
    }
  }, [isSignedIn, clerkUser, getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    const initialize = async () => {
      try {
        if (isSignedIn || clerkUser) {
          await refresh();
        } else {
          setUser(null);
          setOrg(null);
        }
      } catch (error) {
        console.error('[Auth] Refresh failed', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, clerkUser?.id, refresh]);


  const onboardBusiness = async (businessName) => {
    const token = await getToken({ skipCache: true });
    if (!token) throw new Error('Your sign-in session is not ready. Please refresh and try again.');
    setAuthToken(token);
    const data = await api.onboardBusiness(businessName);
    setUser(data.user);
    setOrg(data.org);
    setAuthError(null);
    return data;
  };

  const completeInvitation = async (inviteCode) => {
    const token = await getToken({ skipCache: true });
    if (!token) throw new Error('Your sign-in session is not ready. Please refresh and try again.');
    setAuthToken(token);
    const data = await api.completeInvitation(inviteCode);
    setUser(data.user);
    setOrg(data.org);
    setAuthError(null);
    return data;
  };

  const signOut = async () => {
    setAuthToken(null);
    setUser(null);
    setOrg(null);
    setIsProfileOpen(false);
    await clerkSignOut();
  };

  const can = (key) =>
    user?.role === 'owner' || Boolean(user?.permissions?.[key]);

  return (
    <AuthContext.Provider
      value={{
        user,
        org,
        clerkUser,
        loading,
        authError,
        isProfileOpen,
        setIsProfileOpen,
        refresh,
        onboardBusiness,
        completeInvitation,
        signOut,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
