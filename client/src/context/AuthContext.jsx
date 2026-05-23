import { createContext, useContext, useMemo, useState } from 'react';
import http from '../api/http';

const AuthContext = createContext(null);

function getStoredUser() {
  const raw = localStorage.getItem('user');
  if (!raw || raw === 'undefined' || raw === 'null') return null;

  try {
    return JSON.parse(raw);
  } catch (_error) {
    localStorage.removeItem('user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const login = async (email, password) => {
    const res = await http.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
