import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../src/constants/theme';
import { CosmicBackground } from '../src/components/CosmicBackground';
import { GlassHeader } from '../src/components/GlassHeader';
import { GlassCard } from '../src/components/GlassCard';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.safe}>
      <CosmicBackground />
      <GlassHeader
        title="Privacy Policy"
        subtitle="DPDP Act & Sacred Data Rights"
        showBack
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.secondary} />
            <Text style={styles.badgeText}>DPDP Compliant (India)</Text>
          </View>
          <Text style={styles.lastUpdated}>v1.0 • Oct 2026</Text>
        </View>

        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="heart" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>1. Sacred Data Principles</Text>
          </View>
          <Text style={styles.paragraph}>
            The Mantra app is built with deep reverence for user privacy. In accordance with the Digital Personal Data Protection (DPDP) Act, your personal sadhana records, Jaap counters, intentions (Sankalp), and devotional preferences are treated as private, sacred data.
          </Text>
        </GlassCard>

        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="finger-print" size={18} color={Colors.accent} />
            </View>
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primary} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bulletBold}>Account Credentials: </Text>
              Email, full name, encrypted device fingerprint, and session tokens.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primary} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bulletBold}>Devotional Records: </Text>
              Daily Jaap chant counts, mala goals, and bookmarked scriptures.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primary} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bulletBold}>Granular Consent: </Text>
              User-controlled toggles for analytics, notifications, and AI guidance.
            </Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="key" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>3. Your Data Rights & In-App Controls</Text>
          </View>
          <Text style={styles.paragraph}>
            You retain 100% sovereignty over your personal data. At any time in Profile settings, you may exercise:
          </Text>
          <View style={styles.bulletItem}>
            <Ionicons name="download-outline" size={16} color={Colors.secondary} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bulletBold}>Export My Data: </Text>
              Instant JSON archive download of all your sadhana and profile records.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="trash-outline" size={16} color={Colors.error} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>
              <Text style={styles.bulletBold}>Delete Account & Data: </Text>
              Permanent erasure of your account, consent logs, and database records.
            </Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>4. Data Protection Officer</Text>
          </View>
          <Text style={styles.paragraph}>
            For DPDP queries, rights requests, or regulatory assistance, reach out directly to our designated Data Protection Officer:
          </Text>
          <Text style={styles.contactEmail}>privacy@aarambhtech.in</Text>
        </GlassCard>
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
    paddingBottom: Spacing.major * 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.standard,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 176, 65, 0.12)',
    paddingHorizontal: Spacing.compact,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 176, 65, 0.25)',
  },
  badgeText: {
    fontSize: Typography.sizes.caption,
    color: Colors.secondary,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: Typography.sizes.caption,
    color: Colors.textMuted,
  },
  sectionCard: {
    marginBottom: Spacing.standard,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.compact,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.compact,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Typography.sizes.heading3,
    fontWeight: '700',
    color: Colors.text,
  },
  paragraph: {
    fontSize: Typography.sizes.body,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeights.body,
    marginBottom: Spacing.compact,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.micro,
  },
  bulletIcon: {
    marginRight: Spacing.micro,
    marginTop: 3,
  },
  bulletText: {
    flex: 1,
    fontSize: Typography.sizes.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bulletBold: {
    fontWeight: '600',
    color: Colors.text,
  },
  contactEmail: {
    fontSize: Typography.sizes.body,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
  },
});


