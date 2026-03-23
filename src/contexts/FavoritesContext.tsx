import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Mantra } from '../types/navigation';

interface FavoritesContextData {
  favorites: Mantra[];
  toggleFavorite: (mantra: Mantra) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<Mantra[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

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

  const toggleFavorite = async (mantra: Mantra) => {
    try {
      let updated: Mantra[];
      if (isFavorite(mantra.id)) {
        updated = favorites.filter((item) => item.id !== mantra.id);
      } else {
        updated = [...favorites, mantra];
      }
      setFavorites(updated);
      await SecureStore.setItemAsync('favorites', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update favorites', error);
    }
  };

  const isFavorite = (id: string) => {
    return favorites.some((item) => item.id === id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
