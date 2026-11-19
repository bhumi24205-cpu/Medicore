import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medicore_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('medicore_token');
    if (token) {
      api.get('/auth/me')
        .then(u => {
          setUser(u);
          localStorage.setItem('medicore_user', JSON.stringify(u));
        })
        .catch(() => {
          localStorage.removeItem('medicore_token');
          localStorage.removeItem('medicore_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    localStorage.setItem('medicore_token', data.token);
    localStorage.setItem('medicore_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('medicore_token');
    localStorage.removeItem('medicore_user');
    setUser(null);
  };

  // Switch demo account directly
  const switchDemoRole = async (username) => {
    return login(username, 'password123');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchDemoRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
