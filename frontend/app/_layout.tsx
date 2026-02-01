import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="setup-profile" options={{ headerShown: true, title: 'Configure seu Perfil' }} />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}