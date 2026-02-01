import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { Food } from '../../types';

export default function CaloriasScreen() {
  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [caloriesData, foodsData] = await Promise.all([
        api.getTodayCalories(),
        api.getFoods(),
      ]);
      setTodayData(caloriesData);
      setFoods(foodsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddMeal = (mealType: string) => {
    setSelectedMealType(mealType);
    setModalVisible(true);
  };

  const addFoodToMeal = async (food: Food) => {
    try {
      await api.addMeal({
        meal_type: selectedMealType,
        food_id: food.food_id,
        portions: 100, // Default 100g
      });
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Failed to add food:', error);
    }
  };

  const filteredFoods = foods.filter(
    (food) =>
      (selectedCategory === '' || food.category === selectedCategory) &&
      (search === '' || food.name.toLowerCase().includes(search.toLowerCase()))
  );

  const categories = ['Frutas', 'Verduras', 'Grãos', 'Proteínas', 'Sucos', 'Lanches'];
  const mealTypes = [
    { key: 'cafe_manha', label: 'Café da Manhã', icon: 'coffee' },
    { key: 'almoco', label: 'Almoço', icon: 'food' },
    { key: 'jantar', label: 'Jantar', icon: 'food-variant' },
    { key: 'lanche', label: 'Lanche', icon: 'food-apple' },
  ];

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
          <MaterialCommunityIcons name="fire" size={32} color="#FF9800" />
          <Text style={styles.totalLabel}>Total Consumido Hoje</Text>
          <Text style={styles.totalValue}>{todayData?.total_calories || 0} kcal</Text>
        </View>

        {mealTypes.map((meal) => {
          const mealEntries = todayData?.by_meal?.[meal.key] || [];
          const mealTotal = mealEntries.reduce((sum: number, entry: any) => sum + entry.calories, 0);

          return (
            <View key={meal.key} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealTitle}>
                  <MaterialCommunityIcons name={meal.icon as any} size={24} color="#4CAF50" />
                  <Text style={styles.mealLabel}>{meal.label}</Text>
                </View>
                <Text style={styles.mealCalories}>{mealTotal} kcal</Text>
              </View>

              {mealEntries.map((entry: any, index: number) => (
                <View key={index} style={styles.foodItem}>
                  <Text style={styles.foodName}>{entry.food_name}</Text>
                  <Text style={styles.foodDetails}>
                    {entry.portions}g • {entry.calories} kcal
                  </Text>
                </View>
              ))}

              <TouchableOpacity style={styles.addButton} onPress={() => openAddMeal(meal.key)}>
                <MaterialCommunityIcons name="plus-circle" size={20} color="#4CAF50" />
                <Text style={styles.addButtonText}>Adicionar Alimento</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Modal de Seleção de Alimentos */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecione um Alimento</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar alimento..."
            value={search}
            onChangeText={setSearch}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === '' && styles.categoryChipActive]}
              onPress={() => setSelectedCategory('')}
            >
              <Text style={[styles.categoryChipText, selectedCategory === '' && styles.categoryChipTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredFoods}
            keyExtractor={(item) => item.food_id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.foodOption} onPress={() => addFoodToMeal(item)}>
                <View style={styles.foodOptionInfo}>
                  <Text style={styles.foodOptionName}>{item.name}</Text>
                  <Text style={styles.foodOptionDetails}>
                    {item.category} • {item.calories_per_100g} kcal/100g
                  </Text>
                </View>
                {item.detox_friendly && (
                  <MaterialCommunityIcons name="leaf" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
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
  totalCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 4,
  },
  mealCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
  },
  foodItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  foodName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  foodDetails: {
    fontSize: 12,
    color: '#999',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  searchInput: {
    margin: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    fontSize: 16,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#4CAF50',
  },
  categoryChipText: {
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  foodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  foodOptionInfo: {
    flex: 1,
  },
  foodOptionName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  foodOptionDetails: {
    fontSize: 12,
    color: '#999',
  },
});
