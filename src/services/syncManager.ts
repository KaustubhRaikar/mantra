import * as SecureStore from 'expo-secure-store';
import { AppState, AppStateStatus } from 'react-native';
import { api } from './api';
import { storage, JaapLogItem } from './storage';
import { getDB } from './db';

export interface SyncFavoriteItem {
  id: string | number;
  name?: string;
  path?: string;
  is_deleted?: number;
  updated_at?: number;
  [key: string]: any;
}

/**
 * Pure function: Merges local and remote Jaap logs taking max totalChants & completedMalas per date.
 */
export function mergeJaapLogs(local: JaapLogItem[], remote: JaapLogItem[]): JaapLogItem[] {
  const map = new Map<string, JaapLogItem>();

  const processLog = (item: JaapLogItem) => {
    if (!item || !item.date) return;
    const existing = map.get(item.date);
    if (!existing) {
      map.set(item.date, { ...item });
    } else {
      map.set(item.date, {
        date: item.date,
        formattedDate: item.formattedDate || existing.formattedDate,
        totalChants: Math.max(Number(item.totalChants) || 0, Number(existing.totalChants) || 0),
        completedMalas: Math.max(Number(item.completedMalas) || 0, Number(existing.completedMalas) || 0),
      });
    }
  };

  local.forEach(processLog);
  remote.forEach(processLog);

  return Array.from(map.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 90);
}

/**
 * Pure function: Merges local and remote Favorites using set-union with tombstones and timestamp precedence.
 */
export function mergeFavorites(local: SyncFavoriteItem[], remote: SyncFavoriteItem[]): SyncFavoriteItem[] {
  const map = new Map<string, SyncFavoriteItem>();

  const processItem = (item: SyncFavoriteItem) => {
    if (item.id === undefined || item.id === null) return;
    const key = String(item.id);
    const existing = map.get(key);

    const itemUpdated = Number(item.updated_at) || 0;

    if (!existing) {
      map.set(key, {
        ...item,
        id: key,
        updated_at: itemUpdated || Date.now(),
        is_deleted: item.is_deleted ? 1 : 0,
      });
    } else {
      const existingUpdated = Number(existing.updated_at) || 0;

      if (itemUpdated >= existingUpdated) {
        map.set(key, {
          ...existing,
          ...item,
          id: key,
          updated_at: Math.max(existingUpdated, itemUpdated),
          is_deleted: item.is_deleted ? 1 : 0,
        });
      } else {
        map.set(key, {
          ...item,
          ...existing,
          id: key,
          updated_at: existingUpdated,
          is_deleted: existing.is_deleted ? 1 : 0,
        });
      }
    }
  };

  local.forEach(processItem);
  remote.forEach(processItem);

  return Array.from(map.values());
}

let syncTimeout: NodeJS.Timeout | null = null;

export const syncManager = {
  getAuthCredentials: async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      const token = await SecureStore.getItemAsync('token');
      const deviceId = await SecureStore.getItemAsync('device_id');

      if (!storedUser || !token || !deviceId) return null;
      const user = JSON.parse(storedUser);
      return { userId: user.id, token, deviceId };
    } catch {
      return null;
    }
  },

  syncJaapLogs: async () => {
    const creds = await syncManager.getAuthCredentials();
    if (!creds) return;

    try {
      const localLogs = await storage.getJaapLogs();
      const response = await api.syncJaap(creds, localLogs);

      if (response && response.jaap_logs) {
        const remoteLogs: JaapLogItem[] = response.jaap_logs;
        const merged = mergeJaapLogs(localLogs, remoteLogs);

        // Update local DB with merged result
        const db = await getDB();
        for (const log of merged) {
          await db.runAsync(
            `INSERT OR REPLACE INTO jaap_logs (date, formatted_date, total_chants, completed_malas, updated_at)
             VALUES (?, ?, ?, ?, ?)`,
            [log.date, log.formattedDate, log.totalChants, log.completedMalas, Date.now()]
          );
        }
      }
    } catch (err) {
      console.warn('Jaap sync failed (offline or network error):', err);
    }
  },

  syncFavorites: async (getFavs: () => Promise<SyncFavoriteItem[]>, setFavs: (favs: SyncFavoriteItem[]) => Promise<void>) => {
    const creds = await syncManager.getAuthCredentials();
    if (!creds) return;

    try {
      const localFavs = await getFavs();
      const response = await api.syncFavorites(creds, localFavs);

      if (response && response.favorites) {
        const remoteFavs: SyncFavoriteItem[] = response.favorites;
        const merged = mergeFavorites(localFavs, remoteFavs);

        // Update local state/storage with merged (active non-deleted favorites)
        await setFavs(merged);
      }
    } catch (err) {
      console.warn('Favorites sync failed (offline or network error):', err);
    }
  },

  scheduleDebouncedSync: (triggerSync: () => void, delayMs = 2500) => {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      triggerSync();
    }, delayMs);
  },

  initForegroundListener: (triggerSync: () => void) => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        triggerSync();
      }
    });
    return () => subscription.remove();
  }
};
