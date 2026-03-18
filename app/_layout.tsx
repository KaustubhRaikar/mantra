import { useEffect } from 'react';
import { Platform } from 'react-native';
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as NavigationBar from 'expo-navigation-bar';
import { Theme } from "../src/constants/theme";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setPositionAsync("absolute");
      NavigationBar.setBackgroundColorAsync("#ffffff00");
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
  }, []);

  return (
    <ThemeProvider value={Theme}>
      <Stack screenOptions={{
        headerShown: false,

      }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mantra/[id]" options={{ title: "Mantra Details" }} />
        <Stack.Screen name="search/index" options={{ title: "Search" }} />
      </Stack>
    </ThemeProvider>
  );
}
