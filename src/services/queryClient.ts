import { QueryClient } from '@tanstack/react-query';
import { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import { getDB } from './db';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours stale time
      gcTime: 1000 * 60 * 60 * 24 * 7,  // 7 days garbage collection time
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export const sqlitePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    try {
      const db = await getDB();
      await db.runAsync(
        `INSERT OR REPLACE INTO meta_store (key, value) VALUES ('REACT_QUERY_OFFLINE_CACHE', ?)`,
        [JSON.stringify(client)]
      );
    } catch (e) {
      console.warn('Failed to persist query client to SQLite:', e);
    }
  },
  restoreClient: async (): Promise<PersistedClient | undefined> => {
    try {
      const db = await getDB();
      const row = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM meta_store WHERE key = 'REACT_QUERY_OFFLINE_CACHE'`
      );
      return row ? JSON.parse(row.value) : undefined;
    } catch {
      return undefined;
    }
  },
  removeClient: async () => {
    try {
      const db = await getDB();
      await db.runAsync(`DELETE FROM meta_store WHERE key = 'REACT_QUERY_OFFLINE_CACHE'`);
    } catch {}
  },
};
