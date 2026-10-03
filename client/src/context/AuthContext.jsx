import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem('palette_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('palette_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.auth.getMe();
        if (res && res.user) {
          setUser(res.user);
        } else {
          setToken(null);
          setTokenState(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Auto login failed or token expired:', err.message);
        setToken(null);
        setTokenState(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (username, email, password) => {
    const res = await api.auth.register(username, email, password);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    setToken(null);
    setTokenState(null);
    setUser(null);
  };

  const updateProfile = async data => {
    const res = await api.auth.updateProfile(data);
    setUser(prev => ({ ...prev, ...res.user }));
    return res;
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.getMe();
      if (res && res.user) {
        setUser(res.user);
      }
    } catch (e) {
      // ignore
    }
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
