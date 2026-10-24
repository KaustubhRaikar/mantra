import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassCard } from '../../src/components/GlassCard';
import { SearchBar } from '../../src/components/SearchBar';
import { useRouter } from 'expo-router';
import { getCategoryDisplayProps } from '../../src/utils/categoryHelper';

const { width } = Dimensions.get('window');

const SUB_MENU_SECTIONS = [
  { id: 'sub_counter', name: 'Jaap Mala Counter', type: 'section', subtitle: 'Count Mantra Chants (108 Times)', icon: 'finger-print', color: Colors.primary, route: '/(tabs)/' },
  { id: 'sub_aartis', name: 'Aartis & Hymns', type: 'section', subtitle: 'Divine Aarti Collection', icon: 'flame', color: Colors.primary, route: '/aarti/' },
  { id: 'sub_festivals', name: 'Festival Aartis', type: 'section', subtitle: 'Festive Season Special', icon: 'sparkles', color: '#A29BFE', route: '/festival_aarti/' },
  { id: 'sub_chalisas', name: 'Chalisa Sangrah', type: 'section', subtitle: '40-Verse Hymns of Devotion', icon: 'book', color: Colors.secondary, route: '/chalisa/' },
  { id: 'sub_pooja', name: 'Pooja Vidhi', type: 'section', subtitle: 'Step-by-Step Worship Procedures', icon: 'leaf', color: '#2ECC71', route: '/pooja_vidhi/' },
  { id: 'sub_stotras', name: 'Sacred Stotras', type: 'section', subtitle: 'Praises & Hymns of Deities', icon: 'star', color: Colors.secondary, route: '/stotra/' },
  { id: 'sub_vrat', name: 'Vrat Katha', type: 'section', subtitle: 'Fasting Stories & Rituals', icon: 'moon', color: Colors.primary, route: '/vrat_katha/' },
  { id: 'sub_upanishad', name: 'Upanishads', type: 'section', subtitle: 'Core Vedic Philosophy', icon: 'library', color: '#A29BFE', route: '/upanishad' },
];

type FilterChip = 'all' | 'deities' | 'sections';

export default function CategoriesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChip, setFilterChip] = useState<FilterChip>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (e) {
        console.warn('Failed to load categories', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formattedDeities = useMemo(() => {
    return categories.map((cat) => {
      const { icon, color } = getCategoryDisplayProps(cat.name);
      return {
        id: 'deity_' + cat.id,
        rawId: cat.id,
        name: cat.name,
        type: 'deity',
        subtitle: `${cat.count || 12}+ Sacred Mantras`,
        icon,
        color,
      };
    });
  }, [categories]);

  const displayedItems = useMemo(() => {
    let items: any[] = [];
    if (filterChip === 'all') {
      items = [...SUB_MENU_SECTIONS, ...formattedDeities];
    } else if (filterChip === 'sections') {
      items = SUB_MENU_SECTIONS;
    } else {
      items = formattedDeities;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q)
      );
    }

    return items;
  }, [filterChip, formattedDeities, searchQuery]);

  const handlePressItem = (item: any) => {
    if (item.type === 'section') {
      router.push(item.route as any);
    } else {
      router.push({
        pathname: '/category/[id]',
        params: { id: item.rawId, name: item.name },
      } as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CosmicBackground />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ── Hero Header ── */}
        <GlassCard style={styles.heroCard} glow>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={14} color={Colors.secondary} />
            <Text style={styles.heroBadgeText}>Sacred Catalog</Text>
          </View>
          <Text style={styles.heroTitle}>Menu & Categories</Text>
          <Text style={styles.heroSub}>
            Discover Mantras, Aartis, Chalisas, Stotras & Upanishads
          </Text>

          <View style={{ marginTop: Spacing.standard }}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search category or sacred text..."
            />
          </View>
        </GlassCard>

        {/* ── Category Filter Chips & View Mode Toggle ── */}
        <View style={styles.controlRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScroll}
          >
            <TouchableOpacity
              style={[styles.chip, filterChip === 'all' && styles.chipActive]}
              onPress={() => setFilterChip('all')}
              accessibilityRole="button"
            >
              <Ionicons
                name="grid-outline"
                size={14}
                color={filterChip === 'all' ? '#0C0A1A' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.chipText,
                  filterChip === 'all' && styles.chipTextActive,
                ]}
              >
                All ({SUB_MENU_SECTIONS.length + formattedDeities.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chip,
                filterChip === 'sections' && styles.chipActive,
              ]}
              onPress={() => setFilterChip('sections')}
              accessibilityRole="button"
            >
              <Ionicons
                name="layers-outline"
                size={14}
                color={filterChip === 'sections' ? '#0C0A1A' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.chipText,
                  filterChip === 'sections' && styles.chipTextActive,
                ]}
              >
                Sub-Menus ({SUB_MENU_SECTIONS.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, filterChip === 'deities' && styles.chipActive]}
              onPress={() => setFilterChip('deities')}
              accessibilityRole="button"
            >
              <Ionicons
                name="flame-outline"
                size={14}
                color={filterChip === 'deities' ? '#0C0A1A' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.chipText,
                  filterChip === 'deities' && styles.chipTextActive,
                ]}
              >
                Deities ({formattedDeities.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Toggle Grid / List */}
          <TouchableOpacity
            style={styles.viewToggleBtn}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            accessibilityRole="button"
            accessibilityLabel="Toggle list and grid view"
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list' : 'grid'}
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* ── Content Grid / List ── */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading Sacred Categories...</Text>
          </View>
        ) : displayedItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No matching categories</Text>
            <Text style={styles.emptySub}>
              Try searching with another keyword like "Shiva", "Aarti", or "Chalisa"
            </Text>
          </View>
        ) : viewMode === 'grid' ? (
          /* ── GRID VIEW ── */
          <View style={styles.gridContainer}>
            {displayedItems.map((item) => (
              <GlassCard
                key={item.id}
                style={styles.gridCard}
                onPress={() => handlePressItem(item)}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: item.color + '20',
                      borderColor: item.color + '40',
                    },
                  ]}
                >
                  <Ionicons name={item.icon} size={26} color={item.color} />
                </View>
                <Text style={styles.gridTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.gridSub} numberOfLines={2}>
                  {item.subtitle}
                </Text>

                <View style={styles.explorePill}>
                  <Text style={[styles.exploreText, { color: item.color }]}>
                    Explore
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={item.color}
                  />
                </View>
              </GlassCard>
            ))}
          </View>
        ) : (
          /* ── LIST VIEW ── */
          <View style={styles.listContainer}>
            {displayedItems.map((item) => (
              <GlassCard
                key={item.id}
                style={[styles.listCard, { borderLeftColor: item.color }]}
                onPress={() => handlePressItem(item)}
              >
                <View
                  style={[
                    styles.listIconBox,
                    { backgroundColor: item.color + '20' },
                  ]}
                >
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.listTitle}>{item.name}</Text>
                  <Text style={styles.listSub}>{item.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                />
              </GlassCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroCard: {
    margin: Spacing.standard,
    padding: Spacing.large,
    borderRadius: Radius.xl,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 153, 51, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSub: {
    fontFamily: Typography.families.body,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.standard,
    marginBottom: Spacing.standard,
    gap: 8,
  },
  chipScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#0C0A1A',
    fontWeight: '700',
  },
  viewToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    padding: Spacing.section,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.standard,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyBox: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.standard,
    gap: 12,
  },
  gridCard: {
    width: (width - 44) / 2,
    padding: Spacing.standard,
    borderRadius: Radius.lg,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  gridTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  gridSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    minHeight: 32,
  },
  explorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exploreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: Spacing.standard,
    gap: 10,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.standard,
    borderLeftWidth: 4,
  },
  listIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.standard,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  listSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
