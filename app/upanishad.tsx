import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { api } from '../src/services/api';
import { Mantra } from '../src/types/navigation';
import { CosmicBackground } from '../src/components/CosmicBackground';

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
      // 100% remote fetch of Upanishad-table data via custom endpoint.
      const upanishads = await api.getUpanishads();
      
      // If DB has Upanishad mantras, set them
      if (upanishads && upanishads.length > 0) {
        setMantras(upanishads);
      } else {
        setMantras([]);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Mantra }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/mantra/${item.id}` as any)}
      activeOpacity={0.8}
    >
      <Ionicons name="library" size={24} color={Colors.primary} style={styles.cardIcon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardSanskrit}>{item.sanskrit_title || item.sanskrit}</Text>
        <Text style={styles.cardName}>{item.title || item.name}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CosmicBackground />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upanishadic Mantras</Text>
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.description}>
        Explore the profound philosophical verses and peace chants (Shanti Mantras) from the ancient texts of the Upanishads.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : mantras.length > 0 ? (
        <FlatList
          data={mantras}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      ) : (
        <View style={styles.emptyResults}>
          <Ionicons name="moon-outline" size={60} color={Colors.border} />
          <Text style={styles.emptyText}>No Upanishad mantras found</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backButton: {},
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  description: { fontSize: 13, color: Colors.textSecondary, marginBottom: 24, lineHeight: 22 },
  emptyResults: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  emptyText: { marginTop: 12, fontSize: 16, color: Colors.textSecondary },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.surface, 
    padding: 16, 
    borderRadius: 16, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)'
  },
  cardIcon: { marginRight: 16 },
  cardSanskrit: { fontSize: 18, color: Colors.text, marginBottom: 4 },
  cardName: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
});
