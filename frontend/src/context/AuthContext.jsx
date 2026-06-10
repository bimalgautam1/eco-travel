import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AuthContext = createContext(null);

const TOKEN_KEY = 'ecoroute_token';
const USER_KEY  = 'ecoroute_user';
const POLL_INTERVAL_MS = 4 * 60 * 1000; // 4 min – transaction poller

function getStoredAuth() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user  = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const { token: storedToken, user: storedUser } = getStoredAuth();

  const [token, setToken]       = useState(storedToken);
  const [user, setUser]         = useState(storedUser);
  const [loading, setLoading]   = useState(!!storedToken); // true only on initial hydration
  const [authError, setAuthError] = useState('');

  const pollTimerRef = useRef(null);

  // ─── Axios instance with auth header ──────────────────────────────────────
  const authApi = axios.create({ baseURL: API_URL });
  authApi.interceptors.request.use((config) => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
  });

  // ─── Persist helpers ──────────────────────────────────────────────────────
  const persistAuth = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
  }, []);

  // ─── Transaction Poller – validates token server-side on an interval ──────
  const pollSession = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return;
    try {
      const res = await authApi.get('/api/auth/me');
      // Refresh user data from server
      setUser(res.data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    } catch (err) {
      if (err.response?.status === 401) {
        clearAuth();
      }
      // On network errors we keep the session alive (offline-tolerant)
    }
  }, [clearAuth]);

  const startPoller = useCallback(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(pollSession, POLL_INTERVAL_MS);
  }, [pollSession]);

  // ─── Hydrate session on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!storedToken) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await authApi.get('/api/auth/me');
        setUser(res.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        startPoller();
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auth actions ─────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    setAuthError('');
    const res = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
    persistAuth(res.data.token, res.data.user);
    startPoller();
    return res.data;
  }, [persistAuth, startPoller]);

  const login = useCallback(async (email, password) => {
    setAuthError('');
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    persistAuth(res.data.token, res.data.user);
    startPoller();
    return res.data;
  }, [persistAuth, startPoller]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ token, user, loading, authError, setAuthError, register, login, logout, refreshUser: pollSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
