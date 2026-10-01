import { createContext, useState, useEffect, useCallback } from 'react';
import API, { clearAuthStorage } from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from current tab's sessionStorage on mount
  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('authToken') || localStorage.getItem('accessToken');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse user session', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (role, credentials) => {
    const { data } = await API.post(`/auth/${role}/login`, credentials);
    const { user: userData, accessToken, refreshToken } = data.data;

    // Store in tab-isolated sessionStorage
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('authToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);

    // Also store role-specific keys in sessionStorage
    sessionStorage.setItem(`${role}_user`, JSON.stringify(userData));
    sessionStorage.setItem(`${role}_accessToken`, accessToken);
    sessionStorage.setItem(`${role}_refreshToken`, refreshToken);

    // Fallback sync to localStorage for single-tab convenience
    localStorage.setItem(`${role}_user`, JSON.stringify(userData));
    localStorage.setItem(`${role}_accessToken`, accessToken);

    setUser(userData);
    return data;
  }, []);

  const register = useCallback(async (role, userData) => {
    const endpoint = role === 'vendor' ? '/auth/vendor/register' : '/auth/student/register';
    const { data } = await API.post(endpoint, userData);
    const { user: newUser, accessToken, refreshToken } = data.data;

    sessionStorage.setItem('user', JSON.stringify(newUser));
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('authToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);

    sessionStorage.setItem(`${role}_user`, JSON.stringify(newUser));
    sessionStorage.setItem(`${role}_accessToken`, accessToken);
    sessionStorage.setItem(`${role}_refreshToken`, refreshToken);

    localStorage.setItem(`${role}_user`, JSON.stringify(newUser));
    localStorage.setItem(`${role}_accessToken`, accessToken);

    setUser(newUser);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      // ignore logout errors
    }

    // Clear current tab's sessionStorage AND the role-scoped localStorage fallback keys
    clearAuthStorage();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData };
    sessionStorage.setItem('user', JSON.stringify(newUser));
    if (user?.role) {
      sessionStorage.setItem(`${user.role}_user`, JSON.stringify(newUser));
      localStorage.setItem(`${user.role}_user`, JSON.stringify(newUser));
    }
    setUser(newUser);
  }, [user]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isVendor: user?.role === 'vendor',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
