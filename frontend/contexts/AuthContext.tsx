import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
    
    // Handle cold start (app opened from auth redirect)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleAuthRedirect(url);
      }
    });

    // Handle hot link (app already running)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthRedirect(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = await AsyncStorage.getItem('session_token');
      if (token) {
        setAuthToken(token);
        const userData = await api.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.log('No existing session');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthRedirect = async (url: string) => {
    // Parse session_id from URL (hash or query)
    let session_id = null;
    
    // Try hash first (#session_id=...)
    if (url.includes('#session_id=')) {
      session_id = url.split('#session_id=')[1].split('&')[0];
    }
    // Try query (?session_id=...)
    else if (url.includes('?session_id=')) {
      session_id = url.split('?session_id=')[1].split('&')[0];
    }

    if (session_id) {
      setLoading(true);
      try {
        const response = await api.processSession(session_id);
        const { user: userData, session_token } = response;
        
        // Store token
        await AsyncStorage.setItem('session_token', session_token);
        setAuthToken(session_token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to process session:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const login = async () => {
    try {
      // Get redirect URL based on platform
      const redirectUrl = Platform.OS === 'web'
        ? `${window.location.origin}/`
        : Linking.createURL('/');

      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;

      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        // Use WebBrowser for mobile
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === 'success' && result.url) {
          await handleAuthRedirect(result.url);
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      await AsyncStorage.removeItem('session_token');
      setAuthToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};