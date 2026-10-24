import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  glow?: boolean;
  activeOpacity?: number;
}

export function GlassCard({
  children,
  style,
  onPress,
  glow = false,
  activeOpacity = 0.85,
}: GlassCardProps) {
  const cardStyle = [
    styles.card,
    glow && styles.cardGlow,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glassCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.standard,
    overflow: 'hidden',
  },
  cardGlow: {
    borderColor: Colors.borderGlow,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
});
