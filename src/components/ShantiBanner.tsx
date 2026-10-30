import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

type ShantiListener = (message?: string) => void;
const listeners: Set<ShantiListener> = new Set();

export const triggerShantiBanner = (customMessage?: string) => {
  listeners.forEach((listener) => listener(customMessage));
};

export function ShantiBanner() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>(
    'शांतिः • Offline Sanctuary Active — Prayers continue seamlessly while network rests.'
  );
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    const handleTrigger: ShantiListener = (customMsg) => {
      if (customMsg) {
        setMessage(customMsg);
      } else {
        setMessage('शांतिः • Offline Sanctuary Active — Prayers continue seamlessly while network rests.');
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setVisible(true);

      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      timeoutRef.current = setTimeout(() => {
        hideBanner();
      }, 5500);
    };

    listeners.add(handleTrigger);
    return () => {
      listeners.delete(handleTrigger);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const hideBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: Math.max(insets.top + 8, 16),
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(26, 20, 16, 0.95)' : 'rgba(255, 248, 240, 0.96)',
            borderColor: isDark ? 'rgba(255, 153, 51, 0.45)' : 'rgba(230, 126, 34, 0.5)',
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="leaf-outline" size={20} color="#FF9933" />
        </View>

        <View style={styles.textColumn}>
          <Text style={[styles.title, { color: isDark ? '#FFB366' : '#D35400' }]}>
            शांतिः (Shanti Sanctuary)
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
            {message}
          </Text>
        </View>

        <TouchableOpacity
          onPress={hideBanner}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 10,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    borderWidth: 1.2,
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    maxWidth: 500,
    width: '100%',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 153, 51, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textColumn: {
    flex: 1,
    paddingRight: 6,
  },
  title: {
    fontFamily: Typography.families.heading,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
