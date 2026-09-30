import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';

export interface FavoriteItem {
  id: string | number;
  name?: string;
  title?: string;
  god?: string;
  deity_name?: string;
  sanskrit?: string;
  category?: string;
  path?: string;
  [key: string]: any;
}

interface FavoritesContextData {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => Promise<void>;
  isFavorite: (id: string | number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const loadFavorites = async () => {
    try {
      const stored = await SecureStore.getItemAsync('favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites', error);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const isFavorite = (id: string | number) => {
    if (id === undefined || id === null) return false;
    return favorites.some((item) => String(item.id) === String(id));
  };

  const toggleFavorite = async (item: FavoriteItem) => {
    if (!item || item.id === undefined || item.id === null) return;
    try {
      const itemId = String(item.id);
      let updated: FavoriteItem[];

      if (isFavorite(itemId)) {
        updated = favorites.filter((fav) => String(fav.id) !== itemId);
      } else {
        const normalizedItem: FavoriteItem = {
          ...item,
          id: item.id,
          name: item.name || item.title || item.chalisa_name || item.vidhi_name || item.stotra_name || item.katha_name || item.aarti_name || 'Sacred Item',
          path: item.path || 'mantra',
        };
        updated = [normalizedItem, ...favorites.filter((fav) => String(fav.id) !== itemId)];
      }

      setFavorites(updated);
      await SecureStore.setItemAsync('favorites', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update favorites', error);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);

