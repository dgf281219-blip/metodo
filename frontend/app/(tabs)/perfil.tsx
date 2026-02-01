import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [profile, setProfile] = useState({
    age: '',
    weight: '',
    height: '',
    waist: '',
    hip: '',
    chest: '',
  });
  const [goals, setGoals] = useState({
    meta_principal: '',
    desejo_transformar: '',
    sentimento_desejado: '',
    compromisso: '',
  });
  const [imc, setImc] = useState<number | null>(null);
  const [imcStatus, setImcStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userProfile, userGoals] = await Promise.all([
        api.getMe(),
        api.getUserGoals(),
      ]);

      if (userProfile.weight && userProfile.height) {
        calculateIMC(userProfile.weight, userProfile.height / 100);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const calculateIMC = (weight: number, heightInMeters: number) => {
    if (weight > 0 && heightInMeters > 0) {
      const imcValue = weight / (heightInMeters * heightInMeters);
      setImc(imcValue);
      
      if (imcValue < 18.5) {
        setImcStatus('Abaixo do peso');
      } else if (imcValue >= 18.5 && imcValue < 25) {
        setImcStatus('Peso normal');
      } else if (imcValue >= 25 && imcValue < 30) {
        setImcStatus('Sobrepeso');
      } else {
        setImcStatus('Obesidade');
      }
    }
  };

  const handleOpenProfile = () => {
    if (user) {
      setProfile({
        age: user.age?.toString() || '',
        weight: user.weight?.toString() || '',
        height: user.height?.toString() || '',
        waist: user.waist?.toString() || '',
        hip: user.hip?.toString() || '',
        chest: user.chest?.toString() || '',
      });
    }
    setProfileModalVisible(true);
  };

  const handleOpenGoals = async () => {
    try {
      const userGoals = await api.getUserGoals();
      if (userGoals) {
        setGoals(userGoals);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
    setGoalsModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      const profileData = {
        age: profile.age ? parseInt(profile.age) : undefined,
        weight: profile.weight ? parseFloat(profile.weight) : undefined,
        height: profile.height ? parseFloat(profile.height) : undefined,
        waist: profile.waist ? parseFloat(profile.waist) : undefined,
        hip: profile.hip ? parseFloat(profile.hip) : undefined,
        chest: profile.chest ? parseFloat(profile.chest) : undefined,
      };

      await api.updateUserProfile(profileData);
      setProfileModalVisible(false);
      loadData();
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Erro ao salvar perfil');
    }
  };

  const handleSaveGoals = async () => {
    try {
      await api.createUserGoals(goals);
      setGoalsModalVisible(false);
      alert('Metas salvas com sucesso!');
    } catch (error) {
      console.error('Failed to save goals:', error);
      alert('Erro ao salvar metas');
    }
  };

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

      {/* IMC Card */}
      {imc && (
        <View style={styles.imcCard}>
          <Text style={styles.imcLabel}>Seu IMC</Text>
          <Text style={styles.imcValue}>{imc.toFixed(1)}</Text>
          <Text style={[
            styles.imcStatus,
            imc < 18.5 ? styles.imcLow :
            imc < 25 ? styles.imcNormal :
            imc < 30 ? styles.imcOverweight :
            styles.imcObese
          ]}>
            {imcStatus}
          </Text>
        </View>
      )}

      {/* User Info */}
      <View style={styles.section}>
        {user?.age && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#666" />
            <Text style={styles.infoText}>{user.age} anos</Text>
          </View>
        )}
        {user?.weight && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="scale-bathroom" size={20} color="#666" />
            <Text style={styles.infoText}>{user.weight} kg</Text>
          </View>
        )}
        {user?.height && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="human-male-height" size={20} color="#666" />
            <Text style={styles.infoText}>{user.height} cm</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={handleOpenProfile}>
          <MaterialCommunityIcons name="account-edit" size={24} color="#4CAF50" />
          <Text style={styles.menuText}>Editar Perfil</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleOpenGoals}>
          <MaterialCommunityIcons name="target" size={24} color="#2196F3" />
          <Text style={styles.menuText}>Minhas Metas</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/metodo')}>
          <MaterialCommunityIcons name="chart-line" size={24} color="#FF9800" />
          <Text style={styles.menuText}>Histórico de Progresso</Text>
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

      {/* Modal de Editar Perfil */}
      <Modal visible={profileModalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Idade"
              value={profile.age}
              onChangeText={(text) => setProfile({ ...profile, age: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Peso (kg)"
              value={profile.weight}
              onChangeText={(text) => setProfile({ ...profile, weight: text })}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Altura (cm)"
              value={profile.height}
              onChangeText={(text) => setProfile({ ...profile, height: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Cintura (cm)"
              value={profile.waist}
              onChangeText={(text) => setProfile({ ...profile, waist: text })}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Quadril (cm)"
              value={profile.hip}
              onChangeText={(text) => setProfile({ ...profile, hip: text })}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Busto (cm)"
              value={profile.chest}
              onChangeText={(text) => setProfile({ ...profile, chest: text })}
              keyboardType="decimal-pad"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      {/* Modal de Metas */}
      <Modal visible={goalsModalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Minhas Metas</Text>
            <TouchableOpacity onPress={() => setGoalsModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Meta principal"
              value={goals.meta_principal}
              onChangeText={(text) => setGoals({ ...goals, meta_principal: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="O que desejo transformar?"
              value={goals.desejo_transformar}
              onChangeText={(text) => setGoals({ ...goals, desejo_transformar: text })}
              multiline
              numberOfLines={4}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Como quero me sentir?"
              value={goals.sentimento_desejado}
              onChangeText={(text) => setGoals({ ...goals, sentimento_desejado: text })}
              multiline
              numberOfLines={4}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Compromisso comigo mesma"
              value={goals.compromisso}
              onChangeText={(text) => setGoals({ ...goals, compromisso: text })}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveGoals}>
              <Text style={styles.saveButtonText}>Salvar Metas</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
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
  imcCard: { backgroundColor: '#FFF', margin: 16, padding: 20, borderRadius: 12, alignItems: 'center', elevation: 2 },
  imcLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  imcValue: { fontSize: 36, fontWeight: 'bold', color: '#2E7D32', marginBottom: 4 },
  imcStatus: { fontSize: 18, fontWeight: '600' },
  imcLow: { color: '#FF9800' },
  imcNormal: { color: '#4CAF50' },
  imcOverweight: { color: '#FF9800' },
  imcObese: { color: '#F44336' },
  section: { backgroundColor: '#FFF', marginTop: 16, paddingVertical: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  infoText: { fontSize: 16, color: '#333' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuText: { flex: 1, fontSize: 16, color: '#333', marginLeft: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  logoutText: { fontSize: 16, color: '#F44336', marginLeft: 16, fontWeight: '600' },
  footer: { padding: 32, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#999', marginBottom: 4 },
  footerSubtext: { fontSize: 12, color: '#BBB' },
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 20, fontWeight: '600' },
  modalContent: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
