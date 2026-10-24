import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

export const REPEAT_PRESETS = [
  { label: '1x', count: 1, title: 'Single' },
  { label: '11x', count: 11, title: '11 Chants' },
  { label: '21x', count: 21, title: '21 Chants' },
  { label: '108x', count: 108, title: '108 Mala Japa' },
  { label: '∞', count: -1, title: 'Continuous Loop' },
];

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
  repeatCount?: number;
  onSelectRepeatCount?: (count: number) => void;
  currentCycle?: number;
  targetCycles?: number;
  isAvailable?: boolean;
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
  repeatCount = 1,
  onSelectRepeatCount,
  currentCycle = 1,
  targetCycles,
  isAvailable = true,
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
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(22, 19, 43, 0.95)' : 'rgba(255, 255, 255, 0.96)',
            borderColor: colors.borderGlow,
            shadowColor: colors.primary,
          },
        ]}
      >
        {/* Top Repetition / Loop Selector Bar */}
        {onSelectRepeatCount && isAvailable ? (
          <View
            style={[
              styles.loopSelectorRow,
              {
                borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
              },
            ]}
          >
            <View style={styles.loopTitleCol}>
              <Ionicons name="repeat" size={13} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.loopLabelText, { color: colors.textSecondary }]}>
                {repeatCount === -1
                  ? 'अखंड जप (Infinite Loop)'
                  : repeatCount > 1
                  ? `जप चक्र: ${currentCycle} / ${repeatCount}`
                  : 'जप आवृत्ति (Repeat Count)'}
              </Text>
            </View>

            <View style={styles.presetsRow}>
              {REPEAT_PRESETS.map((p) => {
                const isSelected = repeatCount === p.count;
                return (
                  <TouchableOpacity
                    key={p.label}
                    onPress={() => onSelectRepeatCount(p.count)}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(0, 0, 0, 0.05)',
                        borderColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                    hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Repeat ${p.title}`}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
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
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Progress Track */}
        <View
          style={[
            styles.progressBarTrack,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPct}%`, backgroundColor: colors.primary },
            ]}
          />
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
              {!isAvailable
                ? 'ध्वनि रिकॉर्डिंग जल्द उपलब्ध होगी (Audio coming soon)'
                : `${formatTime(positionMillis)} / ${formatTime(durationMillis)}`}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {onToggleLoop && !onSelectRepeatCount ? (
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
              disabled={!isAvailable}
              style={[
                styles.playButton,
                {
                  backgroundColor: isAvailable ? colors.primary : colors.border,
                  shadowColor: isAvailable ? colors.primary : 'transparent',
                  opacity: isAvailable ? 1 : 0.6,
                },
              ]}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={
                !isAvailable
                  ? 'Audio recording coming soon'
                  : isPlaying
                  ? 'Pause chant'
                  : 'Play chant'
              }
            >
              <Ionicons
                name={!isAvailable ? 'volume-mute-outline' : isPlaying ? 'pause' : 'play'}
                size={22}
                color={isAvailable ? '#0C0A1A' : colors.textMuted}
                style={{ marginLeft: !isAvailable ? 0 : isPlaying ? 0 : 2 }}
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
  loopSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.standard,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  loopTitleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  loopLabelText: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    fontWeight: '600',
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  presetChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipText: {
    fontFamily: Typography.families.body,
    fontSize: 10,
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
