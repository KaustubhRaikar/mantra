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

interface GayatriYantraProps {
  size?: number;
  isMeditating?: boolean;
  breathPhase?: 'inhale' | 'holdIn' | 'exhale' | 'holdOut';
}

export function GayatriYantra({
  size = 300,
  isMeditating = false,
  breathPhase,
}: GayatriYantraProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isMeditating) {
      scaleAnim.setValue(1);
      return;
    }
    if (breathPhase === 'inhale') {
      Animated.timing(scaleAnim, {
        toValue: 1.45,
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

  // 24 Solar Petals representing the 24 syllables of the Gayatri Mantra
  const petals24: string[] = [];
  const rIn = 115;
  const rOut = 145;
  for (let i = 0; i < 24; i++) {
    const angle = (i * 15 * Math.PI) / 180;
    const aPrev = ((i * 15 - 6) * Math.PI) / 180;
    const aNext = ((i * 15 + 6) * Math.PI) / 180;
    const tipX = c + rOut * Math.cos(angle);
    const tipY = c + rOut * Math.sin(angle);
    const p1X = c + rIn * Math.cos(aPrev);
    const p1Y = c + rIn * Math.sin(aPrev);
    const p2X = c + rIn * Math.cos(aNext);
    const p2Y = c + rIn * Math.sin(aNext);
    petals24.push(`M ${p1X} ${p1Y} Q ${tipX} ${tipY} ${p2X} ${p2Y}`);
  }

  // 8 Inner Petals
  const petals8: string[] = [];
  const rIn8 = 75;
  const rOut8 = 100;
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 * Math.PI) / 180;
    const aPrev = ((i * 45 - 18) * Math.PI) / 180;
    const aNext = ((i * 45 + 18) * Math.PI) / 180;
    const tipX = c + rOut8 * Math.cos(angle);
    const tipY = c + rOut8 * Math.sin(angle);
    const p1X = c + rIn8 * Math.cos(aPrev);
    const p1Y = c + rIn8 * Math.sin(aPrev);
    const p2X = c + rIn8 * Math.cos(aNext);
    const p2Y = c + rIn8 * Math.sin(aNext);
    petals8.push(`M ${p1X} ${p1Y} Q ${tipX} ${tipY} ${p2X} ${p2Y}`);
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}>
        <Defs>
          <RadialGradient id="suryaBinduGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFF275" stopOpacity="1" />
            <Stop offset="50%" stopColor="#FFA000" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FF5722" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="solarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFC107" />
            <Stop offset="50%" stopColor="#FF9800" />
            <Stop offset="100%" stopColor="#FF5722" />
          </LinearGradient>
        </Defs>

        {/* 1. Bhupura with 4 Portals */}
        <G stroke="url(#solarStroke)" strokeWidth="2.5" fill="none">
          <Path
            d={`
              M 35,35 L 160,35 L 160,20 L 240,20 L 240,35 L 365,35
              L 365,160 L 380,160 L 380,240 L 365,240 L 365,365
              L 240,365 L 240,380 L 160,380 L 160,365 L 35,365
              L 35,240 L 20,240 L 20,160 L 35,160 Z
            `}
          />
          <Rect x="46" y="46" width="308" height="308" stroke="#FFA000" strokeWidth="1" />
        </G>

        {/* 2. Concentric Solar Boundary Circles */}
        <Circle cx={c} cy={c} r="162" stroke="url(#solarStroke)" strokeWidth="1.5" fill="none" />
        <Circle cx={c} cy={c} r="150" stroke="#FF9800" strokeWidth="1" fill="none" />

        {/* 3. 24 Akshara Solar Petals */}
        <G stroke="url(#solarStroke)" strokeWidth="1.2" fill="rgba(255, 193, 7, 0.06)">
          {petals24.map((d, i) => (
            <Path key={`p24-${i}`} d={d} />
          ))}
        </G>

        {/* 4. Intermediate Circle */}
        <Circle cx={c} cy={c} r="112" stroke="url(#solarStroke)" strokeWidth="1" fill="none" />

        {/* 5. 8 Inner Petals */}
        <G stroke="url(#solarStroke)" strokeWidth="1.5" fill="rgba(255, 152, 0, 0.08)">
          {petals8.map((d, i) => (
            <Path key={`p8-${i}`} d={d} />
          ))}
        </G>

        {/* 6. Central Equilateral Triangle (Cognitive Illumination) */}
        <Circle cx={c} cy={c} r="70" stroke="url(#solarStroke)" strokeWidth="1.2" fill="none" />
        <Polygon points="200,135 145,230 255,230" stroke="#FF5722" strokeWidth="1.8" fill="rgba(255, 87, 34, 0.06)" />

        {/* 7. Central Surya Savitur Bindu */}
        <Circle cx={c} cy={c} r="18" fill="url(#suryaBinduGlow)" opacity={0.75} />
        <Circle cx={c} cy={c} r="6" fill="#FFF59D" />
        <Circle cx={c} cy={c} r="3" fill="#E65100" />
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
