import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search mantras, aartis, suktas...',
  autoFocus = false,
}: SearchBarProps) {
  const { isDark, colors } = useTheme();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? 'rgba(22, 19, 43, 0.85)' : 'rgba(255, 255, 255, 0.92)',
        borderColor: colors.border,
      }
    ]}>
      <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        maxFontSizeMultiplier={1.3}
      />
      {value.length > 0 ? (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            if (onClear) onClear();
          }}
          style={styles.clearButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Clear search text"
        >
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.standard,
  },
  searchIcon: {
    marginRight: Spacing.compact,
  },
  input: {
    flex: 1,
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.body,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
});
