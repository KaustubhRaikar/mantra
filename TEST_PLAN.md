# 🧪 MANTRA APP — MASTER TEST PLAN & TEST CASE LIBRARY

> **Document Version:** 1.0.0 | **Date:** October 2026  
> **Target App Version:** 2.0.0  
> **Platforms Covered:** Android (Android 9–15), iOS (iOS 15–18), Web API  

---

## 📍 1. Test Strategy & Scope

The testing strategy validates all **Fix Tasks (T1–T8)** and **Feature Epics (E1–E16)** across multiple dimensions:
- **Unit & Logic Verification:** `npx tsx` execution of normalizer, storage migration, sync merge, and DPDP consent logic.
- **Security & Penetration:** Rate-limit exhaustion, SQL injection payload resistance, OTP attempt lockouts, SHA-256 hash validation, and DPDP account data erasure verification.
- **Offline Resilience:** Airplane mode caching, SQLite WAL persistence, and debounced cloud sync reconnect.
- **Accessibility & UX:** VoiceOver/TalkBack screen reader labeling, touch target verification (44x44 minimum), and font scaling.

---

## 📚 2. Comprehensive Test Case Catalog

### 🔒 Category A: Security & API Hardening (Tasks T1 & Epic E1)

| Test Case ID | Title | Preconditions | Steps | Expected Result | Type | Platform | Status |
|---|---|---|---|---|---|---|---|
| **TC-SEC-001** | OTP Rate Limit (Email) | Server active | Trigger `/auth/send_otp.php` 4 times within 10 min for `test@example.com` | 4th request returns HTTP 429 with clear rate limit error | Negative / Security | API | **PASSED** |
| **TC-SEC-002** | OTP Rate Limit (IP) | Server active | Trigger `/auth/send_otp.php` 11 times within 1 hour from same IP | 11th request returns HTTP 429 | Security | API | **PASSED** |
| **TC-SEC-003** | OTP Attempt Cap | OTP generated | Call `/auth/verify_otp.php` with incorrect OTP 5 times | 6th attempt locks verification with HTTP 400 error | Security | API | **PASSED** |
| **TC-SEC-004** | Single-Use OTP Deletion | Valid OTP generated | Verify OTP successfully once; call `/auth/verify_otp.php` again with same OTP | Second verification fails with expired/invalid OTP error | Security | API | **PASSED** |
| **TC-SEC-005** | Hashed OTP Storage | DB access | Inspect `user_otps` table after OTP request | Plaintext OTP is NOT present; SHA-256 hash string stored | Security | DB | **PASSED** |
| **TC-SEC-006** | V1 API Namespace | Server active | Call `GET /api/v1/mantras/read.php` | Returns HTTP 200 with mantras list | Functional | API | **PASSED** |
| **TC-SEC-007** | Legacy URL Rewrite | Server active | Call `GET /api/mantras/read.php` (old build path) | Request is rewritten via `.htaccess` and returns HTTP 200 | Backward Comp | API | **PASSED** |
| **TC-SEC-008** | SQL Injection Injection | Endpoint active | Pass `email = "admin' OR '1'='1"` to `send_otp.php` | Request fails gracefully via PDO prepared statements without SQL leakage | Security | API | **PASSED** |
| **TC-PRV-001** | Privacy Policy Navigation | App running | Tap "Privacy Policy" link on Login screen and in Profile tab | App opens `app/privacy.tsx` displaying DPDP disclosures | Functional | Android / iOS | **PASSED** |
| **TC-PRV-002** | Granular DPDP Consent | App running | Navigate to `app/consent.tsx`, toggle Analytics OFF, save preferences | Settings persist in SecureStore and sync to backend `/v1/auth/consent.php` | Functional | Android / iOS | **PASSED** |
| **TC-PRV-003** | Account Deletion DB Verification | User logged in | Tap "Delete My Account & Data" in Profile, confirm action | Server returns HTTP 200; DB queries confirm 0 rows remaining for `user_id` across all tables | Security / DPDP | Android / iOS / DB | **PASSED** |
| **TC-PRV-004** | Data Export Completeness | User logged in | Tap "Export My Data" in Profile | Returns full JSON archive containing profile, consents, jaap logs, favorites, and devices | Functional / DPDP | Android / iOS | **PASSED** |

---

### 🎵 Category B: Audio & Player Engine (Tasks T2 & T3)

| Test Case ID | Title | Preconditions | Steps | Expected Result | Type | Platform | Status |
|---|---|---|---|---|---|---|---|
| **TC-AUD-001** | Zero translate_tts References | Codebase | Run ripgrep for `translate.google.com/translate_tts` | 0 occurrences found across entire project | Security / Cleanliness | Code | **PASSED** |
| **TC-AUD-002** | Server Audio Pregeneration | CLI access | Run `php backend/scripts/pregenerate_audio.php` | Audio files generated in server storage; DB `audio_url` fields populated | Functional | Server CLI | **PASSED** |
| **TC-AUD-003** | Missing Audio Fallback UI | Entity with no audio | Open Mantra detail view for item with null `audio_url` | Play button shows "Audio coming soon" or is gracefully disabled | UI / UX | Android / iOS | **PASSED** |
| **TC-AUD-004** | Expo-Audio Migration | App running | Play audio using `src/utils/audioPlayer.ts` | Audio plays smoothly via `expo-audio` without deprecation warnings | Functional | Android / iOS | **PASSED** |
| **TC-AUD-005** | Expo-AV Package Removal | package.json | Inspect `package.json` dependencies | `expo-av` is absent; TypeScript compiles clean (`npx tsc --noEmit`) | Build | Universal | **PASSED** |
| **TC-AUD-006** | iOS Silent Mode & Background | iOS device | Switch iPhone to silent mode, start audio playback, lock screen | Audio continues playing in background despite hardware silent switch | Edge / Audio | iOS | **PASSED** |

---

### 💾 Category C: Storage Migration & Offline Caching (Tasks T4 & T5)

| Test Case ID | Title | Preconditions | Steps | Expected Result | Type | Platform | Status |
|---|---|---|---|---|---|---|---|
| **TC-STO-001** | SQLite Storage Initialization | App first launch | Launch updated app build | `mantra.db` created in WAL mode; tables initialized | Functional | Android / iOS | **PASSED** |
| **TC-STO-002** | One-Time Migration | Seeded SecureStore | Run `storageMigration.ts` on launch with existing history | All records transferred to SQLite; count matches; old keys deleted | Migration | Android / iOS | **PASSED** |
| **TC-STO-003** | 90-Day Rolling Cleanup | SQLite initialized | Record Jaap taps for dates older than 90 days | Cleanup query deletes records older than 90 days automatically | Functional | Android / iOS | **PASSED** |
| **TC-OFF-001** | React Query Offline Browse | Categories fetched | Turn on Airplane Mode, browse categories & mantras | Content loads instantly from persistent SQLite cache | Offline | Android / iOS | **PASSED** |
| **TC-OFF-002** | Offline Audio Download | Favorited item | Download audio for favorited mantra, enable Airplane Mode, tap Play | Audio plays locally from `expo-file-system` storage | Offline | Android / iOS | **PASSED** |

---

### ☁️ Category D: Canonical Schema & Cloud Sync (Tasks T6 & T7)

| Test Case ID | Title | Preconditions | Steps | Expected Result | Type | Platform | Status |
|---|---|---|---|---|---|---|---|
| **TC-SCH-001** | Canonical Entity API | Server active | Request `/mantras/read_single.php?id=1` | Response contains canonical keys (`name`, `deity`, `sanskrit`) + legacy keys | Compatibility | API | **PASSED** |
| **TC-SCH-002** | Entity Normalizer Logic | Client app | Run `normalizer.test.ts` via `npx tsx` | Normalizes missing/mixed keys to canonical shape without throwing errors | Unit Test | Client | **PASSED** |
| **TC-SYN-001** | Cloud Sync Endpoints | User authenticated | Send POST to `/v1/jaap/sync` and `/v1/favorites/sync` | Server merges records and returns status 200 | Functional | API | **PASSED** |
| **TC-SYN-002** | Multi-Device Sync Merge | 2 Devices logged in | Tap Jaap on Device A, view history on Device B | Max counts merged per date; tombstones remove deleted favorites | Integration | Multi-device | **PASSED** |

---

## 🛠️ 3. Execution Summary & Command Checklist

```bash
# 1. Run All Business Logic Unit Tests
npx tsx src/utils/__tests__/normalizer.test.ts
npx tsx src/services/__tests__/storageMigration.test.ts
npx tsx src/services/__tests__/syncManager.test.ts
npx tsx src/services/__tests__/privacyConsent.test.ts

# 2. Run TypeScript Compilation Check
npx tsc --noEmit
```
