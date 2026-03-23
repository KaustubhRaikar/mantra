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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import { useFonts, TiroDevanagariHindi_400Regular } from '@expo-google-fonts/tiro-devanagari-hindi';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { api } from '../../src/services/api';
import { CosmicBackground } from '../../src/components/CosmicBackground';

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

const RELATED = [
  { id: '2', name: 'Mahamrityunjaya', god: 'Shiva', sanskrit: 'ॐ त्र्यम्बकं यजामहे', category: 'Shiva' },
  { id: '3', name: 'Om Namah Shivaya', god: 'Shiva', sanskrit: 'ॐ नमः शिवाय', category: 'Shiva' },
  { id: '4', name: 'Hare Krishna', god: 'Krishna', sanskrit: 'हरे कृष्ण हरे कृष्ण', category: 'Vishnu' },
];

export default function MantraDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [MANTRA_DATA, setMantraData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (id) {
        setLoading(true);
        // If the ID carries the 'u_' namespace from the Upanishads table, call the standalone API endpoint
        let data;
        if (id.toString().startsWith('u_')) {
          data = await api.getUpanishad(id as string);
        } else {
          data = await api.getMantra(id as string);
        }
        
        setMantraData(data);
        setLoading(false);
      }
    })();
  }, [id]);

  // Fonts
  const [fontsLoaded] = useFonts({ TiroDevanagariHindi_400Regular });

  // Scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;

  // Audio state
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1
  const [positionMillis, setPositionMillis] = useState<number>(0);
  const [durationMillis, setDurationMillis] = useState<number>(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Favorites animation
  const { isFavorite: checkFavorite, toggleFavorite: contextToggleFav } = useFavorites();
  const isFavorite = MANTRA_DATA?.id ? checkFavorite(MANTRA_DATA.id) : false;
  const heartScale = useRef(new Animated.Value(isFavorite ? 1.4 : 1)).current;

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
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      setPositionMillis(status.positionMillis);
      setDurationMillis(status.durationMillis || 108000);
      setIsPlaying(status.isPlaying);
      
      const currentProgress = status.durationMillis && status.durationMillis > 0 ? status.positionMillis / status.durationMillis : 0;
      setProgress(currentProgress);
      Animated.timing(progressAnim, { toValue: currentProgress, duration: 200, useNativeDriver: false }).start();
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setProgress(0);
        setPositionMillis(0);
        Animated.timing(progressAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        soundRef.current?.setPositionAsync(0);
      }
    } else if (status.error) {
      console.error(`FATAL PLAYER ERROR: ${status.error}`);
    }
  }, [progressAnim]);

  const togglePlay = useCallback(async () => {
    if (!MANTRA_DATA) return;
    
    // Using Google Translate's free TTS API endpoint to generate audio from the mantra text.
    // 'tl=hi' uses the Hindi voice which accurately pronounces Sanskrit Devanagari texts.
    const encodedText = encodeURIComponent(MANTRA_DATA.sanskrit);
    const finalUri = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=hi&q=${encodedText}`;

    try {
      if (soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          await soundRef.current.playAsync();
        }
      } else {
        // Load sound for the first time
        setIsPlaying(true);
        const { sound } = await Audio.Sound.createAsync(
          { uri: finalUri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        soundRef.current = sound;
      }
    } catch (error) {
      console.warn('Error playing audio', error);
      Alert.alert(
        "Audio Not Found",
        `The audio API could not play the sound. The server returned a 404 Not Found error for:\n\n${finalUri}\n\nPlease ensure you have uploaded this audio file to the correct backend directory.`
      );
      setIsPlaying(false);
    }
  }, [isPlaying, MANTRA_DATA, onPlaybackStatusUpdate]);

  const seek = async (fraction: number) => {
    if (soundRef.current && durationMillis) {
      const position = fraction * durationMillis;
      await soundRef.current.setPositionAsync(position);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── Favorites animation ────────────────────────────────────────────────────
  const toggleFavorite = async () => {
    if (!MANTRA_DATA) return;
    await contextToggleFav(MANTRA_DATA as any); // Type cast due to sample data
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 50 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!MANTRA_DATA) return;
    try {
      await Share.share({
        message: `✨ ${MANTRA_DATA.name}\n\n${MANTRA_DATA.sanskrit}\n\n${MANTRA_DATA.transliteration || ''}\n\nShared via Mantra App 🙏`,
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
  const translations = MANTRA_DATA ? {
    english: MANTRA_DATA.translation_english,
    hindi: MANTRA_DATA.translation_hindi,
    regional: MANTRA_DATA.translation_regional,
  } : { english: '', hindi: '', regional: '' };

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

  if (loading) {
    return (
      <View style={[s.root, { backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!MANTRA_DATA) {
    return (
      <View style={[s.root, { backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: C.text }}>Mantra not found.</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
          <Text style={{ color: C.primary, fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <CosmicBackground />
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
            <Text style={s.categoryBadgeText}>{MANTRA_DATA.category || 'Mantra'}</Text>
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
          {MANTRA_DATA.transliteration ? (
            <Text style={s.transliterationText}>{MANTRA_DATA.transliteration}</Text>
          ) : null}
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
            <Text style={s.timerText}>{formatTime(Math.floor(positionMillis / 1000))}</Text>
            <Text style={s.timerText}>{formatTime(durationMillis > 0 ? Math.floor(durationMillis / 1000) : (MANTRA_DATA?.duration || 108))}</Text>
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
          <Text style={s.translationBody}>{translations[activeTab] || 'Translation not available.'}</Text>
        </View>

        {/* ── Meaning Section ───────────────────────────────────────────────── */}
        {MANTRA_DATA.meaning ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{Array.isArray(MANTRA_DATA.meaning) ? 'Word-by-Word Meaning' : 'Meaning'}</Text>
            {Array.isArray(MANTRA_DATA.meaning) ? (
              MANTRA_DATA.meaning.map((line: string, i: number) => (
                <View key={i} style={s.meaningRow}>
                  <View style={s.bulletDot} />
                  <Text style={s.meaningText}>{line}</Text>
                </View>
              ))
            ) : (
               <Text style={s.meaningText}>{MANTRA_DATA.meaning}</Text>
            )}
          </View>
        ) : null}

        {/* ── Benefits ─────────────────────────────────────────────────────── */}
        {Array.isArray(MANTRA_DATA.benefits) && MANTRA_DATA.benefits.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Benefits</Text>
            <View style={s.benefitsGrid}>
              {MANTRA_DATA.benefits.map((b: any, i: number) => (
                <View key={i} style={s.benefitCard}>
                  <View style={s.benefitIcon}>
                    <Ionicons name={b.icon as any} size={22} color={C.secondary} />
                  </View>
                  <Text style={s.benefitText}>{b.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

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
