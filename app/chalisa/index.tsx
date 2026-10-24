import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassHeader } from '../../src/components/GlassHeader';
import { ScriptureCard } from '../../src/components/ScriptureCard';
import { SearchBar } from '../../src/components/SearchBar';
import { api } from '../../src/services/api';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function ChalisaListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getChalisas();
        setData(res || []);
      } catch (e) {
        console.warn('Failed loading chalisas:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      const name = (item.chalisa_name || '').toLowerCase();
      const deity = (item.deity_name || '').toLowerCase();
      return name.includes(q) || deity.includes(q);
    });
  }, [data, searchQuery]);

  return (
    <View style={styles.container}>
      <CosmicBackground />
      <GlassHeader
        title="Chalisa Sangrah"
        subtitle={`${data.length} Complete Hymns of Divine Devotion`}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="चालीसा अथवा देवता खोजें..."
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ScriptureCard
              title={item.chalisa_name}
              category={item.deity_name || 'Chalisa'}
              onPress={() => router.push(`/chalisa/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                कोई चालीसा उपलब्ध नहीं है।
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
    gap: 8,
  },
  emptyContainer: {
    padding: Spacing.large,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.families.body,
    fontSize: 14,
  },
});
