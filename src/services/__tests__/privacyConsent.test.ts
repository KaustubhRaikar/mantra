import assert from 'assert';

export interface UserConsentState {
  analytics: boolean;
  notifications: boolean;
  ai: boolean;
  policyVersion: string;
  updatedAt: string;
}

export function buildConsentPayload(consent: Partial<UserConsentState>, version = '1.0'): UserConsentState {
  return {
    analytics: !!consent.analytics,
    notifications: !!consent.notifications,
    ai: !!consent.ai,
    policyVersion: version,
    updatedAt: new Date().toISOString(),
  };
}

export function verifyAccountDeletionSQL(userId: number, tableList: string[]): string[] {
  const queries: string[] = [];
  for (const table of tableList) {
    if (table === 'user_otps') {
      queries.push(`DELETE FROM user_otps WHERE email = (SELECT email FROM users WHERE id = ${userId})`);
    } else if (table === 'users') {
      queries.push(`DELETE FROM users WHERE id = ${userId}`);
    } else {
      queries.push(`DELETE FROM ${table} WHERE user_id = ${userId}`);
    }
  }
  return queries;
}

export async function testPrivacyConsent() {
  console.log('[Test] Running Privacy, Consent & Account Deletion Unit Test...');

  // Test 1: Consent payload generation with timestamp and version
  const consent = buildConsentPayload({ analytics: true, ai: false, notifications: true }, '1.0');
  assert.strictEqual(consent.analytics, true, 'Analytics consent should be true');
  assert.strictEqual(consent.ai, false, 'AI consent should be false');
  assert.strictEqual(consent.notifications, true, 'Notifications consent should be true');
  assert.strictEqual(consent.policyVersion, '1.0', 'Policy version should be 1.0');
  assert.ok(consent.updatedAt, 'Consent should contain an ISO timestamp');

  // Test 2: Account deletion table coverage validation
  const tables = ['user_jaap_logs', 'user_favorites', 'user_consents', 'user_device_info', 'user_otps', 'users'];
  const deletionQueries = verifyAccountDeletionSQL(42, tables);

  assert.strictEqual(deletionQueries.length, 6, 'Should generate 6 deletion queries covering all user data tables');
  assert.ok(deletionQueries[0].includes('DELETE FROM user_jaap_logs WHERE user_id = 42'), 'Should delete user_jaap_logs');
  assert.ok(deletionQueries[1].includes('DELETE FROM user_favorites WHERE user_id = 42'), 'Should delete user_favorites');
  assert.ok(deletionQueries[2].includes('DELETE FROM user_consents WHERE user_id = 42'), 'Should delete user_consents');
  assert.ok(deletionQueries[3].includes('DELETE FROM user_device_info WHERE user_id = 42'), 'Should delete user_device_info');
  assert.ok(deletionQueries[4].includes('DELETE FROM user_otps WHERE email ='), 'Should delete user_otps by email lookup');
  assert.ok(deletionQueries[5].includes('DELETE FROM users WHERE id = 42'), 'Should delete user record');

  console.log('✓ Privacy, Consent & Deletion Unit Test Passed Successfully!');
}

testPrivacyConsent().catch((err) => {
  console.error('✗ Privacy Consent Test Failed:', err);
  process.exit(1);
});
