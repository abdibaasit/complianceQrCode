import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('compliance_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('compliance_token') || null);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlatformSettings = async () => {
    try {
      const res = await api.get('/public/settings');
      if (res.data.success && res.data.data) {
        setPlatformSettings(res.data.data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchPlatformSettings();
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.data.user) {
          const freshUser = res.data.data.user;
          setUser(freshUser);
          localStorage.setItem('compliance_user', JSON.stringify(freshUser));
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('compliance_token', newToken);
        localStorage.setItem('compliance_user', JSON.stringify(newUser));
        toast.success(`Welcome, ${newUser.fullName}!`);
        fetchPlatformSettings();
        return { success: true, user: newUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setToken(null);
    setUser(null);
    localStorage.removeItem('compliance_token');
    localStorage.removeItem('compliance_user');
    toast.success('Logged out successfully');
  };

  const isPlatformAdmin = user?.role === 'PLATFORM_ADMIN';
  const isOrgUser = user?.role === 'ORGANIZATION_USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isPlatformAdmin,
        isOrgUser,
        isAuthenticated: !!user && !!token,
        platformSettings,
        refreshPlatformSettings: fetchPlatformSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
