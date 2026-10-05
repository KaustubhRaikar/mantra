import assert from 'assert';
import crypto from 'crypto';

/**
 * Pure function: HMAC-SHA256 hash generator
 */
export function computeOtpHmac(otp: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(otp).digest('hex');
}

/**
 * Pure function: Constant-time string comparison (mirrors PHP hash_equals)
 */
export function timingSafeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Pure function: Proxy-safe IP resolution simulation
 */
export function resolveClientIp(remoteAddr: string, xForwardedFor?: string, trustedProxies: string[] = ['127.0.0.1']): string {
  const isTrusted = trustedProxies.includes(remoteAddr);
  if (isTrusted && xForwardedFor) {
    const ips = xForwardedFor.split(',').map(s => s.trim());
    if (ips[0]) return ips[0];
  }
  return remoteAddr;
}

/**
 * Pure function: Multi-device Jaap log SUM aggregation per date
 */
export interface DeviceJaapRow {
  userId: number;
  date: string;
  deviceId: string;
  totalChants: number;
  completedMalas: number;
}

export function aggregateJaapByDate(rows: DeviceJaapRow[]): Array<{ date: string; totalChants: number; completedMalas: number }> {
  const map = new Map<string, { totalChants: number; completedMalas: number }>();

  for (const row of rows) {
    const existing = map.get(row.date) || { totalChants: 0, completedMalas: 0 };
    map.set(row.date, {
      totalChants: existing.totalChants + row.totalChants,
      completedMalas: existing.completedMalas + row.completedMalas,
    });
  }

  return Array.from(map.entries()).map(([date, counts]) => ({
    date,
    totalChants: counts.totalChants,
    completedMalas: counts.completedMalas,
  }));
}

/**
 * Pure function: Cross-user token authorization check
 */
export function authorizeUserAction(sessionStore: Map<string, number>, token: string, claimedUserId: number): { allowed: boolean; derivedUserId: number | null } {
  const derivedUserId = sessionStore.get(token) || null;
  if (!derivedUserId) return { allowed: false, derivedUserId: null };
  // Ignore claimedUserId; strictly enforce derivedUserId
  return { allowed: true, derivedUserId };
}

export async function testSecurityAuthz() {
  console.log('[Test] Running Security, Authorization & Multi-Device Aggregation Unit Test...');

  // Test 1: HMAC-SHA256 and constant-time string comparison
  const secret = 'sacred_mantra_secret_key_2026';
  const otp = '123456';
  const hash1 = computeOtpHmac(otp, secret);
  const hash2 = computeOtpHmac('123456', secret);
  const hash3 = computeOtpHmac('654321', secret);

  assert.strictEqual(timingSafeEquals(hash1, hash2), true, 'Identical OTPs must match under timingSafeEquals');
  assert.strictEqual(timingSafeEquals(hash1, hash3), false, 'Different OTPs must not match under timingSafeEquals');

  // Test 2: Proxy-safe IP resolution (Spoofing prevention)
  const untrustedIp = '203.0.113.195'; // External client IP trying to spoof X-Forwarded-For
  const spoofedHeader = '1.1.1.1, 2.2.2.2';
  const resolvedIp = resolveClientIp(untrustedIp, spoofedHeader, ['127.0.0.1']);
  assert.strictEqual(resolvedIp, '203.0.113.195', 'Spoofed X-Forwarded-For must be ignored when REMOTE_ADDR is untrusted');

  const trustedProxyIp = '127.0.0.1';
  const validHeader = '198.51.100.42, 127.0.0.1';
  const trustedResolved = resolveClientIp(trustedProxyIp, validHeader, ['127.0.0.1']);
  assert.strictEqual(trustedResolved, '198.51.100.42', 'X-Forwarded-For must be accepted when coming from trusted proxy');

  // Test 3: Multi-device Jaap log SUM aggregation
  const multiDeviceRows: DeviceJaapRow[] = [
    { userId: 1, date: '2026-10-05', deviceId: 'phone_a', totalChants: 108, completedMalas: 1 },
    { userId: 1, date: '2026-10-05', deviceId: 'tablet_b', totalChants: 216, completedMalas: 2 },
    { userId: 1, date: '2026-10-04', deviceId: 'phone_a', totalChants: 108, completedMalas: 1 },
  ];

  const aggregated = aggregateJaapByDate(multiDeviceRows);
  const oct5 = aggregated.find(r => r.date === '2026-10-05');
  assert.strictEqual(oct5?.totalChants, 324, 'Multi-device totalChants on 2026-10-05 should SUM to 324');
  assert.strictEqual(oct5?.completedMalas, 3, 'Multi-device completedMalas on 2026-10-05 should SUM to 3');

  // Test 4: Cross-user authorization rejection
  const sessionStore = new Map<string, number>();
  sessionStore.set('valid_token_user_10', 10);

  // User 99 attempts to pass token belonging to User 10, or User 10 attempts to modify User 99's data
  const authRes = authorizeUserAction(sessionStore, 'valid_token_user_10', 99);
  assert.strictEqual(authRes.allowed, true, 'Action allowed for token owner');
  assert.strictEqual(authRes.derivedUserId, 10, 'Derived user_id MUST be 10 (token owner), ignoring claimed body user_id 99');

  console.log('✓ Security, Authorization & Multi-Device Aggregation Test Passed!');
}

testSecurityAuthz().catch((err) => {
  console.error('✗ Test Failed:', err);
  process.exit(1);
});
