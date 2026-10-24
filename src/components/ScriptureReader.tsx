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
import { safeSetAudioMode, safeCreateSound } from '../utils/audioPlayer';

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
}: ScriptureReaderProps) {
  const insets = useSafeAreaInsets();
  const { isFavorite: checkFavorite, toggleFavorite } = useFavorites();
  const { isDark, colors } = useTheme();
  const isFav = checkFavorite(id);

  // View Mode Tabs
  type TabType = 'sanskrit' | 'hindi' | 'meaning' | 'translit';
  const availableTabs: { key: TabType; label: string }[] = [];
  if (sanskritText) availableTabs.push({ key: 'sanskrit', label: 'Sanskrit' });
  if (hindiText) availableTabs.push({ key: 'hindi', label: 'Hindi' });
  if (englishMeaning) availableTabs.push({ key: 'meaning', label: 'Meaning' });
  if (transliteration) availableTabs.push({ key: 'translit', label: 'Translit' });

  // Default to first available tab
  const [activeTab, setActiveTab] = useState<TabType>(
    availableTabs.length > 0 ? availableTabs[0].key : 'sanskrit'
  );

  // Accessibility Font Scaling
  const [fontSize, setFontSize] = useState<number>(18);
  const zoomIn = () => setFontSize((s) => Math.min(28, s + 2));
  const zoomOut = () => setFontSize((s) => Math.max(14, s - 2));

  // Audio Playback
  const soundRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [positionMillis, setPositionMillis] = useState<number>(0);
  const [durationMillis, setDurationMillis] = useState<number>(108000);
  const [isLooping, setIsLooping] = useState(false);

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
        const targetUrl =
          audioUrl ||
          'https://d237190n90f4i9.cloudfront.net/daily_mantra.mp3';
        const { sound } = await safeCreateSound(targetUrl, onPlaybackStatusUpdate);
        soundRef.current = sound;
        if (isLooping) {
          await sound.setIsLoopingAsync(true).catch(() => {});
        }
        await sound.playAsync();
      }
    } catch (e) {
      console.warn('Failed audio playback:', e);
      setIsPlaying(false);
    }
  };

  const toggleLoop = async () => {
    const next = !isLooping;
    setIsLooping(next);
    if (soundRef.current) {
      await soundRef.current.setIsLoopingAsync(next).catch(() => {});
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
              <Ionicons name="share-outline" size={22} color={Colors.text} />
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
                color={isFav ? Colors.primary : Colors.text}
              />
            </TouchableOpacity>
          </View>
        }
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching sacred verses...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 110 },
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
                    style={[styles.tabChip, isActive && styles.tabChipActive]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tabChipText,
                        isActive && styles.tabChipTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Accessibility Font Zoom Controls */}
            <View style={styles.zoomControls}>
              <TouchableOpacity
                onPress={zoomOut}
                style={styles.zoomButton}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel="Decrease font size"
              >
                <Text style={styles.zoomText}>A-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={zoomIn}
                style={styles.zoomButton}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel="Increase font size"
              >
                <Text style={styles.zoomText}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Verses Container */}
          <GlassCard style={styles.versesCard} glow>
            <Text
              style={[
                styles.verseText,
                { color: colors.text },
                isDevanagari && styles.devaVerseText,
                { fontSize, lineHeight: isDevanagari ? fontSize * 1.6 : fontSize * 1.5 },
              ]}
              maxFontSizeMultiplier={1.3}
              selectable
            >
              {getCurrentText()}
            </Text>
          </GlassCard>
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
          isLooping={isLooping}
          onToggleLoop={toggleLoop}
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabChipActive: {
    backgroundColor: 'rgba(255, 153, 51, 0.2)',
    borderColor: Colors.primary,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.secondary,
  },
  versesCard: {
    padding: Spacing.large,
    minHeight: 320,
  },
  verseText: {
    fontFamily: Typography.families.body,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  devaVerseText: {
    fontFamily: Typography.families.devanagari,
  },
  playerDock: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
