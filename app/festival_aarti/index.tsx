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

const FESTIVAL_FILTERS = ['All', 'Navaratri', 'Diwali', 'Shivaratri', 'Ganesh Chaturthi', 'Janmashtami'];

export default function FestivalAartiListScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFestival, setSelectedFestival] = useState('All');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getFestivalAartis();
        setData(res || []);
      } catch (e) {
        console.warn('Failed loading festival aartis:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const name = (item.title || item.aarti_name || '').toLowerCase();
      const fest = (item.festival || item.category || '').toLowerCase();
      const deity = (item.deity_name || item.god || '').toLowerCase();

      if (selectedFestival !== 'All') {
        const fLower = selectedFestival.toLowerCase();
        if (!fest.includes(fLower) && !name.includes(fLower) && !deity.includes(fLower)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return name.includes(q) || fest.includes(q) || deity.includes(q);
      }

      return true;
    });
  }, [data, searchQuery, selectedFestival]);

  return (
    <View style={styles.container}>
      <CosmicBackground />
      <GlassHeader
        title="Festival Aartis"
        subtitle="Sacred Recitations for Holy Festivities & Celebrations"
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="त्योहार अथवा आरती खोजें..."
        />
      </View>

      {/* Festival Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FESTIVAL_FILTERS.map((f) => {
            const active = selectedFestival === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setSelectedFestival(f)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active
                      ? isDark
                        ? 'rgba(162, 155, 254, 0.25)'
                        : 'rgba(108, 92, 231, 0.15)'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: active ? '#A29BFE' : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? (isDark ? '#A29BFE' : '#6C5CE7') : colors.textSecondary },
                    active && { fontWeight: '700' },
                  ]}
                >
                  {f}
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
            त्योहार आरतियां लोड हो रही हैं...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const title = item.title || item.aarti_name || 'Festival Aarti';
            const festival = item.festival || item.category || 'Special Festival';
            const deity = item.deity_name || item.god || '';

            return (
              <GlassCard
                style={styles.card}
                onPress={() => router.push(`/festival_aarti/${item.id}` as any)}
              >
                <View style={styles.cardRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isDark
                          ? 'rgba(162, 155, 254, 0.15)'
                          : 'rgba(108, 92, 231, 0.10)',
                      },
                    ]}
                  >
                    <Ionicons name="sparkles" size={22} color={isDark ? '#A29BFE' : '#6C5CE7'} />
                  </View>

                  <View style={styles.cardInfo}>
                    <Text
                      style={[styles.cardTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                    <Text
                      style={[styles.cardSubtitle, { color: isDark ? '#A29BFE' : '#6C5CE7' }]}
                      numberOfLines={1}
                    >
                      ✨ {festival} {deity ? `• ${deity}` : ''}
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
                कोई त्योहार आरती उपलब्ध नहीं है।
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
