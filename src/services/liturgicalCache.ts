import { getDB } from './db';
import { api } from './api';
import {
  CANONICAL_7_DAYS_WORSHIP,
  DayWorshipData,
} from '../data/canonicalTreasuryExpansion';

const DAY_WORSHIP_CACHE_PREFIX = 'CACHE_DAY_WORSHIP_';
const POOJA_VIDHIS_CACHE_KEY = 'CACHE_ALL_POOJA_VIDHIS';
const KATHAS_CACHE_KEY = 'CACHE_ALL_KATHAS';

// In-memory instant L1 cache
const memoryCache = new Map<string, any>();

/**
 * Liturgical Client-Device Caching Engine
 * Provides persistent SQLite & in-memory caching for 7-day worship,
 * mantras, aartis, and pooja vidhis for instant offline responsiveness.
 */
export const liturgicalCache = {
  /**
   * Get Day-Specific Worship data for a day of the week (0 = Sun, ..., 6 = Sat)
   * Always hits local device cache first.
   */
  getDaySpecificWorship: async (targetDay?: number): Promise<DayWorshipData> => {
    const day = typeof targetDay === 'number' ? targetDay : new Date().getDay();
    const cacheKey = `${DAY_WORSHIP_CACHE_PREFIX}${day}`;

    // 1. Try In-Memory L1 Cache
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    // 2. Try SQLite Local L2 Cache
    try {
      const db = await getDB();
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM meta_store WHERE key = ?',
        [cacheKey]
      );
      if (row?.value) {
        const parsed = JSON.parse(row.value) as DayWorshipData;
        memoryCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch {
      // Best-effort
    }

    const defaultData = CANONICAL_7_DAYS_WORSHIP[day] || CANONICAL_7_DAYS_WORSHIP[0];
    memoryCache.set(cacheKey, defaultData);
    await liturgicalCache.saveDaySpecificWorship(day, defaultData);
    return defaultData;
  },

  /**
   * Save Day-Specific Worship data into device's persistent cache
   */
  saveDaySpecificWorship: async (day: number, data: DayWorshipData): Promise<void> => {
    const cacheKey = `${DAY_WORSHIP_CACHE_PREFIX}${day}`;
    memoryCache.set(cacheKey, data);
    const serialized = JSON.stringify(data);

    try {
      const db = await getDB();
      await db.runAsync(
        'INSERT OR REPLACE INTO meta_store (key, value) VALUES (?, ?)',
        [cacheKey, serialized]
      );
    } catch {}
  },

  /**
   * Get all Pooja Vidhis cached locally on the device (backed by MySQL)
   */
  getAllPoojaVidhisCached: async (): Promise<any[]> => {
    try {
      const db = await getDB();
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM meta_store WHERE key = ?',
        [POOJA_VIDHIS_CACHE_KEY]
      );
      if (row?.value) {
        return JSON.parse(row.value);
      }
    } catch {}

    // Fetch from MySQL API
    try {
      const remote = await api.getPoojaVidhis();
      if (remote && remote.length > 0) {
        try {
          const db = await getDB();
          await db.runAsync(
            'INSERT OR REPLACE INTO meta_store (key, value) VALUES (?, ?)',
            [POOJA_VIDHIS_CACHE_KEY, JSON.stringify(remote)]
          );
        } catch {}
        return remote;
      }
    } catch {}

    return [];
  },

  /**
   * Get all Sacred Kathas cached locally on the device (backed by MySQL)
   */
  getAllKathasCached: async (): Promise<any[]> => {
    // 1. Try In-Memory L1 Cache
    if (memoryCache.has(KATHAS_CACHE_KEY)) {
      return memoryCache.get(KATHAS_CACHE_KEY);
    }

    // 2. Try SQLite L2 Cache
    try {
      const db = await getDB();
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM meta_store WHERE key = ?',
        [KATHAS_CACHE_KEY]
      );
      if (row?.value) {
        const parsed = JSON.parse(row.value);
        memoryCache.set(KATHAS_CACHE_KEY, parsed);
        return parsed;
      }
    } catch {}

    // 3. Fetch from MySQL API
    try {
      const remote = await api.getKathas();
      if (remote && remote.length > 0) {
        memoryCache.set(KATHAS_CACHE_KEY, remote);
        try {
          const db = await getDB();
          await db.runAsync(
            'INSERT OR REPLACE INTO meta_store (key, value) VALUES (?, ?)',
            [KATHAS_CACHE_KEY, JSON.stringify(remote)]
          );
        } catch {}
        return remote;
      }
    } catch {}

    return [];
  },

  /**
   * Get single Katha details from on-device cache or MySQL
   */
  getKathaDetailsCached: async (id: string): Promise<any | null> => {
    const all = await liturgicalCache.getAllKathasCached();
    const found = all.find((k: any) => k.id === id || String(k.id) === String(id));
    if (found) return found;

    return await api.getKathaDetails(id);
  },

  /**
   * Preload 7 days of worship into local device cache
   */
  preloadAllLiturgicalDeviceCache: async (): Promise<void> => {
    for (let i = 0; i < 7; i++) {
      await liturgicalCache.saveDaySpecificWorship(i, CANONICAL_7_DAYS_WORSHIP[i]);
    }
    await liturgicalCache.getAllPoojaVidhisCached();
    await liturgicalCache.getAllKathasCached();
  },
};
