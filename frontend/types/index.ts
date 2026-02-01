export interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  created_at: string;
}

export interface UserGoals {
  user_id: string;
  meta_principal: string;
  desejo_transformar: string;
  sentimento_desejado: string;
  peso_inicial?: string;
  medidas_iniciais?: string;
  compromisso: string;
  created_at: string;
}

export interface ChecklistAlimentar {
  sem_acucar: boolean;
  sem_alcool: boolean;
  sem_gluten: boolean;
  sem_refrigerante: boolean;
  alimentos_naturais: boolean;
  evitar_industrializados: boolean;
  frutas_verduras: boolean;
  mastigar_atencao: boolean;
}

export interface PraticasDiarias {
  agua_2l: boolean;
  exercicio: boolean;
  meditacao: boolean;
  vacuo: boolean;
  gratidao: boolean;
}

export interface DailyRecord {
  user_id: string;
  date: string;
  day_number: number;
  checklist_alimentar: ChecklistAlimentar;
  praticas_diarias: PraticasDiarias;
  sentimentos?: string;
  desafios?: string;
  vitoria_dia?: string;
  gratidoes: string[];
  calories_consumed: number;
  calories_burned: number;
  water_intake: number;
  created_at: string;
  updated_at: string;
}

export interface Food {
  food_id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  detox_friendly: boolean;
}

export interface Activity {
  activity_id: string;
  name: string;
  met_value: number;
  category: string;
}

export interface FoodEntry {
  user_id: string;
  date: string;
  meal_type: string;
  food_id: string;
  food_name: string;
  portions: number;
  calories: number;
  created_at: string;
}

export interface ActivityEntry {
  user_id: string;
  date: string;
  activity_id: string;
  activity_name: string;
  duration: number;
  intensity: string;
  calories_burned: number;
  created_at: string;
}