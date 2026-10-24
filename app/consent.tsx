import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../src/constants/theme';
import { CosmicBackground } from '../src/components/CosmicBackground';
import { GlassHeader } from '../src/components/GlassHeader';
import { GlassCard } from '../src/components/GlassCard';
import { SpiritualButton } from '../src/components/SpiritualButton';
import { consentManager } from '../src/services/consentManager';

import { useTheme } from '../src/contexts/ThemeContext';

export default function ConsentScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [analytics, setAnalytics] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [ai, setAi] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    consentManager.getConsent().then((existing) => {
      if (existing) {
        setAnalytics(existing.analytics);
        setNotifications(existing.notifications);
        setAi(existing.ai);
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await consentManager.saveConsent({
      analytics,
      notifications,
      ai,
      policy_version: '1.0',
    });
    setSaving(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.safe}>
      <CosmicBackground />
      <GlassHeader title="Privacy & Data Consent" subtitle="DPDP Act 2023 Compliance" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={38} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]} maxFontSizeMultiplier={1.3}>
          Your Spiritual Privacy
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
          In accordance with the Digital Personal Data Protection Act 2023, you retain sovereign control over your data.
        </Text>

        {/* Devotional Notifications */}
        <GlassCard style={styles.toggleCard}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>Devotional Notifications</Text>
            <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
              Daily Brahma Muhurta prayer reminders & Sandhya Sadhana alerts.
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.primary + '80' }}
            thumbColor={notifications ? colors.primary : '#888'}
            accessibilityLabel="Toggle devotional notifications"
          />
        </GlassCard>

        {/* AI Guidance */}
        <GlassCard style={styles.toggleCard}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>Sanskrit Pronunciation AI</Text>
            <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
              Enable AI pronunciation guidance for authentic Vedic recitation.
            </Text>
          </View>
          <Switch
            value={ai}
            onValueChange={setAi}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.secondary + '80' }}
            thumbColor={ai ? colors.secondary : '#888'}
            accessibilityLabel="Toggle Sanskrit pronunciation AI"
          />
        </GlassCard>

        {/* App Reliability */}
        <GlassCard style={styles.toggleCard}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>Telemetry & Reliability</Text>
            <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
              Anonymous error telemetry to ensure zero audio latency and app stability.
            </Text>
          </View>
          <Switch
            value={analytics}
            onValueChange={setAnalytics}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.primary + '80' }}
            thumbColor={analytics ? colors.primary : '#888'}
            accessibilityLabel="Toggle performance telemetry"
          />
        </GlassCard>

        <View style={{ marginTop: Spacing.large }}>
          <SpiritualButton
            title="Save Privacy Preferences"
            onPress={handleSave}
            loading={saving}
            variant="primary"
          />
        </View>

        <View style={{ marginTop: Spacing.standard, alignItems: 'center' }}>
          <SpiritualButton
            title="Read Full Privacy Policy"
            onPress={() => router.push('/privacy')}
            variant="glass"
            fullWidth={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.standard,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: Spacing.standard,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 153, 51, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Typography.families.heading,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: Typography.families.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.large,
    lineHeight: 20,
    maxWidth: 320,
    alignSelf: 'center',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.standard,
    marginBottom: Spacing.compact,
  },
  toggleInfo: {
    flex: 1,
    marginRight: Spacing.standard,
  },
  toggleTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
