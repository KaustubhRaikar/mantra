import * as SecureStore from 'expo-secure-store';
import { api } from './api';
import { syncManager } from './syncManager';

export interface UserConsent {
  analytics: boolean;
  notifications: boolean;
  ai: boolean;
  policy_version: string;
  updated_at?: string;
}

const CONSENT_KEY = 'user_consent_prefs';

export const consentManager = {
  getConsent: async (): Promise<UserConsent | null> => {
    try {
      const stored = await SecureStore.getItemAsync(CONSENT_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  },

  saveConsent: async (consent: Partial<UserConsent>): Promise<UserConsent> => {
    const existing = (await consentManager.getConsent()) || {
      analytics: false,
      notifications: false,
      ai: false,
      policy_version: '1.0',
    };

    const updated: UserConsent = {
      ...existing,
      ...consent,
      policy_version: consent.policy_version || existing.policy_version || '1.0',
      updated_at: new Date().toISOString(),
    };

    await SecureStore.setItemAsync(CONSENT_KEY, JSON.stringify(updated));

    // Async sync with backend if authenticated
    try {
      const creds = await syncManager.getAuthCredentials();
      if (creds) {
        await api.saveConsent(creds, updated);
      }
    } catch (e) {
      console.warn('Failed to sync consent with backend:', e);
    }

    return updated;
  },

  hasRespondedToConsent: async (): Promise<boolean> => {
    const consent = await consentManager.getConsent();
    return consent !== null;
  }
};
