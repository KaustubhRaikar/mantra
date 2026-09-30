import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, Modal, Alert, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { storage } from '../../src/services/storage';

interface JaapLogItem {
  date: string;
  formattedDate: string;
  totalChants: number;
  completedMalas: number;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Settings State
  const [dailyReminder, setDailyReminder] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [preferredLang, setPreferredLang] = useState<'Hindi' | 'English' | 'Sanskrit'>('Hindi');

  // Modals State
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [jaapLogModalVisible, setJaapLogModalVisible] = useState(false);
  const [jaapLogs, setJaapLogs] = useState<JaapLogItem[]>([]);

  const loadJaapLogs = async () => {
    const logs = await storage.getJaapLogs();
    setJaapLogs(logs);
  };

  useEffect(() => {
    loadJaapLogs();
  }, []);

  const handleOpenJaapLogs = async () => {
    await loadJaapLogs();
    setJaapLogModalVisible(true);
  };

  const handleClearJaapLogs = () => {
    Alert.alert(
      'Clear Jaap Logs',
      'Are you sure you want to clear your daily Jaap history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await storage.clearJaapLogs();
            setJaapLogs([]);
          },
        },
      ]
    );
  };

  const totalLifetimeChants = jaapLogs.reduce((sum, item) => sum + (item.totalChants || 0), 0);
  const totalLifetimeMalas = jaapLogs.reduce((sum, item) => sum + (item.completedMalas || 0), 0);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CosmicBackground />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* ── User Header ── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={42} color={Colors.primary} />
          </View>
          <Text style={styles.name}>{user ? (user.full_name || 'Sacred Devotee') : 'Guest Devotee'}</Text>
          <Text style={styles.email}>{user ? user.email : 'Explore mantras & sync your favorites'}</Text>
          
          {!user && (
            <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/login')}>
              <Ionicons name="log-in-outline" size={18} color="#FFF" />
              <Text style={styles.signInBtnText}>Sign In / Sign Up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Devotion & Jaap Logs Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Jaap & Devotion Tracking</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleOpenJaapLogs} activeOpacity={0.7}>
            <View style={styles.menuIconBadge}>
              <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.menuLabelBold}>Jaap Log & Daily History</Text>
              <Text style={styles.menuSubLabel}>View total counts and completed malas date-wise</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── App Preferences Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences & Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="alarm-outline" size={22} color={Colors.primary} />
              <Text style={styles.settingLabel}>Daily Mantra Reminder</Text>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={setDailyReminder}
              trackColor={{ false: '#E0E0E0', true: Colors.primary + '80' }}
              thumbColor={dailyReminder ? Colors.primary : '#F4F4F4'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-medium-outline" size={22} color={Colors.secondary} />
              <Text style={styles.settingLabel}>Auto-play Audio on Open</Text>
            </View>
            <Switch
              value={autoPlayAudio}
              onValueChange={setAutoPlayAudio}
              trackColor={{ false: '#E0E0E0', true: Colors.secondary + '80' }}
              thumbColor={autoPlayAudio ? Colors.secondary : '#F4F4F4'}
            />
          </View>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              const langs: ('Hindi' | 'English' | 'Sanskrit')[] = ['Hindi', 'English', 'Sanskrit'];
              const nextIdx = (langs.indexOf(preferredLang) + 1) % langs.length;
              setPreferredLang(langs[nextIdx]);
            }}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="language-outline" size={22} color="#0095D9" />
              <Text style={styles.settingLabel}>Preferred Translation</Text>
            </View>
            <View style={styles.valueBadge}>
              <Text style={styles.valueBadgeText}>{preferredLang}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Content Sub-Menus Directory ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Content Sub-Menus</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/categories')}>
            <Ionicons name="apps-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuLabel}>All Categories</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/chalisa/' as any)}>
            <Ionicons name="book-outline" size={22} color={Colors.secondary} />
            <Text style={styles.menuLabel}>Chalisa Collection</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/pooja_vidhi/' as any)}>
            <Ionicons name="flame-outline" size={22} color="#FFD700" />
            <Text style={styles.menuLabel}>Pooja Vidhi Procedures</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/stotra/' as any)}>
            <Ionicons name="sparkles-outline" size={22} color="#2ECC71" />
            <Text style={styles.menuLabel}>Sacred Stotras</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/vrat_katha/' as any)}>
            <Ionicons name="moon-outline" size={22} color="#9B59B6" />
            <Text style={styles.menuLabel}>Vrat Katha Stories</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/upanishad' as any)}>
            <Ionicons name="library-outline" size={22} color="#E67E22" />
            <Text style={styles.menuLabel}>Upanishads Library</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── System & Information Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Support & System</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => setSupportModalVisible(true)}>
            <Ionicons name="help-circle-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuLabel}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setAboutModalVisible(true)}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#2ECC71" />
            <Text style={styles.menuLabel}>Security & About App</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Sign Out Button ── */}
        {user && (
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
              <Text style={styles.signOutBtnText}>Sign Out Account</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* ── Jaap Log & History Modal ── */}
      <Modal visible={jaapLogModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="calendar" size={36} color={Colors.primary} />
              <Text style={styles.modalTitle}>Jaap Log & Daily History</Text>
              <Text style={styles.modalSubTitle}>Date-wise record of your sacred chants</Text>
            </View>

            {/* Total Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Ionicons name="hand-right-outline" size={20} color={Colors.primary} />
                <Text style={styles.summaryNumber}>{totalLifetimeChants}</Text>
                <Text style={styles.summaryLabel}>Total Chants</Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons name="ribbon-outline" size={20} color={Colors.secondary} />
                <Text style={styles.summaryNumber}>{totalLifetimeMalas}</Text>
                <Text style={styles.summaryLabel}>Malas Completed</Text>
              </View>
            </View>

            {/* Date-wise Log List */}
            {jaapLogs.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="hourglass-outline" size={44} color={Colors.textSecondary + '60'} />
                <Text style={styles.emptyStateTitle}>No Jaap Recorded Yet</Text>
                <Text style={styles.emptyStateText}>
                  Start chanting on the home screen counter. Every tap and completed mala will be recorded here date-wise automatically!
                </Text>
              </View>
            ) : (
              <ScrollView style={{ marginTop: 8 }} showsVerticalScrollIndicator={false}>
                {jaapLogs.map((item, index) => (
                  <View key={item.date || index.toString()} style={styles.logCard}>
                    <View style={styles.logCardLeft}>
                      <View style={styles.dateIconBadge}>
                        <Ionicons name="today-outline" size={18} color={Colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.logDateText}>{item.formattedDate || item.date}</Text>
                        <Text style={styles.logSubText}>{item.date}</Text>
                      </View>
                    </View>
                    <View style={styles.logCardRight}>
                      <View style={styles.chantPill}>
                        <Ionicons name="flame" size={12} color={Colors.primary} />
                        <Text style={styles.chantPillText}>{item.totalChants} chants</Text>
                      </View>
                      <View style={styles.malaPill}>
                        <Ionicons name="ribbon" size={12} color={Colors.secondary} />
                        <Text style={styles.malaPillText}>{item.completedMalas} mala{item.completedMalas !== 1 ? 's' : ''}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActionRow}>
              {jaapLogs.length > 0 && (
                <TouchableOpacity style={styles.clearLogsBtn} onPress={handleClearJaapLogs}>
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                  <Text style={styles.clearLogsText}>Clear Log</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.closeBtn, { flex: 1 }]} onPress={() => setJaapLogModalVisible(false)}>
                <Text style={styles.closeBtnText}>Done</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* ── About & Security Modal ── */}
      <Modal visible={aboutModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
              <Text style={styles.modalTitle}>About Mantra App</Text>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.modalBody}>
                <Text style={{ fontWeight: '700' }}>Version:</Text> 1.0.0 (Expo SDK 57){'\n\n'}
                <Text style={{ fontWeight: '700' }}>Cloud Backend:</Text>{'\n'}
                https://mantra.aarambhtech.in{'\n\n'}
                <Text style={{ fontWeight: '700' }}>Security Audit Status:</Text>{'\n'}
                ✓ SSL/TLS Encrypted API{'\n'}
                ✓ SQL Injection Filtered Queries{'\n'}
                ✓ IP Rate Limiting Active{'\n'}
                ✓ HSTS & Secure Headers Enforced{'\n'}
                ✓ Cryptographic UUID Session Tokens
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setAboutModalVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Help & Support Modal ── */}
      <Modal visible={supportModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="help-buoy" size={32} color={Colors.secondary} />
              <Text style={styles.modalTitle}>Help & Support</Text>
            </View>
            <Text style={styles.modalBody}>
              Need assistance or want to report an issue?{'\n\n'}
              <Text style={{ fontWeight: '700' }}>Contact Us:</Text>{'\n'}
              support@aarambhtech.in{'\n\n'}
              <Text style={{ fontWeight: '700' }}>Website:</Text>{'\n'}
              https://mantra.aarambhtech.in
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSupportModalVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileHeader: {
    padding: 28,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  name: { fontSize: 22, fontWeight: '800', color: Colors.text },
  email: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 16,
    elevation: 3,
  },
  signInBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabelBold: { fontSize: 15, fontWeight: '700', color: Colors.text },
  menuSubLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.surface,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  valueBadge: { backgroundColor: Colors.primary + '18', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  valueBadgeText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  menuLabel: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: Colors.text },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFEBEB',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD6D6',
  },
  signOutBtnText: { color: '#FF3B30', fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
  },
  modalHeader: { alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 6 },
  modalSubTitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  modalBody: { fontSize: 14, color: Colors.text, lineHeight: 22, marginBottom: 20 },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryNumber: { fontSize: 22, fontWeight: '800', color: Colors.text, marginVertical: 4 },
  summaryLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 12 },
  emptyStateText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  logCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logDateText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  logSubText: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  logCardRight: { alignItems: 'flex-end', gap: 4 },
  chantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  chantPillText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  malaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary + '18',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  malaPillText: { fontSize: 12, fontWeight: '700', color: Colors.secondary },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  clearLogsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFEBEB',
    borderWidth: 1,
    borderColor: '#FFD6D6',
  },
  clearLogsText: { color: '#FF3B30', fontWeight: '700', fontSize: 13 },
  closeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});

