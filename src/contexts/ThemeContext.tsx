import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { DarkColors, LightColors, setGlobalTheme } from '../constants/theme';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextData {
  themeMode: ThemeMode;
  theme: 'dark' | 'light';
  isDark: boolean;
  colors: typeof DarkColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  navigationTheme: any;
}

const THEME_STORAGE_KEY = 'mantra_theme_mode';

const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export const CosmicThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemeModeState(saved);
        }
      } catch (err) {
        // Fallback to dark mode
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // Resolve active theme: 'light' or 'dark'
  const resolvedTheme: 'dark' | 'light' = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme === 'light' ? 'light' : 'dark';
    }
    return themeMode;
  }, [themeMode, systemScheme]);

  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  // Sync global Colors proxy
  useEffect(() => {
    setGlobalTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
    } catch (_) {}
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  }, [isDark, setThemeMode]);

  const navigationTheme = useMemo(() => ({
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '800' as const },
    },
  }), [isDark, colors]);

  const contextValue = useMemo(() => ({
    themeMode,
    theme: resolvedTheme,
    isDark,
    colors,
    toggleTheme,
    setThemeMode,
    navigationTheme,
  }), [themeMode, resolvedTheme, isDark, colors, toggleTheme, setThemeMode, navigationTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a CosmicThemeProvider');
  }
  return context;
};
