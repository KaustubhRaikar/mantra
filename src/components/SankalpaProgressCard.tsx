import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from './GlassCard';
import { sankalpaStorage, Anushthan } from '../services/sankalpaStorage';

export function SankalpaProgressCard() {
  const router = useRouter();
  const { isDark, colors } = useTheme();

  const [activeAnushthan, setActiveAnushthan] = useState<Anushthan | null>(null);

  const loadActive = useCallback(async () => {
    const active = await sankalpaStorage.getActiveAnushthan();
    setActiveAnushthan(active);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadActive();
    }, [loadActive])
  );

  if (!activeAnushthan) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push('/sankalpa/create' as any)}
        accessibilityRole="button"
        accessibilityLabel="Start a sacred spiritual vow"
      >
        <GlassCard style={styles.emptyCard} glow>
          <View style={styles.emptyLeft}>
            <View
              style={[
                styles.emptyIconCircle,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 153, 51, 0.15)'
                    : 'rgba(230, 126, 34, 0.12)',
                },
              ]}
            >
              <Ionicons name="flame" size={20} color={colors.primary} />
            </View>
            <View style={styles.emptyTextCol}>
              <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#171426' }]}>
                पवित्र संकल्प / अनुष्ठान आरंभ करें
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                21 या 40 दिवसीय दैनिक साधना लक्ष्य निर्धारित करें
              </Text>
            </View>
          </View>
          <Ionicons name="add-circle" size={26} color={colors.primary} />
        </GlassCard>
      </TouchableOpacity>
    );
  }

  const daysPct = Math.min(
    100,
    Math.round((activeAnushthan.completedDays / activeAnushthan.targetDays) * 100)
  );

  const malasPct = Math.min(
    100,
    Math.round((activeAnushthan.completedMalas / activeAnushthan.targetMalas) * 100)
  );

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push('/sankalpa' as any)}
      accessibilityRole="button"
      accessibilityLabel={`View active vow ${activeAnushthan.title}`}
    >
      <GlassCard style={styles.card} glow>
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.activeBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(46, 204, 113, 0.15)'
                      : 'rgba(46, 204, 113, 0.1)',
                  },
                ]}
              >
                <Text style={styles.activeBadgeText}>सक्रिय अनुष्ठान</Text>
              </View>

              {activeAnushthan.streak > 0 ? (
                <View
                  style={[
                    styles.streakBadge,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 153, 51, 0.15)'
                        : 'rgba(230, 126, 34, 0.1)',
                    },
                  ]}
                >
                  <Text style={[styles.streakText, { color: colors.primary }]}>
                    🔥 {activeAnushthan.streak} दिन निरंतर
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              style={[
                styles.titleText,
                { color: isDark ? '#FFFFFF' : '#171426' },
              ]}
              numberOfLines={1}
            >
              {activeAnushthan.title}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </View>

        {/* Dual Progress: Days and Malas */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              दिवसीय प्रगति: {activeAnushthan.completedDays} / {activeAnushthan.targetDays} दिन
            </Text>
            <Text style={[styles.progressPctText, { color: colors.primary }]}>
              {daysPct}%
            </Text>
          </View>

          <View
            style={[
              styles.progressBarTrack,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                { width: `${daysPct}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>

          <View style={[styles.progressRow, { marginTop: 6 }]}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              कुल माला: {activeAnushthan.completedMalas} / {activeAnushthan.targetMalas} माला
            </Text>
            <Text style={[styles.progressPctText, { color: colors.text }]}>
              {malasPct}%
            </Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.standard,
    marginBottom: Spacing.standard,
    borderRadius: Radius.lg,
  },
  emptyCard: {
    padding: Spacing.standard,
    marginBottom: Spacing.standard,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emptyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  emptyTextCol: {
    flex: 1,
  },
  emptyTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  emptySub: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    marginTop: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.compact,
  },
  titleCol: {
    flex: 1,
    paddingRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  activeBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 10,
    fontWeight: '800',
    color: '#2ECC71',
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  streakText: {
    fontFamily: Typography.families.body,
    fontSize: 10,
    fontWeight: '700',
  },
  titleText: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  progressSection: {
    gap: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontFamily: Typography.families.body,
    fontSize: 12,
  },
  progressPctText: {
    fontFamily: Typography.families.heading,
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
