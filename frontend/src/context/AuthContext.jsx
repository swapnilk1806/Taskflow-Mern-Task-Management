import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, registerUser } from '../api/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem('taskflow_token');
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    const token = window.sessionStorage.getItem('taskflow_token');
    if (!token) {
      setLoading(false);
      return () => { active = false; };
    }

    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        window.sessionStorage.removeItem('taskflow_token');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    window.addEventListener('taskflow:unauthorized', logout);
    return () => window.removeEventListener('taskflow:unauthorized', logout);
  }, [logout]);

  const acceptSession = useCallback((session) => {
    window.sessionStorage.setItem('taskflow_token', session.token);
    setUser(session.user);
  }, []);

  const login = useCallback(async (credentials) => {
    const session = await loginUser(credentials);
    acceptSession(session);
  }, [acceptSession]);

  const register = useCallback(async (details) => {
    const session = await registerUser(details);
    acceptSession(session);
  }, [acceptSession]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
