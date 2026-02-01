import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { format } from 'date-fns';

export default function MetodoScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [goals, setGoals] = useState({
    meta_principal: '',
    desejo_transformar: '',
    sentimento_desejado: '',
    compromisso: '',
  });

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await api.getMethodProgress();
      setProgress(data);
      if (!data.goals) {
        setGoalsModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
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

  const updateDayChecklist = async (dayNumber: number, field: string, value: boolean) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      await api.createOrUpdateDailyRecord({
        date: today,
        day_number: dayNumber,
        [field]: value,
      });
      loadProgress();
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
            <Text style={styles.progressText}>Dia {totalDays} de 21</Text>
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
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Desejo Transformar:</Text>
              <Text style={styles.goalValue}>{progress.goals.desejo_transformar}</Text>
            </View>
          </View>
        )}

        {/* Calendário dos 21 Dias */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calendário</Text>
          <View style={styles.calendar}>
            {Array.from({ length: 21 }, (_, i) => i + 1).map((day) => {
              const dayRecord = progress?.daily_records?.find((r: any) => r.day_number === day);
              const isCompleted = dayRecord?.praticas_diarias?.agua_2l &&
                dayRecord?.praticas_diarias?.exercicio &&
                dayRecord?.praticas_diarias?.meditacao &&
                dayRecord?.praticas_diarias?.vacuo &&
                dayRecord?.praticas_diarias?.gratidao;

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    day <= totalDays && styles.dayButtonActive,
                    isCompleted && styles.dayButtonCompleted,
                  ]}
                  onPress={() => {
                    setSelectedDay(day);
                    setModalVisible(true);
                  }}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      day <= totalDays && styles.dayButtonTextActive,
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
        </View>

        {/* Checklist Alimentar */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Checklist Alimentar Diário</Text>
          <ChecklistSection
            items={[
              { key: 'sem_acucar', label: 'Sem açúcar refinado' },
              { key: 'sem_alcool', label: 'Sem álcool' },
              { key: 'sem_gluten', label: 'Sem glúten' },
              { key: 'sem_refrigerante', label: 'Sem refrigerante' },
              { key: 'alimentos_naturais', label: 'Comer alimentos naturais' },
              { key: 'evitar_industrializados', label: 'Evitar industrializados' },
              { key: 'frutas_verduras', label: 'Consumir frutas e verduras' },
              { key: 'mastigar_atencao', label: 'Mastigar com atenção' },
            ]}
          />
        </View>

        {/* Práticas Diárias */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Práticas Diárias</Text>
          <ChecklistSection
            items={[
              { key: 'agua_2l', label: 'Água 2L', icon: 'water' },
              { key: 'exercicio', label: 'Exercício', icon: 'run' },
              { key: 'meditacao', label: 'Meditação', icon: 'meditation' },
              { key: 'vacuo', label: 'Vácuo Abdominal', icon: 'stomach' },
              { key: 'gratidao', label: 'Gratidão', icon: 'heart' },
            ]}
          />
        </View>
      </ScrollView>

      {/* Modal de Metas */}
      <Modal visible={goalsModalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Defina suas Metas para os 21 Dias</Text>
          <TextInput
            style={styles.input}
            placeholder="Meta principal"
            value={goals.meta_principal}
            onChangeText={(text) => setGoals({ ...goals, meta_principal: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="O que desejo transformar em mim?"
            value={goals.desejo_transformar}
            onChangeText={(text) => setGoals({ ...goals, desejo_transformar: text })}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Como quero me sentir ao final?"
            value={goals.sentimento_desejado}
            onChangeText={(text) => setGoals({ ...goals, sentimento_desejado: text })}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Compromisso comigo mesma"
            value={goals.compromisso}
            onChangeText={(text) => setGoals({ ...goals, compromisso: text })}
            multiline
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveGoals}>
            <Text style={styles.saveButtonText}>Salvar Metas</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

function ChecklistSection({ items }: { items: any[] }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item.key} style={styles.checklistItem}>
          {item.icon && <MaterialCommunityIcons name={item.icon} size={20} color="#4CAF50" />}
          <Text style={styles.checklistLabel}>{item.label}</Text>
          <MaterialCommunityIcons name="circle-outline" size={20} color="#CCC" />
        </View>
      ))}
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
  calendar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayButton: { width: 50, height: 50, backgroundColor: '#E0E0E0', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  dayButtonActive: { backgroundColor: '#81C784' },
  dayButtonCompleted: { backgroundColor: '#4CAF50' },
  dayButtonText: { color: '#666', fontWeight: '600' },
  dayButtonTextActive: { color: '#FFF' },
  checkIcon: { position: 'absolute', bottom: 2, right: 2 },
  checklistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  checklistLabel: { flex: 1, fontSize: 14, color: '#666' },
  modalContainer: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  saveButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});