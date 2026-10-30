import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { GlassCard } from './GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { liturgicalCache } from '../services/liturgicalCache';
import { DayWorshipData } from '../data/canonicalTreasuryExpansion';
import { resolveScriptureTranslation } from '../utils/translationEngine';

interface DaySpecificWorshipCardProps {
  onSelectMantra?: (mantra: any) => void;
  onSelectVidhi?: (vidhi: any) => void;
}

const DAY_LABELS = [
  { day: 0, short: 'रवि', label: 'रविवार', en: 'Sun' },
  { day: 1, short: 'सोम', label: 'सोमवार', en: 'Mon' },
  { day: 2, short: 'मंगल', label: 'मंगलवार', en: 'Tue' },
  { day: 3, short: 'बुध', label: 'बुधवार', en: 'Wed' },
  { day: 4, short: 'गुरु', label: 'गुरुवार', en: 'Thu' },
  { day: 5, short: 'शुक्र', label: 'शुक्रवार', en: 'Fri' },
  { day: 6, short: 'शनि', label: 'शनिवार', en: 'Sat' },
];

export function DaySpecificWorshipCard({
  onSelectMantra,
  onSelectVidhi,
}: DaySpecificWorshipCardProps) {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { language, t } = useLanguage();

  const currentRealDay = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(currentRealDay);
  const [worshipData, setWorshipData] = useState<DayWorshipData | null>(null);

  // Load from on-device local cache immediately
  useEffect(() => {
    let isMounted = true;
    liturgicalCache.getDaySpecificWorship(selectedDay).then((data) => {
      if (isMounted) setWorshipData(data);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedDay]);

  if (!worshipData) {
    return null;
  }

  const isToday = selectedDay === currentRealDay;

  // Resolve multi-language translation for the day's primary mantra
  const resolvedMantraTranslation = resolveScriptureTranslation(
    worshipData.primaryMantra,
    language
  );

  const handleShareDayWorship = async () => {
    try {
      const shareText = `🕉️ ${worshipData.dayName} • ${worshipData.presidingDeity}\n\n` +
        `मन्त्र: ${worshipData.primaryMantra.sanskrit}\n\n` +
        `भावार्थ: ${resolvedMantraTranslation.text}\n\n` +
        `पूजा विधि: ${worshipData.poojaVidhi.title} (${worshipData.poojaVidhi.duration})\n\n` +
        `पवित्र मन्त्र साधना ऐप द्वारा प्रेषित।`;
      await Share.share({ message: shareText });
    } catch {}
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.vedicDayBadge,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 153, 51, 0.16)'
                    : 'rgba(230, 126, 34, 0.12)',
                  borderColor: colors.borderGlow,
                },
              ]}
            >
              <Text style={[styles.vedicDayBadgeText, { color: colors.primary }]}>
                {worshipData.daySanskritName}
              </Text>
            </View>
            {isToday && (
              <View
                style={[
                  styles.todayBadge,
                  { backgroundColor: colors.success || '#2ecc71' },
                ]}
              >
                <Text style={styles.todayBadgeText}>आज • Today</Text>
              </View>
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('todays_worship', 'आज की दैनिक वार पूजा व मंत्र')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShareDayWorship}
          style={[
            styles.shareIconBtn,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(0, 0, 0, 0.04)',
              borderColor: colors.border,
            },
          ]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="share-social-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 7-Day Interactive Day Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayStripContainer}
      >
        {DAY_LABELS.map((d) => {
          const isSelected = selectedDay === d.day;
          const isItemToday = currentRealDay === d.day;
          return (
            <TouchableOpacity
              key={d.day}
              onPress={() => setSelectedDay(d.day)}
              style={[
                styles.dayStripPill,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? 'rgba(255, 153, 51, 0.22)'
                      : 'rgba(230, 126, 34, 0.18)'
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
                  styles.dayStripTextShort,
                  {
                    color: isSelected ? colors.primary : colors.text,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {d.short}
              </Text>
              <Text
                style={[
                  styles.dayStripTextSub,
                  { color: isSelected ? colors.primary : colors.textMuted },
                ]}
              >
                {isItemToday ? 'आज' : d.en}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main Worship Card */}
      <GlassCard style={styles.card} glow>
        {/* Deity & Celestial Influence Header */}
        <View style={styles.deityHeaderRow}>
          <View
            style={[
              styles.deityIconBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 153, 51, 0.16)'
                  : 'rgba(230, 126, 34, 0.12)',
                borderColor: colors.borderGlow,
              },
            ]}
          >
            <Ionicons
              name={worshipData.deityIcon as any}
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.deitySubLabel, { color: colors.secondary }]}>
              {t('presiding_deity', 'अधिष्ठाता देव')} • {worshipData.rulingPlanet}
            </Text>
            <Text style={[styles.deityName, { color: colors.text }]}>
              {worshipData.presidingDeity}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.deityDescription,
            { color: isDark ? '#D5D4E6' : '#4A4660' },
          ]}
        >
          {worshipData.deityDescription}
        </Text>

        {/* Sacred Offerings Pill Grid */}
        <View
          style={[
            styles.offeringsBox,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(0, 0, 0, 0.02)',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.offeringItem}>
            <Text style={[styles.offeringLabel, { color: colors.textMuted }]}>
              🌸 पुष्प (Flower)
            </Text>
            <Text style={[styles.offeringVal, { color: colors.text }]}>
              {worshipData.sacredFlower}
            </Text>
          </View>
          <View style={styles.offeringDivider} />
          <View style={styles.offeringItem}>
            <Text style={[styles.offeringLabel, { color: colors.textMuted }]}>
              🍬 नैवेद्य (Offering)
            </Text>
            <Text style={[styles.offeringVal, { color: colors.text }]}>
              {worshipData.sacredNaivedya}
            </Text>
          </View>
        </View>

        {/* 1. Day Mantra Section */}
        <View
          style={[
            styles.subSectionCard,
            {
              backgroundColor: isDark
                ? 'rgba(22, 19, 43, 0.7)'
                : 'rgba(255, 255, 255, 0.85)',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.subSectionTitleRow}>
            <View style={styles.pillIcon}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
            </View>
            <Text style={[styles.subSectionTitle, { color: colors.primary }]}>
              {t('daily_mantra', 'दैनिक मंत्र')} • {worshipData.primaryMantra.name}
            </Text>
          </View>

          <Text
            style={[
              styles.mantraVerse,
              { color: isDark ? '#FFFFFF' : '#141126' },
            ]}
            selectable
          >
            {worshipData.primaryMantra.sanskrit}
          </Text>

          <Text
            style={[
              styles.mantraTranslation,
              { color: isDark ? '#B8B5D1' : '#5A5670' },
            ]}
            numberOfLines={3}
          >
            {resolvedMantraTranslation.text}
          </Text>

          <View style={styles.subActionRow}>
            <TouchableOpacity
              onPress={() => {
                if (onSelectMantra) {
                  onSelectMantra(worshipData.primaryMantra);
                } else {
                  router.push(`/mantra/${worshipData.primaryMantra.id}` as any);
                }
              }}
              style={[
                styles.primaryPillBtn,
                { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons name="hand-right-outline" size={15} color="#0c0a1a" />
              <Text style={styles.primaryPillBtnText}>
                {t('chant_now', 'जप करें')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/(tabs)/categories',
                  params: { tab: 'aartis' },
                });
              }}
              style={[
                styles.secondaryPillBtn,
                { borderColor: colors.borderGlow },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons name="flame-outline" size={15} color={colors.primary} />
              <Text
                style={[styles.secondaryPillBtnText, { color: colors.primary }]}
              >
                {t('daily_aarti', 'दैनिक आरती')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Day Pooja Vidhi Section */}
        <View
          style={[
            styles.subSectionCard,
            {
              backgroundColor: isDark
                ? 'rgba(22, 19, 43, 0.7)'
                : 'rgba(255, 255, 255, 0.85)',
              borderColor: colors.border,
              marginTop: 10,
            },
          ]}
        >
          <View style={styles.subSectionTitleRow}>
            <View style={styles.pillIcon}>
              <Ionicons name="book-outline" size={14} color={colors.secondary} />
            </View>
            <Text style={[styles.subSectionTitle, { color: colors.secondary }]}>
              {t('daily_pooja_vidhi', 'दैनिक पूजा विधि')} • {worshipData.poojaVidhi.duration}
            </Text>
          </View>

          <Text
            style={[
              styles.vidhiTitle,
              { color: isDark ? '#FFFFFF' : '#141126' },
            ]}
          >
            {worshipData.poojaVidhi.title}
          </Text>

          {/* First Step Preview */}
          {worshipData.poojaVidhi.steps.length > 0 && (
            <View style={styles.stepPreviewRow}>
              <View
                style={[
                  styles.stepNumberBadge,
                  { backgroundColor: colors.accent },
                ]}
              >
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text
                style={[
                  styles.stepPreviewText,
                  { color: isDark ? '#B8B5D1' : '#5A5670' },
                ]}
                numberOfLines={2}
              >
                {worshipData.poojaVidhi.steps[0].name}:{' '}
                {worshipData.poojaVidhi.steps[0].description}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              if (onSelectVidhi) {
                onSelectVidhi(worshipData.poojaVidhi);
              } else {
                router.push(`/pooja_vidhi/${worshipData.poojaVidhi.id}` as any);
              }
            }}
            style={[
              styles.fullWidthVidhiBtn,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 153, 51, 0.14)'
                  : 'rgba(230, 126, 34, 0.1)',
                borderColor: colors.borderGlow,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.fullWidthVidhiBtnText, { color: colors.primary }]}
            >
              {t('begin_worship', 'पूजा प्रारम्भ करें')} ({worshipData.poojaVidhi.steps.length} चरण) &rarr;
            </Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.standard,
    marginTop: Spacing.standard,
    marginBottom: Spacing.small,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleColumn: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  vedicDayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  vedicDayBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    fontWeight: '700',
  },
  todayBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  todayBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  sectionTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  shareIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayStripContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  dayStripPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 48,
  },
  dayStripTextShort: {
    fontSize: 13,
    fontFamily: Typography.families.devanagari,
  },
  dayStripTextSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  card: {
    padding: Spacing.standard,
  },
  deityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deityIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deitySubLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deityName: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Typography.families.heading,
  },
  deityDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  offeringsBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  offeringItem: {
    flex: 1,
  },
  offeringLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  offeringVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  offeringDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  subSectionCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 12,
  },
  subSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pillIcon: {
    marginRight: 6,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  mantraVerse: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Typography.families.devanagari,
    lineHeight: 22,
    marginBottom: 4,
  },
  mantraTranslation: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  subActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    gap: 5,
  },
  primaryPillBtnText: {
    color: '#0c0a1a',
    fontSize: 12,
    fontWeight: '800',
  },
  secondaryPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 5,
  },
  secondaryPillBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  vidhiTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepPreviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepNumberBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginTop: 1,
  },
  stepNumberText: {
    color: '#0c0a1a',
    fontSize: 10,
    fontWeight: '800',
  },
  stepPreviewText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  fullWidthVidhiBtn: {
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthVidhiBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
