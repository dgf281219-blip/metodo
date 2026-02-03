import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState('10');
  const [codes, setCodes] = useState<any[]>([]);
  const [allCodes, setAllCodes] = useState<any[]>([]);

  useEffect(() => {
    loadAllCodes();
  }, []);

  const loadAllCodes = async () => {
    try {
      const response = await api.listActivationCodes();
      setAllCodes(response.codes || []);
    } catch (error) {
      console.error('Erro ao carregar códigos:', error);
    }
  };

  const generateCodes = async () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1 || qty > 100) {
      Alert.alert('Erro', 'Quantidade deve ser entre 1 e 100');
      return;
    }

    setLoading(true);
    try {
      const response = await api.generateActivationCodes(qty);
      setCodes(response.codes);
      Alert.alert('Sucesso!', `${response.codes.length} códigos gerados!`);
      await loadAllCodes();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao gerar códigos');
    } finally {
      setLoading(false);
    }
  };

  const copyAllCodes = () => {
    const text = codes.join('\n');
    Clipboard.setString(text);
    Alert.alert('Copiado!', 'Todos os códigos foram copiados');
  };

  const copySingleCode = (code: string) => {
    Clipboard.setString(code);
    Alert.alert('Copiado!', code);
  };

  const unusedCodes = allCodes.filter(c => !c.is_used);
  const usedCodes = allCodes.filter(c => c.is_used);

  // Check if user is admin
  const ADMIN_EMAILS = [
    'dgf281219@gmail.com',
    'isabela@ansanello.com',
  ];
  
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  if (!isAdmin) {
    return (
      <View style={styles.notAdminContainer}>
        <MaterialCommunityIcons name="shield-alert" size={64} color="#F44336" />
        <Text style={styles.notAdminText}>Acesso Restrito</Text>
        <Text style={styles.notAdminSubtext}>Apenas administradores podem acessar esta área</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="shield-crown" size={32} color="#FFF" />
        <Text style={styles.headerTitle}>Painel Administrativo</Text>
        <Text style={styles.headerSubtitle}>Gerenciar Códigos de Ativação</Text>
      </View>

      {/* Gerar Novos Códigos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎫 Gerar Novos Códigos</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quantidade:</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="10"
            maxLength={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.generateButton, loading && styles.buttonDisabled]}
          onPress={generateCodes}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="plus-circle" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Gerar Códigos</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Códigos Gerados Recentemente */}
      {codes.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>✨ Códigos Recém-Gerados ({codes.length})</Text>
            <TouchableOpacity onPress={copyAllCodes} style={styles.copyAllButton}>
              <MaterialCommunityIcons name="content-copy" size={20} color="#4CAF50" />
              <Text style={styles.copyAllText}>Copiar Todos</Text>
            </TouchableOpacity>
          </View>

          {codes.map((code, index) => (
            <TouchableOpacity
              key={index}
              style={styles.codeItem}
              onPress={() => copySingleCode(code)}
            >
              <Text style={styles.codeText}>{code}</Text>
              <MaterialCommunityIcons name="content-copy" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{unusedCodes.length}</Text>
          <Text style={styles.statLabel}>Disponíveis</Text>
          <MaterialCommunityIcons name="ticket" size={24} color="#4CAF50" />
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{usedCodes.length}</Text>
          <Text style={styles.statLabel}>Utilizados</Text>
          <MaterialCommunityIcons name="check-circle" size={24} color="#2196F3" />
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{allCodes.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
          <MaterialCommunityIcons name="chart-box" size={24} color="#FF9800" />
        </View>
      </View>

      {/* Códigos Disponíveis */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🟢 Códigos Disponíveis ({unusedCodes.length})</Text>
        
        {unusedCodes.slice(0, 20).map((codeData, index) => (
          <TouchableOpacity
            key={index}
            style={styles.availableCodeItem}
            onPress={() => copySingleCode(codeData.code)}
          >
            <Text style={styles.availableCodeText}>{codeData.code}</Text>
            <MaterialCommunityIcons name="content-copy" size={18} color="#4CAF50" />
          </TouchableOpacity>
        ))}

        {unusedCodes.length > 20 && (
          <Text style={styles.moreText}>+ {unusedCodes.length - 20} códigos disponíveis</Text>
        )}
      </View>

      {/* Códigos Utilizados */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅ Códigos Utilizados ({usedCodes.length})</Text>
        
        {usedCodes.slice(0, 10).map((codeData, index) => (
          <View key={index} style={styles.usedCodeItem}>
            <View style={styles.usedCodeInfo}>
              <Text style={styles.usedCodeText}>{codeData.code}</Text>
              <Text style={styles.usedCodeEmail}>{codeData.used_by_email}</Text>
            </View>
            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
          </View>
        ))}

        {usedCodes.length > 10 && (
          <Text style={styles.moreText}>+ {usedCodes.length - 10} códigos utilizados</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>💡 Dica: Clique em qualquer código para copiar</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  notAdminContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F5',
  },
  notAdminText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  notAdminSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  copyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
  },
  copyAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  codeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  availableCodeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    marginBottom: 6,
  },
  availableCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    letterSpacing: 1,
  },
  usedCodeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    marginBottom: 6,
  },
  usedCodeInfo: {
    flex: 1,
  },
  usedCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
    marginBottom: 2,
  },
  usedCodeEmail: {
    fontSize: 12,
    color: '#999',
  },
  moreText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
