import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { CosmicBackground } from '../../src/components/CosmicBackground';

export default function ProfileScreen() {
  const menuItems = [
    { icon: 'settings-outline', label: 'Settings' },
    { icon: 'time-outline', label: 'Search History' },
    { icon: 'help-circle-outline', label: 'Help & Support' },
    { icon: 'information-circle-outline', label: 'About App' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CosmicBackground />
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.name}>Guest User</Text>
        <Text style={styles.email}>Sign in to sync your favorites</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <Ionicons name={item.icon as any} size={22} color={Colors.text} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.border} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileHeader: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  name: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  email: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  menuContainer: { marginTop: 20, paddingHorizontal: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    marginBottom: 8,
    borderRadius: 12,
  },
  menuLabel: { flex: 1, marginLeft: 12, fontSize: 16, color: Colors.text },
});
