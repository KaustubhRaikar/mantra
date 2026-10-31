import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '../../src/constants/theme';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassHeader } from '../../src/components/GlassHeader';
import { ScriptureCard } from '../../src/components/ScriptureCard';
import { EmptyState } from '../../src/components/EmptyState';
import { api } from '../../src/services/api';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Mantra } from '../../src/types/navigation';

export default function CategoryScreen() {
  const { id, name } = useLocalSearchParams();
  const { colors } = useTheme();
  const [mantras, setMantras] = useState<Mantra[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMantras();
  }, [id]);

  const fetchMantras = async () => {
    setLoading(true);
    try {
      let identifier: string | number | undefined = id ? String(id) : undefined;
      if (identifier && identifier.startsWith('deity_')) {
        identifier = identifier.replace('deity_', '');
      }
      if (!identifier && name) {
        identifier = String(name);
      }
      const data = await api.getMantras(identifier);
      setMantras(data || []);
    } catch (e) {
      console.warn('Failed loading category mantras:', e);
    } finally {
      setLoading(false);
    }
  };

  const displayName = (name as string) || 'Sacred Verses';

  return (
    <View style={styles.container}>
      <CosmicBackground />
      <GlassHeader
        title={displayName}
        subtitle={`${mantras.length} Verses Available`}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : mantras.length > 0 ? (
        <FlatList
          data={mantras}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ScriptureCard
              title={item.title || item.name}
              sanskritTitle={item.sanskrit_title || item.sanskrit}
              category={displayName}
              onPress={() => router.push(`/mantra/${item.id}` as any)}
            />
          )}
        />
      ) : (
        <EmptyState
          icon="leaf-outline"
          title={`No Verses Found for ${displayName}`}
          description="Sacred chants for this deity will be added in upcoming scripture updates."
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
