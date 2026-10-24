import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import { GlassCard } from './GlassCard';

interface JapaOrbProps {
  count: number;
  goal: number;
  completedMalas: number;
  onTap: () => void;
  onReset: () => void;
  onSelectGoal: (goal: number) => void;
}

const { width } = Dimensions.get('window');
const ORB_SIZE = Math.min(width * 0.62, 240);

export function JapaOrb({
  count,
  goal,
  completedMalas,
  onTap,
  onReset,
  onSelectGoal,
}: JapaOrbProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    // Spring tap animation
    scaleAnim.setValue(0.92);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 250,
      useNativeDriver: true,
    }).start();

    onTap();
  };

  const progressPct = Math.min(100, Math.round((count / goal) * 100));

  return (
    <GlassCard style={styles.container} glow>
      {/* Header with Title and Reset */}
      <View style={styles.headerRow}>
        <View style={styles.titleBadge}>
          <Text style={styles.omMini}>ॐ</Text>
          <Text style={styles.titleText}>Sacred Japa Mala</Text>
        </View>

        <TouchableOpacity
          onPress={onReset}
          style={styles.resetButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Reset mala count"
        >
          <Ionicons name="refresh" size={16} color={Colors.secondary} />
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Goal Selector Pills */}
      <View style={styles.goalPillsRow}>
        <Text style={styles.goalLabel}>Goal:</Text>
        {[21, 54, 108, 1008].map((g) => {
          const isActive = goal === g;
          return (
            <TouchableOpacity
              key={g}
              style={[styles.goalPill, isActive && styles.goalPillActive]}
              onPress={() => onSelectGoal(g)}
              activeOpacity={0.7}
            >
              <Text style={[styles.goalPillText, isActive && styles.goalPillTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Central Sacred Golden Chanting Orb */}
      <View style={styles.orbWrapper}>
        <Animated.View style={[styles.orbScaleContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={styles.touchableOrb}
            onPress={handlePress}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={`Chant counter: ${count} of ${goal}. Tap to count chant.`}
            accessibilityHint="Increments your daily chanting count"
          >
            <LinearGradient
              colors={['#FF9933', '#F5B041', '#E67E22']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.orbGradient}
            >
              <View style={styles.orbInnerGlass}>
                <Text style={styles.orbOmSymbol}>ॐ</Text>
                <Text style={styles.orbCountText}>{count}</Text>
                <Text style={styles.orbGoalText}>/ {goal}</Text>
                <View style={styles.tapPrompt}>
                  <Text style={styles.tapPromptText}>TAP JAAP</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Mala Milestones & Completed Streak */}
      <View style={styles.footerRow}>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{progressPct}% of Mala</Text>
        </View>

        {completedMalas > 0 ? (
          <View style={styles.completedBadge}>
            <Ionicons name="ribbon" size={14} color="#FFF" />
            <Text style={styles.completedText}>
              {completedMalas} {completedMalas === 1 ? 'Mala' : 'Malas'} Done
            </Text>
          </View>
        ) : null}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.standard,
    marginBottom: Spacing.large,
    alignItems: 'center',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.small,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  omMini: {
    fontFamily: Typography.families.devanagari,
    fontSize: 20,
    color: Colors.primary,
  },
  titleText: {
    fontFamily: Typography.families.heading,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255, 153, 51, 0.1)',
  },
  resetText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  goalPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: Spacing.small,
  },
  goalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginRight: 4,
  },
  goalPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalPillActive: {
    backgroundColor: 'rgba(255, 153, 51, 0.2)',
    borderColor: Colors.primary,
  },
  goalPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  goalPillTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  orbWrapper: {
    width: ORB_SIZE + 24,
    height: ORB_SIZE + 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.small,
  },
  orbScaleContainer: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
  },
  touchableOrb: {
    width: '100%',
    height: '100%',
    borderRadius: ORB_SIZE / 2,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: ORB_SIZE / 2,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInnerGlass: {
    width: '100%',
    height: '100%',
    borderRadius: ORB_SIZE / 2,
    backgroundColor: 'rgba(22, 19, 43, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  orbOmSymbol: {
    fontFamily: Typography.families.devanagari,
    fontSize: 32,
    lineHeight: 40,
    color: Colors.secondary,
    opacity: 0.9,
  },
  orbCountText: {
    fontFamily: Typography.families.heading,
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 40,
  },
  orbGoalText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  tapPrompt: {
    backgroundColor: 'rgba(255, 153, 51, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.5)',
  },
  tapPromptText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },
  footerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.compact,
    gap: 12,
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C0A1A',
  },
});
