import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as NavigationBar from 'expo-navigation-bar';

import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export function CustomTabBar({ state, descriptors, navigation }: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Animation value from 0 to 1
  const flowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Re-hide navigation bar on mount in case it popped up
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden').catch(() => {});
    }
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(flowAnim, {
          toValue: 1,
          duration: 15000, 
          useNativeDriver: true,
        }),
        Animated.timing(flowAnim, {
          toValue: 0,
          duration: 15000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [flowAnim]);

  const translateX = flowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(width * 2)],
  });

  const bottomPadding = Platform.OS === 'ios' ? insets.bottom : 0;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding, height: 64 + bottomPadding }]}>
      <View style={styles.barBackground}>
        <Animated.View style={[StyleSheet.absoluteFill, { width: width * 3, transform: [{ translateX }] }]}>
          <LinearGradient
            colors={['#141126', '#1F1A3A', '#281E48', '#141126']} // Celestial deep indigo flowing gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <View style={styles.tabContent}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            let isDefaultPrevented = false;
            if (navigation && typeof navigation.emit === 'function') {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              isDefaultPrevented = event?.defaultPrevented ?? false;
            }

            if (!isFocused && !isDefaultPrevented) {
              if (navigation && typeof navigation.navigate === 'function') {
                navigation.navigate(route.name, route.params);
              } else {
                const targetPath = route.name === 'index' ? '/(tabs)' : `/(tabs)/${route.name}`;
                router.navigate(targetPath as any);
              }
            }
          };

          // Icons mapped directly based on the route name
          let iconName: any = 'home';
          if (route.name === 'index') iconName = 'book-outline';
          if (route.name === 'categories') iconName = 'leaf-outline';
          if (route.name === 'favorites') iconName = 'bookmark-outline';
          if (route.name === 'profile') iconName = 'settings-outline';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={route.name}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? Colors.primary : Colors.textMuted}
              />
              {isFocused && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  barBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F0C20',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  tabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly', 
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 2,
  },
});
