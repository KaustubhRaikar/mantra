import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { Radius, Spacing } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

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
  const { isDark, colors } = useTheme();

  const dynamicCardStyle: ViewStyle = {
    backgroundColor: colors.glassCard,
    borderColor: glow ? colors.borderGlow : colors.border,
    shadowColor: glow ? colors.primary : (isDark ? colors.primary : 'rgba(0, 0, 0, 0.4)'),
  };

  const cardStyle = [
    styles.card,
    dynamicCardStyle,
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
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.standard,
    overflow: 'hidden',
  },
  cardGlow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
});
