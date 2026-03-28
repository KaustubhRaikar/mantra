import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { api } from '../../src/services/api';
import { CosmicBackground } from '../../src/components/CosmicBackground';

const C = { bg: '#FFF9F4', surface: '#FFFFFF', primary: '#FF6B35', text: '#1A1A2E', secondary: '#5D3FD3', border: '#EBEBF5' };

export default function ChalisaListScreen() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.getChalisas();
      setData(res);
      setLoading(false);
    })();
  }, []);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <CosmicBackground />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>All Chalisas</Text>
        <View style={{ width: 40 }} />
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color={C.primary}/></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {data.map((item, idx) => (
            <TouchableOpacity key={idx} style={s.card} onPress={() => router.push(`/chalisa/${item.id}` as any)}>
              <Text style={s.god}>{item.chalisa_name}</Text>
              <Text style={s.sub}>{item.deity_name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: C.secondary },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: C.surface, padding: 20, borderRadius: 16, elevation: 2, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: C.primary },
  god: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 5 },
  sub: { fontSize: 14, color: '#6B6B80' },
});
