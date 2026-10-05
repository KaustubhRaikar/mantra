import axios from 'axios';
import { Mantra } from '../types/navigation';

// Default to cloud backend on Hostinger subdomain with v1 API
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://mantra.aarambhtech.in/api/v1';

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
  getMantra: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/mantras/read_single.php?id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching mantra ${id}:`, error);
      return null;
    }
  },

  getUpanishads: async () => {
    try {
      const response = await apiClient.get('/upanishads/read.php');
      return response.data.records || [];
    } catch (error: any) {
      console.error('Error fetching upanishads full URL trace:', error.config?.baseURL, error.config?.url);
      return [];
    }
  },

  getUpanishad: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/upanishads/read_single.php?id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching upanishad ${id}:`, error);
      return null;
    }
  },

  getMantras: async (categoryId?: number) => {
    try {
      const url = categoryId 
        ? `/mantras/read.php?category_id=${categoryId}` 
        : '/mantras/read.php';
      const response = await apiClient.get(url);
      return response.data.records || [];
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return [];
      }
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

  getFestivalAartis: async () => {
    try {
      const response = await apiClient.get('/festival_aartis/read.php');
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching festival aartis:', error);
      return [];
    }
  },

  getAartis: async () => {
    try {
      const response = await apiClient.get('/aartis/read.php');
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching aartis from table:', error);
      return [];
    }
  },

  getFestivalAartiDetails: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/festival_aartis/read_single.php?id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching festival aarti ${id}:`, error);
      return null;
    }
  },

  getAartiDetails: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/aartis/read_single.php?id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching aarti ${id}:`, error);
      return null;
    }
  },

  getChalisas: async () => {
    try {
      const response = await apiClient.get('/chalisas/read.php');
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching chalisas:', error);
      return [];
    }
  },

  getPoojaVidhis: async () => {
    try {
      const response = await apiClient.get('/pooja_vidhis/read.php');
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching pooja vidhis:', error);
      return [];
    }
  },

  getStotras: async () => {
    try {
      const response = await apiClient.get('/stotras/read.php');
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching stotras:', error);
      return [];
    }
  },

  getVratKathas: async () => {
    try {
      const response = await apiClient.get('/vrat_kathas/read.php');
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching vrat kathas:', error);
      return [];
    }
  },

  getChalisaDetails: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/chalisas/read_single.php?id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chalisa ${id}:`, error);
      return null;
    }
  },

  getPoojaVidhiDetails: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/pooja_vidhis/read_single.php?id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pooja vidhi ${id}:`, error);
      return null;
    }
  },

  getStotraDetails: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/stotras/read_single.php?id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stotra ${id}:`, error);
      return null;
    }
  },

  getVratKathaDetails: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/vrat_kathas/read_single.php?id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vrat katha ${id}:`, error);
      return null;
    }
  },

  // Auth — Two-step OTP Login
  auth: {
    sendOtp: async (email: string, fullName: string) => {
      const response = await apiClient.post('/auth/send_otp.php', {
        email,
        full_name: fullName,
      });
      return response.data;
    },

    verifyOtp: async (email: string, otp: string, deviceId: string, deviceName: string) => {
      const response = await apiClient.post('/auth/verify_otp.php', {
        email,
        otp,
        device_id: deviceId,
        device_name: deviceName,
      });
      return response.data;
    },

    verifySession: async (userId: string | number, token: string, deviceId: string) => {
      try {
        const response = await apiClient.post('/auth/verify_session.php', {
          user_id: userId,
          login_token: token,
          device_id: deviceId,
        });
        return response.data;
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          return error.response.data;
        }
        throw error;
      }
    }
  }
};
