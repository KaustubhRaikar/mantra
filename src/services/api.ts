import axios from 'axios';
import { Mantra } from '../types/navigation';
import * as SecureStore from 'expo-secure-store';
import { getDB } from './db';

// Default to cloud backend on Hostinger subdomain
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://mantra.aarambhtech.in/api';

export const MANTRA_APP_KEY = 'm_app_c0sm1c_7f9b2d4e81a3e5c7';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Key': MANTRA_APP_KEY,
  },
});

apiClient.interceptors.request.use(async (config) => {
  config.headers['X-App-Key'] = MANTRA_APP_KEY;
  try {
    const deviceId = await SecureStore.getItemAsync('device_id');
    if (deviceId) {
      config.headers['X-Device-ID'] = deviceId;
    }
    const token = await SecureStore.getItemAsync('session_token');
    if (token) {
      config.headers['X-Login-Token'] = token;
    }
    const userStr = await SecureStore.getItemAsync('user_data');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.id) {
        config.headers['X-User-ID'] = String(user.id);
      }
    }
  } catch {
    // Best-effort credential extraction
  }
  return config;
});

// Local SQLite cache helpers for resilience & rate-limit immunity
const saveLocalCache = async (key: string, data: any) => {
  try {
    const db = await getDB();
    await db.runAsync(
      `INSERT OR REPLACE INTO meta_store (key, value) VALUES (?, ?)`,
      [key, JSON.stringify(data)]
    );
  } catch {
    // Ignore cache persistence errors
  }
};

const getLocalCache = async <T>(key: string): Promise<T | null> => {
  try {
    const db = await getDB();
    const row = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM meta_store WHERE key = ?`,
      [key]
    );
    return row ? (JSON.parse(row.value) as T) : null;
  } catch {
    return null;
  }
};

export const api = {
  // Unified Home Bootstrap (1 single network call for all 9 liturgical collections)
  getHomeBootstrap: async () => {
    try {
      const response = await apiClient.get('/home/bootstrap.php');
      if (response.data) {
        await saveLocalCache('CACHE_home_bootstrap', response.data);
        return response.data;
      }
    } catch (error) {
      console.warn('Home bootstrap remote call failed or rate-limited, serving from SQLite cache:', error);
    }
    return await getLocalCache<any>('CACHE_home_bootstrap');
  },

  // Categories
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories/read.php');
      const records = response.data.records || [];
      if (records.length > 0) {
        await saveLocalCache('CACHE_categories', records);
      }
      return records;
    } catch (error) {
      const cached = await getLocalCache<any[]>('CACHE_categories');
      if (cached && cached.length > 0) return cached;
      return [];
    }
  },

  // Mantras
  getMantra: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/mantras/read_single.php?id=${id}`);
      if (response.data) {
        await saveLocalCache(`CACHE_mantra_${id}`, response.data);
        return response.data;
      }
    } catch (error) {
      const cached = await getLocalCache(`CACHE_mantra_${id}`);
      if (cached) return cached;
    }
    return null;
  },

  getUpanishads: async () => {
    try {
      const response = await apiClient.get('/upanishads/read.php');
      const records = response.data.records || [];
      if (records.length > 0) {
        await saveLocalCache('CACHE_upanishads', records);
      }
      return records;
    } catch (error: any) {
      const cached = await getLocalCache<any[]>('CACHE_upanishads');
      if (cached && cached.length > 0) return cached;
      return [];
    }
  },

  getUpanishad: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/upanishads/read_single.php?id=${id}`);
      if (response.data) {
        await saveLocalCache(`CACHE_upanishad_${id}`, response.data);
        return response.data;
      }
    } catch (error) {
      const cached = await getLocalCache(`CACHE_upanishad_${id}`);
      if (cached) return cached;
    }
    return null;
  },

  getMantras: async (categoryId?: number) => {
    const cacheKey = categoryId ? `CACHE_mantras_cat_${categoryId}` : 'CACHE_mantras_all';
    try {
      const url = categoryId 
        ? `/mantras/read.php?category_id=${categoryId}` 
        : '/mantras/read.php';
      const response = await apiClient.get(url);
      const records = response.data.records || [];
      if (records.length > 0) {
        await saveLocalCache(cacheKey, records);
      }
      return records;
    } catch (error: any) {
      const cached = await getLocalCache<any[]>(cacheKey);
      if (cached && cached.length > 0) return cached;
      return [];
    }
  },

  getFeaturedMantras: async () => {
    try {
      const response = await apiClient.get('/mantras/featured.php');
      const records = response.data.records || [];
      if (records.length > 0) {
        await saveLocalCache('CACHE_featured_mantras', records);
      }
      return records;
    } catch (error) {
      const cached = await getLocalCache<any[]>('CACHE_featured_mantras');
      if (cached && cached.length > 0) return cached;
      return [];
    }
  },

  getDailyMantra: async () => {
    try {
      const response = await apiClient.get('/mantras/daily.php');
      if (response.data) {
        await saveLocalCache('CACHE_daily_mantra', response.data);
        return response.data;
      }
    } catch (error) {
      const cached = await getLocalCache('CACHE_daily_mantra');
      if (cached) return cached;
    }
    return null;
  },

  getFestivalAartis: async () => {
    try {
      const response = await apiClient.get('/festival_aartis/read.php');
      const records = response.data.records || [];
      if (records.length > 0) {
        await saveLocalCache('CACHE_festival_aartis', records);
      }
      return records;
    } catch (error) {
      const cached = await getLocalCache<any[]>('CACHE_festival_aartis');
      if (cached && cached.length > 0) return cached;
      return [];
    }
  },

  getAartis: async () => {
    try {
      const response = await apiClient.get('/aartis/read.php');
      const records = response.data.records || [];
      if (records.length > 0) {
        await saveLocalCache('CACHE_aartis', records);
      }
      return records;
    } catch (error) {
      const cached = await getLocalCache<any[]>('CACHE_aartis');
      if (cached && cached.length > 0) return cached;
      return [];
    }
  },

  getFestivalAartiDetails: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/festival_aartis/read_single.php?id=${id}`);
      if (response.data) {
        await saveLocalCache(`CACHE_festival_aarti_${id}`, response.data);
        return response.data;
      }
    } catch (error) {
      const cached = await getLocalCache(`CACHE_festival_aarti_${id}`);
      if (cached) return cached;
    }
    return null;
  },

  getAartiDetails: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/aartis/read_single.php?id=${id}`);
      if (response.data) {
        await saveLocalCache(`CACHE_aarti_${id}`, response.data);
        return response.data;
      }
    } catch (error) {
      const cached = await getLocalCache(`CACHE_aarti_${id}`);
      if (cached) return cached;
    }
    return null;
  },

  getChalisas: async () => {
    try {
      const response = await apiClient.get('/chalisas/read.php');
      const records = response.data.records || [];
      if (records.length > 0) {
        await saveLocalCache('CACHE_chalisas', records);
      }
      return records;
    } catch (error) {
      const cached = await getLocalCache<any[]>('CACHE_chalisas');
      if (cached && cached.length > 0) return cached;
      return [];
    }
  },

  getPoojaVidhis: async () => {
    try {
      const response = await apiClient.get('/pooja_vidhis/read.php');
      const records = response.data.records || [];
      if (records.length > 0) {
        await saveLocalCache('CACHE_pooja_vidhis', records);
      }
      return records;
    } catch (error) {
      const cached = await getLocalCache<any[]>('CACHE_pooja_vidhis');
      if (cached && cached.length > 0) return cached;
      return [];
    }
  },

  getStotras: async () => {
    try {
      const response = await apiClient.get('/stotras/read.php');
      const records = response.data.records || [];
      if (records.length > 0) {
        await saveLocalCache('CACHE_stotras', records);
      }
      return records;
    } catch (error) {
      const cached = await getLocalCache<any[]>('CACHE_stotras');
      if (cached && cached.length > 0) return cached;
      return [];
    }
  },

  getVratKathas: async () => {
    try {
      const response = await apiClient.get('/vrat_kathas/read.php');
      const records = response.data.records || [];
      if (records.length > 0) {
        await saveLocalCache('CACHE_vrat_kathas', records);
      }
      return records;
    } catch (error) {
      const cached = await getLocalCache<any[]>('CACHE_vrat_kathas');
      if (cached && cached.length > 0) return cached;
      return [];
    }
  },

  getChalisaDetails: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/chalisas/read_single.php?id=${id}`);
      if (response.data) {
        await saveLocalCache(`CACHE_chalisa_${id}`, response.data);
        return response.data;
      }
    } catch (error) {
      const cached = await getLocalCache(`CACHE_chalisa_${id}`);
      if (cached) return cached;
    }
    return null;
  },

  getPoojaVidhiDetails: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/pooja_vidhis/read_single.php?id=${id}`);
      if (response.data) {
        await saveLocalCache(`CACHE_pooja_vidhi_${id}`, response.data);
        return response.data;
      }
    } catch (error) {
      const cached = await getLocalCache(`CACHE_pooja_vidhi_${id}`);
      if (cached) return cached;
    }
    return null;
  },

  getStotraDetails: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/stotras/read_single.php?id=${id}`);
      if (response.data) {
        await saveLocalCache(`CACHE_stotra_${id}`, response.data);
        return response.data;
      }
    } catch (error) {
      const cached = await getLocalCache(`CACHE_stotra_${id}`);
      if (cached) return cached;
    }
    return null;
  },

  getVratKathaDetails: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/vrat_kathas/read_single.php?id=${id}`);
      if (response.data) {
        await saveLocalCache(`CACHE_vrat_katha_${id}`, response.data);
        return response.data;
      }
    } catch (error) {
      const cached = await getLocalCache(`CACHE_vrat_katha_${id}`);
      if (cached) return cached;
    }
    return null;
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
  },

  // Cloud Sync
  syncJaap: async (creds: { userId: number | string; token: string; deviceId: string }, jaapLogs: any[]) => {
    try {
      const response = await apiClient.post('/jaap/sync.php', {
        user_id: creds.userId,
        login_token: creds.token,
        device_id: creds.deviceId,
        jaap_logs: jaapLogs,
      });
      return response.data;
    } catch (error) {
      console.error('Jaap sync API error:', error);
      return null;
    }
  },

  syncFavorites: async (creds: { userId: number | string; token: string; deviceId: string }, favorites: any[]) => {
    try {
      const response = await apiClient.post('/favorites/sync.php', {
        user_id: creds.userId,
        login_token: creds.token,
        device_id: creds.deviceId,
        favorites: favorites,
      });
      return response.data;
    } catch (error) {
      console.error('Favorites sync API error:', error);
      return null;
    }
  },

  // Privacy, Consent & Account Deletion (DPDP)
  saveConsent: async (creds: { userId: number | string; token: string; deviceId: string }, consent: any) => {
    try {
      const response = await apiClient.post('/auth/consent.php', {
        user_id: creds.userId,
        login_token: creds.token,
        device_id: creds.deviceId,
        analytics: consent.analytics,
        notifications: consent.notifications,
        ai: consent.ai,
        policy_version: consent.policy_version || '1.0',
      });
      return response.data;
    } catch (error) {
      console.error('Save consent API error:', error);
      return null;
    }
  },

  deleteAccount: async (creds: { userId: number | string; token: string; deviceId: string }) => {
    try {
      const response = await apiClient.post('/auth/delete_account.php', {
        user_id: creds.userId,
        login_token: creds.token,
        device_id: creds.deviceId,
      });
      return response.data;
    } catch (error) {
      console.error('Delete account API error:', error);
      return null;
    }
  },

  exportUserData: async (creds: { userId: number | string; token: string; deviceId: string }) => {
    try {
      const response = await apiClient.post('/auth/export_data.php', {
        user_id: creds.userId,
        login_token: creds.token,
        device_id: creds.deviceId,
      });
      return response.data;
    } catch (error) {
      console.error('Export user data API error:', error);
      return null;
    }
  }
};
