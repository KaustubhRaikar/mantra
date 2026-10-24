import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { useFavorites, FavoriteItem } from '../../src/contexts/FavoritesContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { ScriptureCard } from '../../src/components/ScriptureCard';
import { EmptyState } from '../../src/components/EmptyState';

export default function FavoritesScreen() {
  const { favorites, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const router = useRouter();

  const handlePressItem = (item: FavoriteItem) => {
    const basePath = item.path || 'mantra';
    router.push(`/${basePath}/${item.id}` as any);
  };

  const renderItem = ({ item }: { item: FavoriteItem }) => {
    const title =
      item.name ||
      item.title ||
      item.chalisa_name ||
      item.vidhi_name ||
      item.stotra_name ||
      item.katha_name ||
      item.aarti_name ||
      'Sacred Chant';

    const category =
      item.god || item.deity_name || item.category || item.path || 'Devotional';

    return (
      <ScriptureCard
        title={title}
        sanskritTitle={item.sanskrit}
        category={category}
        onPress={() => handlePressItem(item)}
        isFavorite={true}
        onToggleFavorite={() => toggleFavorite(item)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CosmicBackground />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]} maxFontSizeMultiplier={1.3}>
          Your Favorites
        </Text>
        <Text style={[styles.headerSubTitle, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
          Saved sacred chants, aartis & prayers
        </Text>
      </View>

      {favorites.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No favorites saved yet"
          description="Tap the sacred heart icon on any mantra, aarti, or scripture to keep them close at hand."
          actionTitle="Explore Scriptures"
          onAction={() => router.push('/(tabs)/categories')}
        />
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.standard,
  },
  header: {
    marginTop: Spacing.compact,
    marginBottom: Spacing.standard,
  },
  headerTitle: {
    fontFamily: Typography.families.heading,
    fontSize: Typography.sizes.heading1,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubTitle: {
    fontFamily: Typography.families.body,
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 110,
    paddingTop: Spacing.compact,
  },
});
