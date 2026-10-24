import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from './GlassCard';
import { calculatePanchang } from '../utils/panchangEngine';

export function PanchangCard() {
  const router = useRouter();
  const { isDark, colors } = useTheme();

  const panchang = useMemo(() => calculatePanchang(new Date()), []);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push('/panchang' as any)}
      accessibilityRole="button"
      accessibilityLabel="View full daily panchang and muhurta timeline"
    >
      <GlassCard style={styles.card} glow>
        {/* Top Header: Date, Tithi & Nakshatra */}
        <View style={styles.headerRow}>
          <View style={styles.leftCol}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.tithiBadge,
                  { backgroundColor: isDark ? 'rgba(255, 153, 51, 0.18)' : 'rgba(230, 126, 34, 0.12)' },
                ]}
              >
                <Text style={[styles.tithiBadgeText, { color: colors.primary }]}>
                  {panchang.paksha} पक्ष
                </Text>
              </View>

              {panchang.fastingToday ? (
                <View
                  style={[
                    styles.fastingBadge,
                    { backgroundColor: 'rgba(231, 76, 60, 0.15)', borderColor: 'rgba(231, 76, 60, 0.3)' },
                  ]}
                >
                  <Text style={styles.fastingBadgeText}>
                    🕉️ {panchang.fastingToday.split(' ')[1] || 'व्रत'}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              style={[
                styles.tithiTitle,
                { color: isDark ? '#FFFFFF' : '#171426' },
              ]}
              numberOfLines={1}
            >
              {panchang.tithiName}
            </Text>
            <Text style={[styles.nakshatraSub, { color: colors.textSecondary }]}>
              नक्षत्र: {panchang.nakshatra}
            </Text>
          </View>

          <View style={styles.sunTimesCol}>
            <View style={styles.sunRow}>
              <Ionicons name="sunny-outline" size={14} color="#F39C12" style={{ marginRight: 4 }} />
              <Text style={[styles.sunTimeText, { color: colors.text }]}>
                {panchang.sunriseTime}
              </Text>
            </View>
            <View style={styles.sunRow}>
              <Ionicons name="moon-outline" size={14} color="#9B59B6" style={{ marginRight: 4 }} />
              <Text style={[styles.sunTimeText, { color: colors.text }]}>
                {panchang.sunsetTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Current / Auspicious Muhurta Highlight */}
        <View
          style={[
            styles.muhurtaBox,
            {
              backgroundColor: panchang.currentMuhurtaStatus.isAuspicious
                ? isDark
                  ? 'rgba(46, 204, 113, 0.08)'
                  : 'rgba(46, 204, 113, 0.06)'
                : isDark
                ? 'rgba(231, 76, 60, 0.08)'
                : 'rgba(231, 76, 60, 0.06)',
              borderColor: panchang.currentMuhurtaStatus.isAuspicious
                ? 'rgba(46, 204, 113, 0.3)'
                : 'rgba(231, 76, 60, 0.3)',
            },
          ]}
        >
          <View style={styles.muhurtaLeft}>
            <Ionicons
              name={
                panchang.currentMuhurtaStatus.isAuspicious
                  ? 'sparkles'
                  : 'alert-circle-outline'
              }
              size={16}
              color={
                panchang.currentMuhurtaStatus.isAuspicious
                  ? '#2ECC71'
                  : '#E74C3C'
              }
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.muhurtaName,
                {
                  color: panchang.currentMuhurtaStatus.isAuspicious
                    ? isDark
                      ? '#2ECC71'
                      : '#27AE60'
                    : '#E74C3C',
                },
              ]}
            >
              {panchang.currentMuhurtaStatus.name}
            </Text>
          </View>

          <View style={styles.viewDetailsRow}>
            <Text style={[styles.detailsLink, { color: colors.primary }]}>
              सम्पूर्ण पंचांग
            </Text>
            <Ionicons name="chevron-forward" size={13} color={colors.primary} />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  leftCol: {
    flex: 1,
    paddingRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tithiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  tithiBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 10,
    fontWeight: '700',
  },
  fastingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  fastingBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 10,
    fontWeight: '800',
    color: '#E74C3C',
  },
  tithiTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  nakshatraSub: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    marginTop: 2,
  },
  sunTimesCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  sunRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sunTimeText: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    fontWeight: '600',
  },
  muhurtaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.compact,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  muhurtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  muhurtaName: {
    fontFamily: Typography.families.heading,
    fontSize: 12,
    fontWeight: '700',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsLink: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    fontWeight: '700',
  },
});
