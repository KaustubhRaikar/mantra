import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/theme';
import { Mantra } from '../../src/types/navigation';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CosmicBackground } from '../../src/components/CosmicBackground';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const router = useRouter();

  const renderItem = ({ item }: { item: Mantra }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push('/mantra/' as any + item.id)}
      activeOpacity={0.8}
    >
      <Ionicons name="heart" size={24} color={Colors.primary} style={styles.cardIcon} />
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title || item.name || item.mantra_name}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={Colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CosmicBackground />
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No favorites yet.</Text>
          <Text style={styles.subText}>Mantras you like will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  subText: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
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
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.text },
});
