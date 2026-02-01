import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

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
    // Check if user is activated
    if (!user.is_active) {
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
