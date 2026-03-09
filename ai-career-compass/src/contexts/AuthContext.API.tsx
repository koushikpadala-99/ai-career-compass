// AuthContext with API Integration
// Replace the existing AuthContext.tsx with this file
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authAPI } from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  joinDate: string;
  points: number;
  level: number;
  streak: number;
  tasksCompleted: number;
  studyHours: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const profile = await authAPI.getProfile();
          setUser({
            id: profile.id,
            name: profile.username,
            email: profile.email,
            username: profile.username,
            joinDate: profile.join_date,
            points: profile.points,
            level: profile.level,
            streak: profile.streak,
            tasksCompleted: profile.tasks_completed,
            studyHours: profile.study_hours,
          });
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(username, email, password);
      
      // Store tokens
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      
      // Set user
      setUser({
        id: response.user.id,
        name: response.user.username,
        email: response.user.email,
        username: response.user.username,
        joinDate: response.user.join_date,
        points: response.user.points,
        level: response.user.level,
        streak: response.user.streak,
        tasksCompleted: response.user.tasks_completed,
        studyHours: response.user.study_hours,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      // Store tokens
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Load user profile
      const profile = await authAPI.getProfile();
      setUser({
        id: profile.id,
        name: profile.username,
        email: profile.email,
        username: profile.username,
        joinDate: profile.join_date,
        points: profile.points,
        level: profile.level,
        streak: profile.streak,
        tasksCompleted: profile.tasks_completed,
        studyHours: profile.study_hours,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
