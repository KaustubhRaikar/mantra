import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '../../src/constants/theme';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassHeader } from '../../src/components/GlassHeader';
import { ScriptureCard } from '../../src/components/ScriptureCard';
import { api } from '../../src/services/api';

export default function VratKathaListScreen() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getVratKathas();
        setData(res || []);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <CosmicBackground />
      <GlassHeader
        title="Vrat Katha Sangrah"
        subtitle="Sacred Fasting Stories & Rituals"
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ScriptureCard
              title={item.katha_name}
              category={item.deity_name || 'Vrat Katha'}
              onPress={() => router.push(`/vrat_katha/${item.id}` as any)}
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
