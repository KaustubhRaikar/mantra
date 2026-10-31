import axios from 'axios';
import { Mantra } from '../types/navigation';
import * as SecureStore from 'expo-secure-store';
import { getDB } from './db';
import { triggerShantiBanner } from '../components/ShantiBanner';
import {
  CANONICAL_7_DAYS_WORSHIP,
  CANONICAL_MAHAPARVA_POOJA_VIDHIS,
} from '../data/canonicalTreasuryExpansion';
import { CANONICAL_KATHAS } from '../data/canonicalKathas';

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
    let deviceId = await SecureStore.getItemAsync('device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      await SecureStore.setItemAsync('device_id', deviceId);
    }
    config.headers['X-Device-ID'] = deviceId;

    const token =
      (await SecureStore.getItemAsync('session_token')) ||
      (await SecureStore.getItemAsync('token'));
    if (token) {
      config.headers['X-Login-Token'] = token;
    }

    const userStr =
      (await SecureStore.getItemAsync('user_data')) ||
      (await SecureStore.getItemAsync('user'));
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 429) {
      triggerShantiBanner(
        'शांतिः • Offline Sanctuary Active — Prayers continue seamlessly while network rests.'
      );
    }
    return Promise.reject(error);
  }
);

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
    // 1. Check if ID matches a Day-Specific Mantra
    if (typeof id === 'string' && id.startsWith('day_mantra_')) {
      const match = Object.values(CANONICAL_7_DAYS_WORSHIP).find(
        (d) => d.primaryMantra.id === id
      );
      if (match) {
        return {
          id: match.primaryMantra.id,
          mantra_name: match.primaryMantra.name,
          title: match.primaryMantra.name,
          sanskrit_text: match.primaryMantra.sanskrit,
          sanskrit: match.primaryMantra.sanskrit,
          transliteration: match.primaryMantra.transliteration,
          translation_hi: match.primaryMantra.translation_hi,
          translation_hindi: match.primaryMantra.translation_hi,
          translation_en: match.primaryMantra.translation_en,
          translation_english: match.primaryMantra.translation_en,
          translation_gu: match.primaryMantra.translation_gu,
          translation_mr: match.primaryMantra.translation_mr,
          translation_bn: match.primaryMantra.translation_bn,
          translation_te: match.primaryMantra.translation_te,
          translation_ta: match.primaryMantra.translation_ta,
          translation_kn: match.primaryMantra.translation_kn,
          deity: match.presidingDeity,
          deity_name: match.presidingDeity,
        };
      }
    }

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

  getMantras: async (categoryId?: number | string) => {
    let cleanId: string | number | undefined = categoryId;
    if (typeof cleanId === 'string') {
      if (cleanId.startsWith('deity_')) {
        cleanId = cleanId.replace('deity_', '');
      }
      if (/^\d+$/.test(cleanId)) {
        cleanId = parseInt(cleanId, 10);
      }
    }

    const cacheKey = cleanId ? `CACHE_mantras_cat_${cleanId}` : 'CACHE_mantras_all';
    try {
      const url = cleanId 
        ? `/mantras/read.php?category_id=${encodeURIComponent(cleanId)}` 
        : '/mantras/read.php';
      const response = await apiClient.get(url);
      const records = response.data?.records || [];
      if (records.length > 0) {
        await saveLocalCache(cacheKey, records);
        return records;
      }
    } catch (error: any) {
      // Fall through to cached data
    }

    const cached = await getLocalCache<any[]>(cacheKey);
    if (cached && cached.length > 0) return cached;
    return [];
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
    // 1. Check if ID matches a Day-Specific Aarti
    if (typeof id === 'string' && id.startsWith('day_aarti_')) {
      const match = Object.values(CANONICAL_7_DAYS_WORSHIP).find(
        (d) => d.primaryAarti.id === id
      );
      if (match) {
        return {
          id: match.primaryAarti.id,
          title: match.primaryAarti.title,
          aarti_name: match.primaryAarti.title,
          lyrics: match.primaryAarti.firstLine,
          first_line: match.primaryAarti.firstLine,
          translation_hi: match.primaryAarti.translation_hi,
          translation_en: match.primaryAarti.translation_en,
          translation_gu: match.primaryAarti.translation_gu,
          translation_mr: match.primaryAarti.translation_mr,
          deity: match.presidingDeity,
          deity_name: match.presidingDeity,
        };
      }
    }

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
        return records;
      }
    } catch (error) {
      const cached = await getLocalCache<any[]>('CACHE_pooja_vidhis');
      if (cached && cached.length > 0) return cached;
    }

    // Fall back to canonical Mahaparva & 7-Day Pooja Vidhis from device cache
    const canonicalList = [
      ...CANONICAL_MAHAPARVA_POOJA_VIDHIS.map((v) => ({
        id: v.id,
        vidhi_name: v.title,
        deity_name: v.deity,
        duration: v.duration,
        significance: v.significance,
      })),
      ...Object.values(CANONICAL_7_DAYS_WORSHIP).map((d) => ({
        id: d.poojaVidhi.id,
        vidhi_name: d.poojaVidhi.title,
        deity_name: d.presidingDeity,
        duration: d.poojaVidhi.duration,
        significance: d.vratSignificance,
      })),
    ];
    await saveLocalCache('CACHE_pooja_vidhis', canonicalList);
    return canonicalList;
  },

  getPoojaVidhiDetails: async (id: string | number) => {
    // 1. Check Day-Specific Pooja Vidhi match
    const dayMatch = Object.values(CANONICAL_7_DAYS_WORSHIP).find(
      (d) => d.poojaVidhi.id === String(id)
    );
    if (dayMatch) {
      return {
        id: dayMatch.poojaVidhi.id,
        vidhi_name: dayMatch.poojaVidhi.title,
        title: dayMatch.poojaVidhi.title,
        deity_name: dayMatch.presidingDeity,
        duration: dayMatch.poojaVidhi.duration,
        significance: dayMatch.vratSignificance,
        samagri: dayMatch.poojaVidhi.samagri,
        steps: dayMatch.poojaVidhi.steps,
      };
    }

    // 2. Check Mahaparva Pooja Vidhi match
    const parvaMatch = CANONICAL_MAHAPARVA_POOJA_VIDHIS.find(
      (v) => v.id === String(id)
    );
    if (parvaMatch) {
      return {
        id: parvaMatch.id,
        vidhi_name: parvaMatch.title,
        title: parvaMatch.title,
        deity_name: parvaMatch.deity,
        duration: parvaMatch.duration,
        significance: parvaMatch.significance,
        samagri: parvaMatch.samagri,
        steps: parvaMatch.steps,
      };
    }

    // 3. Try Remote API
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

  getKathas: async () => {
    let remoteRecords: any[] = [];
    try {
      const response = await apiClient.get('/vrat_kathas/read.php');
      remoteRecords = response.data?.records || [];
    } catch {}

    const canonicalList = CANONICAL_KATHAS.map((k) => ({
      id: k.id,
      title: k.title,
      katha_name: k.title,
      deity: k.deity,
      deity_name: k.deity,
      category: k.category,
      category_label: k.categoryLabel,
      duration: k.duration,
      synopsis: k.synopsis,
      katha_text: k.kathaText,
      chapters: k.chapters,
      sanskrit: k.sanskritTitle,
      sanskrit_title: k.sanskritTitle,
      translation_hi: k.translation_hi,
      translation_en: k.translation_en,
      translation_gu: k.translation_gu,
      translation_mr: k.translation_mr,
    }));

    if (remoteRecords.length > 0) {
      // Merge remote records with canonical rich content
      const enrichedRemote = remoteRecords.map((r: any) => {
        const canonicalMatch = CANONICAL_KATHAS.find((c) => 
          c.id === String(r.id) ||
          c.title.includes(r.title || r.katha_name || '') ||
          (r.title && c.title.includes(r.title)) ||
          (r.katha_name && c.title.includes(r.katha_name))
        );

        if (canonicalMatch) {
          return {
            ...r,
            title: canonicalMatch.title,
            katha_name: canonicalMatch.title,
            deity: canonicalMatch.deity,
            deity_name: canonicalMatch.deity,
            katha_text: canonicalMatch.kathaText || r.katha_text,
            chapters: canonicalMatch.chapters || r.chapters,
            synopsis: canonicalMatch.synopsis || r.synopsis || r.description,
            vratSignificance: canonicalMatch.vratSignificance || r.vrat_significance || r.significance,
            sanskrit: canonicalMatch.sanskritTitle || r.sanskrit,
            translation_hi: canonicalMatch.translation_hi || r.translation_hi,
            translation_en: canonicalMatch.translation_en || r.translation_en,
          };
        }
        return r;
      });

      // Add any canonical kathas not already present in remote
      const existingIds = new Set(enrichedRemote.map((e: any) => String(e.id)));
      for (const ck of canonicalList) {
        if (!existingIds.has(String(ck.id))) {
          enrichedRemote.unshift(ck);
        }
      }

      await saveLocalCache('CACHE_vrat_kathas', enrichedRemote);
      return enrichedRemote;
    }

    const cached = await getLocalCache<any[]>('CACHE_vrat_kathas');
    if (cached && cached.length > 0) return cached;

    await saveLocalCache('CACHE_vrat_kathas', canonicalList);
    return canonicalList;
  },

  getKathaDetails: async (id: string | number) => {
    const idStr = String(id).toLowerCase();

    // 1. Check canonical Kathas first by id, title, or substring
    const canonicalMatch = CANONICAL_KATHAS.find((k) => 
      k.id.toLowerCase() === idStr || 
      k.title.toLowerCase().includes(idStr) ||
      idStr.includes(k.id.toLowerCase())
    );
    if (canonicalMatch) {
      return {
        id: canonicalMatch.id,
        title: canonicalMatch.title,
        katha_name: canonicalMatch.title,
        deity: canonicalMatch.deity,
        deity_name: canonicalMatch.deity,
        category: canonicalMatch.category,
        category_label: canonicalMatch.categoryLabel,
        duration: canonicalMatch.duration,
        synopsis: canonicalMatch.synopsis,
        vratSignificance: canonicalMatch.vratSignificance,
        katha_text: canonicalMatch.kathaText,
        sanskrit: canonicalMatch.sanskritTitle,
        sanskrit_title: canonicalMatch.sanskritTitle,
        translation_hi: canonicalMatch.translation_hi,
        translation_hindi: canonicalMatch.translation_hi,
        translation_en: canonicalMatch.translation_en,
        translation_english: canonicalMatch.translation_en,
        translation_gu: canonicalMatch.translation_gu,
        translation_mr: canonicalMatch.translation_mr,
        chapters: canonicalMatch.chapters,
      };
    }

    // 2. Try remote API
    try {
      const response = await apiClient.get(`/vrat_kathas/read_single.php?id=${id}`);
      if (response.data) {
        const item = response.data;
        // Check if item matches canonical narrative
        const match = CANONICAL_KATHAS.find(c => 
          c.title.includes(item.title || item.katha_name || '') ||
          (item.title && c.title.includes(item.title)) ||
          (item.katha_name && c.title.includes(item.katha_name))
        );
        if (match) {
          item.title = match.title;
          item.katha_text = match.kathaText;
          item.chapters = match.chapters;
          item.synopsis = match.synopsis;
          item.vratSignificance = match.vratSignificance;
        }

        await saveLocalCache(`CACHE_vrat_katha_${id}`, item);
        return item;
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
