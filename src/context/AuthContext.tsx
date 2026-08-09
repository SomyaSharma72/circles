import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';
import { joinUserRoom } from '../services/socket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('neighborly_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    let storedToken = localStorage.getItem('neighborly_token');
    
    if (!storedToken) {
      try {
        const demoRes = await api.post('/auth/login', { email: 'priya@neighborly.app', password: 'password123' });
        if (demoRes.data?.token && demoRes.data?.user) {
          storedToken = demoRes.data.token;
          localStorage.setItem('neighborly_token', storedToken);
          setToken(storedToken);
          setUser(demoRes.data.user);
          joinUserRoom(demoRes.data.user.id);
          setLoading(false);
          return;
        }
      } catch (dErr) {
        console.warn('Auto demo login notice:', dErr);
      }
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        joinUserRoom(res.data.user.id);
      }
    } catch (err) {
      console.warn('Session check failed, clearing token:', err);
      localStorage.removeItem('neighborly_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const loginUser = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('neighborly_token', newToken);
    setToken(newToken);
    setUser(newUser);
    joinUserRoom(newUser.id);
  };

  const signupUser = async (signupData: any) => {
    const res = await api.post('/auth/signup', signupData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('neighborly_token', newToken);
    setToken(newToken);
    setUser(newUser);
    joinUserRoom(newUser.id);
  };

  const logoutUser = () => {
    localStorage.removeItem('neighborly_token');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (profileData: any) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data?.user) {
      setUser(res.data.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: loginUser,
        signup: signupUser,
        logout: logoutUser,
        updateProfile: updateUserProfile,
        refreshUser: fetchCurrentUser,
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
