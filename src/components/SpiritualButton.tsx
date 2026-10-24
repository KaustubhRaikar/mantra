import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Radius, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

export type ButtonVariant = 'primary' | 'glass' | 'destructive' | 'secondary';

interface SpiritualButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export function SpiritualButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}: SpiritualButtonProps) {
  const { isDark, colors } = useTheme();

  const isPrimary = variant === 'primary';
  const isGlass = variant === 'glass';
  const isDestructive = variant === 'destructive';
  const isSecondary = variant === 'secondary';

  const dynamicGlassStyle: ViewStyle | null = isGlass
    ? {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
        borderColor: colors.border,
      }
    : null;

  const containerStyle = [
    styles.baseButton,
    fullWidth && styles.fullWidth,
    isGlass && styles.glassButton,
    dynamicGlassStyle,
    isDestructive && styles.destructiveButton,
    isSecondary && styles.secondaryButton,
    disabled && styles.disabledButton,
    style,
  ];

  const content = (
    <View style={styles.contentRow}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? '#0C0A1A' : colors.text}
          style={styles.spinner}
        />
      ) : (
        <>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text
            style={[
              styles.baseText,
              isPrimary && styles.primaryText,
              isGlass && [styles.glassText, { color: colors.text }],
              isDestructive && styles.destructiveText,
              isSecondary && [styles.secondaryText, { color: isDark ? '#A29BFE' : '#5E48C8' }],
              disabled && styles.disabledText,
              textStyle,
            ]}
            maxFontSizeMultiplier={1.3}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  if (isPrimary && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[containerStyle, { paddingHorizontal: 0, paddingVertical: 0 }]}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    height: 52,
    minHeight: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.standard,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradientContainer: {
    width: '100%',
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.standard,
  },
  glassButton: {
    borderWidth: 1,
  },
  secondaryButton: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.25)',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'transparent',
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.compact,
  },
  spinner: {
    marginRight: Spacing.compact,
  },
  baseText: {
    fontFamily: Typography.families.heading,
    fontSize: Typography.sizes.body,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryText: {
    color: '#0C0A1A',
  },
  glassText: {
    fontWeight: '600',
  },
  secondaryText: {
    fontWeight: '600',
  },
  destructiveText: {
    color: '#FF3B30',
  },
  disabledText: {
    color: '#716D8E',
  },
});
