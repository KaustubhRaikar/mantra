import axios from 'axios';
import { Mantra } from '../types/navigation';

// We fall back to localhost equivalent for Android Emulator if EXPO_PUBLIC_API_URL isn't set properly
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2/native_php/mantra/backend/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Categories
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories/read.php');
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Mantras
  getMantras: async (categoryId?: number) => {
    try {
      const url = categoryId 
        ? `/mantras/read.php?category_id=${categoryId}` 
        : '/mantras/read.php';
      const response = await apiClient.get(url);
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching mantras:', error);
      return [];
    }
  },

  getFeaturedMantras: async () => {
    try {
      const response = await apiClient.get('/mantras/featured.php');
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching featured mantras:', error);
      return [];
    }
  },

  getDailyMantra: async () => {
    try {
      const response = await apiClient.get('/mantras/daily.php');
      return response.data; // It returns a single object
    } catch (error) {
      console.error('Error fetching daily mantra:', error);
      return null;
    }
  },
};
