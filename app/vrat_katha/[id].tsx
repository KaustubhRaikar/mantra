import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { api } from '../../src/services/api';
import { CosmicBackground } from '../../src/components/CosmicBackground';

const C = { bg: '#FFF9F4', surface: '#FFFFFF', primary: '#FF6B35', text: '#1A1A2E', secondary: '#5D3FD3', textSub: '#6B6B80' };

export default function VratKathaDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (id) {
        setLoading(true);
        const res = await api.getVratKathaDetails(id as string);
        setData(res);
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  if (!data) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: C.text }}>Vrat Katha not found.</Text>
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
        <Text style={s.headerTitle} numberOfLines={1}>{data.katha_name}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={s.card}>
            <Text style={s.god}>{data.deity_name}</Text>
            {data.description ? <Text style={s.desc}>{data.description}</Text> : null}
            {data.vrat_duration ? <Text style={s.subText}><Text style={s.bold}>Duration: </Text>{data.vrat_duration}</Text> : null}
            {data.vrat_day ? <Text style={s.subText}><Text style={s.bold}>Day: </Text>{data.vrat_day}</Text> : null}
            {data.rules ? <Text style={s.subText}><Text style={s.bold}>Rules: </Text>{data.rules}</Text> : null}
            {data.benefits ? <Text style={s.subText}><Text style={s.bold}>Benefits: </Text>{data.benefits}</Text> : null}
        </View>

        {data.katha_chapters ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Katha Chapters</Text>
            {(() => {
              try {
                const chapters = JSON.parse(data.katha_chapters);
                return chapters.map((c: any, i: number) => (
                  <View key={i} style={s.chapterCard}>
                    <Text style={s.chapterTitle}>Chapter {c.chapter}: {c.title}</Text>
                    <Text style={s.chapterStory}>{c.story}</Text>
                  </View>
                ));
              } catch (e) {
                return <Text style={s.desc}>Error parsing chapters.</Text>;
              }
            })()}
          </View>
        ) : null}

        {data.vidhi ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Pooja Vidhi</Text>
            {(() => {
              try {
                const vidhis = JSON.parse(data.vidhi);
                return vidhis.map((v: any, i: number) => (
                  <View key={i} style={s.stepCard}>
                    <View style={s.stepHeader}>
                      <View style={s.stepCircle}><Text style={s.stepNum}>{v.step}</Text></View>
                      <Text style={s.stepTitle}>{v.name}</Text>
                    </View>
                    <Text style={s.stepDesc}>{v.description}</Text>
                  </View>
                ));
              } catch (e) {
                return <Text style={s.desc}>Error parsing vidhi.</Text>;
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
  chapterCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
  chapterTitle: { fontSize: 18, fontWeight: '700', color: C.secondary, marginBottom: 12 },
  chapterStory: { fontSize: 15, color: '#333', lineHeight: 26 },
  stepCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2, borderLeftWidth: 4, borderLeftColor: C.primary },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.secondary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepNum: { color: C.secondary, fontSize: 14, fontWeight: 'bold' },
  stepTitle: { fontSize: 18, fontWeight: '700', color: C.text, flex: 1 },
  stepDesc: { fontSize: 15, color: '#444', lineHeight: 24 }
});
