import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/theme';
import { CosmicBackground } from '../src/components/CosmicBackground';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.safe}>
      <CosmicBackground />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy & Data Rights</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.lastUpdated}>Version 1.0 — Effective October 2026</Text>

        <Text style={styles.sectionHeader}>1. Principles of Sacred Data Privacy</Text>
        <Text style={styles.paragraph}>
          The Mantra app is built with deep reverence for user privacy. In accordance with the Digital Personal Data Protection (DPDP) Act, your personal sadhana records, Jaap counters, intentions (Sankalp), and devotional preferences are treated as private personal data.
        </Text>

        <Text style={styles.sectionHeader}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          • Account & Device Credentials: Email address, full name, encrypted device fingerprint, and login session tokens.
          {'\n'}• Devotional Records: Daily Jaap chant counts, mala goals, and favorite bookmarked items.
          {'\n'}• Optional Preferences: Granular consent choices for analytics, local notifications, and AI spiritual guidance features.
        </Text>

        <Text style={styles.sectionHeader}>3. Data Rights & In-App Controls</Text>
        <Text style={styles.paragraph}>
          You retain 100% ownership and control over your personal data. At any time within the Profile settings, you may:
          {'\n'}• Export My Data: Download a complete JSON archive of all profile and sadhana records.
          {'\n'}• Delete Account & Data: Permanently purge your account and all associated database records across our servers.
        </Text>

        <Text style={styles.sectionHeader}>4. Contact Data Protection Officer</Text>
        <Text style={styles.paragraph}>
          For privacy inquiries or DPDP compliance assistance, contact our Data Protection Officer at privacy@aarambhtech.in.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  paragraph: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
});
