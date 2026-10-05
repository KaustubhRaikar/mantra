import { getDB } from './db';
import { runStorageMigration } from './storageMigration';

export interface JaapLogItem {
  date: string;
  formattedDate: string;
  totalChants: number;
  completedMalas: number;
}

let isInitialized = false;

const ensureInit = async () => {
  if (!isInitialized) {
    try {
      await runStorageMigration();
      await cleanupOldJaapLogs();
      isInitialized = true;
    } catch (e) {
      console.warn('Storage initialization/migration warning:', e);
    }
  }
};

const cleanupOldJaapLogs = async () => {
  try {
    const db = await getDB();
    // Maintain strict 90-day rolling window
    await db.runAsync(
      `DELETE FROM jaap_logs WHERE date < date('now', '-90 days')`
    );
  } catch (e) {
    // Ignore cleanup error
  }
};

export const storage = {
  initialize: async () => {
    await ensureInit();
  },

  // --- Recent Searches ---
  getRecentSearches: async (): Promise<string[]> => {
    await ensureInit();
    try {
      const db = await getDB();
      const rows = await db.getAllAsync<{ query: string }>(
        `SELECT query FROM recent_searches ORDER BY searched_at DESC LIMIT 10`
      );
      return rows.map((r) => r.query);
    } catch {
      return [];
    }
  },

  addRecentSearch: async (query: string) => {
    if (!query || !query.trim()) return;
    await ensureInit();
    try {
      const db = await getDB();
      const clean = query.trim();
      await db.runAsync(
        `INSERT OR REPLACE INTO recent_searches (query, searched_at) VALUES (?, ?)`,
        [clean, Date.now()]
      );
    } catch {}
  },

  clearRecentSearches: async () => {
    await ensureInit();
    try {
      const db = await getDB();
      await db.runAsync(`DELETE FROM recent_searches`);
    } catch {}
  },

  // --- Recently Played ---
  getRecentlyPlayed: async (): Promise<any[]> => {
    await ensureInit();
    try {
      const db = await getDB();
      const rows = await db.getAllAsync<{
        id: string;
        name: string;
        sanskrit: string;
        category: string;
        path: string;
      }>(`SELECT id, name, sanskrit, category, path FROM recently_played ORDER BY played_at DESC LIMIT 10`);
      return rows;
    } catch {
      return [];
    }
  },

  addRecentlyPlayed: async (item: any) => {
    if (!item) return;
    await ensureInit();
    try {
      const db = await getDB();
      const itemToSave = {
        id: String(item.id || Math.random().toString()),
        name: item.title || item.name || item.chalisa_name || item.vidhi_name || item.stotra_name || item.katha_name || item.aarti_name || 'Mantra',
        sanskrit: item.sanskrit || item.sanskrit_title || item.text || '',
        category: item.category || item.category_name || item.festival_category || item.deity_name || 'Divine',
        path: item.path || 'mantra'
      };

      await db.runAsync(
        `INSERT OR REPLACE INTO recently_played (id, name, sanskrit, category, path, played_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          itemToSave.id,
          itemToSave.name,
          itemToSave.sanskrit,
          itemToSave.category,
          itemToSave.path,
          Date.now(),
        ]
      );
    } catch {}
  },

  // --- Jaap Logs (90-day rolling window) ---
  getJaapLogs: async (): Promise<JaapLogItem[]> => {
    await ensureInit();
    try {
      const db = await getDB();
      const rows = await db.getAllAsync<JaapLogItem>(
        `SELECT date, formatted_date AS formattedDate, total_chants AS totalChants, completed_malas AS completedMalas FROM jaap_logs ORDER BY date DESC LIMIT 90`
      );
      return rows;
    } catch {
      return [];
    }
  },

  recordJaapTap: async (incrementCount: number = 1, incrementMala: number = 0) => {
    await ensureInit();
    try {
      const db = await getDB();
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      const existing = await db.getFirstAsync<{ total_chants: number; completed_malas: number }>(
        `SELECT total_chants, completed_malas FROM jaap_logs WHERE date = ?`,
        [dateStr]
      );

      if (existing) {
        const newChants = existing.total_chants + incrementCount;
        const newMalas  = existing.completed_malas + incrementMala;
        await db.runAsync(
          `UPDATE jaap_logs SET total_chants = ?, completed_malas = ?, updated_at = ? WHERE date = ?`,
          [newChants, newMalas, Date.now(), dateStr]
        );
      } else {
        await db.runAsync(
          `INSERT INTO jaap_logs (date, formatted_date, total_chants, completed_malas, updated_at) VALUES (?, ?, ?, ?, ?)`,
          [dateStr, formattedDate, incrementCount, incrementMala, Date.now()]
        );
      }

      await cleanupOldJaapLogs();
    } catch (e) {
      console.warn('Failed to record jaap log:', e);
    }
  },

  clearJaapLogs: async () => {
    await ensureInit();
    try {
      const db = await getDB();
      await db.runAsync(`DELETE FROM jaap_logs`);
    } catch {}
  }
};
