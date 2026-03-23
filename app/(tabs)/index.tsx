import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { getCategoryDisplayProps } from '../../src/utils/categoryHelper';

// ─── Color Palette ──────────────────────────────────────────────────────────
const C = {
  primary: '#FF6B35',
  secondary: '#5D3FD3',
  accent: '#FFD700',
  bg: '#FFF9F4',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSub: '#6B6B80',
  border: '#EBEBF5',
};

const { width } = Dimensions.get('window');
const CARD_W = width * 0.7;

// ─── Types ───────────────────────────────────────────────────────────────────
interface Mantra {
  id: string;
  name: string;
  god: string;
  sanskrit: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  count: number;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────
const DAILY_MANTRA: Mantra = {
  id: '1',
  name: 'Om Namah Shivaya',
  god: 'Lord Shiva',
  sanskrit: 'ॐ नमः शिवाय',
  category: 'Shiva',
};

const FEATURED: Mantra[] = [
  { id: '1', name: 'Gayatri Mantra', god: 'Surya', sanskrit: 'ॐ भूर्भुवः स्वः', category: 'Vedic' },
  { id: '2', name: 'Mahamrityunjaya', god: 'Shiva', sanskrit: 'ॐ त्र्यम्बकं यजामहे', category: 'Shiva' },
  { id: '3', name: 'Hare Krishna', god: 'Krishna', sanskrit: 'हरे कृष्ण हरे कृष्ण', category: 'Vishnu' },
];

const CATEGORIES: Category[] = [
  { id: '1', name: 'Ganesha', icon: 'star', color: '#FF6B35', count: 12 },
  { id: '2', name: 'Shiva', icon: 'flame', color: '#5D3FD3', count: 18 },
  { id: '3', name: 'Vishnu', icon: 'heart', color: '#0095D9', count: 15 },
  { id: '4', name: 'Devi', icon: 'sparkles', color: '#E91E8C', count: 14 },
  { id: '5', name: 'Surya', icon: 'sunny', color: '#FFD700', count: 8 },
  { id: '6', name: 'Vedic', icon: 'book', color: '#2ECC71', count: 20 },
];

const RECENTLY_PLAYED: Mantra[] = [
  { id: '2', name: 'Mahamrityunjaya', god: 'Shiva', sanskrit: 'ॐ त्र्यम्बकं यजामहे', category: 'Shiva' },
  { id: '3', name: 'Hare Krishna', god: 'Krishna', sanskrit: 'हरे कृष्ण हरे कृष्ण', category: 'Vishnu' },
];

// ─── Skeleton Component ───────────────────────────────────────────────────────
const Skeleton = ({ width: w = '100%', height: h = 16, radius = 8, style = {} }: {
  width?: number | string; height?: number; radius?: number; style?: object;
}) => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[{ width: w as any, height: h, borderRadius: radius, backgroundColor: C.border, opacity }, style]}
    />
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
  <View style={s.sectionHeader}>
    <Text style={s.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={s.seeAll}>See all</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Data State
  const [dailyMantra, setDailyMantra] = useState<any>(null);
  const [featuredMantras, setFeaturedMantras] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [festivalAartiMantras, setFestivalAartiMantras] = useState<any[]>([]);
  const [aartiMantras, setAartiMantras] = useState<any[]>([]);
  
  // Loading State
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // Import the api down here or globally, assuming it's imported at top
      const { api } = require('../../src/services/api');
      const [daily, featured, cats] = await Promise.all([
        api.getDailyMantra(),
        api.getFeaturedMantras(),
        api.getCategories()
      ]);
      setDailyMantra(daily);
      setFeaturedMantras(featured);
      setCategories(cats);

      // Festival Aartis and Aartis now come from their own dedicated database tables
      const [festAarti, aartiData] = await Promise.all([
        api.getFestivalAartis(),
        api.getAartis()
      ]);
      
      setFestivalAartiMantras(festAarti);
      setAartiMantras(aartiData);
    } catch (e) {
      console.warn("Failed fetching from Backend API", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const activeDaily = dailyMantra || DAILY_MANTRA; // fallback
  const listFeatured = featuredMantras.length > 0 ? featuredMantras : FEATURED;
  const listCategories = categories.length > 0 ? categories : CATEGORIES;

  // ── Featured Card ──────────────────────────────────────────────────────────
  const renderFeaturedCard = (routePrefix: string) => ({ item }: { item: any }) => (
    <TouchableOpacity
      style={s.featuredCard}
      activeOpacity={0.85}
      onPress={() => router.push(`${routePrefix}${item.id}` as any)}
    >
      <View style={[s.featuredBadge, { backgroundColor: C.secondary }]}>
        <Text style={s.badgeText}>{item.category || item.category_name || item.festival || item.festival_category || 'Aarti'}</Text>
      </View>
      <Text style={s.featuredSanskrit}>{item.sanskrit || item.sanskrit_title || item.sanskrit_text}</Text>
      <Text style={s.featuredName}>{item.title || item.name || item.aarti_name}</Text>
      <Text style={s.featuredGod}>{item.god || item.deity_name}</Text>
      <View style={s.featuredFooter}>
        <Ionicons name="play-circle" size={28} color={C.accent} />
        <Ionicons name="heart-outline" size={22} color="rgba(255,255,255,0.7)" style={{ marginLeft: 12 }} />
      </View>
    </TouchableOpacity>
  );

  // ── Category Card ──────────────────────────────────────────────────────────
  const renderCategory = ({ item }: { item: any }) => {
    const { icon, color } = getCategoryDisplayProps(item.name);
    return (
      <TouchableOpacity
        style={[s.categoryCard, { borderTopColor: color }]}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/category/[id]', params: { id: item.id, name: item.name } } as any)}
      >
        <View style={[s.categoryIconWrap, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={s.categoryName}>{item.name}</Text>
        {item.count && <Text style={s.categoryCount}>{item.count} mantras</Text>}
      </TouchableOpacity>
    );
  };

  // ── Recently Played Row ────────────────────────────────────────────────────
  const renderRecent = ({ item }: { item: Mantra }) => (
    <TouchableOpacity style={s.recentItem} activeOpacity={0.85}>
      <View style={s.recentIconWrap}>
        <Ionicons name="musical-note" size={20} color={C.primary} />
      </View>
      <View style={s.recentInfo}>
        <Text style={s.recentName}>{item.name}</Text>
        <Text style={s.recentGod}>{item.god}</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="play-circle-outline" size={30} color={C.secondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <CosmicBackground />
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
            colors={[C.primary, C.secondary]}
          />
        }
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={{ width: 44, height: 44, marginRight: 12, borderRadius: 22 }} 
              resizeMode="contain" 
            />
            <View>
              <Text style={s.headerGreeting}>नमस्ते 🙏</Text>
              <Text style={s.headerSub}>Find your inner peace</Text>
            </View>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/search/' as any)}>
              <Ionicons name="search" size={22} color={C.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.iconBtn, { marginLeft: 8 }]} onPress={() => router.push('/(tabs)/profile')}>
              <Ionicons name="person-circle-outline" size={26} color={C.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Daily Mantra Card ─────────────────────────────────────────── */}
        {loading ? (
          <View style={s.dailySkeleton}>
            <Skeleton height={14} width={80} style={{ marginBottom: 12 }} />
            <Skeleton height={32} style={{ marginBottom: 8 }} />
            <Skeleton height={18} width="60%" style={{ marginBottom: 20 }} />
            <Skeleton height={44} radius={22} width={120} />
          </View>
        ) : (
          <View style={s.dailyCard}>
            <View style={s.dailyLabel}>
              <Ionicons name="sunny" size={14} color={C.accent} />
              <Text style={s.dailyLabelText}>Daily Mantra</Text>
            </View>
            <Text style={s.dailySanskrit}>{activeDaily.sanskrit_title || activeDaily.sanskrit}</Text>
            <Text style={s.dailyName}>{activeDaily.title || activeDaily.name}</Text>
            <Text style={s.dailyGod}>{activeDaily.god || activeDaily.category_name}</Text>
            <View style={s.dailyActions}>
              <TouchableOpacity
                style={s.playBtn}
                onPress={() => setIsPlaying(!isPlaying)}
                activeOpacity={0.85}
              >
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#FFF" />
                <Text style={s.playBtnText}>{isPlaying ? 'Pause' : 'Play Mantra'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.heartBtn}>
                <Ionicons name="heart-outline" size={22} color={C.accent} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Featured Mantras ──────────────────────────────────────────── */}
        <SectionHeader title="Featured Mantras" onSeeAll={() => router.push('/(tabs)/categories')} />
        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
            {[1, 2].map((i) => (
              <Skeleton key={i} width={CARD_W} height={180} radius={20} style={{ marginRight: 14 }} />
            ))}
          </ScrollView>
        ) : (
          <FlatList
            data={listFeatured}
            renderItem={renderFeaturedCard('/mantra/')}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.hScroll}
            snapToInterval={CARD_W + 14}
            decelerationRate="fast"
          />
        )}

        {/* ── Categories Grid ───────────────────────────────────────────── */}
        <SectionHeader title="Categories" onSeeAll={() => router.push('/(tabs)/categories')} />
        {loading ? (
          <View style={s.grid}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={(width - 56) / 2} height={110} radius={16} style={{ marginBottom: 12 }} />
            ))}
          </View>
        ) : (
          <FlatList
            data={listCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={s.gridRow}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
          />
        )}

        {/* ── Festival Aarti ────────────────────────────────────────────── */}
        {(festivalAartiMantras.length > 0 || loading) && (
          <>
            <SectionHeader title="Festival Aarti" onSeeAll={() => router.push('/(tabs)/categories')} />
            {loading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
                {[1, 2].map((i) => (
                  <Skeleton key={i} width={CARD_W} height={180} radius={20} style={{ marginRight: 14 }} />
                ))}
              </ScrollView>
            ) : (
              <FlatList
                data={festivalAartiMantras}
                renderItem={renderFeaturedCard('/festival_aarti/')}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.hScroll}
                snapToInterval={CARD_W + 14}
                decelerationRate="fast"
              />
            )}
          </>
        )}

        {/* ── Aarti ─────────────────────────────────────────────────────── */}
        {(aartiMantras.length > 0 || loading) && (
          <>
            <SectionHeader title="Aarti" onSeeAll={() => router.push('/(tabs)/categories')} />
            {loading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
                {[1, 2].map((i) => (
                  <Skeleton key={i} width={CARD_W} height={180} radius={20} style={{ marginRight: 14 }} />
                ))}
              </ScrollView>
            ) : (
              <FlatList
                data={aartiMantras}
                renderItem={renderFeaturedCard('/aarti/')}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.hScroll}
                snapToInterval={CARD_W + 14}
                decelerationRate="fast"
              />
            )}
          </>
        )}

        {/* ── Upanishads Section ────────────────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Upanishads</Text>
          <TouchableOpacity onPress={() => router.push('/upanishad' as any)}>
            <Text style={s.seeAll}>Explore</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={s.upanishadBanner} 
          activeOpacity={0.8}
          onPress={() => router.push('/upanishad' as any)}
        >
          <View style={s.upanishadBannerContent}>
            <Ionicons name="book" size={24} color={C.primary} style={{ marginBottom: 8 }} />
            <Text style={s.upanishadBannerTitle}>Ancient Wisdom</Text>
            <Text style={s.upanishadBannerSub}>Explore mantras from the core Upanishads</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={32} color={C.primary} />
        </TouchableOpacity>

        {/* ── Recently Played ───────────────────────────────────────────── */}
        <SectionHeader title="Recently Played" />
        {loading ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 120 }}>
            {[1, 2].map((i) => (
              <Skeleton key={i} height={64} radius={14} style={{ marginBottom: 10 }} />
            ))}
          </View>
        ) : (
          <FlatList
            data={RECENTLY_PLAYED}
            renderItem={renderRecent}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerGreeting: { fontSize: 22, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 13, color: C.textSub, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },

  // Daily Mantra Card
  dailyCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, marginBottom: 28, backgroundColor: C.secondary, elevation: 6, shadowColor: C.secondary, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  dailySkeleton: { marginHorizontal: 20, borderRadius: 24, padding: 24, marginBottom: 28, backgroundColor: C.surface, elevation: 2, height: 200, justifyContent: 'center' },
  dailyLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dailyLabelText: { color: C.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginLeft: 6, textTransform: 'uppercase' },
  dailySanskrit: { fontSize: 32, color: '#FFF', textAlign: 'center', marginBottom: 8, lineHeight: 44, fontWeight: '500' },
  dailyName: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontWeight: '600' },
  dailyGod: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  dailyActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  playBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 50, gap: 8 },
  playBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  heartBtn: { width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: C.accent, justifyContent: 'center', alignItems: 'center' },

  // Section Header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  seeAll: { fontSize: 13, color: C.primary, fontWeight: '600' },

  // Featured Cards
  hScroll: { paddingLeft: 20, paddingRight: 6, paddingBottom: 8, marginBottom: 28 },
  featuredCard: { width: CARD_W, marginRight: 14, borderRadius: 20, backgroundColor: C.primary, padding: 20, elevation: 4, shadowColor: C.primary, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  featuredBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 14 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  featuredSanskrit: { fontSize: 20, color: '#FFF', marginBottom: 8, lineHeight: 28 },
  featuredName: { fontSize: 15, color: 'rgba(255,255,255,0.95)', fontWeight: '700', marginBottom: 2 },
  featuredGod: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 14 },
  featuredFooter: { flexDirection: 'row', alignItems: 'center' },

  // Upanishad Banner
  upanishadBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: C.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
  },
  upanishadBannerContent: { flex: 1 },
  upanishadBannerTitle: { fontSize: 18, fontWeight: 'bold', color: C.text, marginBottom: 4 },
  upanishadBannerSub: { fontSize: 13, color: C.textSub },

  // Categories
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 28 },
  gridRow: { justifyContent: 'space-between', marginBottom: 12 },
  categoryCard: { width: (width - 56) / 2, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderTopWidth: 3, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  categoryIconWrap: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  categoryName: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  categoryCount: { fontSize: 12, color: C.textSub },

  // Recently Played
  recentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  recentIconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.primary + '18', justifyContent: 'center', alignItems: 'center' },
  recentInfo: { flex: 1, marginLeft: 12 },
  recentName: { fontSize: 14, fontWeight: '700', color: C.text },
  recentGod: { fontSize: 12, color: C.textSub, marginTop: 2 },
});
