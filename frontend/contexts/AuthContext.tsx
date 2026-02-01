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
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      // Check for session_id in URL (web redirect)
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const hash = window.location.hash;
        const search = window.location.search;
        
        let session_id = null;
        if (hash.includes('session_id=')) {
          session_id = hash.split('session_id=')[1].split('&')[0];
        } else if (search.includes('session_id=')) {
          session_id = search.split('session_id=')[1].split('&')[0];
        }

        if (session_id) {
          console.log('Processing session_id from URL...');
          await handleAuthRedirect(session_id);
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }

      // Check existing session
      await checkExistingSession();
    } catch (error) {
      console.error('Init auth error:', error);
      setLoading(false);
    }
  };

  const checkExistingSession = async () => {
    try {
      const token = await AsyncStorage.getItem('session_token');
      if (token) {
        setAuthToken(token);
        const userData = await api.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.log('No existing session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthRedirect = async (session_id: string) => {
    setLoading(true);
    try {
      console.log('Exchanging session_id for user data...');
      const response = await api.processSession(session_id);
      const { user: userData, session_token } = response;
      
      console.log('Session processed, saving token...');
      await AsyncStorage.setItem('session_token', session_token);
      setAuthToken(session_token);
      setUser(userData);
      console.log('User authenticated:', userData.email);
    } catch (error) {
      console.error('Failed to process session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      const redirectUrl = Platform.OS === 'web'
        ? `${window.location.origin}/`
        : Linking.createURL('/');

      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;

      console.log('Redirecting to auth...', authUrl);

      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        if (result.type === 'success' && result.url) {
          const session_id = extractSessionId(result.url);
          if (session_id) {
            await handleAuthRedirect(session_id);
          }
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const extractSessionId = (url: string): string | null => {
    if (url.includes('#session_id=')) {
      return url.split('#session_id=')[1].split('&')[0];
    } else if (url.includes('?session_id=')) {
      return url.split('?session_id=')[1].split('&')[0];
    }
    return null;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      await AsyncStorage.removeItem('session_token');
      setAuthToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};