import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useClerkAuth, useUser } from '@clerk/react';
import { api, createIdempotencyKey, setAuthToken, setTokenGetter } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const {
    isLoaded,
    isSignedIn,
    sessionId,
    getToken,
    signOut: clerkSignOut,
  } = useClerkAuth();

  const { user: clerkUser } = useUser();

  useEffect(() => {
    if (typeof getToken === 'function') {
      setTokenGetter(getToken);
    }
  }, [getToken]);

  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [checkedSession, setCheckedSession] = useState(null);
  const [checking, setChecking] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [workspaceRequired, setWorkspaceRequired] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const requestVersion = useRef(0);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !sessionId) return null;
    const version = ++requestVersion.current;
    setChecking(true);
    setWorkspaceRequired(false);
    try {
      const token = await getToken();
      if (version !== requestVersion.current) return null;
      if (!token) throw new Error('Your sign-in session is not ready.');
      setAuthToken(token);
      const data = await api.getMe();
      if (version !== requestVersion.current) return null;
      if (!data?.user) throw new Error('Could not load your workspace.');
      setUser(data.user);
      setOrg(data.org);
      setAuthError(null);
      return data;
    } catch (error) {
      if (version !== requestVersion.current) return null;
      setUser(null);
      setOrg(null);
      const needsWorkspace = error.code === 'WORKSPACE_REQUIRED';
      setWorkspaceRequired(needsWorkspace);
      setAuthError(needsWorkspace ? null : error.message);
      return null;
    } finally {
      if (version === requestVersion.current) {
        setCheckedSession(sessionId);
        setChecking(false);
      }
    }
  }, [isLoaded, isSignedIn, sessionId, getToken]);

  useEffect(() => {
    if (!isLoaded || signingOut) return;
    if (isSignedIn) {
      refresh();
    } else {
      setAuthToken(null);
      setUser(null);
      setOrg(null);
      setCheckedSession(null);
      setWorkspaceRequired(false);
      setChecking(false);
      setAuthError(null);
    }
    return () => { requestVersion.current++; };
  }, [isLoaded, isSignedIn, signingOut, refresh]);

  const loading = !isLoaded || Boolean(isSignedIn &&
    (checkedSession !== sessionId || checking || !clerkUser));

  const onboardBusiness = async (businessName) => {
    const token = await getToken({ skipCache: true });
    if (!token) throw new Error('Your sign-in session is not ready. Please refresh and try again.');
    setAuthToken(token);
    const data = await api.onboardBusiness(businessName, createIdempotencyKey());
    setUser(data.user);
    setOrg(data.org);
    setAuthError(null);
    return data;
  };

  const completeInvitation = useCallback(async (inviteCode) => {
    const token = await getToken({ skipCache: true });
    if (!token) throw new Error('Your sign-in session is not ready. Please refresh and try again.');
    setAuthToken(token);
    const data = await api.completeInvitation(inviteCode, createIdempotencyKey());
    setUser(data.user);
    setOrg(data.org);
    setAuthError(null);
    return data;
  }, [getToken]);

  const signOut = async () => {
    if (signingOut) return;
    requestVersion.current++;
    setSigningOut(true);
    try {
      await clerkSignOut();
      setAuthToken(null);
      setUser(null);
      setOrg(null);
      setIsProfileOpen(false);
      navigate('/', { replace: true });
    } catch (error) {
      setAuthError(error.message || 'Could not sign out. Try again.');
      setSigningOut(false);
    }
  };

  const syncMemberPermissions = useCallback((member) => {
    setUser(previous => previous?.id === member.id
      ? { ...previous, permissions: member.permissions }
      : previous);
  }, []);

  const can = (key) =>
    user?.role === 'owner' || Boolean(user?.permissions?.[key]);

  return (
    <AuthContext.Provider
      value={{
        user: isSignedIn && checkedSession === sessionId ? user : null,
        org: isSignedIn && checkedSession === sessionId ? org : null,
        clerkUser: isSignedIn ? clerkUser : null,
        loading,
        isSignedIn,
        signingOut,
        workspaceRequired: isSignedIn && checkedSession === sessionId && workspaceRequired,
        authError,
        isProfileOpen,
        setIsProfileOpen,
        refresh,
        onboardBusiness,
        completeInvitation,
        signOut,
        can,
        syncMemberPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);