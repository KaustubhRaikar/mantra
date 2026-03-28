import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { api } from '../../src/services/api';
import { storage } from '../../src/services/storage';
import { CosmicBackground } from '../../src/components/CosmicBackground';

const C = { bg: '#FFF9F4', surface: '#FFFFFF', primary: '#FF6B35', text: '#1A1A2E', secondary: '#5D3FD3', textSub: '#6B6B80' };

export default function ChalisaDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentVerse, setCurrentVerse] = useState(0);

  useEffect(() => {
    (async () => {
      if (id) {
        setLoading(true);
        const res = await api.getChalisaDetails(id as string);
        setData(res);
        setLoading(false);
        if (res) {
          storage.addRecentlyPlayed({ ...res, path: 'chalisa' });
        }
      }
    })();
  }, [id]);

  if (loading) {
    return <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  if (!data) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: C.text }}>Chalisa not found.</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}><Text style={{ color: C.primary, fontSize: 16 }}>Go Back</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <CosmicBackground />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{data.chalisa_name}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={s.card}>
            <Text style={s.god}>{data.deity_name}</Text>
            {data.description ? <Text style={s.desc}>{data.description}</Text> : null}
            {data.significance ? <Text style={s.subText}><Text style={s.bold}>Significance: </Text>{data.significance}</Text> : null}
            {data.benefits ? <Text style={s.subText}><Text style={s.bold}>Benefits: </Text>{data.benefits}</Text> : null}
        </View>

        {data.verses ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Verses</Text>
            {(() => {
              try {
                const verses = JSON.parse(data.verses);
                
                if (verses.length === 0) return <Text style={s.desc}>No verses found.</Text>;
                const v = verses[currentVerse];

                return (
                  <>
                    <View style={s.verseCard}>
                      <View style={s.verseHeader}>
                         <Text style={s.verseNo}>Verse {v.verse_no}</Text>
                      </View>
                      <Text style={s.sanskrit}>{v.text || v.sanskrit}</Text>
                      {v.transliteration ? <Text style={s.translit}>{v.transliteration}</Text> : null}
                      {v.translation_hindi ? <Text style={s.hindi}>{v.translation_hindi}</Text> : null}
                      {v.translation_english ? <Text style={s.english}>{v.translation_english}</Text> : null}
                    </View>
                    
                    <View style={s.paginationRow}>
                      <TouchableOpacity 
                        style={[s.pageBtn, currentVerse === 0 && s.pageBtnDisabled]} 
                        onPress={() => setCurrentVerse(Math.max(0, currentVerse - 1))}
                        disabled={currentVerse === 0}
                      >
                        <Ionicons name="arrow-back" size={20} color={currentVerse === 0 ? '#CCC' : '#FFF'} />
                        <Text style={[s.pageBtnText, currentVerse === 0 && {color: '#CCC'}]}>Previous</Text>
                      </TouchableOpacity>
                      
                      <Text style={s.pageText}>{currentVerse + 1} / {verses.length}</Text>
                      
                      <TouchableOpacity 
                        style={[s.pageBtn, currentVerse === verses.length - 1 && s.pageBtnDisabled]} 
                        onPress={() => setCurrentVerse(Math.min(verses.length - 1, currentVerse + 1))}
                        disabled={currentVerse === verses.length - 1}
                      >
                        <Text style={[s.pageBtnText, currentVerse === verses.length - 1 && {color: '#CCC'}]}>Next</Text>
                        <Ionicons name="arrow-forward" size={20} color={currentVerse === verses.length - 1 ? '#CCC' : '#FFF'} />
                      </TouchableOpacity>
                    </View>
                  </>
                );
              } catch (e) {
                return <Text style={s.desc}>Error parsing verses.</Text>;
              }
            })()}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: C.secondary },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: C.surface, padding: 20, borderRadius: 16, elevation: 3, shadowColor: C.secondary, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  god: { fontSize: 22, fontWeight: '800', color: C.primary, marginBottom: 15, textAlign: 'center' },
  desc: { fontSize: 16, lineHeight: 24, color: C.text, textAlign: 'center', marginBottom: 15 },
  subText: { fontSize: 15, lineHeight: 22, color: C.text, marginBottom: 10 },
  bold: { fontWeight: 'bold', color: C.secondary },
  section: { marginTop: 24, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 16, paddingHorizontal: 4 },
  verseCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  verseHeader: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  verseNo: { backgroundColor: C.secondary + '15', color: C.secondary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 13, fontWeight: 'bold' },
  sanskrit: { fontSize: 22, lineHeight: 36, color: C.text, textAlign: 'center', marginBottom: 16, fontWeight: '500' },
  translit: { fontSize: 14, fontStyle: 'italic', color: C.textSub, textAlign: 'center', marginBottom: 16, lineHeight: 22 },
  hindi: { fontSize: 15, color: '#333', textAlign: 'center', marginBottom: 10, lineHeight: 24 },
  english: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
  paginationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  pageBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, elevation: 2 },
  pageBtnDisabled: { backgroundColor: '#F0F0F0', elevation: 0 },
  pageBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, marginHorizontal: 4 },
  pageText: { fontSize: 16, fontWeight: 'bold', color: C.textSub }
});
