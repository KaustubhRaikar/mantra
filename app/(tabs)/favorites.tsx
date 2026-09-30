import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/theme';
import { useFavorites, FavoriteItem } from '../../src/contexts/FavoritesContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CosmicBackground } from '../../src/components/CosmicBackground';

export default function FavoritesScreen() {
  const { favorites, toggleFavorite } = useFavorites();
  const router = useRouter();

  const handlePressItem = (item: FavoriteItem) => {
    const basePath = item.path || 'mantra';
    router.push(`/${basePath}/${item.id}` as any);
  };

  const renderItem = ({ item }: { item: FavoriteItem }) => {
    const title = item.name || item.title || item.chalisa_name || item.vidhi_name || item.stotra_name || item.katha_name || item.aarti_name || 'Sacred Item';
    const subTitle = item.god || item.deity_name || item.category || item.path || 'Devotional';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePressItem(item)}
        activeOpacity={0.8}
      >
        <TouchableOpacity 
          style={styles.heartBtn} 
          onPress={() => toggleFavorite(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="heart" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.cardSubTitle} numberOfLines={1}>
            {subTitle}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CosmicBackground />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Favorites</Text>
        <Text style={styles.headerSubTitle}>Quick access to your saved sacred chants & prayers</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-dislike-outline" size={54} color={Colors.textSecondary + '60'} />
          <Text style={styles.emptyText}>No favorites saved yet</Text>
          <Text style={styles.subText}>Tap the heart icon on any mantra, chalisa, or prayer to save it here.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 16 },
  header: { marginTop: 12, marginBottom: 14, marginLeft: 4 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  headerSubTitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 16 },
  subText: { fontSize: 13, color: Colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.surface, 
    padding: 14, 
    borderRadius: 16, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)'
  },
  heartBtn: {
    padding: 6,
    marginRight: 10,
    backgroundColor: Colors.primary + '12',
    borderRadius: 20,
  },
  cardContent: { flex: 1, marginRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  cardSubTitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});

