import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassCard } from '../../src/components/GlassCard';
import { SpiritualButton } from '../../src/components/SpiritualButton';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
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
  const { themeMode, setThemeMode, isDark, toggleTheme, colors } = useTheme();
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
      'Are you sure you want to sign out from your spiritual account?',
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Devotee Header ── */}
        <GlassCard style={styles.profileHeader} glow>
          <View style={[styles.avatar, { backgroundColor: isDark ? 'rgba(255, 153, 51, 0.15)' : 'rgba(230, 126, 34, 0.12)', borderColor: isDark ? 'rgba(255, 153, 51, 0.3)' : 'rgba(230, 126, 34, 0.35)' }]}>
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.name, { color: colors.text }]} maxFontSizeMultiplier={1.3}>
            {user ? user.full_name || 'Sacred Devotee' : 'Guest Devotee'}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
            {user ? user.email : 'Explore scriptures & sync your spiritual sadhana'}
          </Text>

          {!user ? (
            <View style={{ marginTop: Spacing.standard, width: '100%' }}>
              <SpiritualButton
                title="Sign In / Register"
                onPress={() => router.push('/login')}
                variant="primary"
                icon={<Ionicons name="log-in-outline" size={18} color="#0C0A1A" />}
              />
            </View>
          ) : null}
        </GlassCard>

        {/* ── Devotion & Jaap Logs Section ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Sadhana & Devotion Tracking</Text>
          <GlassCard onPress={handleOpenJaapLogs} style={styles.menuCard}>
            <View style={styles.menuIconBadge}>
              <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.menuLabelBold, { color: colors.text }]}>Jaap Log & Daily History</Text>
              <Text style={[styles.menuSubLabel, { color: colors.textSecondary }]}>View total chants and completed malas date-wise</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </GlassCard>
        </View>

        {/* ── App Preferences Section ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Preferences & Settings</Text>

          <GlassCard style={styles.settingsCard}>
            {/* Sanctuary Appearance / Theme Mode */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={22} color={colors.primary} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Sanctuary Theme</Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>
                    {isDark ? 'Cosmic Dark (Night Devotion)' : 'Sacred Dawn (Suryodaya)'}
                  </Text>
                </View>
              </View>
              <View style={[styles.themePillsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.themePill, isDark && { backgroundColor: colors.primary }]}
                  onPress={() => setThemeMode('dark')}
                  accessibilityRole="button"
                  accessibilityLabel="Cosmic Dark theme"
                >
                  <Ionicons name="moon" size={13} color={isDark ? '#0C0A1A' : colors.textMuted} style={{ marginRight: 3 }} />
                  <Text style={[styles.themePillText, { color: isDark ? '#0C0A1A' : colors.textMuted }]}>Dark</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.themePill, !isDark && { backgroundColor: colors.primary }]}
                  onPress={() => setThemeMode('light')}
                  accessibilityRole="button"
                  accessibilityLabel="Sacred Dawn theme"
                >
                  <Ionicons name="sunny" size={13} color={!isDark ? '#0C0A1A' : colors.textMuted} style={{ marginRight: 3 }} />
                  <Text style={[styles.themePillText, { color: !isDark ? '#0C0A1A' : colors.textMuted }]}>Light</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Daily Reminder */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="alarm-outline" size={22} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Daily Brahma Muhurta Reminder</Text>
              </View>
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.primary + '80' }}
                thumbColor={dailyReminder ? Colors.primary : '#888'}
              />
            </View>

            <View style={styles.divider} />

            {/* Autoplay Audio */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="volume-medium-outline" size={22} color={colors.secondary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Auto-play Sacred Audio</Text>
              </View>
              <Switch
                value={autoPlayAudio}
                onValueChange={setAutoPlayAudio}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.primary + '80' }}
                thumbColor={autoPlayAudio ? colors.primary : '#888'}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Language Selection */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                const langs: ('Hindi' | 'English' | 'Sanskrit')[] = ['Hindi', 'English', 'Sanskrit'];
                const nextIdx = (langs.indexOf(preferredLang) + 1) % langs.length;
                setPreferredLang(langs[nextIdx]);
              }}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="language-outline" size={22} color={colors.accent} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Preferred Language</Text>
              </View>
              <View style={styles.valueBadge}>
                <Text style={[styles.valueBadgeText, { color: isDark ? colors.secondary : colors.primary }]}>{preferredLang}</Text>
              </View>
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* ── Privacy, DPDP & Legal ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Privacy & Legal Governance</Text>
          <GlassCard style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/consent')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="shield-checkmark-outline" size={22} color={colors.success} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Data Privacy & Consent (DPDP)</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/privacy')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="document-text-outline" size={22} color={colors.secondary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Policy & Data Safety</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setAboutModalVisible(true)}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>About Mantra App & Sacred Covenant</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* ── Sign Out ── */}
        {user ? (
          <View style={{ marginHorizontal: Spacing.standard, marginTop: Spacing.large }}>
            <SpiritualButton
              title="Sign Out"
              onPress={handleSignOut}
              variant="destructive"
            />
          </View>
        ) : null}
      </ScrollView>

      {/* ── Jaap History Modal ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={jaapLogModalVisible}
        onRequestClose={() => setJaapLogModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="calendar" size={22} color={Colors.primary} />
                <Text style={styles.modalTitle}>Sadhana History</Text>
              </View>
              <TouchableOpacity
                onPress={() => setJaapLogModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Lifetime Summary */}
            <View style={styles.lifetimeBox}>
              <View style={styles.lifetimeCol}>
                <Text style={styles.lifetimeNum}>{totalLifetimeChants}</Text>
                <Text style={styles.lifetimeLabel}>Total Chants</Text>
              </View>
              <View style={styles.lifetimeDivider} />
              <View style={styles.lifetimeCol}>
                <Text style={styles.lifetimeNum}>{totalLifetimeMalas}</Text>
                <Text style={styles.lifetimeLabel}>Completed Malas</Text>
              </View>
            </View>

            {/* Log list */}
            {jaapLogs.length === 0 ? (
              <View style={styles.emptyLogBox}>
                <Ionicons name="leaf-outline" size={36} color={Colors.primary} />
                <Text style={styles.emptyLogTitle}>No Sadhana Logged Yet</Text>
                <Text style={styles.emptyLogSub}>Tap the Japa Mala Orb on the Home tab to begin your daily practice.</Text>
              </View>
            ) : (
              <FlatList
                data={jaapLogs}
                keyExtractor={(item, index) => item.date || String(index)}
                style={{ maxHeight: 280 }}
                renderItem={({ item }) => (
                  <View style={styles.logRow}>
                    <View>
                      <Text style={styles.logDate}>{item.formattedDate || item.date}</Text>
                      <Text style={styles.logSub}>{item.totalChants} chants</Text>
                    </View>
                    <View style={styles.malaPill}>
                      <Text style={styles.malaPillText}>{item.completedMalas} Malas</Text>
                    </View>
                  </View>
                )}
              />
            )}

            <View style={styles.modalBtnRow}>
              {jaapLogs.length > 0 ? (
                <TouchableOpacity onPress={handleClearJaapLogs} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>Clear History</Text>
                </TouchableOpacity>
              ) : null}
              <View style={{ flex: 1 }}>
                <SpiritualButton
                  title="Close"
                  onPress={() => setJaapLogModalVisible(false)}
                  variant="primary"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── About Modal ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={aboutModalVisible}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About Mantra</Text>
              <TouchableOpacity onPress={() => setAboutModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.aboutText}>
              Mantra is a sacred, non-commercial devotional platform dedicated to Sanatana Dharma.
              {'\n\n'}
              🕊️ <Text style={{ fontWeight: '700', color: '#FFF' }}>Sacred Non-Commercial Covenant:</Text>
              {'\n'}
              100% free spiritual sanctuary with zero advertisements, zero paywalls, and hardware-secured data protection under the DPDP Act 2023.
              {'\n\n'}
              Version 1.0.0 (Release Build)
            </Text>
            <SpiritualButton
              title="Close"
              onPress={() => setAboutModalVisible(false)}
              variant="primary"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    margin: Spacing.standard,
    padding: Spacing.large,
    alignItems: 'center',
    borderRadius: Radius.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 153, 51, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.compact,
  },
  name: {
    fontFamily: Typography.families.heading,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  email: {
    fontFamily: Typography.families.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: Spacing.standard,
    marginTop: Spacing.large,
  },
  sectionHeader: {
    fontFamily: Typography.families.heading,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.compact,
    marginLeft: 4,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.standard,
  },
  menuIconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 153, 51, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabelBold: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  menuSubLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.standard,
    paddingVertical: 14,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontFamily: Typography.families.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.standard,
  },
  valueBadge: {
    backgroundColor: 'rgba(255, 153, 51, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  valueBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  themePillsContainer: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    padding: 3,
    borderWidth: 1,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  themePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.standard,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#161329',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderGlow,
    padding: Spacing.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.standard,
  },
  modalTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  lifetimeBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: Radius.md,
    padding: Spacing.standard,
    marginBottom: Spacing.standard,
  },
  lifetimeCol: {
    flex: 1,
    alignItems: 'center',
  },
  lifetimeDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  lifetimeNum: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.secondary,
  },
  lifetimeLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyLogBox: {
    padding: Spacing.large,
    alignItems: 'center',
  },
  emptyLogTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  emptyLogSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logDate: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  logSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  malaPill: {
    backgroundColor: 'rgba(255, 153, 51, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  malaPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: Spacing.standard,
  },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  clearBtnText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '700',
  },
  aboutText: {
    fontFamily: Typography.families.body,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: Spacing.large,
  },
});
