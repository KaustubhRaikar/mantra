import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export function CosmicBackground() {
  return (
    <View style={styles.rootCanvas} pointerEvents="none">
      {/* Top Right Saffron Aura */}
      <View
        style={[
          styles.aura,
          {
            backgroundColor: Colors.primary,
            top: -height * 0.1,
            right: -width * 0.25,
            opacity: 0.12,
          },
        ]}
      />

      {/* Bottom Left Celestial Purple Nebula */}
      <View
        style={[
          styles.aura,
          {
            backgroundColor: Colors.accent,
            bottom: -height * 0.1,
            left: -width * 0.25,
            width: width * 1.0,
            height: width * 1.0,
            opacity: 0.14,
          },
        ]}
      />

      {/* Sacred Central Om Silhouette */}
      <Text style={styles.omSymbol}>ॐ</Text>
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
    backgroundColor: Colors.background,
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
    color: Colors.primary,
    opacity: 0.04,
    includeFontPadding: false,
    lineHeight: width * 0.9,
    fontWeight: '300',
    textAlign: 'center',
  },
});
