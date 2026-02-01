import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { format, addDays } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

export default function MetodoScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedDayRecord, setSelectedDayRecord] = useState<any>(null);
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [goals, setGoals] = useState({
    meta_principal: '',
    desejo_transformar: '',
    sentimento_desejado: '',
    compromisso: '',
  });

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [])
  );

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    if (progress?.goals) {
      loadDayRecord(selectedDay);
    }
  }, [selectedDay, progress?.goals]);

  const loadProgress = async () => {
    try {
      const data = await api.getMethodProgress();
      setProgress(data);
      
      if (!data.goals) {
        setGoalsModalVisible(true);
      } else {
        // Load the current day's record
        loadDayRecord(selectedDay);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDayRecord = async (dayNumber: number) => {
    try {
      if (!progress?.goals) return;
      
      // Calculate the date for this day number
      const startDate = new Date(progress.goals.created_at);
      const targetDate = addDays(startDate, dayNumber - 1);
      const dateString = format(targetDate, 'yyyy-MM-dd');
      
      const record = await api.getDailyRecord(dateString);
      setSelectedDayRecord(record);
    } catch (error) {
      console.error('Failed to load day record:', error);
      setSelectedDayRecord(null);
    }
  };

  const saveGoals = async () => {
    try {
      await api.createUserGoals(goals);
      setGoalsModalVisible(false);
      loadProgress();
    } catch (error) {
      console.error('Failed to save goals:', error);
    }
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const toggleChecklistItem = async (field: string, subfield: string, currentValue: boolean) => {
    try {
      if (!progress?.goals) return;
      
      // Calculate the date for the selected day
      const startDate = new Date(progress.goals.created_at);
      const targetDate = addDays(startDate, selectedDay - 1);
      const dateString = format(targetDate, 'yyyy-MM-dd');
      
      const updateData: any = {
        date: dateString,
        day_number: selectedDay,
      };
      
      if (field === 'checklist_alimentar') {
        updateData.checklist_alimentar = {
          ...(selectedDayRecord?.checklist_alimentar || {}),
          [subfield]: !currentValue,
        };
      } else if (field === 'praticas_diarias') {
        updateData.praticas_diarias = {
          ...(selectedDayRecord?.praticas_diarias || {}),
          [subfield]: !currentValue,
        };
      }
      
      await api.createOrUpdateDailyRecord(updateData);
      await loadProgress();
      await loadDayRecord(selectedDay);
    } catch (error) {
      console.error('Failed to update checklist:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const totalDays = progress?.total_days_completed || 0;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Desafio 21 Dias</Text>
          <Text style={styles.subtitle}>Transformação Integral</Text>
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>Dia {totalDays} de 21 completados</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(totalDays / 21) * 100}%` }]} />
            </View>
          </View>
        </View>

        {/* Metas */}
        {progress?.goals && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Suas Metas</Text>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Meta Principal:</Text>
              <Text style={styles.goalValue}>{progress.goals.meta_principal}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => setGoalsModalVisible(true)}>
              <Text style={styles.editButtonText}>Editar Metas</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Calendário dos 21 Dias - CLICÁVEL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Calendário - Clique no dia para preencher</Text>
          <View style={styles.calendar}>
            {Array.from({ length: 21 }, (_, i) => i + 1).map((day) => {
              const dayRecord = progress?.daily_records?.find((r: any) => r.day_number === day);
              const isCompleted = dayRecord?.praticas_diarias?.agua_2l &&
                dayRecord?.praticas_diarias?.exercicio &&
                dayRecord?.praticas_diarias?.meditacao;
              const isSelected = day === selectedDay;

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    isCompleted && styles.dayButtonCompleted,
                    isSelected && styles.dayButtonSelected,
                  ]}
                  onPress={() => handleDayClick(day)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      (isCompleted || isSelected) && styles.dayButtonTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                  {isCompleted && (
                    <MaterialCommunityIcons name="check" size={12} color="#FFF" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E0E0E0' }]} />
              <Text style={styles.legendText}>Pendente</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.legendText}>Selecionado</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Completo</Text>
            </View>
          </View>
        </View>

        {/* Indicador do Dia Selecionado */}
        <View style={styles.selectedDayCard}>
          <MaterialCommunityIcons name="calendar-today" size={24} color="#2196F3" />
          <Text style={styles.selectedDayText}>Checklist do Dia {selectedDay}</Text>
        </View>

        {/* Checklist Alimentar */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✓ Checklist Alimentar - Dia {selectedDay}</Text>
          {[
            { key: 'sem_acucar', label: 'Sem açúcar refinado' },
            { key: 'sem_alcool', label: 'Sem álcool' },
            { key: 'sem_gluten', label: 'Sem glúten' },
            { key: 'sem_refrigerante', label: 'Sem refrigerante' },
            { key: 'alimentos_naturais', label: 'Comer alimentos naturais' },
            { key: 'evitar_industrializados', label: 'Evitar industrializados' },
            { key: 'frutas_verduras', label: 'Consumir frutas e verduras' },
            { key: 'mastigar_atencao', label: 'Mastigar com atenção' },
          ].map((item) => {
            const checked = selectedDayRecord?.checklist_alimentar?.[item.key] || false;
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.checklistItem}
                onPress={() => toggleChecklistItem('checklist_alimentar', item.key, checked)}
              >
                <MaterialCommunityIcons
                  name={checked ? 'check-circle' : 'circle-outline'}
                  size={24}
                  color={checked ? '#4CAF50' : '#CCC'}
                />
                <Text style={[styles.checklistLabel, checked && styles.checklistLabelChecked]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Práticas Diárias */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💫 Práticas Diárias - Dia {selectedDay}</Text>
          {[
            { key: 'agua_2l', label: 'Água 2L', icon: 'water' },
            { key: 'exercicio', label: 'Exercício', icon: 'run' },
            { key: 'meditacao', label: 'Meditação', icon: 'meditation' },
            { key: 'vacuo', label: 'Vácuo Abdominal', icon: 'stomach' },
            { key: 'gratidao', label: 'Gratidão', icon: 'heart' },
          ].map((item) => {
            const checked = selectedDayRecord?.praticas_diarias?.[item.key] || false;
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.checklistItem}
                onPress={() => toggleChecklistItem('praticas_diarias', item.key, checked)}
              >
                <MaterialCommunityIcons name={item.icon as any} size={20} color={checked ? '#4CAF50' : '#CCC'} />
                <Text style={[styles.checklistLabel, checked && styles.checklistLabelChecked]}>
                  {item.label}
                </Text>
                <MaterialCommunityIcons
                  name={checked ? 'check-circle' : 'circle-outline'}
                  size={24}
                  color={checked ? '#4CAF50' : '#CCC'}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Modal de Metas */}
      <Modal visible={goalsModalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Defina suas Metas</Text>
            {progress?.goals && (
              <TouchableOpacity onPress={() => setGoalsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#666" />
              </TouchableOpacity>
            )}
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
              placeholder="O que desejo transformar em mim?"
              value={goals.desejo_transformar}
              onChangeText={(text) => setGoals({ ...goals, desejo_transformar: text })}
              multiline
              numberOfLines={4}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Como quero me sentir ao final?"
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
            <TouchableOpacity style={styles.saveButton} onPress={saveGoals}>
              <Text style={styles.saveButtonText}>Salvar Metas</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#4CAF50', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#E8F5E9', textAlign: 'center', marginTop: 4 },
  progressCard: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 8 },
  progressText: { fontSize: 18, color: '#FFF', textAlign: 'center', marginBottom: 8 },
  progressBar: { height: 12, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFF' },
  card: { backgroundColor: '#FFF', margin: 16, padding: 16, borderRadius: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  goalItem: { marginBottom: 12 },
  goalLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  goalValue: { fontSize: 14, color: '#333' },
  editButton: { backgroundColor: '#E8F5E9', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  editButtonText: { color: '#4CAF50', fontWeight: '600' },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  dayButton: { width: 50, height: 50, backgroundColor: '#E0E0E0', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  dayButtonCompleted: { backgroundColor: '#4CAF50' },
  dayButtonSelected: { backgroundColor: '#2196F3', borderWidth: 3, borderColor: '#1976D2' },
  dayButtonText: { color: '#666', fontWeight: '600', fontSize: 16 },
  dayButtonTextActive: { color: '#FFF' },
  checkIcon: { position: 'absolute', bottom: 2, right: 2 },
  legendContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: '#666' },
  selectedDayCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F2FD', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 8, gap: 8 },
  selectedDayText: { fontSize: 16, fontWeight: '600', color: '#2196F3' },
  checklistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  checklistLabel: { flex: 1, fontSize: 14, color: '#666' },
  checklistLabelChecked: { color: '#4CAF50', fontWeight: '500' },
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 20, fontWeight: '600' },
  modalContent: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
