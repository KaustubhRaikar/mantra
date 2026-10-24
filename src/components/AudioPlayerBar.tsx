import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface AudioPlayerBarProps {
  title: string;
  isPlaying: boolean;
  progress: number; // 0 to 1
  positionMillis: number;
  durationMillis: number;
  onTogglePlay: () => void;
  onSeek?: (ratio: number) => void;
  isLooping?: boolean;
  onToggleLoop?: () => void;
}

export function AudioPlayerBar({
  title,
  isPlaying,
  progress,
  positionMillis,
  durationMillis,
  onTogglePlay,
  isLooping = false,
  onToggleLoop,
}: AudioPlayerBarProps) {
  const { isDark, colors } = useTheme();

  const formatTime = (millis: number) => {
    const totalSec = Math.floor(millis / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = Math.min(100, Math.max(0, Math.round(progress * 100)));

  return (
    <View style={styles.floatingContainer}>
      <View style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(22, 19, 43, 0.95)' : 'rgba(255, 255, 255, 0.96)',
          borderColor: colors.borderGlow,
          shadowColor: colors.primary,
        }
      ]}>
        {/* Progress Track at top edge of player */}
        <View style={[styles.progressBarTrack, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }]}>
          <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: colors.primary }]} />
        </View>

        <View style={styles.contentRow}>
          {/* Track Info */}
          <View style={styles.infoCol}>
            <Text
              style={[styles.titleText, { color: colors.text }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
            >
              {title}
            </Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {formatTime(positionMillis)} / {formatTime(durationMillis)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {onToggleLoop ? (
              <TouchableOpacity
                onPress={onToggleLoop}
                style={styles.auxButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Loop chant audio"
              >
                <Ionicons
                  name="repeat"
                  size={20}
                  color={isLooping ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            ) : null}

            {/* Main Play/Pause Button */}
            <TouchableOpacity
              onPress={onTogglePlay}
              style={[styles.playButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Pause chant' : 'Play chant'}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={22}
                color="#0C0A1A"
                style={{ marginLeft: isPlaying ? 0 : 2 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    paddingHorizontal: Spacing.standard,
    paddingBottom: Spacing.compact,
    backgroundColor: 'transparent',
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  progressBarTrack: {
    height: 4,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.standard,
    paddingVertical: Spacing.compact,
  },
  infoCol: {
    flex: 1,
    paddingRight: Spacing.standard,
  },
  titleText: {
    fontFamily: Typography.families.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  timeText: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  auxButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
});
