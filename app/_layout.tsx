import { useEffect } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments, ThemeProvider } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useFonts, TiroDevanagariHindi_400Regular } from '@expo-google-fonts/tiro-devanagari-hindi';
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { FavoritesProvider } from "../src/contexts/FavoritesContext";
import { CosmicThemeProvider, useTheme } from "../src/contexts/ThemeContext";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, sqlitePersister } from '../src/services/queryClient';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'setPositionAsync is not supported',
  'setBackgroundColorAsync is not supported',
  'setVisibilityAsync is not supported',
  'setBehaviorAsync is not supported',
]);

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { isDark, navigationTheme, colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const currentSegment = segments[0] as any;
    const inAuthGroup = currentSegment === 'login' || currentSegment === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="login" options={{ animationTypeForReplace: user ? 'push' : 'pop' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mantra/[id]" options={{ title: "Mantra Details" }} />
        <Stack.Screen name="aarti/[id]" options={{ title: "Aarti Details" }} />
        <Stack.Screen name="chalisa/[id]" options={{ title: "Chalisa Details" }} />
        <Stack.Screen name="stotra/[id]" options={{ title: "Stotra Details" }} />
        <Stack.Screen name="pooja_vidhi/[id]" options={{ title: "Pooja Vidhi Details" }} />
        <Stack.Screen name="vrat_katha/[id]" options={{ title: "Vrat Katha Details" }} />
        <Stack.Screen name="festival_aarti/[id]" options={{ title: "Festival Aarti Details" }} />
        <Stack.Screen name="search/index" options={{ title: "Search" }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    TiroDevanagariHindi_400Regular,
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden").catch(() => {});
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#080711' }}>
        <ActivityIndicator size="large" color="#FF9933" />
      </View>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: sqlitePersister }}
    >
      <CosmicThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <RootLayoutNav />
          </FavoritesProvider>
        </AuthProvider>
      </CosmicThemeProvider>
    </PersistQueryClientProvider>
  );
}
