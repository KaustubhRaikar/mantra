import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { api } from '../../src/services/api';
import { storage } from '../../src/services/storage';
import { Mantra } from '../../src/types/navigation';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [mantras, setMantras] = useState<Mantra[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchMantras();
    loadRecent();
  }, []);

  const loadRecent = async () => {
    const r = await storage.getRecentSearches();
    setRecentSearches(r);
  };

  const fetchMantras = async () => {
    setLoading(true);
    const data = await api.getMantras();
    setMantras(data);
    setLoading(false);
  };

  const results = query.trim() === '' ? [] : mantras.filter((m) => {
    const term = query.toLowerCase();
    return (
      m.title?.toLowerCase().includes(term) ||
      m.name?.toLowerCase().includes(term) ||
      m.sanskrit_title?.includes(term) ||
      m.sanskrit?.includes(term) ||
      m.category_name?.toLowerCase().includes(term)
    );
  });

  const handleRecentPress = (term: string) => {
    setQuery(term);
  };

  const handleSearchSubmit = async () => {
    if (query.trim()) {
      await storage.addRecentSearch(query.trim());
      loadRecent();
    }
  };

  const renderItem = ({ item }: { item: Mantra }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/mantra/${item.id}` as any)}
      activeOpacity={0.8}
    >
      <Text style={styles.cardSanskrit}>{item.sanskrit_title || item.sanskrit}</Text>
      <Text style={styles.cardName}>{item.title || item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Search mantras, gods, or benefits..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.length === 0 ? (
        <>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <View style={styles.chipsContainer}>
            {recentSearches.map((item, index) => (
              <TouchableOpacity key={index} style={styles.chip} onPress={() => handleRecentPress(item)}>
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.emptyResults}>
            <Ionicons name="search-outline" size={60} color={Colors.border} />
            <Text style={styles.emptyText}>Find your inner peace</Text>
          </View>
        </>
      ) : loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      ) : (
        <View style={styles.emptyResults}>
          <Ionicons name="moon-outline" size={60} color={Colors.border} />
          <Text style={styles.emptyText}>No mantras found matching "{query}"</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { marginRight: 12 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: Colors.text },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { color: Colors.textSecondary },
  emptyResults: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  emptyText: { marginTop: 12, fontSize: 16, color: Colors.textSecondary },
  card: { backgroundColor: Colors.surface, padding: 16, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, borderLeftWidth: 4, borderLeftColor: Colors.primary },
  cardSanskrit: { fontSize: 18, color: Colors.text, marginBottom: 4 },
  cardName: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
});
