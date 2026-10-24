import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../src/constants/theme';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { SearchBar } from '../../src/components/SearchBar';
import { ScriptureCard } from '../../src/components/ScriptureCard';
import { EmptyState } from '../../src/components/EmptyState';
import { api } from '../../src/services/api';
import { storage } from '../../src/services/storage';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Mantra } from '../../src/types/navigation';

export default function SearchScreen() {
  const { isDark, colors } = useTheme();
  const [query, setQuery] = useState('');
  const [mantras, setMantras] = useState<Mantra[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchMantras();
    loadRecent();
  }, []);

  const loadRecent = async () => {
    const r = await storage.getRecentSearches();
    setRecentSearches(r);
  };

  const fetchMantras = async () => {
    setLoading(true);
    try {
      const data = await api.getMantras();
      setMantras(data);
    } catch (e) {
      console.warn('Failed loading mantras for search:', e);
    } finally {
      setLoading(false);
    }
  };

  const results =
    query.trim() === ''
      ? []
      : mantras.filter((m) => {
          const term = query.toLowerCase();
          return (
            m.title?.toLowerCase().includes(term) ||
            m.name?.toLowerCase().includes(term) ||
            m.sanskrit_title?.includes(term) ||
            m.sanskrit?.includes(term) ||
            m.category_name?.toLowerCase().includes(term)
          );
        });

  const handleRecentPress = (term: string) => {
    setQuery(term);
  };

  const handleSearchSubmit = async () => {
    if (query.trim()) {
      await storage.addRecentSearch(query.trim());
      loadRecent();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CosmicBackground />

      {/* Top Search Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: colors.border,
            }
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search mantras, gods, suktas..."
            autoFocus
          />
        </View>
      </View>

      {/* Recent Searches */}
      {query.trim() === '' && recentSearches.length > 0 ? (
        <View style={styles.recentContainer}>
          <Text style={[styles.recentHeading, { color: colors.textSecondary }]}>Recent Searches</Text>
          <View style={styles.recentWrap}>
            {recentSearches.map((term, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.recentChip,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => handleRecentPress(term)}
              >
                <Ionicons name="time-outline" size={14} color={colors.primary} />
                <Text style={[styles.recentText, { color: colors.text }]}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {/* Results Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Searching sacred catalog...</Text>
        </View>
      ) : query.trim() !== '' && results.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Matching Verses Found"
          description={`We couldn't find scriptures matching "${query}". Try searching for Lord Shiva, Gayatri, or Aarti.`}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ScriptureCard
              title={item.title || item.name}
              sanskritTitle={item.sanskrit_title || item.sanskrit}
              category={item.category_name || item.god}
              onPress={() => {
                handleSearchSubmit();
                router.push(`/mantra/${item.id}` as any);
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.standard,
    paddingVertical: Spacing.compact,
    gap: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrapper: {
    flex: 1,
  },
  recentContainer: {
    paddingHorizontal: Spacing.standard,
    marginTop: Spacing.standard,
  },
  recentHeading: {
    fontFamily: Typography.families.heading,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.compact,
  },
  recentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentText: {
    fontSize: 13,
    color: Colors.text,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.compact,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: Spacing.standard,
    paddingTop: Spacing.standard,
    paddingBottom: 40,
  },
});
