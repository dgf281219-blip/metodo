import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { Activity } from '../../types';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

export default function AtividadesScreen() {
  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [waterIntake, setWaterIntake] = useState(0);

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
      const [activitiesData, todayActivities, dailyRecord] = await Promise.all([
        api.getActivities(),
        api.getTodayActivities(),
        api.getDailyRecord(format(new Date(), 'yyyy-MM-dd')),
      ]);
      setActivities(activitiesData);
      setTodayData(todayActivities);
      setWaterIntake(dailyRecord?.water_intake || 0);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activity: Activity, duration: number, intensity: string) => {
    try {
      await api.addActivity({
        activity_id: activity.activity_id,
        duration,
        intensity,
      });
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

  const updateWater = async (amount: number) => {
    const newTotal = waterIntake + amount;
    setWaterIntake(newTotal);
    try {
      await api.updateWaterIntake(newTotal);
    } catch (error) {
      console.error('Failed to update water:', error);
      // Revert on error
      setWaterIntake(waterIntake);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.totalCard}>
          <MaterialCommunityIcons name="fire" size={32} color="#F44336" />
          <Text style={styles.totalLabel}>Calorias Gastas Hoje</Text>
          <Text style={styles.totalValue}>{todayData?.total_calories_burned || 0} kcal</Text>
        </View>

        {/* Rastreador de Água */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="water" size={24} color="#2196F3" />
            <Text style={styles.cardTitle}>Água (Meta: 2L)</Text>
          </View>
          <View style={styles.waterProgress}>
            <View style={styles.waterBar}>
              <View style={[styles.waterFill, { width: `${(waterIntake / 2000) * 100}%` }]} />
            </View>
            <Text style={styles.waterText}>{waterIntake / 1000}L / 2L</Text>
          </View>
          <View style={styles.waterButtons}>
            <TouchableOpacity style={styles.waterButton} onPress={() => updateWater(250)}>
              <Text style={styles.waterButtonText}>+ 250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waterButton} onPress={() => updateWater(500)}>
              <Text style={styles.waterButtonText}>+ 500ml</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de Atividades do Dia */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="run" size={24} color="#4CAF50" />
            <Text style={styles.cardTitle}>Atividades de Hoje</Text>
          </View>
          {todayData?.entries?.map((entry: any, index: number) => (
            <View key={index} style={styles.activityItem}>
              <Text style={styles.activityName}>{entry.activity_name}</Text>
              <Text style={styles.activityDetails}>
                {entry.duration} min • {entry.intensity} • {entry.calories_burned} kcal
              </Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="plus-circle" size={20} color="#4CAF50" />
            <Text style={styles.addButtonText}>Registrar Atividade</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecione uma Atividade</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={activities}
            keyExtractor={(item) => item.activity_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.activityOption}
                onPress={() => addActivity(item, 30, 'media')}
              >
                <Text style={styles.activityOptionName}>{item.name}</Text>
                <Text style={styles.activityOptionDetails}>{item.category}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  totalCard: { backgroundColor: '#FFF', margin: 16, padding: 20, borderRadius: 12, alignItems: 'center', elevation: 2 },
  totalLabel: { fontSize: 14, color: '#666', marginTop: 8 },
  totalValue: { fontSize: 32, fontWeight: 'bold', color: '#F44336', marginTop: 4 },
  card: { backgroundColor: '#FFF', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginLeft: 8 },
  waterProgress: { marginBottom: 12 },
  waterBar: { height: 12, backgroundColor: '#E0E0E0', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  waterFill: { height: '100%', backgroundColor: '#2196F3' },
  waterText: { fontSize: 16, color: '#666', textAlign: 'center' },
  waterButtons: { flexDirection: 'row', gap: 12 },
  waterButton: { flex: 1, backgroundColor: '#E3F2FD', padding: 12, borderRadius: 8, alignItems: 'center' },
  waterButtonText: { color: '#2196F3', fontWeight: '600' },
  activityItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  activityName: { fontSize: 14, color: '#333', marginBottom: 2 },
  activityDetails: { fontSize: 12, color: '#999' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginTop: 8, gap: 8 },
  addButtonText: { color: '#4CAF50', fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 20, fontWeight: '600' },
  activityOption: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  activityOptionName: { fontSize: 16, color: '#333', marginBottom: 4 },
  activityOptionDetails: { fontSize: 12, color: '#999' },
});
