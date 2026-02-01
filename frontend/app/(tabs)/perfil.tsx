import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function PerfilScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {user?.picture ? (
          <Image source={{ uri: user.picture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons name="account" size={60} color="#FFF" />
          </View>
        )}
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="target" size={24} color="#4CAF50" />
          <Text style={styles.menuText}>Minhas Metas</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="chart-line" size={24} color="#2196F3" />
          <Text style={styles.menuText}>Histórico de Progresso</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="cog" size={24} color="#FF9800" />
          <Text style={styles.menuText}>Configurações</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={24} color="#F44336" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Método Isabela Ansanello</Text>
        <Text style={styles.footerSubtext}>Versão 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#4CAF50', padding: 32, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#81C784', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  email: { fontSize: 14, color: '#E8F5E9' },
  section: { backgroundColor: '#FFF', marginTop: 16, paddingVertical: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuText: { flex: 1, fontSize: 16, color: '#333', marginLeft: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  logoutText: { fontSize: 16, color: '#F44336', marginLeft: 16, fontWeight: '600' },
  footer: { padding: 32, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#999', marginBottom: 4 },
  footerSubtext: { fontSize: 12, color: '#BBB' },
});