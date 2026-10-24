import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassHeader } from '../../src/components/GlassHeader';
import { GlassCard } from '../../src/components/GlassCard';
import { sankalpaStorage, Anushthan } from '../../src/services/sankalpaStorage';

export default function SankalpaDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  const [active, setActive] = useState<Anushthan | null>(null);
  const [history, setHistory] = useState<Anushthan[]>([]);

  const loadData = useCallback(async () => {
    const act = await sankalpaStorage.getActiveAnushthan();
    const all = await sankalpaStorage.getAllAnushthans();
    setActive(act);
    setHistory(all.filter((a) => a.id !== act?.id));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handlePoornaAhuti = (item: Anushthan) => {
    Alert.alert(
      'पूर्णाहुति (Complete Vow)',
      `क्या आप "${item.title}" संकल्प को श्रद्धापूर्वक संपन्न करना चाहते हैं?`,
      [
        { text: 'रद्द करें', style: 'cancel' },
        {
          text: 'संपन्न करें (Complete)',
          onPress: async () => {
            await sankalpaStorage.completeAnushthan(item.id);
            loadData();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <CosmicBackground />
      <GlassHeader
        title="साधना संकल्प व अनुष्ठान"
        subtitle="Spiritual Vows & Milestones"
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/sankalpa/create' as any)}
            style={styles.headerBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Create new vow"
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Vow Section */}
        {active ? (
          <View style={styles.activeSection}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>
              🔥 सक्रिय साधना संकल्प (Active Vow)
            </Text>

            <GlassCard style={styles.activeCard} glow>
              <View style={styles.activeHeader}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>साधना जारी</Text>
                </View>
                {active.streak > 0 ? (
                  <View style={styles.streakBadge}>
                    <Text style={[styles.streakText, { color: colors.primary }]}>
                      🔥 {active.streak} दिन निरंतर
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={[styles.activeTitle, { color: isDark ? '#FFFFFF' : '#171426' }]}>
                {active.title}
              </Text>
              <Text style={[styles.activeDeity, { color: colors.primary }]}>
                इष्ट देव: {active.deity}
              </Text>

              {active.mantraText ? (
                <View
                  style={[
                    styles.mantraBox,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 153, 51, 0.08)'
                        : 'rgba(230, 126, 34, 0.06)',
                      borderColor: colors.borderGlow,
                    },
                  ]}
                >
                  <Text style={[styles.mantraText, { color: colors.text }]}>
                    {active.mantraText}
                  </Text>
                </View>
              ) : null}

              {/* Progress Counters */}
              <View style={styles.statsGrid}>
                <View style={styles.statCol}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    दिवसीय प्रगति
                  </Text>
                  <Text style={[styles.statVal, { color: colors.text }]}>
                    {active.completedDays} / {active.targetDays} दिन
                  </Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    कुल जप माला
                  </Text>
                  <Text style={[styles.statVal, { color: colors.text }]}>
                    {active.completedMalas} / {active.targetMalas} माला
                  </Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    कुल मंत्र जप
                  </Text>
                  <Text style={[styles.statVal, { color: colors.primary }]}>
                    {active.completedBeads.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)' as any)}
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  activeOpacity={0.85}
                >
                  <Ionicons name="finger-print" size={16} color="#0C0A1A" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>जप प्रारंभ करें (Chant)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handlePoornaAhuti(active)}
                  style={[
                    styles.actionBtnSecondary,
                    { borderColor: colors.border },
                  ]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.actionBtnSecText, { color: colors.textSecondary }]}>
                    पूर्णाहुति
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        ) : (
          <GlassCard style={styles.emptyCard} glow>
            <Ionicons name="sparkles" size={40} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#171426' }]}>
              कोई सक्रिय संकल्प नहीं है
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              अपने आध्यात्मिक अनुशासन एवं मनोकामना पूर्ति हेतु 21 या 40 दिवसीय पावन संकल्प लें।
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/sankalpa/create' as any)}
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
            >
              <Text style={styles.createBtnText}>नया संकल्प आरंभ करें</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Past Vows History */}
        {history.length > 0 ? (
          <View style={styles.historySection}>
            <Text style={[styles.sectionHeading, { color: colors.text, marginTop: Spacing.large }]}>
              📜 पूर्व संकल्प इतिहास (Past Vows)
            </Text>

            {history.map((item) => (
              <GlassCard key={item.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          item.status === 'completed'
                            ? 'rgba(46, 204, 113, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color:
                            item.status === 'completed' ? '#2ECC71' : colors.textMuted,
                        },
                      ]}
                    >
                      {item.status === 'completed' ? 'संपन्न (Completed)' : 'विराम (Paused)'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.historySub, { color: colors.textSecondary }]}>
                  {item.completedMalas} माला • {item.completedDays} दिन साधना
                </Text>
              </GlassCard>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.standard,
  },
  sectionHeading: {
    fontFamily: Typography.families.heading,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.compact,
  },
  activeSection: {
    marginBottom: Spacing.standard,
  },
  activeCard: {
    padding: Spacing.standard,
    borderRadius: Radius.lg,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
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
  activeTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  activeDeity: {
    fontFamily: Typography.families.body,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  mantraBox: {
    padding: Spacing.compact,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginVertical: Spacing.standard,
  },
  mantraText: {
    fontFamily: Typography.families.devanagari,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: Spacing.compact,
    marginBottom: Spacing.standard,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: Typography.families.body,
    fontSize: 10,
  },
  statVal: {
    fontFamily: Typography.families.heading,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  actionBtnText: {
    fontFamily: Typography.families.body,
    fontSize: 13,
    fontWeight: '800',
    color: '#0C0A1A',
  },
  actionBtnSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  actionBtnSecText: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    padding: Spacing.large,
    alignItems: 'center',
    borderRadius: Radius.lg,
    marginVertical: Spacing.large,
  },
  emptyTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: Typography.families.body,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: Spacing.standard,
    lineHeight: 20,
  },
  createBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.full,
  },
  createBtnText: {
    fontFamily: Typography.families.body,
    fontSize: 14,
    fontWeight: '800',
    color: '#0C0A1A',
  },
  historySection: {
    marginTop: Spacing.compact,
  },
  historyCard: {
    padding: Spacing.standard,
    borderRadius: Radius.md,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  statusPillText: {
    fontFamily: Typography.families.body,
    fontSize: 10,
    fontWeight: '700',
  },
  historySub: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    marginTop: 4,
  },
});
