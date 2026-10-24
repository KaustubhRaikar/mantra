import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Polygon,
  Path,
  G,
  Rect,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';

interface ShivaYantraProps {
  size?: number;
  isMeditating?: boolean;
  breathPhase?: 'inhale' | 'holdIn' | 'exhale' | 'holdOut';
}

export function ShivaYantra({
  size = 300,
  isMeditating = false,
  breathPhase,
}: ShivaYantraProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isMeditating) {
      scaleAnim.setValue(1);
      return;
    }
    if (breathPhase === 'inhale') {
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 4000,
        useNativeDriver: false,
      }).start();
    } else if (breathPhase === 'exhale') {
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 4000,
        useNativeDriver: false,
      }).start();
    }
  }, [isMeditating, breathPhase, scaleAnim]);

  const vb = 400;
  const c = 200;

  // 12 Petals generation for Shiva Yantra
  const petals12: string[] = [];
  const rIn = 120;
  const rOut = 145;
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180;
    const aPrev = ((i * 30 - 12) * Math.PI) / 180;
    const aNext = ((i * 30 + 12) * Math.PI) / 180;
    const tipX = c + rOut * Math.cos(angle);
    const tipY = c + rOut * Math.sin(angle);
    const p1X = c + rIn * Math.cos(aPrev);
    const p1Y = c + rIn * Math.sin(aPrev);
    const p2X = c + rIn * Math.cos(aNext);
    const p2Y = c + rIn * Math.sin(aNext);
    petals12.push(`M ${p1X} ${p1Y} Q ${tipX} ${tipY} ${p2X} ${p2Y}`);
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}>
        <Defs>
          <RadialGradient id="shivaBinduGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#A8E6CF" stopOpacity="1" />
            <Stop offset="60%" stopColor="#3498DB" stopOpacity="0.7" />
            <Stop offset="100%" stopColor="#2C3E50" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="shivaStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3498DB" />
            <Stop offset="50%" stopColor="#9B59B6" />
            <Stop offset="100%" stopColor="#E67E22" />
          </LinearGradient>
        </Defs>

        {/* 1. Bhupura (Outer Sacred Citadel) */}
        <G stroke="url(#shivaStroke)" strokeWidth="2.5" fill="none">
          <Path
            d={`
              M 35,35 L 160,35 L 160,20 L 240,20 L 240,35 L 365,35
              L 365,160 L 380,160 L 380,240 L 365,240 L 365,365
              L 240,365 L 240,380 L 160,380 L 160,365 L 35,365
              L 35,240 L 20,240 L 20,160 L 35,160 Z
            `}
          />
          <Rect x="46" y="46" width="308" height="308" stroke="#3498DB" strokeWidth="1" />
        </G>

        {/* 2. Concentric Circles */}
        <Circle cx={c} cy={c} r="162" stroke="url(#shivaStroke)" strokeWidth="1.5" fill="none" />
        <Circle cx={c} cy={c} r="150" stroke="#9B59B6" strokeWidth="1" fill="none" />

        {/* 3. 12 Lotus Petals */}
        <G stroke="url(#shivaStroke)" strokeWidth="1.5" fill="rgba(52, 152, 219, 0.06)">
          {petals12.map((d, i) => (
            <Path key={`p12-${i}`} d={d} />
          ))}
        </G>

        {/* 4. Inner Enclosing Circle */}
        <Circle cx={c} cy={c} r="118" stroke="url(#shivaStroke)" strokeWidth="1.5" fill="none" />

        {/* 5. Shatkona (Two Interlocking Equilateral Triangles) */}
        <G stroke="url(#shivaStroke)" strokeWidth="2" fill="rgba(155, 89, 182, 0.06)">
          {/* Upward Triangle (Shiva - Fire / Purusha) */}
          <Polygon points="200,90 96,270 304,270" stroke="#3498DB" />
          {/* Downward Triangle (Shakti - Water / Prakriti) */}
          <Polygon points="200,310 96,130 304,130" stroke="#E67E22" />
        </G>

        {/* 6. Trishula Resonances at 4 Quadrants */}
        <Circle cx={c} cy={c} r="52" stroke="#3498DB" strokeWidth="1" strokeDasharray="3,3" fill="none" />

        {/* 7. Central Bindu */}
        <Circle cx={c} cy={c} r="18" fill="url(#shivaBinduGlow)" opacity={0.7} />
        <Circle cx={c} cy={c} r="6" fill="#A8E6CF" />
        <Circle cx={c} cy={c} r="3" fill="#FFFFFF" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
