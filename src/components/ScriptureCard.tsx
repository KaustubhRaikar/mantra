import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import { GlassCard } from './GlassCard';
import { useTheme } from '../contexts/ThemeContext';

interface ScriptureCardProps {
  title: string;
  sanskritTitle?: string;
  category?: string;
  god?: string;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showPlayIcon?: boolean;
}

export function ScriptureCard({
  title,
  sanskritTitle,
  category,
  god,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  showPlayIcon = true,
}: ScriptureCardProps) {
  const { isDark, colors } = useTheme();
  const displayCategory = category || god || 'Vedic';

  return (
    <GlassCard onPress={onPress} style={styles.cardContainer}>
      <View style={styles.leftContent}>
        {sanskritTitle ? (
          <Text
            style={[styles.sanskritText, { color: colors.primary }]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {sanskritTitle}
          </Text>
        ) : null}

        <Text
          style={[styles.titleText, { color: colors.text }]}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {title}
        </Text>

        <View style={styles.metaRow}>
          <View style={[
            styles.categoryBadge,
            {
              backgroundColor: isDark ? 'rgba(255, 153, 51, 0.12)' : 'rgba(230, 126, 34, 0.10)',
              borderColor: isDark ? 'rgba(255, 153, 51, 0.25)' : 'rgba(230, 126, 34, 0.30)',
            }
          ]}>
            <Text style={[styles.categoryText, { color: isDark ? colors.secondary : colors.primary }]} numberOfLines={1}>
              {displayCategory}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rightActions}>
        {onToggleFavorite ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}

        {showPlayIcon ? (
          <View style={[
            styles.playIconContainer,
            {
              backgroundColor: isDark ? 'rgba(255, 153, 51, 0.15)' : 'rgba(230, 126, 34, 0.12)',
              borderColor: isDark ? 'rgba(255, 153, 51, 0.3)' : 'rgba(230, 126, 34, 0.35)',
            }
          ]}>
            <Ionicons name="play" size={16} color={colors.primary} />
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.small,
    paddingVertical: Spacing.standard,
  },
  leftContent: {
    flex: 1,
    paddingRight: Spacing.compact,
  },
  sanskritText: {
    fontFamily: Typography.families.devanagari,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.primary,
    marginBottom: 4,
  },
  titleText: {
    fontFamily: Typography.families.heading,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 153, 51, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.25)',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 153, 51, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
