import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import { useFonts, TiroDevanagariHindi_400Regular } from '@expo-google-fonts/tiro-devanagari-hindi';

// ─── Color Palette ────────────────────────────────────────────────────────────
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

const { width, height } = Dimensions.get('window');
const HEADER_MAX = 280;
const HEADER_MIN = 80;

// ─── Sample Data ──────────────────────────────────────────────────────────────
const MANTRA_DATA = {
  id: '1',
  name: 'Gayatri Mantra',
  god: 'Surya Dev',
  category: 'Vedic',
  sanskrit: 'ॐ भूर्भुवः स्वः।\nतत्सवितुर्वरेण्यं\nभर्गो देवस्य धीमहि।\nधियो यो नः प्रचोदयात्॥',
  transliteration: 'Om Bhur Bhuva Svaha\nTat Savitur Varenyam\nBhargo Devasya Dheemahi\nDhiyo Yo Nah Prachodayat',
  translation_english:
    'We meditate on the glory of the Creator who has created the Universe, who is worthy of worship, who is the embodiment of knowledge and light, who is the remover of sin and ignorance. May He open our hearts and enlighten our intellect.',
  translation_hindi:
    'उस प्राण स्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ, तेजस्वी, पापनाशक, देवस्वरूप परमात्मा को हम अपनी अंतरात्मा में धारण करें। वह परमात्मा हमारी बुद्धि को सन्मार्ग में प्रेरित करे।',
  translation_regional: 'त्या सर्वश्रेष्ठ, प्रकाशमान, सृष्टिकर्त्या परमात्म्याचे आपण ध्यान करूया. तो परमात्मा आपल्या बुद्धीला सन्मार्गावर प्रेरित करो. (Marathi)',
  meaning: [
    'OM — The primordial sound of the universe',
    'BHUR — Earth, the physical world',
    'BHUVA — The astral plane / consciousness',
    'SVAHA — The celestial realms beyond',
    'TAT — That (pointing to the divine)',
    'SAVITUR — Of Savitr, the solar deity',
    'VARENYAM — Most adorable / worthy of reverence',
    'BHARGO — Radiance, divine effulgence',
    'DHEEMAHI — We meditate upon',
    'DHIYO YO NAH PRACHODAYAT — May it inspire our intellect',
  ],
  benefits: [
    { icon: 'brain', text: 'Enhances intellect and concentration' },
    { icon: 'leaf', text: 'Promotes spiritual growth and clarity' },
    { icon: 'heart', text: 'Purifies the mind and removes negativity' },
    { icon: 'sunny', text: 'Invokes blessings of the Sun God' },
    { icon: 'shield-checkmark', text: 'Offers protection from evil forces' },
    { icon: 'infinite', text: 'Leads toward moksha (liberation)' },
  ],
  audio_url: '', // placeholder
  duration: 108,
};

const RELATED = [
  { id: '2', name: 'Mahamrityunjaya', god: 'Shiva', sanskrit: 'ॐ त्र्यम्बकं यजामहे', category: 'Shiva' },
  { id: '3', name: 'Om Namah Shivaya', god: 'Shiva', sanskrit: 'ॐ नमः शिवाय', category: 'Shiva' },
  { id: '4', name: 'Hare Krishna', god: 'Krishna', sanskrit: 'हरे कृष्ण हरे कृष्ण', category: 'Vishnu' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MantraDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  // Fonts
  const [fontsLoaded] = useFonts({ TiroDevanagariHindi_400Regular });

  // Scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;

  // Audio state
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1
  const [elapsed, setElapsed] = useState(0);   // seconds
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Favorites animation
  const [isFavorite, setIsFavorite] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;

  // Tab state
  const [activeTab, setActiveTab] = useState<'english' | 'hindi' | 'regional'>('english');

  // ── Audio setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
    });
    return () => {
      soundRef.current?.unloadAsync();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // Simulate playback progress (replace with real expo-av sound when audio URL is available)
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= MANTRA_DATA.duration) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1;
          const p = next / MANTRA_DATA.duration;
          setProgress(p);
          Animated.timing(progressAnim, { toValue: p, duration: 500, useNativeDriver: false }).start();
          return next;
        });
      }, 1000);
    }
  }, [isPlaying]);

  const seek = (fraction: number) => {
    setElapsed(Math.round(fraction * MANTRA_DATA.duration));
    setProgress(fraction);
    Animated.timing(progressAnim, { toValue: fraction, duration: 100, useNativeDriver: false }).start();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── Favorites animation ────────────────────────────────────────────────────
  const toggleFavorite = () => {
    setIsFavorite((f) => !f);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 50 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      await Share.share({
        message: `✨ ${MANTRA_DATA.name}\n\n${MANTRA_DATA.sanskrit}\n\n${MANTRA_DATA.transliteration}\n\nShared via Mantra App 🙏`,
        title: MANTRA_DATA.name,
      });
    } catch (_) {}
  };

  // ── Animated header values ─────────────────────────────────────────────────
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX - HEADER_MIN],
    outputRange: [HEADER_MAX, HEADER_MIN],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, (HEADER_MAX - HEADER_MIN) * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const titleOpacity = scrollY.interpolate({
    inputRange: [(HEADER_MAX - HEADER_MIN) * 0.5, HEADER_MAX - HEADER_MIN],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // ── Render helpers ─────────────────────────────────────────────────────────
  const translations = {
    english: MANTRA_DATA.translation_english,
    hindi: MANTRA_DATA.translation_hindi,
    regional: MANTRA_DATA.translation_regional,
  };

  const renderRelated = ({ item }: { item: typeof RELATED[0] }) => (
    <TouchableOpacity style={s.relatedCard} onPress={() => router.push('/mantra/' as any + item.id)} activeOpacity={0.85}>
      <Text style={s.relatedSanskrit}>{item.sanskrit}</Text>
      <Text style={s.relatedName}>{item.name}</Text>
      <Text style={s.relatedGod}>{item.god}</Text>
    </TouchableOpacity>
  );

  // ── Progress bar width ─────────────────────────────────────────────────────
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Animated Collapsing Header ──────────────────────────────────────── */}
      <Animated.View style={[s.header, { height: headerHeight, paddingTop: insets.top }]}>
        {/* Always-visible top bar */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.iconBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Animated.Text style={[s.collapsedTitle, { opacity: titleOpacity }]} numberOfLines={1}>
            {MANTRA_DATA.name}
          </Animated.Text>
          <View style={s.topBarRight}>
            <TouchableOpacity style={s.iconBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Expanded content */}
        <Animated.View style={[s.headerExpanded, { opacity: headerOpacity }]}>
          <View style={s.categoryBadge}>
            <Text style={s.categoryBadgeText}>{MANTRA_DATA.category}</Text>
          </View>
          <Text style={s.headerTitle}>{MANTRA_DATA.name}</Text>
          <Text style={s.headerGod}>{MANTRA_DATA.god}</Text>
        </Animated.View>
      </Animated.View>

      {/* ── Scrollable Content ──────────────────────────────────────────────── */}
      <Animated.ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Sanskrit Text */}
        <View style={s.sanskritCard}>
          <Text style={[s.sanskritText, fontsLoaded && { fontFamily: 'TiroDevanagariHindi_400Regular' }]}>
            {MANTRA_DATA.sanskrit}
          </Text>
          <Text style={s.transliterationText}>{MANTRA_DATA.transliteration}</Text>
        </View>

        {/* ── Audio Player ─────────────────────────────────────────────────── */}
        <View style={s.playerCard}>
          <Text style={s.playerLabel}>🎵 Audio Player</Text>

          {/* Progress bar */}
          <View style={s.progressTrack}>
            <Animated.View style={[s.progressFill, { width: progressWidth }]} />
          </View>

          {/* Time */}
          <View style={s.timerRow}>
            <Text style={s.timerText}>{formatTime(elapsed)}</Text>
            <Text style={s.timerText}>{formatTime(MANTRA_DATA.duration)}</Text>
          </View>

          {/* Controls */}
          <View style={s.controls}>
            <TouchableOpacity onPress={() => seek(0)}>
              <Ionicons name="play-skip-back" size={26} color={C.text} />
            </TouchableOpacity>
            <TouchableOpacity style={s.playBtn} onPress={togglePlay} activeOpacity={0.85}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => seek(1)}>
              <Ionicons name="play-skip-forward" size={26} color={C.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Translation Tabs ─────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Translation</Text>
          <View style={s.tabRow}>
            {(['english', 'hindi', 'regional'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[s.tab, activeTab === tab && s.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.translationBody}>{translations[activeTab]}</Text>
        </View>

        {/* ── Meaning Section ───────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Word-by-Word Meaning</Text>
          {MANTRA_DATA.meaning.map((line, i) => (
            <View key={i} style={s.meaningRow}>
              <View style={s.bulletDot} />
              <Text style={s.meaningText}>{line}</Text>
            </View>
          ))}
        </View>

        {/* ── Benefits ─────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Benefits</Text>
          <View style={s.benefitsGrid}>
            {MANTRA_DATA.benefits.map((b, i) => (
              <View key={i} style={s.benefitCard}>
                <View style={s.benefitIcon}>
                  <Ionicons name={b.icon as any} size={22} color={C.secondary} />
                </View>
                <Text style={s.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Related Mantras ───────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Related Mantras</Text>
          <FlatList
            data={RELATED}
            renderItem={renderRelated}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 14, paddingRight: 4 }}
          />
        </View>
      </Animated.ScrollView>

      {/* ── Floating Favorites Button ─────────────────────────────────────── */}
      <View style={[s.fabRow, { bottom: insets.bottom + 20 }]}>
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <TouchableOpacity
            style={[s.favBtn, isFavorite && s.favBtnActive]}
            onPress={toggleFavorite}
            activeOpacity={0.85}
          >
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? '#FFF' : C.primary} />
            <Text style={[s.favBtnText, isFavorite && { color: '#FFF' }]}>
              {isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },

  // Animated Header
  header: {
    backgroundColor: C.secondary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 6,
    shadowColor: C.secondary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 10,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44 },
  topBarRight: { flexDirection: 'row' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  collapsedTitle: { flex: 1, textAlign: 'center', color: '#FFF', fontWeight: '700', fontSize: 16, marginHorizontal: 8 },
  headerExpanded: { marginTop: 12 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 10 },
  categoryBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  headerGod: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },

  // Sanskrit Card
  sanskritCard: { marginHorizontal: 20, marginTop: 24, marginBottom: 20, backgroundColor: C.surface, borderRadius: 20, padding: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, alignItems: 'center' },
  sanskritText: { fontSize: 28, lineHeight: 46, textAlign: 'center', color: C.text, marginBottom: 16 },
  transliterationText: { fontSize: 14, fontStyle: 'italic', color: C.textSub, textAlign: 'center', lineHeight: 22 },

  // Audio Player
  playerCard: { marginHorizontal: 20, marginBottom: 20, backgroundColor: C.surface, borderRadius: 20, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  playerLabel: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 16 },
  progressTrack: { height: 6, backgroundColor: C.border, borderRadius: 3, marginBottom: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 3 },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  timerText: { fontSize: 12, color: C.textSub },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 28 },
  playBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },

  // Section
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 14 },

  // Translation tabs
  tabRow: { flexDirection: 'row', backgroundColor: C.border, borderRadius: 12, padding: 4, marginBottom: 14 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: C.surface, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  tabText: { fontSize: 13, color: C.textSub, fontWeight: '600' },
  tabTextActive: { color: C.secondary },
  translationBody: { fontSize: 15, lineHeight: 26, color: C.text },

  // Meaning
  meaningRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bulletDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary, marginTop: 7, marginRight: 10 },
  meaningText: { flex: 1, fontSize: 14, color: C.text, lineHeight: 22 },

  // Benefits
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  benefitCard: { width: (width - 56) / 2, backgroundColor: C.surface, borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: C.secondary, elevation: 1 },
  benefitIcon: { marginBottom: 8 },
  benefitText: { fontSize: 13, color: C.text, lineHeight: 20 },

  // Related
  relatedCard: { width: 180, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderTopWidth: 3, borderTopColor: C.primary, elevation: 2 },
  relatedSanskrit: { fontSize: 18, color: C.text, marginBottom: 6 },
  relatedName: { fontSize: 13, fontWeight: '700', color: C.text },
  relatedGod: { fontSize: 12, color: C.textSub, marginTop: 2 },

  // FAB
  fabRow: { position: 'absolute', left: 20, right: 20, alignItems: 'center' },
  favBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.primary, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 50, elevation: 6, shadowColor: C.primary, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  favBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  favBtnText: { fontSize: 15, fontWeight: '700', color: C.primary },
});
