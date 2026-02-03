import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

// Emails que não precisam de código de ativação
const SUPER_ADMIN_EMAILS = [
  'dgf281219@gmail.com',
  'isabela@ansanello.com',
];

export default function Index() {
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Give auth context time to initialize
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (user) {
    // Super admins entram direto (não precisam de código)
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email);
    
    if (!isSuperAdmin && !user.is_active) {
      return <Redirect href="/activate" />;
    }
    
    // Check if user has completed profile setup
    if (!user.weight || !user.height) {
      return <Redirect href="/setup-profile" />;
    }
    
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});
