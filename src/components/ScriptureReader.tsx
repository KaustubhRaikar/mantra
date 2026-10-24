import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import { CosmicBackground } from './CosmicBackground';
import { GlassHeader } from './GlassHeader';
import { AudioPlayerBar } from './AudioPlayerBar';
import { GlassCard } from './GlassCard';
import { useFavorites } from '../contexts/FavoritesContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  safeSetAudioMode,
  safeCreateSound,
  playWithExpoSpeech,
  resolveAudioUrl,
} from '../utils/audioPlayer';
import {
  ParsedPoojaStep,
  ParsedSamagriItem,
  ParsedVidhiMeta,
  ParsedNamavaliItem,
} from '../utils/scriptureParser';

interface ScriptureReaderProps {
  id: string;
  title: string;
  sanskritText?: string;
  hindiText?: string;
  englishMeaning?: string;
  transliteration?: string;
  deityName?: string;
  audioUrl?: string;
  categoryPath: string;
  loading?: boolean;
  poojaSteps?: ParsedPoojaStep[];
  samagriItems?: ParsedSamagriItem[];
  vidhiMeta?: ParsedVidhiMeta;
  namavaliItems?: ParsedNamavaliItem[];
  isNamavali?: boolean;
}

export function ScriptureReader({
  id,
  title,
  sanskritText,
  hindiText,
  englishMeaning,
  transliteration,
  deityName,
  audioUrl,
  categoryPath,
  loading = false,
  poojaSteps,
  samagriItems,
  vidhiMeta,
  namavaliItems,
  isNamavali,
}: ScriptureReaderProps) {
  const insets = useSafeAreaInsets();
  const { isFavorite: checkFavorite, toggleFavorite } = useFavorites();
  const { isDark, colors } = useTheme();
  const isFav = checkFavorite(id);

  const isPoojaVidhi =
    categoryPath === 'pooja_vidhi' || (poojaSteps && poojaSteps.length > 0);

  // Tab Definitions
  type TabType = 'sanskrit' | 'hindi' | 'meaning' | 'translit' | 'steps' | 'samagri' | 'details' | 'archana';
  const availableTabs: { key: TabType; label: string }[] = [];

  if (isPoojaVidhi) {
    if (poojaSteps && poojaSteps.length > 0) {
      availableTabs.push({ key: 'steps', label: `विधि चरण (${poojaSteps.length})` });
    }
    if (samagriItems && samagriItems.length > 0) {
      availableTabs.push({ key: 'samagri', label: `पूजा सामग्री (${samagriItems.length})` });
    }
    availableTabs.push({ key: 'details', label: 'विवरण व महत्व' });
  } else {
    if (namavaliItems && namavaliItems.length > 0) {
      if (isNamavali) {
        availableTabs.push({ key: 'archana', label: `🌸 नामार्चन (${namavaliItems.length})` });
        if (sanskritText) availableTabs.push({ key: 'sanskrit', label: 'संपूर्ण पाठ' });
      } else {
        if (sanskritText) availableTabs.push({ key: 'sanskrit', label: 'श्लोक पाठ' });
        availableTabs.push({ key: 'archana', label: `🌸 नामार्चन (${namavaliItems.length})` });
      }
    } else {
      if (sanskritText) availableTabs.push({ key: 'sanskrit', label: 'Sanskrit' });
    }
    if (hindiText) availableTabs.push({ key: 'hindi', label: 'Hindi' });
    if (englishMeaning) availableTabs.push({ key: 'meaning', label: 'Meaning' });
    if (transliteration) availableTabs.push({ key: 'translit', label: 'Translit' });
  }

  // Active Tab
  const defaultTab = availableTabs.length > 0
    ? availableTabs[0].key
    : isPoojaVidhi
    ? 'steps'
    : namavaliItems && isNamavali
    ? 'archana'
    : 'sanskrit';

  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  // Namavali Archana State & Handlers
  const [offeredNames, setOfferedNames] = useState<Record<number, boolean>>({});
  const toggleOfferName = (num: number) => {
    setOfferedNames((prev) => ({ ...prev, [num]: !prev[num] }));
  };
  const offerAllNames = () => {
    if (!namavaliItems) return;
    const all: Record<number, boolean> = {};
    namavaliItems.forEach((n) => {
      all[n.number] = true;
    });
    setOfferedNames(all);
  };
  const resetArchana = () => {
    setOfferedNames({});
  };
  const offeredCount = Object.values(offeredNames).filter(Boolean).length;

  // Checklist tracking for devotee during Pooja Vidhi
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const toggleStepCompleted = (stepNum: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const [collectedSamagri, setCollectedSamagri] = useState<Record<number, boolean>>({});
  const toggleSamagriCollected = (index: number) => {
    setCollectedSamagri((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Accessibility Font Scaling
  const [fontSize, setFontSize] = useState<number>(18);
  const zoomIn = () => setFontSize((s) => Math.min(28, s + 2));
  const zoomOut = () => setFontSize((s) => Math.max(14, s - 2));

  // Audio Playback & Repeat Logic
  const soundRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [positionMillis, setPositionMillis] = useState<number>(0);
  const [durationMillis, setDurationMillis] = useState<number>(108000);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [targetCycles, setTargetCycles] = useState<number>(1);

  const hasRemoteAudio = Boolean(resolveAudioUrl(audioUrl));
  const hasTextToChant = Boolean(sanskritText || title);
  const isAudioAvailable = hasRemoteAudio || hasTextToChant;

  useEffect(() => {
    safeSetAudioMode();
    return () => {
      if (soundRef.current?.unloadAsync) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      setPositionMillis(status.positionMillis);
      setDurationMillis(status.durationMillis || 108000);
      setIsPlaying(status.isPlaying);
      if (typeof status.currentCycle === 'number') {
        setCurrentCycle(status.currentCycle);
      }
      if (typeof status.targetCycles === 'number') {
        setTargetCycles(status.targetCycles);
      }

      const currentProgress =
        status.durationMillis && status.durationMillis > 0
          ? status.positionMillis / status.durationMillis
          : 0;
      setProgress(currentProgress);

      if (status.didJustFinish) {
        setIsPlaying(false);
        soundRef.current?.setPositionAsync(0).catch(() => {});
      }
    }
  }, []);

  const togglePlay = async () => {
    try {
      if (soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          await soundRef.current.playAsync();
        }
      } else {
        const payload = {
          audio_url: audioUrl,
          sanskrit: sanskritText,
          title,
        };
        const { sound } = await safeCreateSound(payload, onPlaybackStatusUpdate, {
          repeatCount,
        });
        soundRef.current = sound;
        await sound.playAsync();
      }
    } catch (e) {
      console.warn('Failed audio playback:', e);
      setIsPlaying(false);
    }
  };

  const handleSelectRepeatCount = (count: number) => {
    setRepeatCount(count);
    if (soundRef.current) {
      // Re-trigger playback with new repeat count if playing
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
      setIsPlaying(false);
      setProgress(0);
      setPositionMillis(0);
    }
  };

  // Chant specific verse or step with natural human-like voice
  const chantText = async (textToChant: string, stepTitle?: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      setIsPlaying(true);
      const sound = playWithExpoSpeech(textToChant, onPlaybackStatusUpdate, stepTitle, repeatCount);
      soundRef.current = sound;
    } catch (e) {
      console.warn('Failed chant speech:', e);
      setIsPlaying(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareText = `🕉️ ${title}\n\n${sanskritText || ''}\n\n${englishMeaning || ''}\n\nShared via Mantra App — Discover Divine Peace.`;
      await Share.share({ message: shareText });
    } catch (e) {
      // Ignored
    }
  };

  const getCurrentText = () => {
    switch (activeTab) {
      case 'sanskrit':
        return sanskritText || '';
      case 'hindi':
        return hindiText || sanskritText || '';
      case 'meaning':
        return englishMeaning || 'Meaning not available.';
      case 'translit':
        return transliteration || 'Transliteration not available.';
      default:
        return sanskritText || '';
    }
  };

  const isDevanagari = activeTab === 'sanskrit' || activeTab === 'hindi';

  return (
    <View style={styles.root}>
      <CosmicBackground />

      {/* Unified Glass Header */}
      <GlassHeader
        title={title}
        subtitle={deityName}
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Share scripture"
            >
              <Ionicons name="share-outline" size={22} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                toggleFavorite({
                  id,
                  title,
                  sanskrit: sanskritText,
                  god: deityName,
                  path: categoryPath,
                })
              }
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={isFav ? 'Remove favorite' : 'Add favorite'}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={22}
                color={isFav ? colors.primary : colors.text}
              />
            </TouchableOpacity>
          </View>
        }
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            पावन श्लोक लोड हो रहे हैं...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Controls Bar: Tabs & Font Resizer */}
          <View style={styles.controlsBar}>
            {/* View Mode Tabs */}
            <View style={styles.tabsRow}>
              {availableTabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.tabChip,
                      {
                        backgroundColor: isActive
                          ? isDark
                            ? 'rgba(255, 153, 51, 0.2)'
                            : 'rgba(230, 126, 34, 0.15)'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.04)',
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tabChipText,
                        { color: isActive ? colors.primary : colors.textSecondary },
                        isActive && { fontWeight: '700' },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Accessibility Font Zoom Controls */}
            <View
              style={[
                styles.zoomControls,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
                  borderColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity
                onPress={zoomOut}
                style={styles.zoomButton}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel="Decrease font size"
              >
                <Text
                  style={[
                    styles.zoomText,
                    { color: isDark ? colors.secondary : colors.primary },
                  ]}
                >
                  A-
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={zoomIn}
                style={styles.zoomButton}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel="Increase font size"
              >
                <Text
                  style={[
                    styles.zoomText,
                    { color: isDark ? colors.secondary : colors.primary },
                  ]}
                >
                  A+
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* POOJA VIDHI: STEP-BY-STEP CARDS VIEW */}
          {isPoojaVidhi && activeTab === 'steps' ? (
            <View style={styles.stepsContainer}>
              {poojaSteps && poojaSteps.length > 0 ? (
                poojaSteps.map((s) => {
                  const isDone = completedSteps[s.step] ?? false;
                  return (
                    <GlassCard
                      key={s.step}
                      style={[
                        styles.stepCard,
                        isDone && {
                          borderColor: 'rgba(46, 204, 113, 0.4)',
                          backgroundColor: isDark
                            ? 'rgba(46, 204, 113, 0.05)'
                            : 'rgba(46, 204, 113, 0.03)',
                        },
                      ]}
                    >
                      <View style={styles.stepHeaderRow}>
                        <View style={styles.stepBadgeCol}>
                          <View
                            style={[
                              styles.stepBadge,
                              { backgroundColor: colors.primary },
                            ]}
                          >
                            <Text style={styles.stepBadgeText}>चरण {s.step}</Text>
                          </View>
                          <Text
                            style={[
                              styles.stepTitleText,
                              { color: colors.text, fontSize: fontSize + 1 },
                            ]}
                          >
                            {s.name}
                          </Text>
                        </View>

                        <View style={styles.stepActionIcons}>
                          {/* Tap-to-chant step */}
                          <TouchableOpacity
                            onPress={() => chantText(`${s.name}. ${s.description}`, s.name)}
                            style={styles.stepListenBtn}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            accessibilityRole="button"
                            accessibilityLabel={`Chant step ${s.step}`}
                          >
                            <Ionicons
                              name="volume-medium-outline"
                              size={20}
                              color={colors.primary}
                            />
                          </TouchableOpacity>

                          {/* Completion toggle checkmark */}
                          <TouchableOpacity
                            onPress={() => toggleStepCompleted(s.step)}
                            style={styles.stepCheckBtn}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            accessibilityRole="button"
                            accessibilityLabel={
                              isDone ? 'Mark incomplete' : 'Mark complete'
                            }
                          >
                            <Ionicons
                              name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                              size={22}
                              color={isDone ? '#2ECC71' : colors.textMuted}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.stepDescText,
                          {
                            color: isDark ? '#E5E4EE' : '#2D283E',
                            fontSize,
                            lineHeight: fontSize * 1.55,
                          },
                          isDone && { opacity: 0.75 },
                        ]}
                        selectable
                      >
                        {s.description}
                      </Text>
                    </GlassCard>
                  );
                })
              ) : (
                <GlassCard style={styles.emptyCard}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {sanskritText || 'विधि चरण उपलब्ध नहीं हैं।'}
                  </Text>
                </GlassCard>
              )}
            </View>
          ) : null}

          {/* POOJA VIDHI: REQUIRED SAMAGRI VIEW */}
          {isPoojaVidhi && activeTab === 'samagri' ? (
            <View style={styles.samagriContainer}>
              <View style={styles.samagriHeader}>
                <Ionicons
                  name="basket-outline"
                  size={20}
                  color={colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.sectionHeading, { color: colors.text }]}>
                  आवश्यक पूजा सामग्री (Required Samagri)
                </Text>
              </View>

              {samagriItems && samagriItems.length > 0 ? (
                samagriItems.map((item, idx) => {
                  const isChecked = collectedSamagri[idx] ?? false;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => toggleSamagriCollected(idx)}
                      activeOpacity={0.8}
                    >
                      <GlassCard
                        style={[
                          styles.samagriItemCard,
                          isChecked && {
                            borderColor: 'rgba(46, 204, 113, 0.4)',
                            backgroundColor: isDark
                              ? 'rgba(46, 204, 113, 0.05)'
                              : 'rgba(46, 204, 113, 0.03)',
                          },
                        ]}
                      >
                        <Ionicons
                          name={isChecked ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={isChecked ? '#2ECC71' : colors.primary}
                          style={{ marginRight: 12 }}
                        />
                        <View style={styles.samagriInfoCol}>
                          <Text
                            style={[
                              styles.samagriItemTitle,
                              {
                                color: colors.text,
                                textDecorationLine: isChecked ? 'line-through' : 'none',
                                opacity: isChecked ? 0.7 : 1,
                              },
                            ]}
                          >
                            {item.item}
                          </Text>
                        </View>
                        {item.quantity ? (
                          <View
                            style={[
                              styles.quantityBadge,
                              {
                                backgroundColor: isDark
                                  ? 'rgba(255, 153, 51, 0.15)'
                                  : 'rgba(230, 126, 34, 0.1)',
                                borderColor: colors.borderGlow,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.quantityText,
                                { color: colors.primary },
                              ]}
                            >
                              {item.quantity}
                            </Text>
                          </View>
                        ) : null}
                      </GlassCard>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <GlassCard style={styles.emptyCard}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {hindiText || 'सामग्री सूची उपलब्ध नहीं है।'}
                  </Text>
                </GlassCard>
              )}
            </View>
          ) : null}

          {/* POOJA VIDHI: DETAILS & SIGNIFICANCE VIEW */}
          {isPoojaVidhi && activeTab === 'details' ? (
            <View style={styles.detailsContainer}>
              {/* Meta Grid: Duration, Best Time, Day */}
              {vidhiMeta?.duration || vidhiMeta?.bestTime || vidhiMeta?.day ? (
                <View style={styles.metaRow}>
                  {vidhiMeta?.duration ? (
                    <GlassCard style={styles.metaCard}>
                      <Ionicons name="time-outline" size={20} color={colors.primary} />
                      <Text style={[styles.metaCardLabel, { color: colors.textSecondary }]}>
                        अवधि (Duration)
                      </Text>
                      <Text style={[styles.metaCardVal, { color: colors.text }]}>
                        {vidhiMeta.duration}
                      </Text>
                    </GlassCard>
                  ) : null}

                  {vidhiMeta?.bestTime ? (
                    <GlassCard style={styles.metaCard}>
                      <Ionicons name="sunny-outline" size={20} color={colors.primary} />
                      <Text style={[styles.metaCardLabel, { color: colors.textSecondary }]}>
                        शुभ समय (Time)
                      </Text>
                      <Text style={[styles.metaCardVal, { color: colors.text }]}>
                        {vidhiMeta.bestTime}
                      </Text>
                    </GlassCard>
                  ) : null}

                  {vidhiMeta?.day ? (
                    <GlassCard style={styles.metaCard}>
                      <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                      <Text style={[styles.metaCardLabel, { color: colors.textSecondary }]}>
                        शुभ वार (Day)
                      </Text>
                      <Text style={[styles.metaCardVal, { color: colors.text }]}>
                        {vidhiMeta.day}
                      </Text>
                    </GlassCard>
                  ) : null}
                </View>
              ) : null}

              {/* Significance */}
              {vidhiMeta?.significance ? (
                <GlassCard style={styles.detailSectionCard}>
                  <Text style={[styles.detailSectionTitle, { color: colors.primary }]}>
                    ✨ महत्व (Significance)
                  </Text>
                  <Text
                    style={[
                      styles.detailSectionBody,
                      { color: isDark ? '#E5E4EE' : '#2D283E', fontSize },
                    ]}
                    selectable
                  >
                    {vidhiMeta.significance}
                  </Text>
                </GlassCard>
              ) : null}

              {/* Benefits */}
              {vidhiMeta?.benefits ? (
                <GlassCard style={styles.detailSectionCard}>
                  <Text style={[styles.detailSectionTitle, { color: colors.primary }]}>
                    🙏 पूजा के लाभ व फल (Benefits)
                  </Text>
                  <Text
                    style={[
                      styles.detailSectionBody,
                      { color: isDark ? '#E5E4EE' : '#2D283E', fontSize },
                    ]}
                    selectable
                  >
                    {vidhiMeta.benefits}
                  </Text>
                </GlassCard>
              ) : null}

              {/* Precautions */}
              {vidhiMeta?.precautions ? (
                <GlassCard
                  style={[
                    styles.detailSectionCard,
                    { borderColor: 'rgba(231, 76, 60, 0.4)' },
                  ]}
                >
                  <Text style={[styles.detailSectionTitle, { color: '#E74C3C' }]}>
                    ⚠️ सावधानियां (Precautions)
                  </Text>
                  <Text
                    style={[
                      styles.detailSectionBody,
                      { color: isDark ? '#E5E4EE' : '#2D283E', fontSize },
                    ]}
                    selectable
                  >
                    {vidhiMeta.precautions}
                  </Text>
                </GlassCard>
              ) : null}
            </View>
          ) : null}

          {/* INTERACTIVE ARCHARNA (नामार्चन) VIEW */}
          {!isPoojaVidhi && activeTab === 'archana' && namavaliItems && namavaliItems.length > 0 ? (
            <View style={styles.archanaContainer}>
              {/* Archana Progress Header Card */}
              <GlassCard style={styles.archanaHeaderCard} glow>
                <View style={styles.archanaProgressRow}>
                  <View style={styles.archanaIconBadge}>
                    <Text style={{ fontSize: 26 }}>🌸</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.archanaTitle, { color: colors.text }]}>
                      पावन नामार्चन (Pushpanjali Offerings)
                    </Text>
                    <Text style={[styles.archanaSubtitle, { color: colors.primary }]}>
                      {offeredCount} / {namavaliItems.length} नाम पुष्प समर्पित
                    </Text>
                  </View>
                </View>

                {/* Visual Progress Bar */}
                <View
                  style={[
                    styles.archanaProgressBarBg,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.06)',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.archanaProgressBarFill,
                      {
                        width: `${Math.min(
                          100,
                          Math.round((offeredCount / namavaliItems.length) * 100)
                        )}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>

                {/* Offering Action Controls */}
                <View style={styles.archanaActionsRow}>
                  <TouchableOpacity
                    onPress={offerAllNames}
                    style={[
                      styles.archanaActionBtn,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 153, 51, 0.18)'
                          : 'rgba(230, 126, 34, 0.12)',
                        borderColor: colors.borderGlow,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.primary,
                        fontWeight: '700',
                      }}
                    >
                      🌸 सर्व समर्पणम् (Offer All)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={resetArchana}
                    style={[
                      styles.archanaActionBtn,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.04)',
                        borderColor: colors.border,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={14}
                      color={colors.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        fontWeight: '600',
                      }}
                    >
                      पुनः आरम्भ (Reset)
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>

              {/* Namavali Chants List */}
              {namavaliItems.map((n) => {
                const isOffered = offeredNames[n.number] ?? false;
                return (
                  <GlassCard
                    key={n.number}
                    style={[
                      styles.namavaliCard,
                      isOffered && {
                        borderColor: 'rgba(255, 184, 0, 0.5)',
                        backgroundColor: isDark
                          ? 'rgba(255, 184, 0, 0.08)'
                          : 'rgba(255, 184, 0, 0.04)',
                      },
                    ]}
                  >
                    <View style={styles.namavaliRow}>
                      {/* Number Badge */}
                      <View
                        style={[
                          styles.namavaliNumberBadge,
                          {
                            backgroundColor: isOffered
                              ? colors.primary
                              : isDark
                              ? 'rgba(255, 255, 255, 0.08)'
                              : 'rgba(0, 0, 0, 0.05)',
                            borderColor: isOffered
                              ? colors.borderGlow
                              : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.namavaliNumberText,
                            {
                              color: isOffered
                                ? '#FFFFFF'
                                : colors.textSecondary,
                            },
                          ]}
                        >
                          #{n.number}
                        </Text>
                      </View>

                      {/* Name and Meaning */}
                      <View style={{ flex: 1, paddingHorizontal: 10 }}>
                        <Text
                          style={[
                            styles.namavaliNameText,
                            {
                              color: isOffered
                                ? isDark
                                  ? '#FFD700'
                                  : '#B8860B'
                                : colors.text,
                              fontSize: fontSize,
                            },
                          ]}
                        >
                          {n.name}
                        </Text>
                        {n.meaning ? (
                          <Text
                            style={[
                              styles.namavaliMeaningText,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {n.meaning}
                          </Text>
                        ) : null}
                      </View>

                      {/* Actions: Chant and Offer */}
                      <View style={styles.namavaliActions}>
                        <TouchableOpacity
                          onPress={() => chantText(n.name, `#${n.number}`)}
                          style={styles.namavaliChantBtn}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          accessibilityRole="button"
                          accessibilityLabel={`Chant ${n.name}`}
                        >
                          <Ionicons
                            name="volume-medium-outline"
                            size={20}
                            color={colors.primary}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => toggleOfferName(n.number)}
                          style={[
                            styles.namavaliOfferBtn,
                            {
                              backgroundColor: isOffered
                                ? isDark
                                  ? 'rgba(255, 184, 0, 0.25)'
                                  : 'rgba(230, 126, 34, 0.18)'
                                : isDark
                                ? 'rgba(255, 255, 255, 0.06)'
                                : 'rgba(0, 0, 0, 0.04)',
                              borderColor: isOffered
                                ? colors.borderGlow
                                : colors.border,
                            },
                          ]}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          accessibilityRole="button"
                          accessibilityLabel={
                            isOffered ? 'Name offered' : 'Offer flower'
                          }
                        >
                          <Text style={{ fontSize: 16 }}>
                            {isOffered ? '🌸' : '💮'}
                          </Text>
                          <Text
                            style={[
                              styles.namavaliOfferBtnText,
                              {
                                color: isOffered
                                  ? colors.primary
                                  : colors.textMuted,
                              },
                            ]}
                          >
                            {isOffered ? 'समर्पित' : 'अर्पण'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </GlassCard>
                );
              })}
            </View>
          ) : null}

          {/* STANDARD VERSES VIEW (Mantras, Aartis, Chalisas, Stotras) */}
          {!isPoojaVidhi && activeTab !== 'archana' ? (
            <GlassCard style={styles.versesCard} glow>
              <View style={styles.verseActionHeader}>
                <TouchableOpacity
                  onPress={() => chantText(getCurrentText(), title)}
                  style={[
                    styles.listenVerseBtn,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 153, 51, 0.15)'
                        : 'rgba(230, 126, 34, 0.12)',
                      borderColor: colors.borderGlow,
                    },
                  ]}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Chant this mantra"
                >
                  <Ionicons name="volume-high" size={16} color={colors.primary} />
                  <Text style={[styles.listenVerseText, { color: colors.primary }]}>
                    मंत्र पाठ सुनें (Listen)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.verseText,
                  {
                    color: isDevanagari
                      ? isDark
                        ? '#FFFFFF'
                        : '#171426'
                      : isDark
                      ? '#E5E4EE'
                      : '#2D283E',
                  },
                  isDevanagari && styles.devaVerseText,
                  {
                    fontSize,
                    lineHeight: isDevanagari ? fontSize * 1.65 : fontSize * 1.5,
                  },
                ]}
                maxFontSizeMultiplier={1.3}
                selectable
              >
                {getCurrentText()}
              </Text>
            </GlassCard>
          ) : null}
        </ScrollView>
      )}

      {/* Docked Floating Audio Player */}
      <View style={[styles.playerDock, { bottom: insets.bottom + 8 }]}>
        <AudioPlayerBar
          title={title}
          isPlaying={isPlaying}
          progress={progress}
          positionMillis={positionMillis}
          durationMillis={durationMillis}
          onTogglePlay={togglePlay}
          repeatCount={repeatCount}
          onSelectRepeatCount={handleSelectRepeatCount}
          currentCycle={currentCycle}
          targetCycles={targetCycles}
          isAvailable={isAudioAvailable}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.standard,
  },
  loadingText: {
    fontFamily: Typography.families.body,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.standard,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.standard,
    gap: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 3,
  },
  zoomButton: {
    width: 32,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    fontSize: 13,
    fontWeight: '800',
  },
  versesCard: {
    padding: Spacing.large,
    minHeight: 280,
  },
  verseActionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.standard,
  },
  listenVerseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  listenVerseText: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    fontWeight: '700',
  },
  verseText: {
    fontFamily: Typography.families.body,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  devaVerseText: {
    fontFamily: Typography.families.devanagari,
  },
  stepsContainer: {
    gap: 12,
  },
  stepCard: {
    padding: Spacing.standard,
    borderRadius: Radius.md,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepBadgeCol: {
    flex: 1,
    paddingRight: 8,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginBottom: 4,
  },
  stepBadgeText: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    fontWeight: '800',
    color: '#0C0A1A',
  },
  stepTitleText: {
    fontFamily: Typography.families.heading,
    fontWeight: '700',
  },
  stepActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepListenBtn: {
    padding: 4,
  },
  stepCheckBtn: {
    padding: 4,
  },
  stepDescText: {
    fontFamily: Typography.families.devanagari,
  },
  samagriContainer: {
    gap: 8,
  },
  samagriHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeading: {
    fontFamily: Typography.families.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  samagriItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.standard,
    borderRadius: Radius.md,
    marginBottom: 6,
  },
  samagriInfoCol: {
    flex: 1,
  },
  samagriItemTitle: {
    fontFamily: Typography.families.body,
    fontSize: 15,
    fontWeight: '600',
  },
  quantityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  quantityText: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    fontWeight: '700',
  },
  detailsContainer: {
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaCard: {
    flex: 1,
    minWidth: 100,
    padding: Spacing.compact,
    alignItems: 'center',
    gap: 4,
  },
  metaCardLabel: {
    fontFamily: Typography.families.body,
    fontSize: 10,
    fontWeight: '600',
  },
  metaCardVal: {
    fontFamily: Typography.families.heading,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  detailSectionCard: {
    padding: Spacing.standard,
    borderRadius: Radius.md,
  },
  detailSectionTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  detailSectionBody: {
    fontFamily: Typography.families.devanagari,
    lineHeight: 22,
  },
  emptyCard: {
    padding: Spacing.large,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.families.body,
    fontSize: 14,
    textAlign: 'center',
  },
  // Archana Mode Styles
  archanaContainer: {
    gap: 10,
    paddingBottom: 20,
  },
  archanaHeaderCard: {
    padding: Spacing.standard,
    borderRadius: Radius.md,
    gap: 12,
    marginBottom: 4,
  },
  archanaProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  archanaIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
  },
  archanaTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  archanaSubtitle: {
    fontFamily: Typography.families.body,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  archanaProgressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  archanaProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  archanaActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  archanaActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  namavaliCard: {
    paddingVertical: Spacing.compact,
    paddingHorizontal: Spacing.standard,
    borderRadius: Radius.md,
  },
  namavaliRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  namavaliNumberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  namavaliNumberText: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    fontWeight: '700',
  },
  namavaliNameText: {
    fontFamily: Typography.families.devanagari,
    fontWeight: '700',
    lineHeight: 24,
  },
  namavaliMeaningText: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  namavaliActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  namavaliChantBtn: {
    padding: 6,
    borderRadius: Radius.sm,
  },
  namavaliOfferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  namavaliOfferBtnText: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    fontWeight: '700',
  },
  playerDock: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
