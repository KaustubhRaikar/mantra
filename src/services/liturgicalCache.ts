import { getDB } from './db';
import {
  CANONICAL_7_DAYS_WORSHIP,
  CANONICAL_MAHAPARVA_POOJA_VIDHIS,
  DayWorshipData,
} from '../data/canonicalTreasuryExpansion';

const DAY_WORSHIP_CACHE_PREFIX = 'CACHE_DAY_WORSHIP_';
const POOJA_VIDHIS_CACHE_KEY = 'CACHE_ALL_POOJA_VIDHIS';

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
      // Fallback to embedded canonical treasury
    }

    // 3. Fallback to embedded canonical dataset & persist to device cache
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
   * Get all Pooja Vidhis cached locally on the device
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

    // Combine Mahaparva Vidhis with 7-Day Nitya Vidhis
    const combined = [
      ...CANONICAL_MAHAPARVA_POOJA_VIDHIS.map((v) => ({
        id: v.id,
        vidhi_name: v.title,
        deity_name: v.deity,
        duration: v.duration,
        significance: v.significance,
        samagri: v.samagri,
        steps: v.steps,
      })),
      ...Object.values(CANONICAL_7_DAYS_WORSHIP).map((d) => ({
        id: d.poojaVidhi.id,
        vidhi_name: d.poojaVidhi.title,
        deity_name: d.presidingDeity,
        duration: d.poojaVidhi.duration,
        significance: d.vratSignificance,
        samagri: d.poojaVidhi.samagri,
        steps: d.poojaVidhi.steps,
      })),
    ];

    try {
      const db = await getDB();
      await db.runAsync(
        'INSERT OR REPLACE INTO meta_store (key, value) VALUES (?, ?)',
        [POOJA_VIDHIS_CACHE_KEY, JSON.stringify(combined)]
      );
    } catch {}

    return combined;
  },

  /**
   * Preload all 7 days of worship into local device cache for 0ms access
   */
  preloadAllLiturgicalDeviceCache: async (): Promise<void> => {
    for (let i = 0; i < 7; i++) {
      await liturgicalCache.saveDaySpecificWorship(i, CANONICAL_7_DAYS_WORSHIP[i]);
    }
    await liturgicalCache.getAllPoojaVidhisCached();
  },
};
