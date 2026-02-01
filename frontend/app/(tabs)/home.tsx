import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayData, setTodayData] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);

  // Reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const [dailyRecord, methodProgress, calories, activities] = await Promise.all([
        api.getDailyRecord(today),
        api.getMethodProgress(),
        api.getTodayCalories(),
        api.getTodayActivities(),
      ]);

      setTodayData({
        dailyRecord,
        calories,
        activities,
      });
      setProgress(methodProgress);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const calorieBalance = (todayData?.calories?.total_calories || 0) - (todayData?.activities?.total_calories_burned || 0);
  const totalDaysCompleted = progress?.total_days_completed || 0;
  const progressPercentage = (totalDaysCompleted / 21) * 100;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />}
    >
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]}!</Text>
        <Text style={styles.date}>{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</Text>
      </View>

      {/* Progresso do Desafio 21 Dias */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="calendar-check" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>Desafio 21 Dias</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Dia {totalDaysCompleted} de 21
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}% concluído</Text>
        </View>
        <TouchableOpacity style={styles.viewButton} onPress={() => router.push('/(tabs)/metodo')}>
          <Text style={styles.viewButtonText}>Ver Detalhes</Text>
        </TouchableOpacity>
      </View>

      {/* Balanço Calórico */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="scale-balance" size={24} color="#2196F3" />
          <Text style={styles.cardTitle}>Balanço Calórico Hoje</Text>
        </View>
        <View style={styles.calorieRow}>
          <View style={styles.calorieItem}>
            <MaterialCommunityIcons name="food-apple" size={20} color="#FF9800" />
            <Text style={styles.calorieLabel}>Consumidas</Text>
            <Text style={styles.calorieValue}>{todayData?.calories?.total_calories || 0}</Text>
          </View>
          <MaterialCommunityIcons name="minus" size={20} color="#999" />
          <View style={styles.calorieItem}>
            <MaterialCommunityIcons name="fire" size={20} color="#F44336" />
            <Text style={styles.calorieLabel}>Gastas</Text>
            <Text style={styles.calorieValue}>{todayData?.activities?.total_calories_burned || 0}</Text>
          </View>
          <MaterialCommunityIcons name="equal" size={20} color="#999" />
          <View style={styles.calorieItem}>
            <Text style={styles.calorieLabel}>Saldo</Text>
            <Text style={[styles.calorieValue, calorieBalance < 0 ? styles.negativeCal : styles.positiveCal]}>
              {calorieBalance}
            </Text>
          </View>
        </View>
      </View>

      {/* Checklist Diário */}
      {todayData?.dailyRecord && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#8BC34A" />
            <Text style={styles.cardTitle}>Práticas Diárias</Text>
          </View>
          <View style={styles.checklistContainer}>
            <ChecklistItem
              icon="water"
              label="Água 2L"
              checked={todayData.dailyRecord.praticas_diarias.agua_2l}
            />
            <ChecklistItem
              icon="run"
              label="Exercício"
              checked={todayData.dailyRecord.praticas_diarias.exercicio}
            />
            <ChecklistItem
              icon="meditation"
              label="Meditação"
              checked={todayData.dailyRecord.praticas_diarias.meditacao}
            />
            <ChecklistItem
              icon="stomach"
              label="Vácuo"
              checked={todayData.dailyRecord.praticas_diarias.vacuo}
            />
            <ChecklistItem
              icon="heart"
              label="Gratidão"
              checked={todayData.dailyRecord.praticas_diarias.gratidao}
            />
          </View>
        </View>
      )}

      {/* Atalhos Rápidos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Atalhos Rápidos</Text>
        <View style={styles.shortcutsContainer}>
          <TouchableOpacity style={styles.shortcut} onPress={() => router.push('/(tabs)/calorias')}>
            <MaterialCommunityIcons name="food-apple" size={32} color="#4CAF50" />
            <Text style={styles.shortcutText}>Adicionar{"\n"}Refeição</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcut} onPress={() => router.push('/(tabs)/atividades')}>
            <MaterialCommunityIcons name="run" size={32} color="#2196F3" />
            <Text style={styles.shortcutText}>Registrar{"\n"}Atividade</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcut} onPress={() => router.push('/(tabs)/metodo')}>
            <MaterialCommunityIcons name="calendar-check" size={32} color="#FF9800" />
            <Text style={styles.shortcutText}>Atualizar{"\n"}Checklist</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function ChecklistItem({ icon, label, checked }: { icon: any; label: string; checked: boolean }) {
  return (
    <View style={styles.checklistItem}>
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={checked ? '#4CAF50' : '#CCC'}
      />
      <Text style={[styles.checklistLabel, checked && styles.checklistLabelChecked]}>
        {label}
      </Text>
      <MaterialCommunityIcons
        name={checked ? 'check-circle' : 'circle-outline'}
        size={20}
        color={checked ? '#4CAF50' : '#CCC'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#E8F5E9',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
  },
  viewButton: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  calorieItem: {
    alignItems: 'center',
  },
  calorieLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  calorieValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  positiveCal: {
    color: '#F44336',
  },
  negativeCal: {
    color: '#4CAF50',
  },
  checklistContainer: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checklistLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  checklistLabelChecked: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  shortcutsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  shortcut: {
    alignItems: 'center',
    padding: 12,
  },
  shortcutText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});