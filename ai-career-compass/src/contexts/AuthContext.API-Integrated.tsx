import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  joinDate: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      return null;
    }
  });

  const [tokens, setTokens] = useState<AuthTokens | null>(() => {
    try {
      const saved = localStorage.getItem('tokens');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading tokens from localStorage:', error);
      return null;
    }
  });

  // Auto-refresh token before it expires
  useEffect(() => {
    if (!tokens?.refresh) return;

    // Refresh token every 4 minutes (tokens typically expire in 5 minutes)
    const interval = setInterval(() => {
      refreshAccessToken().catch(err => {
        console.error('Token refresh failed:', err);
      });
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tokens?.refresh]);

  // Refresh access token using refresh token
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!tokens?.refresh) return false;

    try {
      const response = await fetch(`${API_URL}/users/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: tokens.refresh,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newTokens = {
        access: data.access,
        refresh: tokens.refresh,
      };

      setTokens(newTokens);
      localStorage.setItem('tokens', JSON.stringify(newTokens));
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    // Validate input
    if (!email || !password || !name) {
      return { success: false, error: 'All fields are required' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    try {
      const response = await fetch(`${API_URL}/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: data.email?.[0] || data.password?.[0] || data.name?.[0] || 'Registration failed' 
        };
      }

      // Save user and tokens
      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        joinDate: new Date(data.user.created_at).toLocaleDateString(),
      };

      const tokenData: AuthTokens = {
        access: data.tokens.access,
        refresh: data.tokens.refresh,
      };

      setUser(userData);
      setTokens(tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokens', JSON.stringify(tokenData));

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Validate input
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    try {
      const response = await fetch(`${API_URL}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: data.detail || 'Invalid email or password' 
        };
      }

      // Get user profile with the access token
      const profileResponse = await fetch(`${API_URL}/users/profile/`, {
        headers: {
          'Authorization': `Bearer ${data.access}`,
        },
      });

      if (!profileResponse.ok) {
        return { success: false, error: 'Failed to fetch user profile' };
      }

      const profileData = await profileResponse.json();

      // Save user and tokens
      const userData: User = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        joinDate: new Date(profileData.created_at).toLocaleDateString(),
      };

      const tokenData: AuthTokens = {
        access: data.access,
        refresh: data.refresh,
      };

      setUser(userData);
      setTokens(tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokens', JSON.stringify(tokenData));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
  };

  return (
    <AuthContext.Provider value={{ user, tokens, login, signup, logout, isAuthenticated: !!user, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
