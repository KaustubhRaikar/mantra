import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../../src/constants/theme';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassHeader } from '../../src/components/GlassHeader';
import { ScriptureCard } from '../../src/components/ScriptureCard';
import { SearchBar } from '../../src/components/SearchBar';
import { api } from '../../src/services/api';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useFavorites } from '../../src/contexts/FavoritesContext';

type KathaFilter = 'all' | 'vrat_katha' | 'pauranik_katha';

export default function KathaListScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<KathaFilter>('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getKathas();
        setData(res || []);
      } catch (e) {
        console.warn('Failed loading kathas:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter((item) => {
        const cat = (item.category || '').toLowerCase();
        return cat === selectedCategory;
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const title = (item.title || item.katha_name || '').toLowerCase();
        const deity = (item.deity || item.deity_name || '').toLowerCase();
        const syn = (item.synopsis || '').toLowerCase();
        return title.includes(q) || deity.includes(q) || syn.includes(q);
      });
    }

    return result;
  }, [data, selectedCategory, searchQuery]);

  const CATEGORY_TABS: { key: KathaFilter; label: string; hindi: string; icon: any }[] = [
    { key: 'all', label: 'All', hindi: 'सम्पूर्ण कथाएं', icon: 'sparkles' },
    { key: 'vrat_katha', label: 'Vrat Kathas', hindi: 'व्रत कथा', icon: 'calendar-outline' },
    { key: 'pauranik_katha', label: 'Pauranik Leela', hindi: 'पौराणिक लीला', icon: 'book-outline' },
  ];

  return (
    <View style={styles.container}>
      <CosmicBackground />
      <GlassHeader
        title="Katha Sangrah"
        subtitle={`${data.length} Sacred Fasting & Pauranik Narratives`}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="कथा, पर्व अथवा देवता खोजें..."
        />
      </View>

      {/* Category Pills */}
      <View style={styles.pillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.pillBtn,
                  {
                    backgroundColor: isActive
                      ? isDark
                        ? 'rgba(255, 153, 51, 0.22)'
                        : 'rgba(230, 126, 34, 0.18)'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(tab.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={isActive ? colors.primary : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.pillText,
                    { color: isActive ? colors.primary : colors.text },
                    isActive && { fontWeight: '700' },
                  ]}
                >
                  {tab.hindi}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const id = item.id;
            const fav = isFavorite(id);
            return (
              <ScriptureCard
                title={item.title || item.katha_name}
                sanskritTitle={item.sanskrit || item.sanskritTitle}
                category={item.category_label || (item.category === 'vrat_katha' ? 'व्रत कथा' : 'पौराणिक कथा')}
                god={item.deity || item.deity_name}
                onPress={() => router.push(`/katha/${id}` as any)}
                isFavorite={fav}
                onToggleFavorite={() => toggleFavorite({ ...item, path: 'katha' })}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={colors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                कोई कथा उपलब्ध नहीं है।
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.standard,
    paddingTop: 8,
    paddingBottom: 4,
  },
  pillsContainer: {
    paddingVertical: 8,
  },
  pillsScroll: {
    paddingHorizontal: Spacing.standard,
    gap: 8,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: Spacing.standard,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: Typography.families.devanagari,
    fontSize: 16,
    textAlign: 'center',
  },
});
