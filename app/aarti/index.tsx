import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../src/constants/theme';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassHeader } from '../../src/components/GlassHeader';
import { GlassCard } from '../../src/components/GlassCard';
import { SearchBar } from '../../src/components/SearchBar';
import { api } from '../../src/services/api';
import { useTheme } from '../../src/contexts/ThemeContext';

const DEITY_FILTERS = ['All', 'Ganesh', 'Shiva', 'Hanuman', 'Durga', 'Krishna', 'Rama', 'Lakshmi'];

export default function AartiListScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeity, setSelectedDeity] = useState('All');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getAartis();
        setData(res || []);
      } catch (e) {
        console.warn('Failed loading aartis:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const name = (item.aarti_name || item.title || '').toLowerCase();
      const deity = (item.deity_name || item.god || '').toLowerCase();

      if (selectedDeity !== 'All') {
        const filterLower = selectedDeity.toLowerCase();
        if (!deity.includes(filterLower) && !name.includes(filterLower)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return name.includes(q) || deity.includes(q);
      }

      return true;
    });
  }, [data, searchQuery, selectedDeity]);

  return (
    <View style={styles.container}>
      <CosmicBackground />
      <GlassHeader
        title="Aarti Sangrah"
        subtitle={`${data.length || 20}+ Divine Aartis & Devotional Hymns`}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="आरती अथवा देवता खोजें..."
        />
      </View>

      {/* Deity Filter Horizontal Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {DEITY_FILTERS.map((d) => {
            const active = selectedDeity === d;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setSelectedDeity(d)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active
                      ? isDark
                        ? 'rgba(255, 153, 51, 0.25)'
                        : 'rgba(230, 126, 34, 0.2)'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? colors.primary : colors.textSecondary },
                    active && { fontWeight: '700' },
                  ]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            पावन आरतियां लोड हो रही हैं...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const title = item.aarti_name || item.title || 'Aarti';
            const deity = item.deity_name || item.god || 'Divine Devotion';

            return (
              <GlassCard
                style={styles.card}
                onPress={() => router.push(`/aarti/${item.id}` as any)}
              >
                <View style={styles.cardRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 153, 51, 0.15)'
                          : 'rgba(230, 126, 34, 0.12)',
                      },
                    ]}
                  >
                    <Ionicons name="flame" size={22} color={colors.primary} />
                  </View>

                  <View style={styles.cardInfo}>
                    <Text
                      style={[styles.cardTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                    <Text
                      style={[styles.cardSubtitle, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {deity}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </GlassCard>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                कोई आरती उपलब्ध नहीं है।
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
  filterBar: {
    paddingVertical: 6,
  },
  filterScroll: {
    paddingHorizontal: Spacing.standard,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontFamily: Typography.families.body,
    fontSize: 14,
    marginTop: 12,
  },
  listContent: {
    paddingHorizontal: Spacing.standard,
    paddingTop: 8,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 10,
    padding: Spacing.standard,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontFamily: Typography.families.body,
    fontSize: 13,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.families.body,
    fontSize: 15,
  },
});
