import { useEffect } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as NavigationBar from 'expo-navigation-bar';
import { Theme, Colors } from "../src/constants/theme";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // TypeScript workaround for expo-router typed navigation strictness
    const currentSegment = segments[0] as any;
    const inAuthGroup = currentSegment === 'login' || currentSegment === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/login' as any);
    } else if (user && inAuthGroup) {
      // Redirect to the home page if already logged in.
      router.replace('/(tabs)' as any);
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={Theme}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="login" options={{ animationTypeForReplace: user ? 'push' : 'pop' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mantra/[id]" options={{ title: "Mantra Details" }} />
        <Stack.Screen name="search/index" options={{ title: "Search" }} />
      </Stack>
    </ThemeProvider>
  );
}

import { FavoritesProvider } from "../src/contexts/FavoritesContext";

import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'setPositionAsync is not supported',
  'setBackgroundColorAsync is not supported',
  'setVisibilityAsync is not supported',
  'setBehaviorAsync is not supported',
  'Expo AV has been deprecated'
]);

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden").catch(() => {});
    }
  }, []);

  return (
    <AuthProvider>
      <FavoritesProvider>
        <RootLayoutNav />
      </FavoritesProvider>
    </AuthProvider>
  );
}
