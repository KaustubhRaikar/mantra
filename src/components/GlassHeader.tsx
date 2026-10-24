import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../constants/theme';

interface GlassHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function GlassHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction,
}: GlassHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.headerContent}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}

        <View style={styles.titleContainer}>
          <Text
            style={styles.titleText}
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={styles.subtitleText}
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightActionContainer}>
          {rightAction || <View style={styles.backButtonPlaceholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'rgba(14, 12, 31, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.standard,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 48,
    height: 48,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.compact,
  },
  titleText: {
    fontFamily: Typography.families.heading,
    fontSize: Typography.sizes.heading3,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.caption,
    color: Colors.primary,
    marginTop: 2,
    textAlign: 'center',
  },
  rightActionContainer: {
    minWidth: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
