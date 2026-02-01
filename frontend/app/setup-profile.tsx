import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../services/api';

export default function SetupProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    age: '',
    weight: '',
    height: '',
    waist: '',
    hip: '',
    chest: '',
  });
  const [imc, setImc] = useState<number | null>(null);
  const [imcStatus, setImcStatus] = useState('');

  const calculateIMC = (weight: string, height: string) => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // convert cm to m
    
    if (w > 0 && h > 0) {
      const imcValue = w / (h * h);
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
    } else {
      setImc(null);
      setImcStatus('');
    }
  };

  const handleWeightChange = (text: string) => {
    setProfile({ ...profile, weight: text });
    calculateIMC(text, profile.height);
  };

  const handleHeightChange = (text: string) => {
    setProfile({ ...profile, height: text });
    calculateIMC(profile.weight, text);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Convert strings to numbers
      const profileData = {
        age: profile.age ? parseInt(profile.age) : undefined,
        weight: profile.weight ? parseFloat(profile.weight) : undefined,
        height: profile.height ? parseFloat(profile.height) : undefined,
        waist: profile.waist ? parseFloat(profile.waist) : undefined,
        hip: profile.hip ? parseFloat(profile.hip) : undefined,
        chest: profile.chest ? parseFloat(profile.chest) : undefined,
      };

      await api.updateUserProfile(profileData);
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Seu Perfil</Text>
          <Text style={styles.subtitle}>
            Essas informações nos ajudam a calcular suas calorias e acompanhar seu progresso
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Idade (anos)</Text>
            <TextInput
              style={styles.input}
              value={profile.age}
              onChangeText={(text) => setProfile({ ...profile, age: text })}
              keyboardType="numeric"
              placeholder="Ex: 25"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                value={profile.weight}
                onChangeText={handleWeightChange}
                keyboardType="decimal-pad"
                placeholder="Ex: 70.5"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Altura (cm)</Text>
              <TextInput
                style={styles.input}
                value={profile.height}
                onChangeText={handleHeightChange}
                keyboardType="numeric"
                placeholder="Ex: 165"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {imc && (
            <View style={styles.imcCard}>
              <Text style={styles.imcLabel}>Seu IMC:</Text>
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

          <Text style={styles.sectionTitle}>Medidas (opcional)</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Cintura (cm)</Text>
              <TextInput
                style={styles.input}
                value={profile.waist}
                onChangeText={(text) => setProfile({ ...profile, waist: text })}
                keyboardType="decimal-pad"
                placeholder="Ex: 75"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Quadril (cm)</Text>
              <TextInput
                style={styles.input}
                value={profile.hip}
                onChangeText={(text) => setProfile({ ...profile, hip: text })}
                keyboardType="decimal-pad"
                placeholder="Ex: 95"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Busto (cm)</Text>
            <TextInput
              style={styles.input}
              value={profile.chest}
              onChangeText={(text) => setProfile({ ...profile, chest: text })}
              keyboardType="decimal-pad"
              placeholder="Ex: 90"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Salvando...' : 'Continuar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Pular por enquanto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#999',
    fontSize: 14,
  },
  imcCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  imcLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  imcValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  imcStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  imcLow: {
    color: '#FF9800',
  },
  imcNormal: {
    color: '#4CAF50',
  },
  imcOverweight: {
    color: '#FF9800',
  },
  imcObese: {
    color: '#F44336',
  },
});
