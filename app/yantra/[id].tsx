import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Radius, Spacing, Typography } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { SriYantra } from '../../src/components/yantras/SriYantra';
import { ShivaYantra } from '../../src/components/yantras/ShivaYantra';
import { GayatriYantra } from '../../src/components/yantras/GayatriYantra';

const { width } = Dimensions.get('window');
const YANTRA_SIZE = Math.min(width * 0.88, 360);

type BreathPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

export default function TratakaSessionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Duration in minutes (defaults to 5 mins)
  const [targetMinutes, setTargetMinutes] = useState<number>(5);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);

  // Pranayama Breath phase (4-4-4-4 Sama Vritti cycle)
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [phaseSeconds, setPhaseSeconds] = useState<number>(4);

  const timerRef = useRef<any>(null);
  const breathTimerRef = useRef<any>(null);

  // Get Yantra data
  const yantraTitle =
    id === 'shiva_yantra'
      ? 'शिव षट्कोण यंत्र (Shiva Yantra)'
      : id === 'gayatri_yantra'
      ? 'गायत्री सूर्य यंत्र (Gayatri Yantra)'
      : 'श्री यंत्र (Sri Yantra)';

  const renderYantra = () => {
    if (id === 'shiva_yantra') {
      return (
        <ShivaYantra
          size={YANTRA_SIZE}
          isMeditating={isActive}
          breathPhase={breathPhase}
        />
      );
    }
    if (id === 'gayatri_yantra') {
      return (
        <GayatriYantra
          size={YANTRA_SIZE}
          isMeditating={isActive}
          breathPhase={breathPhase}
        />
      );
    }
    return (
      <SriYantra
        size={YANTRA_SIZE}
        isMeditating={isActive}
        breathPhase={breathPhase}
      />
    );
  };

  // Main Session Countdown Timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (_) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // Breath Cycle Timer (4s Inhale -> 4s HoldIn -> 4s Exhale -> 4s HoldOut)
  useEffect(() => {
    if (!isActive) {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      return;
    }

    breathTimerRef.current = setInterval(() => {
      setPhaseSeconds((prev) => {
        if (prev <= 1) {
          // Transition to next breath phase
          setBreathPhase((currPhase) => {
            switch (currPhase) {
              case 'inhale':
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
                return 'holdIn';
              case 'holdIn':
                return 'exhale';
              case 'exhale':
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
                return 'holdOut';
              case 'holdOut':
                return 'inhale';
            }
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [isActive]);

  const toggleSession = () => {
    if (!isActive && secondsRemaining === 0) {
      setSecondsRemaining(targetMinutes * 60);
    }
    setIsActive(!isActive);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}
  };

  const handleSelectDuration = (mins: number) => {
    setTargetMinutes(mins);
    setSecondsRemaining(mins * 60);
    setIsActive(false);
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getBreathLabel = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'श्वास लें (Inhale)';
      case 'holdIn':
        return 'श्वास रोकें (Hold)';
      case 'exhale':
        return 'श्वास छोड़ें (Exhale)';
      case 'holdOut':
        return 'मौन स्थिर (Stillness)';
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Exit meditation"
        >
          <Ionicons name="close" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerInfoCol}>
          <Text style={styles.titleText}>{yantraTitle}</Text>
          <Text style={styles.subText}>त्राटक दृष्टि एकाग्रता ध्यान</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Breath Guidance Pill */}
      <View style={styles.breathGuideContainer}>
        {isActive ? (
          <View style={styles.breathPill}>
            <Text style={styles.breathPhaseText}>
              {getBreathLabel()} • {phaseSeconds}s
            </Text>
          </View>
        ) : (
          <Text style={styles.idleGuideText}>
            केंद्र बिंदु (Bindu) पर दृष्टि स्थिर कर ध्यान प्रारंभ करें
          </Text>
        )}
      </View>

      {/* Centered Sacred Yantra */}
      <View style={styles.yantraCenterContainer}>
        {renderYantra()}
      </View>

      {/* Bottom Controls: Duration Selector & Play/Pause */}
      <View style={styles.bottomControls}>
        {/* Timer Display */}
        <Text style={styles.timerDisplay}>
          {formatTime(secondsRemaining)}
        </Text>

        {/* Duration Pills */}
        {!isActive ? (
          <View style={styles.durationRow}>
            {[3, 5, 11, 21].map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => handleSelectDuration(m)}
                style={[
                  styles.durationPill,
                  targetMinutes === m && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.durationPillText,
                    targetMinutes === m && { color: '#0C0A1A', fontWeight: '800' },
                  ]}
                >
                  {m} मिनट
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Start / Pause Button */}
        <TouchableOpacity
          onPress={toggleSession}
          style={[styles.mainActionBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={isActive ? 'Pause meditation' : 'Start meditation'}
        >
          <Ionicons
            name={isActive ? 'pause' : 'play'}
            size={24}
            color="#0C0A1A"
            style={{ marginLeft: isActive ? 0 : 3 }}
          />
          <Text style={styles.mainActionBtnText}>
            {isActive ? 'विराम (Pause)' : 'ध्यान प्रारंभ करें (Begin)'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07050E',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.standard,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfoCol: {
    alignItems: 'center',
    flex: 1,
  },
  titleText: {
    fontFamily: Typography.families.heading,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subText: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    color: '#E5E4EE',
    opacity: 0.7,
    marginTop: 2,
  },
  breathGuideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
  },
  breathPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 153, 51, 0.2)',
    borderWidth: 1,
    borderColor: '#FF9933',
  },
  breathPhaseText: {
    fontFamily: Typography.families.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#FF9933',
  },
  idleGuideText: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    color: '#A09EAA',
    textAlign: 'center',
  },
  yantraCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bottomControls: {
    alignItems: 'center',
    gap: 12,
  },
  timerDisplay: {
    fontFamily: Typography.families.heading,
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  durationPillText: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    color: '#FFFFFF',
  },
  mainActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: Radius.full,
    width: '100%',
  },
  mainActionBtnText: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '800',
    color: '#0C0A1A',
    marginLeft: 6,
  },
});
