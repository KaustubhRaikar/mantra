import * as SecureStore from 'expo-secure-store';
import { getDB } from './db';

const LEGACY_KEYS = {
  SEARCHES: 'recentSearches',
  PLAYED: 'recentlyPlayed',
  JAAP_LOG: 'jaapLog',
};

export interface MigrationResult {
  migrated: boolean;
  searchesCount: number;
  playedCount: number;
  jaapLogCount: number;
  errors: string[];
}

export const runStorageMigration = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    migrated: false,
    searchesCount: 0,
    playedCount: 0,
    jaapLogCount: 0,
    errors: [],
  };

  try {
    const db = await getDB();

    // Check if migration has already been completed
    const meta = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM meta_store WHERE key = 'secure_store_migrated_v1'`
    );

    if (meta?.value === '1') {
      return { ...result, migrated: false };
    }

    // Read legacy SecureStore data
    const rawSearches = await SecureStore.getItemAsync(LEGACY_KEYS.SEARCHES);
    const rawPlayed   = await SecureStore.getItemAsync(LEGACY_KEYS.PLAYED);
    const rawJaapLog  = await SecureStore.getItemAsync(LEGACY_KEYS.JAAP_LOG);

    const searches: string[] = rawSearches ? JSON.parse(rawSearches) : [];
    const played: any[] = rawPlayed ? JSON.parse(rawPlayed) : [];
    const jaapLog: any[] = rawJaapLog ? JSON.parse(rawJaapLog) : [];

    // 1. Migrate Searches
    for (const query of searches) {
      if (typeof query === 'string' && query.trim()) {
        await db.runAsync(
          `INSERT OR REPLACE INTO recent_searches (query, searched_at) VALUES (?, ?)`,
          [query.trim(), Date.now()]
        );
        result.searchesCount++;
      }
    }

    // 2. Migrate Recently Played
    for (const item of played) {
      if (item && (item.id || item.name)) {
        const id = String(item.id || Math.random().toString());
        await db.runAsync(
          `INSERT OR REPLACE INTO recently_played (id, name, sanskrit, category, path, played_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            id,
            item.name || item.title || 'Sacred Item',
            item.sanskrit || '',
            item.category || 'Divine',
            item.path || 'mantra',
            Date.now(),
          ]
        );
        result.playedCount++;
      }
    }

    // 3. Migrate Jaap Logs
    for (const log of jaapLog) {
      if (log && log.date) {
        await db.runAsync(
          `INSERT OR REPLACE INTO jaap_logs (date, formatted_date, total_chants, completed_malas, updated_at) VALUES (?, ?, ?, ?, ?)`,
          [
            log.date,
            log.formattedDate || log.date,
            log.totalChants || 0,
            log.completedMalas || 0,
            Date.now(),
          ]
        );
        result.jaapLogCount++;
      }
    }

    // Verify Counts match parsed source array lengths
    const dbSearchesCount = await db.getFirstAsync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM recent_searches`);
    const dbPlayedCount   = await db.getFirstAsync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM recently_played`);
    const dbJaapLogCount  = await db.getFirstAsync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM jaap_logs`);

    const searchesMatch = (dbSearchesCount?.cnt || 0) >= searches.length;
    const playedMatch   = (dbPlayedCount?.cnt || 0) >= played.length;
    const jaapMatch     = (dbJaapLogCount?.cnt || 0) >= jaapLog.length;

    if (searchesMatch && playedMatch && jaapMatch) {
      // Delete legacy SecureStore keys
      await SecureStore.deleteItemAsync(LEGACY_KEYS.SEARCHES);
      await SecureStore.deleteItemAsync(LEGACY_KEYS.PLAYED);
      await SecureStore.deleteItemAsync(LEGACY_KEYS.JAAP_LOG);

      // Mark migration as completed
      await db.runAsync(
        `INSERT OR REPLACE INTO meta_store (key, value) VALUES ('secure_store_migrated_v1', '1')`
      );

      result.migrated = true;
    } else {
      result.errors.push('Verification failed: database item count does not match legacy SecureStore data.');
    }
  } catch (error: any) {
    result.errors.push(error?.message || 'Unknown migration error.');
  }

  return result;
};
