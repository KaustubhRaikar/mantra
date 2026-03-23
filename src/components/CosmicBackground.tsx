import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export function CosmicBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top Right Aura */}
      <View
        style={[
          styles.aura,
          {
            backgroundColor: Colors.primary,
            top: -height * 0.1,
            right: -width * 0.2,
          },
        ]}
      />

      {/* Bottom Left Aura */}
      <View
        style={[
          styles.aura,
          {
            backgroundColor: Colors.secondary,
            bottom: -height * 0.1,
            left: -width * 0.2,
            width: width * 0.9,
            height: width * 0.9,
          },
        ]}
      />

      {/* Central Symbol (Om) */}
      <Text style={styles.omSymbol}>ॐ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  aura: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width,
    opacity: 0.05,
    transform: [{ scale: 1.5 }],
  },
  omSymbol: {
    position: 'absolute',
    top: height * 0.35,
    left: width * 0.1,
    fontSize: width * 0.8,
    color: Colors.primary,
    opacity: 0.03, // extremely subtle so it doesn't disturb UX
    includeFontPadding: false,
    lineHeight: width * 0.8,
    fontWeight: '300',
  },
});
