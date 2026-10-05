import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/theme';
import { CosmicBackground } from '../src/components/CosmicBackground';
import { consentManager } from '../src/services/consentManager';

export default function ConsentScreen() {
  const router = useRouter();
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy & Data Consent</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Your Privacy Preferences</Text>
        <Text style={styles.subtitle}>
          In compliance with the DPDP Act, you can choose how your data is processed. You can update these settings anytime in your Profile.
        </Text>

        <View style={styles.toggleCard}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Devotional Notifications</Text>
            <Text style={styles.toggleDesc}>Receive daily Brahma Muhurta reminders and Sadhana updates.</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#E0E0E0', true: Colors.primary + '80' }}
            thumbColor={notifications ? Colors.primary : '#F4F4F4'}
            accessibilityLabel="Toggle devotional notifications"
          />
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>AI Spiritual Guidance</Text>
            <Text style={styles.toggleDesc}>Allow AI assistant to provide personalized mantra meanings and pronunciation feedback.</Text>
          </View>
          <Switch
            value={ai}
            onValueChange={setAi}
            trackColor={{ false: '#E0E0E0', true: Colors.primary + '80' }}
            thumbColor={ai ? Colors.primary : '#F4F4F4'}
            accessibilityLabel="Toggle AI spiritual guidance"
          />
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>App Performance & Analytics</Text>
            <Text style={styles.toggleDesc}>Help improve app stability with anonymous crash reporting.</Text>
          </View>
          <Switch
            value={analytics}
            onValueChange={setAnalytics}
            trackColor={{ false: '#E0E0E0', true: Colors.primary + '80' }}
            thumbColor={analytics ? Colors.primary : '#F4F4F4'}
            accessibilityLabel="Toggle performance analytics"
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Save privacy preferences"
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Preferences'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.policyLink}
          onPress={() => router.push('/privacy')}
          accessibilityRole="link"
          accessibilityLabel="Read full Privacy Policy"
        >
          <Text style={styles.policyLinkText}>Read full Privacy Policy</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  iconContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 22,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 44,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  policyLink: {
    alignItems: 'center',
    marginTop: 20,
    minHeight: 44,
    justifyContent: 'center',
  },
  policyLinkText: {
    color: Colors.primary,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
