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

interface SriYantraProps {
  size?: number;
  isMeditating?: boolean;
  breathPhase?: 'inhale' | 'holdIn' | 'exhale' | 'holdOut';
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function SriYantra({
  size = 300,
  isMeditating = false,
  breathPhase,
}: SriYantraProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!isMeditating) {
      scaleAnim.setValue(1);
      glowAnim.setValue(0.8);
      return;
    }

    if (breathPhase === 'inhale') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.45,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (breathPhase === 'exhale') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 4000,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isMeditating, breathPhase, scaleAnim, glowAnim]);

  // Sacred geometry coordinates normalized to 400x400 viewBox
  const vb = 400;
  const c = 200;

  // 8 Petals generation
  const petals8: string[] = [];
  const rIn8 = 110;
  const rOut8 = 135;
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 * Math.PI) / 180;
    const aPrev = ((i * 45 - 20) * Math.PI) / 180;
    const aNext = ((i * 45 + 20) * Math.PI) / 180;
    const tipX = c + rOut8 * Math.cos(angle);
    const tipY = c + rOut8 * Math.sin(angle);
    const p1X = c + rIn8 * Math.cos(aPrev);
    const p1Y = c + rIn8 * Math.sin(aPrev);
    const p2X = c + rIn8 * Math.cos(aNext);
    const p2Y = c + rIn8 * Math.sin(aNext);
    petals8.push(`M ${p1X} ${p1Y} Q ${tipX} ${tipY} ${p2X} ${p2Y}`);
  }

  // 16 Petals generation
  const petals16: string[] = [];
  const rIn16 = 138;
  const rOut16 = 158;
  for (let i = 0; i < 16; i++) {
    const angle = (i * 22.5 * Math.PI) / 180;
    const aPrev = ((i * 22.5 - 10) * Math.PI) / 180;
    const aNext = ((i * 22.5 + 10) * Math.PI) / 180;
    const tipX = c + rOut16 * Math.cos(angle);
    const tipY = c + rOut16 * Math.sin(angle);
    const p1X = c + rIn16 * Math.cos(aPrev);
    const p1Y = c + rIn16 * Math.sin(aPrev);
    const p2X = c + rIn16 * Math.cos(aNext);
    const p2Y = c + rIn16 * Math.sin(aNext);
    petals16.push(`M ${p1X} ${p1Y} Q ${tipX} ${tipY} ${p2X} ${p2Y}`);
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}>
        <Defs>
          <RadialGradient id="binduGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFF275" stopOpacity="1" />
            <Stop offset="50%" stopColor="#FF9933" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F9D423" />
            <Stop offset="50%" stopColor="#FF4E50" />
            <Stop offset="100%" stopColor="#F9D423" />
          </LinearGradient>
        </Defs>

        {/* 1. Bhupura (Outer Square Citadel with 4 Portals) */}
        <G stroke="url(#goldStroke)" strokeWidth="2.5" fill="none">
          {/* Outer Layer */}
          <Path
            d={`
              M 30,30 L 160,30 L 160,15 L 240,15 L 240,30 L 370,30
              L 370,160 L 385,160 L 385,240 L 370,240 L 370,370
              L 240,370 L 240,385 L 160,385 L 160,370 L 30,370
              L 30,240 L 15,240 L 15,160 L 30,160 Z
            `}
          />
          {/* Middle Boundary Line */}
          <Rect x="42" y="42" width="316" height="316" stroke="#FF9933" strokeWidth="1" />
        </G>

        {/* 2. Concentric Mekhala Circles */}
        <Circle cx={c} cy={c} r="168" stroke="url(#goldStroke)" strokeWidth="1.5" fill="none" />
        <Circle cx={c} cy={c} r="162" stroke="#FF9933" strokeWidth="1" fill="none" />

        {/* 3. 16 Lotus Petals */}
        <G stroke="url(#goldStroke)" strokeWidth="1.2" fill="rgba(255, 153, 51, 0.05)">
          {petals16.map((d, i) => (
            <Path key={`p16-${i}`} d={d} />
          ))}
        </G>

        {/* 4. Intermediate Circle */}
        <Circle cx={c} cy={c} r="136" stroke="url(#goldStroke)" strokeWidth="1" fill="none" />

        {/* 5. 8 Lotus Petals */}
        <G stroke="url(#goldStroke)" strokeWidth="1.5" fill="rgba(255, 215, 0, 0.06)">
          {petals8.map((d, i) => (
            <Path key={`p8-${i}`} d={d} />
          ))}
        </G>

        {/* 6. Inner Circle enclosing Triangles */}
        <Circle cx={c} cy={c} r="108" stroke="url(#goldStroke)" strokeWidth="1.5" fill="none" />

        {/* 7. Nine Interlocking Triangles (4 Upward Shiva, 5 Downward Shakti) */}
        <G stroke="url(#goldStroke)" strokeWidth="1.5" fill="none">
          {/* Downward 1 (Largest Shakti) */}
          <Polygon points="200,305 105,120 295,120" stroke="#FF5722" />

          {/* Upward 1 (Largest Shiva) */}
          <Polygon points="200,95 105,280 295,280" stroke="#F9A825" />

          {/* Downward 2 */}
          <Polygon points="200,285 118,138 282,138" />

          {/* Upward 2 */}
          <Polygon points="200,115 118,262 282,262" />

          {/* Downward 3 */}
          <Polygon points="200,265 130,154 270,154" />

          {/* Upward 3 */}
          <Polygon points="200,135 130,246 270,246" />

          {/* Downward 4 */}
          <Polygon points="200,245 142,170 258,170" />

          {/* Upward 4 */}
          <Polygon points="200,155 142,230 258,230" />

          {/* Downward 5 (Innermost) */}
          <Polygon points="200,225 158,185 242,185" />
        </G>

        {/* 8. Central Bindu (Pulsing Singularity Point of Divine Consciousness) */}
        <Circle cx={c} cy={c} r="20" fill="url(#binduGlow)" opacity={0.6} />
        <Circle cx={c} cy={c} r="7" fill="#FFF275" />
        <Circle cx={c} cy={c} r="4" fill="#FF4500" />
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
