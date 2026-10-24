import { Platform } from 'react-native';

/**
 * Cosmic Vedic Glassmorphism Design Tokens
 * Aligned with docs/UI_DESIGN.md & docs/UX_DESIGN.md
 * Dual Mode: Cosmic Dark (Night Devotion) & Sacred Dawn (Suryodaya Light)
 */

export const DarkColors = {
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

export const LightColors: typeof DarkColors = {
  // Primary Spiritual Brand Tokens (Engineered for high contrast on light canvas)
  primary: '#E67E22',        // Deep Radiant Vedic Saffron
  secondary: '#D4AC0D',      // Sacred Temple Gold
  accent: '#5E48C8',         // Deep Celestial Purple
  gold: '#D4AC0D',
  saffron: '#E67E22',
  purple: '#5E48C8',

  // Canvas & Surfaces (Sacred Dawn / Suryodaya Serenity)
  background: '#F8F6F0',     // Sacred Ivory Temple Canvas
  surface: '#FFFFFF',        // Pure Marble Surface
  surfaceElevated: '#F2EDE4',// Sandalwood Wash Surface
  card: 'rgba(255, 255, 255, 0.95)',
  glassCard: 'rgba(255, 255, 255, 0.88)',
  glassHighlight: 'rgba(230, 126, 34, 0.06)',

  // Typography & Text Hierarchy
  text: '#171426',           // Deep Slate Charcoal (Exceptional Legibility)
  textSecondary: '#4E4968',  // Twilight Indigo
  textMuted: '#847E9C',      // Incense Ash Muted Labels

  // Glassmorphic Borders & Dividers
  border: 'rgba(0, 0, 0, 0.08)',
  borderGlow: 'rgba(230, 126, 34, 0.30)',
  borderActive: 'rgba(230, 126, 34, 0.60)',

  // Functional & Semantic States
  error: '#D32F2F',          // Destructive Red
  danger: '#D32F2F',
  success: '#27AE60',        // Divine Green
  warning: '#D4AC0D',        // Caution Gold
  info: '#2980B9',           // Sacred Blue
};

// Internal active theme reference (defaults to Cosmic Dark per docs/UX_DESIGN.md)
let currentTheme: 'dark' | 'light' = 'dark';

export const setGlobalTheme = (mode: 'dark' | 'light') => {
  currentTheme = mode;
};

export const getActivePalette = () => (currentTheme === 'light' ? LightColors : DarkColors);

/**
 * Dynamic Colors Proxy
 * Allows direct property access (e.g. Colors.primary, Colors.background) while
 * dynamically returning the active theme's colors at runtime.
 */
export const Colors: typeof DarkColors = new Proxy(DarkColors, {
  get(target, prop: keyof typeof DarkColors) {
    const palette = currentTheme === 'light' ? LightColors : DarkColors;
    return palette[prop] ?? target[prop];
  },
});

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
    primary: DarkColors.primary,
    background: DarkColors.background,
    card: DarkColors.surface,
    text: DarkColors.text,
    border: DarkColors.border,
    notification: DarkColors.primary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};
