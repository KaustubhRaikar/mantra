import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../constants/theme';
import { SpiritualButton } from './SpiritualButton';
import { useTheme } from '../contexts/ThemeContext';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'leaf-outline',
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { borderColor: colors.borderGlow }]}>
        <Ionicons name={icon} size={36} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]} maxFontSizeMultiplier={1.3}>
        {title}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
        {description}
      </Text>
      {actionTitle && onAction ? (
        <View style={styles.buttonWrapper}>
          <SpiritualButton
            title={actionTitle}
            onPress={onAction}
            variant="glass"
            fullWidth={false}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.section,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 153, 51, 0.1)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.standard,
  },
  title: {
    fontFamily: Typography.families.heading,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.compact,
  },
  description: {
    fontFamily: Typography.families.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  buttonWrapper: {
    marginTop: Spacing.standard,
  },
});
