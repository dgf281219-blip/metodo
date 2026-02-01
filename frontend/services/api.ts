import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const api = {
  // Auth
  processSession: async (session_id: string) => {
    const response = await fetch(`${BACKEND_URL}/api/auth/process-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id }),
    });
    return response.json();
  },

  getMe: async () => {
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    if (!response.ok) throw new Error('Not authenticated');
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    return response.json();
  },

  // User Goals
  getUserGoals: async () => {
    const response = await fetch(`${BACKEND_URL}/api/user/goals`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    return response.json();
  },

  createUserGoals: async (goals: any) => {
    const response = await fetch(`${BACKEND_URL}/api/user/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(goals),
    });
    return response.json();
  },

  updateUserProfile: async (profile: any) => {
    const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(profile),
    });
    return response.json();
  },

  // Daily Records
  getDailyRecord: async (date: string) => {
    const response = await fetch(`${BACKEND_URL}/api/daily/record/${date}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    return response.json();
  },

  getAllDailyRecords: async () => {
    const response = await fetch(`${BACKEND_URL}/api/daily/records`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    return response.json();
  },

  createOrUpdateDailyRecord: async (record: any) => {
    const response = await fetch(`${BACKEND_URL}/api/daily/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(record),
    });
    return response.json();
  },

  updateWaterIntake: async (water_ml: number) => {
    const response = await fetch(`${BACKEND_URL}/api/daily/water?water_ml=${water_ml}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    return response.json();
  },

  // Method Progress
  getMethodProgress: async () => {
    const response = await fetch(`${BACKEND_URL}/api/method/progress`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    return response.json();
  },

  createFinalReflection: async (reflection: any) => {
    const response = await fetch(`${BACKEND_URL}/api/method/final-reflection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(reflection),
    });
    return response.json();
  },

  // Foods
  getFoods: async (category?: string, search?: string) => {
    let url = `${BACKEND_URL}/api/calories/foods`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    return response.json();
  },

  addMeal: async (meal: any) => {
    const response = await fetch(`${BACKEND_URL}/api/calories/add-meal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(meal),
    });
    return response.json();
  },

  getTodayCalories: async () => {
    const response = await fetch(`${BACKEND_URL}/api/calories/today`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    return response.json();
  },

  // Activities
  getActivities: async (category?: string) => {
    let url = `${BACKEND_URL}/api/activities/list`;
    if (category) url += `?category=${category}`;

    const response = await fetch(url);
    return response.json();
  },

  addActivity: async (activity: any) => {
    const response = await fetch(`${BACKEND_URL}/api/activities/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(activity),
    });
    return response.json();
  },

  getTodayActivities: async () => {
    const response = await fetch(`${BACKEND_URL}/api/activities/today`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    return response.json();
  },
};