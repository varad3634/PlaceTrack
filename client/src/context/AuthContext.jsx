import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('placetrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('placetrack_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify token and fetch fresh user profile on startup
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('placetrack_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('placetrack_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session validation error:', err);
          logout(false);
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('placetrack_token', receivedToken);
        localStorage.setItem('placetrack_user', JSON.stringify(receivedUser));
        toast.success(`Welcome back, ${receivedUser.name}!`);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please verify credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = (notify = true) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('placetrack_token');
    localStorage.removeItem('placetrack_user');
    if (notify) {
      toast.success('Signed out successfully.');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('placetrack_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isTpo: user?.role === 'tpo',
    isStudent: user?.role === 'student',
    canManage: user?.role === 'admin' || user?.role === 'tpo',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
