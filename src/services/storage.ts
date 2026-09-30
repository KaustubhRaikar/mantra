import * as SecureStore from 'expo-secure-store';
import { Mantra } from '../types/navigation';

const RECENT_SEARCHES_KEY = 'recentSearches';
const RECENTLY_PLAYED_KEY = 'recentlyPlayed';

export const storage = {
  getRecentSearches: async (): Promise<string[]> => {
    try {
      const data = await SecureStore.getItemAsync(RECENT_SEARCHES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  addRecentSearch: async (query: string) => {
    if (!query.trim()) return;
    try {
      let searches = await storage.getRecentSearches();
      searches = [query, ...searches.filter(s => s.toLowerCase() !== query.toLowerCase())].slice(0, 10);
      await SecureStore.setItemAsync(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch {}
  },
  
  clearRecentSearches: async () => {
    await SecureStore.deleteItemAsync(RECENT_SEARCHES_KEY);
  },

  getRecentlyPlayed: async (): Promise<any[]> => {
    try {
      const data = await SecureStore.getItemAsync(RECENTLY_PLAYED_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  addRecentlyPlayed: async (item: any) => {
    if (!item) return;
    try {
      let played = await storage.getRecentlyPlayed();
      const itemToSave = {
        id: item.id || Math.random().toString(),
        name: item.title || item.name || item.chalisa_name || item.vidhi_name || item.stotra_name || item.katha_name || item.aarti_name || 'Mantra',
        sanskrit: item.sanskrit || item.sanskrit_title || item.text || '',
        category: item.category || item.category_name || item.festival_category || item.deity_name || 'Divine',
        path: item.path || 'mantra' // fallback
      };
      
      // Prevent duplicates by ID and Name
      played = [itemToSave, ...played.filter((p: any) => p.name !== itemToSave.name)].slice(0, 10);
      await SecureStore.setItemAsync(RECENTLY_PLAYED_KEY, JSON.stringify(played));
    } catch {}
  },

  // Jaap Log History
  getJaapLogs: async (): Promise<{ date: string; formattedDate: string; totalChants: number; completedMalas: number }[]> => {
    try {
      const data = await SecureStore.getItemAsync('jaapLog');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  recordJaapTap: async (incrementCount: number = 1, incrementMala: number = 0) => {
    try {
      const logs = await storage.getJaapLogs();
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      const existingIndex = logs.findIndex((l) => l.date === dateStr);
      if (existingIndex >= 0) {
        logs[existingIndex].totalChants += incrementCount;
        logs[existingIndex].completedMalas += incrementMala;
      } else {
        logs.unshift({
          date: dateStr,
          formattedDate,
          totalChants: incrementCount,
          completedMalas: incrementMala,
        });
      }
      await SecureStore.setItemAsync('jaapLog', JSON.stringify(logs.slice(0, 90))); // Keep last 90 days
    } catch (e) {
      console.warn('Failed to record jaap log:', e);
    }
  },

  clearJaapLogs: async () => {
    await SecureStore.deleteItemAsync('jaapLog');
  }
};
