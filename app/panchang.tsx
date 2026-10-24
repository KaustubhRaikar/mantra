import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../src/constants/theme';
import { useTheme } from '../src/contexts/ThemeContext';
import { CosmicBackground } from '../src/components/CosmicBackground';
import { GlassHeader } from '../src/components/GlassHeader';
import { GlassCard } from '../src/components/GlassCard';
import { calculatePanchang } from '../src/utils/panchangEngine';

export default function PanchangScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  const [selectedOffset, setSelectedOffset] = useState<number>(0);

  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + selectedOffset);
    return d;
  }, [selectedOffset]);

  const panchang = useMemo(() => calculatePanchang(targetDate), [targetDate]);

  return (
    <View style={styles.root}>
      <CosmicBackground />
      <GlassHeader
        title="दैनिक पंचांग व शुभ मुहूर्त"
        subtitle="Vedic Astronomical Almanac"
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selector: Yesterday, Today, Tomorrow */}
        <View style={styles.dateSelectorRow}>
          {[-1, 0, 1].map((offset) => {
            const isSelected = selectedOffset === offset;
            const label =
              offset === -1 ? 'कल (Yesterday)' : offset === 0 ? 'आज (Today)' : 'कल (Tomorrow)';
            return (
              <TouchableOpacity
                key={offset}
                onPress={() => setSelectedOffset(offset)}
                style={[
                  styles.datePill,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.datePillText,
                    {
                      color: isSelected
                        ? '#0C0A1A'
                        : isDark
                        ? colors.textSecondary
                        : colors.textMuted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Main Tithi Banner Card */}
        <GlassCard style={styles.mainBannerCard} glow>
          <View style={styles.bannerHeader}>
            <View>
              <Text style={[styles.pakshaText, { color: colors.primary }]}>
                {panchang.paksha} पक्ष • {panchang.date}
              </Text>
              <Text style={[styles.tithiHeading, { color: isDark ? '#FFFFFF' : '#171426' }]}>
                {panchang.tithiName}
              </Text>
            </View>
            {panchang.fastingToday ? (
              <View style={styles.vratBadge}>
                <Text style={styles.vratBadgeText}>{panchang.fastingToday}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.divider} />

          {/* Nakshatra & Yoga */}
          <View style={styles.astroGrid}>
            <View style={styles.astroCol}>
              <Text style={[styles.astroLabel, { color: colors.textSecondary }]}>नक्षत्र (Nakshatra)</Text>
              <Text style={[styles.astroVal, { color: colors.text }]}>{panchang.nakshatra}</Text>
            </View>
            <View style={styles.astroCol}>
              <Text style={[styles.astroLabel, { color: colors.textSecondary }]}>योग (Yoga)</Text>
              <Text style={[styles.astroVal, { color: colors.text }]}>{panchang.yoga}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Sun & Moon Times */}
        <View style={styles.sunCardsRow}>
          <GlassCard style={styles.sunCard}>
            <Ionicons name="sunny-outline" size={24} color="#F39C12" />
            <Text style={[styles.sunCardLabel, { color: colors.textSecondary }]}>सूर्योदय (Sunrise)</Text>
            <Text style={[styles.sunCardTime, { color: colors.text }]}>{panchang.sunriseTime}</Text>
          </GlassCard>

          <GlassCard style={styles.sunCard}>
            <Ionicons name="sunny" size={24} color="#E67E22" />
            <Text style={[styles.sunCardLabel, { color: colors.textSecondary }]}>मध्याह्न (Noon)</Text>
            <Text style={[styles.sunCardTime, { color: colors.text }]}>{panchang.solarNoon}</Text>
          </GlassCard>

          <GlassCard style={styles.sunCard}>
            <Ionicons name="moon-outline" size={24} color="#9B59B6" />
            <Text style={[styles.sunCardLabel, { color: colors.textSecondary }]}>सूर्यास्त (Sunset)</Text>
            <Text style={[styles.sunCardTime, { color: colors.text }]}>{panchang.sunsetTime}</Text>
          </GlassCard>
        </View>

        {/* Auspicious Muhurtas Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          ✨ पावन एवं शुभ मुहूर्त (Auspicious Timings)
        </Text>

        <View style={styles.muhurtaList}>
          {/* Brahma Muhurta */}
          <GlassCard style={[styles.muhurtaCard, { borderColor: 'rgba(46, 204, 113, 0.4)' }]}>
            <View style={styles.muhurtaCardHeader}>
              <View style={styles.muhurtaTitleRow}>
                <Ionicons name="sparkles" size={18} color="#2ECC71" style={{ marginRight: 6 }} />
                <Text style={[styles.muhurtaTitle, { color: '#2ECC71' }]}>
                  ब्रह्म मुहूर्त (Brahma Muhurta)
                </Text>
              </View>
              <Text style={[styles.muhurtaTimeText, { color: colors.text }]}>
                {panchang.brahmaMuhurta.start} - {panchang.brahmaMuhurta.end}
              </Text>
            </View>
            <Text style={[styles.muhurtaDesc, { color: colors.textSecondary }]}>
              सर्वोच्च आध्यात्मिक ऊर्जा, ध्यान, गायत्री जप एवं ईष्ट साधना काल।
            </Text>
          </GlassCard>

          {/* Pratah Sandhya */}
          <GlassCard style={styles.muhurtaCard}>
            <View style={styles.muhurtaCardHeader}>
              <View style={styles.muhurtaTitleRow}>
                <Ionicons name="partly-sunny-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.muhurtaTitle, { color: colors.text }]}>
                  प्रातः संध्या (Pratah Sandhya)
                </Text>
              </View>
              <Text style={[styles.muhurtaTimeText, { color: colors.text }]}>
                {panchang.pratahSandhya.start} - {panchang.pratahSandhya.end}
              </Text>
            </View>
            <Text style={[styles.muhurtaDesc, { color: colors.textSecondary }]}>
              प्रातःकाल सूर्य वंदना, अर्घ्य समर्पण एवं दैनिक पूजा का समय।
            </Text>
          </GlassCard>

          {/* Abhijit Muhurta */}
          <GlassCard style={[styles.muhurtaCard, { borderColor: 'rgba(243, 156, 18, 0.4)' }]}>
            <View style={styles.muhurtaCardHeader}>
              <View style={styles.muhurtaTitleRow}>
                <Ionicons name="star" size={18} color="#F39C12" style={{ marginRight: 6 }} />
                <Text style={[styles.muhurtaTitle, { color: '#F39C12' }]}>
                  अभिजित मुहूर्त (Abhijit Muhurta)
                </Text>
              </View>
              <Text style={[styles.muhurtaTimeText, { color: colors.text }]}>
                {panchang.abhijitMuhurta.start} - {panchang.abhijitMuhurta.end}
              </Text>
            </View>
            <Text style={[styles.muhurtaDesc, { color: colors.textSecondary }]}>
              समस्त शुभ कार्यों, नए अनुष्ठान एवं महत्वपूर्ण निर्णयों के लिए सिद्ध विजय मुहूर्त।
            </Text>
          </GlassCard>

          {/* Sayam Sandhya */}
          <GlassCard style={styles.muhurtaCard}>
            <View style={styles.muhurtaCardHeader}>
              <View style={styles.muhurtaTitleRow}>
                <Ionicons name="flame-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.muhurtaTitle, { color: colors.text }]}>
                  सायं संध्या (Sayam Sandhya)
                </Text>
              </View>
              <Text style={[styles.muhurtaTimeText, { color: colors.text }]}>
                {panchang.sayamSandhya.start} - {panchang.sayamSandhya.end}
              </Text>
            </View>
            <Text style={[styles.muhurtaDesc, { color: colors.textSecondary }]}>
              संध्या आरती, दीप प्रज्वलन एवं हनुमान चालीसा पाठ का समय।
            </Text>
          </GlassCard>
        </View>

        {/* Inauspicious Caution Windows */}
        <Text style={[styles.sectionTitle, { color: '#E74C3C', marginTop: Spacing.standard }]}>
          ⚠️ वर्ज्य काल (Caution Windows)
        </Text>

        <View style={styles.muhurtaList}>
          {/* Rahu Kaal */}
          <GlassCard style={[styles.muhurtaCard, { borderColor: 'rgba(231, 76, 60, 0.35)' }]}>
            <View style={styles.muhurtaCardHeader}>
              <View style={styles.muhurtaTitleRow}>
                <Ionicons name="warning-outline" size={18} color="#E74C3C" style={{ marginRight: 6 }} />
                <Text style={[styles.muhurtaTitle, { color: '#E74C3C' }]}>
                  राहु काल (Rahu Kaal)
                </Text>
              </View>
              <Text style={[styles.muhurtaTimeText, { color: colors.text }]}>
                {panchang.rahuKaal.start} - {panchang.rahuKaal.end}
              </Text>
            </View>
            <Text style={[styles.muhurtaDesc, { color: colors.textSecondary }]}>
              नया कार्य, यात्रा या शुभ खरीदारी वर्जित। केवल ईष्ट/महामृत्युंजय स्मरण श्रेयस्कर।
            </Text>
          </GlassCard>

          {/* Yamaganda */}
          <GlassCard style={styles.muhurtaCard}>
            <View style={styles.muhurtaCardHeader}>
              <Text style={[styles.muhurtaTitle, { color: colors.textSecondary }]}>यमगण्ड (Yamaganda)</Text>
              <Text style={[styles.muhurtaTimeText, { color: colors.text }]}>
                {panchang.yamaganda.start} - {panchang.yamaganda.end}
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* Day Choghadiya Table */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.standard }]}>
          🕉️ दिन का चौघड़िया (Day Choghadiya)
        </Text>

        <GlassCard style={styles.choghadiyaCard}>
          {panchang.choghadiya.map((ch, idx) => (
            <View key={idx} style={[styles.choghadiyaRow, idx > 0 && styles.choghadiyaBorder]}>
              <Text style={[styles.chPeriod, { color: colors.textSecondary }]}>{ch.period}</Text>
              <View style={styles.chBadgeRow}>
                <View
                  style={[
                    styles.chBadge,
                    {
                      backgroundColor: ch.isAuspicious
                        ? isDark
                          ? 'rgba(46, 204, 113, 0.15)'
                          : 'rgba(46, 204, 113, 0.1)'
                        : isDark
                        ? 'rgba(231, 76, 60, 0.15)'
                        : 'rgba(231, 76, 60, 0.1)',
                      borderColor: ch.isAuspicious ? '#2ECC71' : '#E74C3C',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chBadgeText,
                      { color: ch.isAuspicious ? '#2ECC71' : '#E74C3C' },
                    ]}
                  >
                    {ch.name}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.standard,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.standard,
  },
  datePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillText: {
    fontFamily: Typography.families.body,
    fontSize: 12,
  },
  mainBannerCard: {
    padding: Spacing.standard,
    borderRadius: Radius.lg,
    marginBottom: Spacing.standard,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pakshaText: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  tithiHeading: {
    fontFamily: Typography.families.heading,
    fontSize: 20,
    fontWeight: '700',
  },
  vratBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderColor: '#E74C3C',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  vratBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    fontWeight: '800',
    color: '#E74C3C',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: Spacing.compact,
  },
  astroGrid: {
    flexDirection: 'row',
  },
  astroCol: {
    flex: 1,
  },
  astroLabel: {
    fontFamily: Typography.families.body,
    fontSize: 11,
  },
  astroVal: {
    fontFamily: Typography.families.heading,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  sunCardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.standard,
  },
  sunCard: {
    flex: 1,
    padding: Spacing.compact,
    alignItems: 'center',
    borderRadius: Radius.md,
    gap: 4,
  },
  sunCardLabel: {
    fontFamily: Typography.families.body,
    fontSize: 10,
    textAlign: 'center',
  },
  sunCardTime: {
    fontFamily: Typography.families.heading,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.compact,
  },
  muhurtaList: {
    gap: 8,
    marginBottom: Spacing.standard,
  },
  muhurtaCard: {
    padding: Spacing.standard,
    borderRadius: Radius.md,
  },
  muhurtaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  muhurtaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muhurtaTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  muhurtaTimeText: {
    fontFamily: Typography.families.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  muhurtaDesc: {
    fontFamily: Typography.families.devanagari,
    fontSize: 12,
    lineHeight: 18,
  },
  choghadiyaCard: {
    padding: Spacing.standard,
    borderRadius: Radius.lg,
  },
  choghadiyaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  choghadiyaBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  chPeriod: {
    fontFamily: Typography.families.body,
    fontSize: 12,
  },
  chBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  chBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    fontWeight: '700',
  },
});
