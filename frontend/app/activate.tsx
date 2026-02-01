import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';

export default function ActivateScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!code.trim()) {
      Alert.alert('Erro', 'Por favor, insira o código de ativação');
      return;
    }

    setLoading(true);
    try {
      await api.validateActivationCode(code.trim().toUpperCase());
      Alert.alert(
        'Sucesso!',
        'Código ativado com sucesso! Você já pode usar o aplicativo.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Código inválido ou já utilizado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Ative sua Conta</Text>
        <Text style={styles.subtitle}>
          Insira o código de ativação que você recebeu
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Código de Ativação</Text>
          <TextInput
            style={styles.input}
            placeholder="ISA-XXXX-XXXX-XXXX"
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            autoCapitalize="characters"
            maxLength={19}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleActivate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Ativar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={24} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Não tem um código?</Text>
            <Text style={styles.infoText}>
              Entre em contato com a Isabela Ansanello para receber seu código exclusivo de acesso ao aplicativo.
            </Text>
          </View>
        </View>

        <View style={styles.securityCard}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            Cada código é único e pessoal
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    maxWidth: 400,
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 20,
  },
  securityText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
});
