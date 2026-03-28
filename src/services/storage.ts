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
  }
};
