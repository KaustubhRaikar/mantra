export const Colors = {
  primary: '#FF6B35', // Saffron
  secondary: '#FFD700', // Gold
  background: '#FFF9F2', // Light cream for premium feel
  surface: '#FFFFFF',
  text: '#2D2D2D',
  textSecondary: '#666666',
  border: '#E0E0E0',
  error: '#B00020',
  success: '#4CAF50',
};

export const Theme = {
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
  dark: false,
};
