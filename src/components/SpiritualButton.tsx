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
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

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
  const isPrimary = variant === 'primary';
  const isGlass = variant === 'glass';
  const isDestructive = variant === 'destructive';
  const isSecondary = variant === 'secondary';

  const containerStyle = [
    styles.baseButton,
    fullWidth && styles.fullWidth,
    isGlass && styles.glassButton,
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
          color={isPrimary ? '#0C0A1A' : Colors.text}
          style={styles.spinner}
        />
      ) : (
        <>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text
            style={[
              styles.baseText,
              isPrimary && styles.primaryText,
              isGlass && styles.glassText,
              isDestructive && styles.destructiveText,
              isSecondary && styles.secondaryText,
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
          colors={[Colors.primary, Colors.secondary]}
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
    minHeight: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.standard,
    paddingVertical: Spacing.compact,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    minHeight: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.standard,
  },
  glassButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
  },
  secondaryText: {
    color: '#A29BFE',
  },
  destructiveText: {
    color: Colors.error,
  },
  disabledText: {
    color: Colors.textMuted,
  },
});
