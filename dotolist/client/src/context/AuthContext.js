import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('alwaysfront_user');
    const token = localStorage.getItem('alwaysfront_token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('alwaysfront_token', token);
      localStorage.setItem('alwaysfront_user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('alwaysfront_token', token);
      localStorage.setItem('alwaysfront_user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const googleAuth = async (token) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { token });
      const { token: authToken, user: userData } = res.data;
      
      localStorage.setItem('alwaysfront_token', authToken);
      localStorage.setItem('alwaysfront_user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Google authentication failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('alwaysfront_token');
    localStorage.removeItem('alwaysfront_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, updates);
      const updatedUser = res.data.data;
      setUser(updatedUser);
      localStorage.setItem('alwaysfront_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Profile update failed' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to send reset email' };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    googleAuth,
    logout,
    updateProfile,
    forgotPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
