import { Platform } from 'react-native';

/**
 * Cosmic Vedic Glassmorphism Design Tokens
 * Aligned with docs/UI_DESIGN.md & docs/UX_DESIGN.md
 */

export const Colors = {
  // Primary Spiritual Brand Tokens
  primary: '#FF9933',        // Radiant Vedic Saffron
  secondary: '#F5B041',      // Sacred Gold Highlight
  accent: '#6C5CE7',         // Celestial Purple Nebula
  gold: '#F5B041',           // Sacred Gold
  saffron: '#FF9933',        // Saffron
  purple: '#6C5CE7',         // Celestial Purple

  // Canvas & Surfaces (Cosmic Dark)
  background: '#080711',     // Celestial Midnight Root Canvas
  surface: '#161329',        // Cosmic Card & Sheet Elevated Surface
  surfaceElevated: '#1F1A3A',// High-Elevation Dialog / Sheet Surface
  card: 'rgba(22, 19, 43, 0.85)',
  glassCard: 'rgba(22, 19, 43, 0.72)',
  glassHighlight: 'rgba(255, 255, 255, 0.05)',

  // Typography & Text Hierarchy
  text: '#FFFFFF',           // High-Emphasis Devanagari & Latin Text
  textSecondary: '#B3B1C9',  // Medium-Emphasis Translation & Subtitles
  textMuted: '#716D8E',      // Low-Emphasis Captions & Disabled Labels

  // Glassmorphic Borders & Dividers
  border: 'rgba(255, 255, 255, 0.08)',
  borderGlow: 'rgba(255, 153, 51, 0.25)',
  borderActive: 'rgba(255, 153, 51, 0.50)',

  // Functional & Semantic States
  error: '#FF3B30',          // Destructive / Flame Red
  danger: '#FF3B30',
  success: '#2ECC71',        // Divine Accomplishment / Green
  warning: '#F5B041',        // Caution / Gold
  info: '#3498DB',           // Informational Blue
};

export const Spacing = {
  micro: 4,
  compact: 8,
  small: 12,
  standard: 16,
  medium: 20,
  large: 24,
  section: 32,
  major: 48,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  families: {
    devanagari: 'TiroDevanagariHindi_400Regular',
    heading: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
    body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  },
  sizes: {
    displaySanskrit: 26,
    heading1: 24,
    heading2: 20,
    heading3: 18,
    body: 15,
    caption: 12,
    micro: 10,
  },
  lineHeights: {
    displaySanskrit: 38,
    heading1: 32,
    heading2: 28,
    heading3: 26,
    body: 24,
    caption: 16,
    micro: 14,
  },
};

export const Theme = {
  dark: true,
  colors: {
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.primary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};
