import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/user';

type FetchInit = RequestInit & { retry?: boolean };

// User authentication context and provider
type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => Promise<void>;
  loading: boolean;
  // new helper: use this for API calls that require auth; it will refresh tokens & retry automatically
  fetchWithAuth: (input: RequestInfo, init?: FetchInit) => Promise<Response>;
};
// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshTimerRef = useRef<number | null>(null);
  const refreshingPromiseRef = useRef<Promise<boolean> | null>(null);

  // ref to hold the latest doRefresh so schedule callbacks always call the current function
  const doRefreshRef = useRef<(() => Promise<boolean>) | null>(null);

  const apiBase = import.meta.env.VITE_API_URL || '';

  // helper to decode JWT exp (seconds)
  const getTokenExp = (token: string | null): number | null => {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
      const json = JSON.parse(window.atob(b64 + pad));
      return typeof json.exp === 'number' ? json.exp : null;
    } catch {
      return null;
    }
  };

  // schedule a refresh a short time before expiry
  const scheduleRefresh = useCallback((token: string | null) => {
    // clear any previous timer
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    const exp = getTokenExp(token);
    if (!exp) return;
    const now = Math.floor(Date.now() / 1000);
    // refresh a minute before expiry or at 20% of remaining time, whichever is smaller, but at least 5s ahead
    const secondsUntilExp = Math.max(0, exp - now);
    const refreshBefore = Math.min(60, Math.max(5, Math.floor(secondsUntilExp * 0.2)));
    const ms = Math.max(1000, (secondsUntilExp - refreshBefore) * 1000);
    // schedule only if expiry in future
    if (ms > 0) {
      refreshTimerRef.current = window.setTimeout(() => {
        // call doRefresh but ignore result (background)
        doRefresh().catch(() => {});
      }, ms);
    }
  }, []);

  // Perform refresh; single-flight via refreshingPromiseRef
  const doRefresh = useCallback(async (): Promise<boolean> => {
    if (refreshingPromiseRef.current) return refreshingPromiseRef.current;
    const p = (async () => {
      try {
        const res = await fetch(`${apiBase}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          // failed refresh
          setUserState(null);
          setAccessToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return false;
        }
        const json = await res.json();
        if (json.accessToken && json.user) {
          console.log('Token refreshed');
          setUserState(json.user);
          setAccessToken(json.accessToken);
          localStorage.setItem('token', json.accessToken);
          localStorage.setItem('user', JSON.stringify(json.user));
          scheduleRefresh(json.accessToken);
          return true;
        } else {
          setUserState(null);
          setAccessToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return false;
        }
      } catch (err) {
        console.error('Refresh error', err);
        setUserState(null);
        setAccessToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      } finally {
        // clear the single-flight holder after resolution
        refreshingPromiseRef.current = null;
      }
    })();
    refreshingPromiseRef.current = p;
    return p;
  }, [apiBase, scheduleRefresh]);

  // keep a ref pointing to the latest doRefresh implementation so scheduled timers can call it
  useEffect(() => {
    doRefreshRef.current = doRefresh;
    return () => { doRefreshRef.current = null; };
  }, [doRefresh]);

  // high-level fetch that injects Authorization and retries once after refresh when receiving 401
  const fetchWithAuth = useCallback(
    async (input: RequestInfo, init: FetchInit = {}): Promise<Response> => {
      // ensure we include credentials by default so refresh cookie works
      init.credentials = init.credentials ?? 'include';
      const makeRequest = async (token: string | null) => {
        const headers = new Headers(init.headers || {});
        if (token) headers.set('Authorization', `Bearer ${token}`);
        // merge headers into init
        const mergedInit: RequestInit = { ...init, headers };
        return fetch(input, mergedInit);
      };

      // first attempt with current token
      const token = accessToken || localStorage.getItem('token');
      let res = await makeRequest(token);
      if (res.status !== 401) return res;

      // got 401 -> try refresh (single-flight)
      const refreshed = await doRefresh();
      if (!refreshed) {
        // refresh failed; ensure logout state cleared
        // caller can inspect response and redirect to login
        return res;
      }

      // retry with new token
      const newToken = accessToken || localStorage.getItem('token');
      res = await makeRequest(newToken);
      return res;
    },
    [accessToken, doRefresh]
  );

  // On mount try initial refresh
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await doRefresh();
        // if doRefresh set token, schedule refresh already
      } catch (err) {
        console.error('Initial refresh failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [doRefresh]);

  const setUser = (u: User | null, token: string | null = null) => {
    setUserState(u);
    setAccessToken(token);
    if (token) {
      localStorage.setItem('token', token);
      scheduleRefresh(token);
    } else {
      // clear scheduled refresh
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      localStorage.removeItem('token');
    }
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      localStorage.removeItem('user');
    }
  };

  // Logout function, clears user and tokens
  const logout = async () => {
    try {
      await fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
      });
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      // clear local state and timers
      setUserState(null);
      setAccessToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      refreshingPromiseRef.current = null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        setUser,
        logout,
        loading,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};