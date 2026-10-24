import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

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
  const formatTime = (millis: number) => {
    const totalSec = Math.floor(millis / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = Math.min(100, Math.max(0, Math.round(progress * 100)));

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.card}>
        {/* Progress Track at top edge of player */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
        </View>

        <View style={styles.contentRow}>
          {/* Track Info */}
          <View style={styles.infoCol}>
            <Text
              style={styles.titleText}
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
            >
              {title}
            </Text>
            <Text style={styles.timeText}>
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
                  name={isLooping ? 'repeat' : 'repeat-outline'}
                  size={20}
                  color={isLooping ? Colors.primary : Colors.textMuted}
                />
              </TouchableOpacity>
            ) : null}

            {/* Play/Pause Button */}
            <TouchableOpacity
              onPress={onTogglePlay}
              style={styles.playButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
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
    backgroundColor: 'rgba(22, 19, 43, 0.94)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGlow,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
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
    color: Colors.text,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
});
