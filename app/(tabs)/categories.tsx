import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, ScrollView, Animated, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { useRouter } from 'expo-router';
import { getCategoryDisplayProps } from '../../src/utils/categoryHelper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ── Sacred Sub-Menu Collections ──
const SUB_MENU_SECTIONS = [
  { id: 'sub_counter', name: 'Jaap Mala Counter', type: 'section', subtitle: 'Count Mantra Chants (108 Times)', icon: 'finger-print', color: '#FF6B35', gradient: ['#FF6B35', '#FF8E53'], route: '/(tabs)/' },
  { id: 'sub_aartis', name: 'Aartis & Hymns', type: 'section', subtitle: 'Divine Aarti Collection', icon: 'flame', color: '#FF6B35', gradient: ['#FF6B35', '#FF8E53'], route: '/aarti/' },
  { id: 'sub_festivals', name: 'Festival Aartis', type: 'section', subtitle: 'Festive Season Special', icon: 'sparkles', color: '#5D3FD3', gradient: ['#5D3FD3', '#7B5FE0'], route: '/festival_aarti/' },
  { id: 'sub_chalisas', name: 'Chalisa Sangrah', type: 'section', subtitle: '40-Verse Hymns of Devotion', icon: 'book', color: '#0095D9', gradient: ['#0095D9', '#33B5E5'], route: '/chalisa/' },
  { id: 'sub_pooja', name: 'Pooja Vidhi', type: 'section', subtitle: 'Step-by-Step Worship Procedures', icon: 'leaf', color: '#2ECC71', gradient: ['#2ECC71', '#48D38A'], route: '/pooja_vidhi/' },
  { id: 'sub_stotras', name: 'Sacred Stotras', type: 'section', subtitle: 'Praises & Hymns of Deities', icon: 'star', color: '#E91E8C', gradient: ['#E91E8C', '#FF5B9C'], route: '/stotra/' },
  { id: 'sub_vrat', name: 'Vrat Katha', type: 'section', subtitle: 'Fasting Stories & Rituals', icon: 'moon', color: '#FFD700', gradient: ['#FFC107', '#FFD54F'], route: '/vrat_katha/' },
  { id: 'sub_upanishad', name: 'Upanishads', type: 'section', subtitle: 'Core Vedic Philosophy', icon: 'library', color: '#9B59B6', gradient: ['#9B59B6', '#B370D0'], route: '/upanishad' },
];

type FilterChip = 'all' | 'deities' | 'sections';

export default function CategoriesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChip, setFilterChip]   = useState<FilterChip>('all');
  const [viewMode, setViewMode]       = useState<'grid' | 'list'>('grid');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);

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

  // Format deity categories
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
        gradient: [color, color + 'CC'],
      };
    });
  }, [categories]);

  // Combined and filtered data based on search and chip filter
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        
        {/* ── Premium Hero Header ── */}
        <LinearGradient
          colors={['#5D3FD3', '#FF6B35']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={14} color="#FFD700" />
            <Text style={styles.heroBadgeText}>Sacred Catalog</Text>
          </View>
          <Text style={styles.heroTitle}>Menu & Categories</Text>
          <Text style={styles.heroSub}>Discover Mantras, Aartis, Chalisas, Stotras & Upanishads</Text>

          {/* Real-time Search Input */}
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search category or sacred text..."
              placeholderTextColor="#888899"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* ── Category Filter Chips & View Mode Toggle ── */}
        <View style={styles.controlRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            <TouchableOpacity
              style={[styles.chip, filterChip === 'all' && styles.chipActive]}
              onPress={() => setFilterChip('all')}
            >
              <Ionicons name="grid-outline" size={14} color={filterChip === 'all' ? '#FFF' : Colors.textSecondary} />
              <Text style={[styles.chipText, filterChip === 'all' && styles.chipTextActive]}>All ({SUB_MENU_SECTIONS.length + formattedDeities.length})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, filterChip === 'sections' && styles.chipActive]}
              onPress={() => setFilterChip('sections')}
            >
              <Ionicons name="layers-outline" size={14} color={filterChip === 'sections' ? '#FFF' : Colors.textSecondary} />
              <Text style={[styles.chipText, filterChip === 'sections' && styles.chipTextActive]}>Sub-Menus ({SUB_MENU_SECTIONS.length})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, filterChip === 'deities' && styles.chipActive]}
              onPress={() => setFilterChip('deities')}
            >
              <Ionicons name="flame-outline" size={14} color={filterChip === 'deities' ? '#FFF' : Colors.textSecondary} />
              <Text style={[styles.chipText, filterChip === 'deities' && styles.chipTextActive]}>Deities ({formattedDeities.length})</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Toggle Grid / List */}
          <TouchableOpacity
            style={styles.viewToggleBtn}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={20} color={Colors.primary} />
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
            <Text style={styles.emptySub}>Try searching with another keyword like "Shiva", "Aarti", or "Chalisa"</Text>
          </View>
        ) : viewMode === 'grid' ? (
          /* ── GRID VIEW ── */
          <View style={styles.gridContainer}>
            {displayedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridCard}
                activeOpacity={0.85}
                onPress={() => handlePressItem(item)}
              >
                <LinearGradient
                  colors={[item.color + '15', item.color + '05']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 18 }]}
                />
                
                {/* Glowing Icon Badge */}
                <View style={[styles.iconBox, { backgroundColor: item.color + '22', borderColor: item.color + '40' }]}>
                  <Ionicons name={item.icon as any} size={28} color={item.color} />
                </View>

                {/* Card Title & Info */}
                <Text style={styles.gridTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.gridSub} numberOfLines={1}>{item.subtitle}</Text>

                {/* Explore Pill */}
                <View style={styles.explorePill}>
                  <Text style={[styles.exploreText, { color: item.color }]}>Explore</Text>
                  <Ionicons name="arrow-forward" size={14} color={item.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* ── LIST VIEW ── */
          <View style={styles.listContainer}>
            {displayedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.listCard, { borderLeftColor: item.color }]}
                activeOpacity={0.85}
                onPress={() => handlePressItem(item)}
              >
                <View style={[styles.listIconBox, { backgroundColor: item.color + '18' }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>

                <View style={styles.listInfo}>
                  <Text style={styles.listTitle}>{item.name}</Text>
                  <Text style={styles.listSub}>{item.subtitle}</Text>
                </View>

                <View style={[styles.chevronBox, { backgroundColor: item.color + '12' }]}>
                  <Ionicons name="chevron-forward" size={18} color={item.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Hero Card
  heroCard: {
    margin: 16,
    borderRadius: 24,
    padding: 24,
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  heroBadgeText: { color: '#FFD700', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', marginBottom: 20 },

  // Search Input
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '500' },

  // Controls & Chips
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chipScroll: { gap: 8, paddingRight: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: '#FFF', fontWeight: '700' },
  viewToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginLeft: 4,
  },

  // Loading & Empty States
  loadingBox: { paddingVertical: 60, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  emptyBox: { paddingVertical: 60, paddingHorizontal: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 12, marginBottom: 4 },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  // Grid Layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  gridCard: {
    width: (width - 44) / 2,
    margin: 6,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 3,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  gridTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  gridSub: { fontSize: 12, color: Colors.textSecondary, marginBottom: 12 },
  explorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exploreText: { fontSize: 13, fontWeight: '700' },

  // List Layout
  listContainer: { paddingHorizontal: 16 },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  listIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  listSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
