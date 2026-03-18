import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/theme';
import { Mantra } from '../../src/types/navigation';

export default function FavoritesScreen() {
  const favorites: Mantra[] = []; // Empty state for now

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No favorites yet.</Text>
          <Text style={styles.subText}>Mantras you like will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={({ item }) => <View />}
          keyExtractor={(item) => item.id}
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
});
