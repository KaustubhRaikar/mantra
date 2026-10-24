import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography } from '../../src/constants/theme';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassHeader } from '../../src/components/GlassHeader';
import { ScriptureCard } from '../../src/components/ScriptureCard';
import { SearchBar } from '../../src/components/SearchBar';
import { api } from '../../src/services/api';
import { useTheme } from '../../src/contexts/ThemeContext';

type StotraFilter = 'all' | 'sahasranama' | 'namavali' | 'sukta' | 'kavacha' | 'ashtakam';

const FILTER_PILLS: { key: StotraFilter; label: string }[] = [
  { key: 'all', label: 'समस्त (All)' },
  { key: 'sahasranama', label: 'सहस्रनाम (1000 Names)' },
  { key: 'namavali', label: '१०८ नामावली' },
  { key: 'sukta', label: 'वैदिक सूक्त' },
  { key: 'kavacha', label: 'रक्षा कवच' },
  { key: 'ashtakam', label: 'अष्टकम्' },
];

export default function StotraListScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<StotraFilter>('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getStotras();
        setData(res || []);
      } catch (e) {
        console.warn('Failed to fetch stotras:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const name = (item.stotra_name || '').toLowerCase();
      const deity = (item.deity_name || '').toLowerCase();

      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!name.includes(q) && !deity.includes(q)) {
          return false;
        }
      }

      // Filter pill matching
      if (activeFilter === 'sahasranama') {
        return name.includes('sahasranama') || name.includes('सहस्रनाम');
      }
      if (activeFilter === 'namavali') {
        return name.includes('108') || name.includes('namavali') || name.includes('नामावली');
      }
      if (activeFilter === 'sukta') {
        return name.includes('suktam') || name.includes('सूक्त') || name.includes('rudram');
      }
      if (activeFilter === 'kavacha') {
        return name.includes('kavach') || name.includes('कवच') || name.includes('baan');
      }
      if (activeFilter === 'ashtakam') {
        return name.includes('ashtak') || name.includes('अष्टक') || name.includes('ashtakam');
      }

      return true;
    });
  }, [data, searchQuery, activeFilter]);

  return (
    <View style={styles.container}>
      <CosmicBackground />
      <GlassHeader
        title="Sacred Stotras & Sahasranama"
        subtitle={`${data.length} Canonical Hymns, Suktas & 1008 Names`}
      />

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="स्तोत्र, सहस्रनाम अथवा देवता खोजें..."
        />
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsContainer}
        >
          {FILTER_PILLS.map((pill) => {
            const isActive = activeFilter === pill.key;
            return (
              <TouchableOpacity
                key={pill.key}
                onPress={() => setActiveFilter(pill.key)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive
                      ? colors.primary
                      : isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isActive ? colors.borderGlow : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isActive
                        ? '#FFFFFF'
                        : isDark
                        ? colors.textSecondary
                        : colors.text,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {pill.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
              title={item.stotra_name}
              category={item.deity_name || 'Stotra'}
              onPress={() => router.push(`/stotra/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                कोई स्तोत्र उपलब्ध नहीं है।
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
  },
  filterBarWrapper: {
    paddingVertical: 10,
  },
  filterPillsContainer: {
    paddingHorizontal: Spacing.standard,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterPillText: {
    fontFamily: Typography.families.body,
    fontSize: 13,
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
