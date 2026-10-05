import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { syncManager, SyncFavoriteItem } from '../services/syncManager';

export interface FavoriteItem extends SyncFavoriteItem {
  id: string | number;
  name?: string;
  title?: string;
  god?: string;
  deity_name?: string;
  sanskrit?: string;
  category?: string;
  path?: string;
  is_deleted?: number;
  updated_at?: number;
}

interface FavoritesContextData {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => Promise<void>;
  isFavorite: (id: string | number) => boolean;
  syncFavoritesWithCloud: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [allFavorites, setAllFavorites] = useState<FavoriteItem[]>([]);

  // Active non-deleted favorites for UI consumption
  const favorites = allFavorites.filter(item => !item.is_deleted);

  const loadFavorites = async () => {
    try {
      const stored = await SecureStore.getItemAsync('favorites');
      if (stored) {
        setAllFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites', error);
    }
  };

  const saveFavorites = async (items: FavoriteItem[]) => {
    setAllFavorites(items);
    try {
      await SecureStore.setItemAsync('favorites', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to persist favorites', error);
    }
  };

  const syncFavoritesWithCloud = async () => {
    await syncManager.syncFavorites(
      async () => allFavorites,
      async (mergedItems) => saveFavorites(mergedItems as FavoriteItem[])
    );
  };

  useEffect(() => {
    loadFavorites().then(() => {
      syncFavoritesWithCloud();
    });

    const unsubscribe = syncManager.initForegroundListener(() => {
      syncFavoritesWithCloud();
    });

    return () => unsubscribe();
  }, []);

  const isFavorite = (id: string | number) => {
    if (id === undefined || id === null) return false;
    const itemId = String(id);
    return allFavorites.some((item) => String(item.id) === itemId && !item.is_deleted);
  };

  const toggleFavorite = async (item: FavoriteItem) => {
    if (!item || item.id === undefined || item.id === null) return;
    try {
      const itemId = String(item.id);
      const now = Date.now();
      let updatedList: FavoriteItem[];

      if (isFavorite(itemId)) {
        // Mark as tombstone deleted for set-union cloud sync
        updatedList = allFavorites.map((fav) =>
          String(fav.id) === itemId
            ? { ...fav, is_deleted: 1, updated_at: now }
            : fav
        );
      } else {
        const normalizedItem: FavoriteItem = {
          ...item,
          id: itemId,
          name: item.name || item.title || item.chalisa_name || item.vidhi_name || item.stotra_name || item.katha_name || item.aarti_name || 'Sacred Item',
          path: item.path || 'mantra',
          is_deleted: 0,
          updated_at: now,
        };
        const existingIdx = allFavorites.findIndex((fav) => String(fav.id) === itemId);
        if (existingIdx >= 0) {
          updatedList = allFavorites.map((fav, i) => i === existingIdx ? normalizedItem : fav);
        } else {
          updatedList = [normalizedItem, ...allFavorites];
        }
      }

      await saveFavorites(updatedList);

      // Debounced sync after local favorite toggle
      syncManager.scheduleDebouncedSync(() => {
        syncFavoritesWithCloud();
      });
    } catch (error) {
      console.error('Failed to update favorites', error);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, syncFavoritesWithCloud }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
