import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography } from '../../src/constants/theme';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassCard } from '../../src/components/GlassCard';
import { JapaOrb } from '../../src/components/JapaOrb';
import { SkeletonLoader } from '../../src/components/SkeletonLoader';
import { getCategoryDisplayProps } from '../../src/utils/categoryHelper';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { storage } from '../../src/services/storage';
import { api } from '../../src/services/api';
import { safeCreateSound, safeSetAudioMode } from '../../src/utils/audioPlayer';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.72;

interface Mantra {
  id: string;
  name: string;
  god: string;
  sanskrit: string;
  category: string;
}

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

export default function HomeScreen() {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isDark, toggleTheme, colors } = useTheme();

  const [isPlaying, setIsPlaying] = useState(false);
  const [dailyMantra, setDailyMantra] = useState<any>(null);
  const [featuredMantras, setFeaturedMantras] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [festivalAartis, setFestivalAartis] = useState<any[]>([]);
  const [aartis, setAartis] = useState<any[]>([]);
  const [chalisas, setChalisas] = useState<any[]>([]);
  const [poojaVidhis, setPoojaVidhis] = useState<any[]>([]);
  const [stotras, setStotras] = useState<any[]>([]);
  const [vratKathas, setVratKathas] = useState<any[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Audio state
  const soundRef = useRef<any>(null);

  // Japa Mala Counter State
  const [jaapCount, setJaapCount] = useState(0);
  const [jaapGoal, setJaapGoal] = useState(108);
  const [completedMalas, setCompletedMalas] = useState(0);

  const handleJaapTap = useCallback(() => {
    setJaapCount((prev) => {
      const next = prev + 1;
      const isMalaComplete = next >= jaapGoal;
      if (isMalaComplete) {
        setCompletedMalas((m) => m + 1);
      }
      storage.recordJaapTap(1, isMalaComplete ? 1 : 0).catch(() => {});
      return isMalaComplete ? 0 : next;
    });
  }, [jaapGoal]);

  const handleResetJaap = () => {
    setJaapCount(0);
    setCompletedMalas(0);
  };

  const loadData = async () => {
    try {
      const [
        daily,
        featured,
        cats,
        played,
        festAarti,
        aartiData,
        chalData,
        poojaData,
        stotraData,
        vratData,
      ] = await Promise.all([
        api.getDailyMantra(),
        api.getFeaturedMantras(),
        api.getCategories(),
        storage.getRecentlyPlayed(),
        api.getFestivalAartis(),
        api.getAartis(),
        api.getChalisas(),
        api.getPoojaVidhis(),
        api.getStotras(),
        api.getVratKathas(),
      ]);

      setDailyMantra(daily);
      setFeaturedMantras(featured);
      setCategories(cats);
      setRecentlyPlayed(played);
      setFestivalAartis(festAarti);
      setAartis(aartiData);
      setChalisas(chalData);
      setPoojaVidhis(poojaData);
      setStotras(stotraData);
      setVratKathas(vratData);
    } catch (e) {
      console.warn('Failed fetching data from API', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const toggleDailyPlay = useCallback(async () => {
    const target = dailyMantra || DAILY_MANTRA;
    if (!target) return;

    try {
      if (soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      } else {
        await safeSetAudioMode();
        setIsPlaying(true);
        const payload = {
          audio_url: target.audio_url,
          sanskrit: target.sanskrit || target.sanskrit_title,
          title: target.title,
        };
        const { sound } = await safeCreateSound(payload, (status: any) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              setIsPlaying(false);
              soundRef.current?.setPositionAsync(0).catch(() => {});
            }
          }
        });
        soundRef.current = sound;
      }
    } catch (e) {
      console.warn('Failed to play daily mantra audio:', e);
      setIsPlaying(false);
    }
  }, [isPlaying, dailyMantra]);

  useEffect(() => {
    return () => {
      if (soundRef.current?.unloadAsync) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const activeDaily = dailyMantra || DAILY_MANTRA;
  const listFeatured = featuredMantras.length > 0 ? featuredMantras : FEATURED;

  const renderSectionHeader = (title: string, onSeeAll?: () => void) => (
    <View style={styles.sectionHeaderRow}>
      <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>{title}</Text>
      {onSeeAll ? (
        <TouchableOpacity
          onPress={onSeeAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
        >
          <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderFeaturedCard = (routePrefix: string) => ({ item }: { item: any }) => {
    const title = item.title || item.name || item.aarti_name || item.chalisa_name || item.vidhi_name || item.stotra_name || item.katha_name;
    const sanskrit = item.sanskrit || item.sanskrit_title || item.sanskrit_text || '';
    const god = item.god || item.deity_name || 'Vedic';
    const cat = item.category || item.category_name || item.festival || 'Sacred';
    const fav = isFavorite(item.id);

    return (
      <GlassCard
        style={styles.featuredCard}
        glow
        onPress={() => {
          storage.addRecentlyPlayed({ ...item, path: routePrefix.replace(/\//g, '') });
          router.push(`${routePrefix}${item.id}` as any);
        }}
      >
        <View style={styles.badgeRow}>
          <View style={[
            styles.categoryChip,
            {
              backgroundColor: isDark ? 'rgba(255, 153, 51, 0.12)' : 'rgba(230, 126, 34, 0.10)',
              borderColor: isDark ? 'rgba(255, 153, 51, 0.25)' : 'rgba(230, 126, 34, 0.30)',
            }
          ]}>
            <Text style={[styles.categoryChipText, { color: isDark ? colors.secondary : colors.primary }]}>{cat}</Text>
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite({ ...item, path: routePrefix.replace(/\//g, '') || 'mantra' });
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={fav ? 'Remove favorite' : 'Add favorite'}
          >
            <Ionicons
              name={fav ? 'heart' : 'heart-outline'}
              size={22}
              color={fav ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {sanskrit ? (
          <Text
            style={[styles.featuredSanskrit, { color: colors.primary }]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {sanskrit}
          </Text>
        ) : null}

        <Text
          style={[styles.featuredTitle, { color: colors.text }]}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {title}
        </Text>

        <Text style={[styles.featuredGod, { color: colors.textSecondary }]} numberOfLines={1}>
          {god}
        </Text>

        <View style={styles.cardPlayRow}>
          <View style={[styles.playBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="play" size={14} color="#0C0A1A" />
          </View>
          <Text style={[styles.listenText, { color: colors.primary }]}>Listen & Recite</Text>
        </View>
      </GlassCard>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <CosmicBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary, Colors.secondary]}
          />
        }
      >
        {/* ── Top Bar ───────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.branding}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={[styles.greetingText, { color: colors.text }]}>नमस्ते 🙏</Text>
              <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>Sacred Peace & Wisdom</Text>
            </View>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              style={[
                styles.circleButton,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)', borderColor: colors.border }
              ]}
              onPress={() => router.push('/search/' as any)}
              accessibilityRole="button"
              accessibilityLabel="Search scriptures"
            >
              <Ionicons name="search" size={20} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.circleButton,
                { marginLeft: 8, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)', borderColor: colors.border }
              ]}
              onPress={toggleTheme}
              accessibilityRole="button"
              accessibilityLabel={isDark ? "Switch to Sacred Dawn Light Theme" : "Switch to Cosmic Dark Night Theme"}
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={20}
                color={isDark ? colors.primary : colors.secondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.circleButton,
                { marginLeft: 8, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)', borderColor: colors.border }
              ]}
              onPress={() => router.push('/(tabs)/profile')}
              accessibilityRole="button"
              accessibilityLabel="Open devotee profile"
            >
              <Ionicons name="person-circle-outline" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Daily Mantra Card ─────────────────────────────────── */}
        {loading ? (
          <GlassCard style={styles.dailyCard}>
            <SkeletonLoader height={14} width={100} style={{ marginBottom: 12 }} />
            <SkeletonLoader height={32} style={{ marginBottom: 10 }} />
            <SkeletonLoader height={18} width="60%" style={{ marginBottom: 20 }} />
            <SkeletonLoader height={44} radius={22} width={130} />
          </GlassCard>
        ) : (
          <GlassCard style={styles.dailyCard} glow>
            <View style={styles.dailyHeader}>
              <View style={[
                styles.dailyPill,
                {
                  backgroundColor: isDark ? 'rgba(255, 153, 51, 0.15)' : 'rgba(230, 126, 34, 0.12)',
                  borderColor: isDark ? 'rgba(255, 153, 51, 0.3)' : 'rgba(230, 126, 34, 0.35)',
                }
              ]}>
                <Ionicons name="sunny" size={14} color={isDark ? colors.secondary : colors.primary} />
                <Text style={[styles.dailyPillText, { color: isDark ? colors.secondary : colors.primary }]}>Daily Mantra</Text>
              </View>
              <TouchableOpacity
                onPress={() => activeDaily && toggleFavorite({ ...activeDaily, path: 'mantra' })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Favorite daily mantra"
              >
                <Ionicons
                  name={activeDaily && isFavorite(activeDaily.id) ? 'heart' : 'heart-outline'}
                  size={24}
                  color={activeDaily && isFavorite(activeDaily.id) ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <Text
              style={[styles.dailySanskrit, { color: colors.primary }]}
              numberOfLines={2}
              maxFontSizeMultiplier={1.3}
            >
              {activeDaily.sanskrit_title || activeDaily.sanskrit}
            </Text>

            <Text
              style={[styles.dailyTitle, { color: colors.text }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
            >
              {activeDaily.title || activeDaily.name}
            </Text>

            <Text style={[styles.dailyGod, { color: colors.textSecondary }]} numberOfLines={1}>
              {activeDaily.god || activeDaily.category_name}
            </Text>

            <TouchableOpacity
              style={[styles.dailyPlayBtn, { backgroundColor: colors.primary }]}
              onPress={toggleDailyPlay}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Pause daily mantra' : 'Play daily mantra'}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color="#0C0A1A" />
              <Text style={styles.dailyPlayBtnText}>{isPlaying ? 'Pause' : 'Play Mantra'}</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* ── Sacred Japa Mala Orb Component ────────────────────── */}
        <JapaOrb
          count={jaapCount}
          goal={jaapGoal}
          completedMalas={completedMalas}
          onTap={handleJaapTap}
          onReset={handleResetJaap}
          onSelectGoal={(g) => {
            setJaapGoal(g);
            setJaapCount(0);
          }}
        />

        {/* ── Featured Mantras ─────────────────────────────────── */}
        {renderSectionHeader('Featured Mantras', () => router.push('/(tabs)/categories'))}
        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            {[1, 2].map((i) => (
              <SkeletonLoader key={i} width={CARD_W} height={190} radius={16} style={{ marginRight: 14 }} />
            ))}
          </ScrollView>
        ) : (
          <FlatList
            data={listFeatured}
            renderItem={renderFeaturedCard('/mantra/')}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
            snapToInterval={CARD_W + 14}
            decelerationRate="fast"
          />
        )}

        {/* ── Upanishads Quick Banner ──────────────────────────── */}
        <GlassCard
          style={styles.upanishadBanner}
          onPress={() => router.push('/upanishad' as any)}
        >
          <View style={[
            styles.upanishadIconCircle,
            {
              backgroundColor: isDark ? 'rgba(255, 153, 51, 0.15)' : 'rgba(230, 126, 34, 0.12)',
              borderColor: isDark ? 'rgba(255, 153, 51, 0.3)' : 'rgba(230, 126, 34, 0.35)',
            }
          ]}>
            <Ionicons name="book" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <Text style={[styles.upanishadTitle, { color: colors.text }]}>Sacred Upanishads</Text>
            <Text style={[styles.upanishadSub, { color: colors.textSecondary }]}>Explore eternal philosophical wisdom</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? colors.secondary : colors.primary} />
        </GlassCard>

        {/* ── Categories Grid ──────────────────────────────────── */}
        {renderSectionHeader('Categories', () => router.push('/(tabs)/categories'))}
        <View style={styles.grid}>
          {(() => {
            const seen = new Set<string>();
            const uniqueCats = categories.filter((cat) => {
              if (!cat?.name) return false;
              const n = cat.name.trim().toLowerCase();
              if (seen.has(n) || n === 'aartis') return false;
              seen.add(n);
              return true;
            }).slice(0, 6);

            return uniqueCats.map((cat, idx) => {
              const { icon, color } = getCategoryDisplayProps(cat.name);
              return (
                <GlassCard
                  key={idx}
                  style={styles.categoryCard}
                  onPress={() => router.push({ pathname: '/category/[id]', params: { id: cat.id, name: cat.name } } as any)}
                >
                  <View style={[styles.categoryIconWrap, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={26} color={color} />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>{cat.name}</Text>
                  {cat.count ? <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>{cat.count} verses</Text> : null}
                </GlassCard>
              );
            });
          })()}
        </View>

        {/* ── Festival Aartis ──────────────────────────────────── */}
        {festivalAartis.length > 0 ? (
          <>
            {renderSectionHeader('Festival Aartis')}
            <FlatList
              data={festivalAartis}
              renderItem={renderFeaturedCard('/festival_aarti/')}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
              snapToInterval={CARD_W + 14}
              decelerationRate="fast"
            />
          </>
        ) : null}

        {/* ── Chalisas ─────────────────────────────────────────── */}
        {chalisas.length > 0 ? (
          <>
            {renderSectionHeader('Chalisas', () => router.push('/chalisa' as any))}
            <FlatList
              data={chalisas}
              renderItem={renderFeaturedCard('/chalisa/')}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
              snapToInterval={CARD_W + 14}
              decelerationRate="fast"
            />
          </>
        ) : null}

        {/* ── Stotras ──────────────────────────────────────────── */}
        {stotras.length > 0 ? (
          <>
            {renderSectionHeader('Stotras', () => router.push('/stotra' as any))}
            <FlatList
              data={stotras}
              renderItem={renderFeaturedCard('/stotra/')}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
              snapToInterval={CARD_W + 14}
              decelerationRate="fast"
            />
          </>
        ) : null}

        {/* ── Pooja Vidhi ──────────────────────────────────────── */}
        {poojaVidhis.length > 0 ? (
          <>
            {renderSectionHeader('Pooja Vidhis', () => router.push('/pooja_vidhi' as any))}
            <FlatList
              data={poojaVidhis}
              renderItem={renderFeaturedCard('/pooja_vidhi/')}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
              snapToInterval={CARD_W + 14}
              decelerationRate="fast"
            />
          </>
        ) : null}

        {/* ── Vrat Kathas ──────────────────────────────────────── */}
        {vratKathas.length > 0 ? (
          <>
            {renderSectionHeader('Vrat Kathas', () => router.push('/vrat_katha' as any))}
            <FlatList
              data={vratKathas}
              renderItem={renderFeaturedCard('/vrat_katha/')}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
              snapToInterval={CARD_W + 14}
              decelerationRate="fast"
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for custom tab bar
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.standard,
    paddingVertical: Spacing.compact,
    marginBottom: Spacing.compact,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    marginRight: 12,
  },
  greetingText: {
    fontFamily: Typography.families.heading,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  greetingSub: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyCard: {
    marginHorizontal: Spacing.standard,
    marginBottom: Spacing.large,
    padding: Spacing.large,
    alignItems: 'center',
  },
  dailyHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.small,
  },
  dailyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 153, 51, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.3)',
  },
  dailyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  dailySanskrit: {
    fontFamily: Typography.families.devanagari,
    fontSize: 26,
    lineHeight: 38,
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: Spacing.compact,
  },
  dailyTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  dailyGod: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: Spacing.standard,
  },
  dailyPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.full,
  },
  dailyPlayBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C0A1A',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.standard,
    marginBottom: Spacing.small,
    marginTop: Spacing.standard,
  },
  sectionHeaderTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  hScroll: {
    paddingLeft: Spacing.standard,
    paddingRight: Spacing.compact,
    paddingBottom: Spacing.compact,
    marginBottom: Spacing.medium,
  },
  featuredCard: {
    width: CARD_W,
    marginRight: 14,
    padding: Spacing.standard,
    borderRadius: Radius.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.small,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 153, 51, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.25)',
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  featuredSanskrit: {
    fontFamily: Typography.families.devanagari,
    fontSize: 18,
    lineHeight: 26,
    color: Colors.primary,
    marginBottom: 4,
  },
  featuredTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  featuredGod: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.standard,
  },
  cardPlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  upanishadBanner: {
    marginHorizontal: Spacing.standard,
    marginVertical: Spacing.standard,
    padding: Spacing.standard,
    flexDirection: 'row',
    alignItems: 'center',
  },
  upanishadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 153, 51, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upanishadTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  upanishadSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.standard,
    gap: 12,
    marginBottom: Spacing.large,
  },
  categoryCard: {
    width: (width - 44) / 2,
    padding: Spacing.standard,
    borderRadius: Radius.md,
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontFamily: Typography.families.heading,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  categoryCount: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
