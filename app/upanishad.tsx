import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '../src/constants/theme';
import { CosmicBackground } from '../src/components/CosmicBackground';
import { GlassHeader } from '../src/components/GlassHeader';
import { ScriptureCard } from '../src/components/ScriptureCard';
import { api } from '../src/services/api';
import { Mantra } from '../src/types/navigation';

export default function UpanishadScreen() {
  const [mantras, setMantras] = useState<Mantra[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMantras();
  }, []);

  const fetchMantras = async () => {
    setLoading(true);
    try {
      const upanishads = await api.getUpanishads();
      setMantras(upanishads || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CosmicBackground />
      <GlassHeader
        title="Sacred Upanishads"
        subtitle="Eternal Vedic Wisdom & Philosophy"
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={mantras}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ScriptureCard
              title={item.title || item.name}
              sanskritTitle={item.sanskrit_title || item.sanskrit}
              category="Upanishad"
              onPress={() => router.push(`/mantra/${item.id}` as any)}
            />
          )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: Spacing.standard,
    paddingBottom: 40,
  },
});
