import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassHeader } from '../../src/components/GlassHeader';
import { ScriptureCard } from '../../src/components/ScriptureCard';
import { SearchBar } from '../../src/components/SearchBar';
import { api } from '../../src/services/api';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useFavorites } from '../../src/contexts/FavoritesContext';

export default function VratKathaListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getKathas();
        setData(res || []);
      } catch (e) {
        console.warn('Failed loading vrat kathas:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      const name = (item.title || item.katha_name || '').toLowerCase();
      const deity = (item.deity || item.deity_name || '').toLowerCase();
      return name.includes(q) || deity.includes(q);
    });
  }, [data, searchQuery]);

  return (
    <View style={styles.container}>
      <CosmicBackground />
      <GlassHeader
        title="Vrat Katha Sangrah"
        subtitle={`${data.length} Sacred Fasting Stories & Rituals`}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="व्रत कथा अथवा देवता खोजें..."
        />
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
