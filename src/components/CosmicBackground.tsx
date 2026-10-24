import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export function CosmicBackground() {
  const { isDark, colors } = useTheme();

  return (
    <View style={[styles.rootCanvas, { backgroundColor: colors.background }]} pointerEvents="none">
      {/* Top Right Saffron Dawn / Cosmic Aura */}
      <View
        style={[
          styles.aura,
          {
            backgroundColor: isDark ? colors.primary : '#FFA726',
            top: -height * 0.1,
            right: -width * 0.25,
            opacity: isDark ? 0.12 : 0.15,
          },
        ]}
      />

      {/* Bottom Left Celestial Purple / Sandalwood Gold Nebula */}
      <View
        style={[
          styles.aura,
          {
            backgroundColor: isDark ? colors.accent : '#F5B041',
            bottom: -height * 0.1,
            left: -width * 0.25,
            width: width * 1.0,
            height: width * 1.0,
            opacity: isDark ? 0.14 : 0.12,
          },
        ]}
      />

      {/* Sacred Central Om Silhouette */}
      <Text style={[styles.omSymbol, { color: colors.primary, opacity: isDark ? 0.04 : 0.045 }]}>ॐ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rootCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  aura: {
    position: 'absolute',
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width,
    transform: [{ scale: 1.4 }],
  },
  omSymbol: {
    position: 'absolute',
    top: height * 0.22,
    left: width * 0.05,
    fontSize: width * 0.9,
    includeFontPadding: false,
    lineHeight: width * 0.9,
    fontWeight: '300',
    textAlign: 'center',
  },
});
