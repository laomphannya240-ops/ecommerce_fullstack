import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  const persistAuth = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    if (nextToken) localStorage.setItem('token', nextToken);
    else localStorage.removeItem('token');
    if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser));
    else localStorage.removeItem('user');
  };

  const login = async (credentials) => {
    const { data } = await api.post('/login', credentials);
    const payload = data.data;
    persistAuth(payload.user, payload.token);
    return payload.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/register', payload);
    const result = data.data;
    persistAuth(result.user, result.token);
    return result.user;
  };

  const logout = async () => {
    try {
      if (token) await api.post('/logout');
    } catch {
      // ignore
    } finally {
      persistAuth(null, null);
    }
  };

  const refreshUser = async () => {
    if (!token) return null;
    try {
      setLoading(true);
      const { data } = await api.get('/user');
      persistAuth(data.data, token);
      return data.data;
    } catch {
      persistAuth(null, null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && !user) {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, isAuthenticated, isAdmin, login, register, logout, refreshUser, setUser: (u) => persistAuth(u, token) }),
    [user, token, loading, isAuthenticated, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
