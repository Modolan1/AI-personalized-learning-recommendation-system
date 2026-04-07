import { createContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('pls_user');
    const token = localStorage.getItem('pls_token');
    if (savedUser && token) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await authService.login({ email, password });
    const nextUser = result.data.user;
    const token = result.data.token;
    setUser(nextUser);
    localStorage.setItem('pls_user', JSON.stringify(nextUser));
    localStorage.setItem('pls_token', token);
    return nextUser;
  };

  const register = async (payload) => {
    const result = await authService.register(payload);
    const nextUser = result.data.user;
    const token = result.data.token;
    setUser(nextUser);
    localStorage.setItem('pls_user', JSON.stringify(nextUser));
    localStorage.setItem('pls_token', token);
    return nextUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pls_user');
    localStorage.removeItem('pls_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
