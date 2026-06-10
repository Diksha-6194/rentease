import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const profile = await authService.getProfile();
      setUser(profile);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    await authService.login(email, password);
    const profile = await authService.getProfile();
    setUser(profile);
    return profile;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
