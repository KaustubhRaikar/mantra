import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { api } from '../../src/services/api';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { useRouter } from 'expo-router';
import { getCategoryDisplayProps } from '../../src/utils/categoryHelper';

export default function CategoriesScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (e) {
        console.warn('Failed to load categories', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CosmicBackground />
      <View style={styles.headerRow}>
        <Text style={styles.title}>All Categories</Text>
        <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
          <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          key={viewMode} // Force re-render on viewMode change
          numColumns={viewMode === 'grid' ? 2 : 1}
          renderItem={({ item }) => {
            const { icon, color } = getCategoryDisplayProps(item.name);
            return (
              <TouchableOpacity 
                style={viewMode === 'grid' ? [styles.gridItem, { borderTopColor: color, borderTopWidth: 3 }] : [styles.listItem, { borderLeftColor: color, borderLeftWidth: 4 }]}
                onPress={() => router.push({ pathname: '/category/[id]', params: { id: item.id, name: item.name } } as any)}
                activeOpacity={0.85}
              >
                <Ionicons name={icon} size={viewMode === 'grid' ? 32 : 24} color={color} style={{ marginBottom: viewMode === 'grid' ? 8 : 0, marginRight: viewMode === 'list' ? 16 : 0 }} />
                <Text style={styles.itemText}>{item.name}</Text>
                {viewMode === 'list' && <View style={{ flex: 1 }} />}
                {viewMode === 'list' && <Ionicons name="chevron-forward" size={20} color={color} />}
              </TouchableOpacity>
            )
          }}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  gridItem: {
    flex: 1,
    height: 100,
    margin: 6,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listItem: {
    padding: 20,
    backgroundColor: Colors.surface,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemText: { fontSize: 16, fontWeight: '500', color: Colors.text },
});
