import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  // Animation value from 0 to 1
  const flowAnim = useRef(new Animated.Value(0)).current;

  // Option 3: "Very Slow Flow": we animate a 300% wide gradient slowly back and forth over 15 seconds.
  useEffect(() => {
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

  // Translate by negative width * 2 so the 300% wide gradient slides cleanly.
  const translateX = flowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(width * 2)],
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom, height: 64 + insets.bottom }]}>
      <View style={styles.barBackground}>
        <Animated.View style={[StyleSheet.absoluteFill, { width: width * 3, transform: [{ translateX }] }]}>
          <LinearGradient
            colors={[Colors.surface, '#fff4e6', '#ffe8cc', Colors.surface]} // Saffron-tinted subtle flowing gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <View style={styles.tabContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
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
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? Colors.primary : Colors.textSecondary}
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
    elevation: 8,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  barBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden', // Prevents the 300% wide gradient from bleeding outside the pill!
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
    height: 64, // Keep consistent height for interaction
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary, 
    marginTop: 4,
  },
});
