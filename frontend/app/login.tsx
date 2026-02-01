import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Handle session_id on web after redirect
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      
      if (hash.includes('session_id=') || search.includes('session_id=')) {
        // Session will be processed by AuthContext
        console.log('Session ID detected, processing...');
      }
    }
  }, []);

  useEffect(() => {
    // Redirect to home if already authenticated
    if (user) {
      router.replace('/(tabs)/home');
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Método Isabela Ansanello</Text>
        <Text style={styles.subtitle}>Desafio 21 Dias</Text>
        <Text style={styles.description}>
          Transformação Integral • Corpo • Mente • Espírito
        </Text>
        <Text style={styles.tagline}>
          Um caminho consciente de autocuidado,{"\n"}
          disciplina amorosa e expansão espiritual
        </Text>

        <TouchableOpacity style={styles.loginButton} onPress={login}>
          <Text style={styles.loginButtonText}>Entrar com Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#388E3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});