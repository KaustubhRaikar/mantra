# 🐞 MANTRA APP — DEFECT TRACKER LOG

> **Document Version:** 1.0.0 | **Date:** October 2026  
> **Build Target:** 2.0.0 (Hardened & Synchronized)

---

## 📊 Defect Metrics Overview

| Severity | Total Found | Resolved | Open | Reopened |
|---|---|---|---|---|
| **S1 - Blocker** (Data Loss, Security Breach, Crash) | 2 | 2 | 0 | 0 |
| **S2 - Major** (Feature Broken, No Workaround) | 3 | 3 | 0 | 0 |
| **S3 - Minor** (Workaround Available, Non-Critical) | 1 | 1 | 0 | 0 |
| **S4 - Cosmetic** (UI Alignment, Typos) | 2 | 2 | 0 | 0 |
| **TOTAL** | **8** | **8** | **0** | **0** |

---

## 📝 Comprehensive Defect Log

### 🟢 Resolved Defects

| Defect ID | Title | Severity | Task / Epic | Steps to Reproduce | Root Cause | Resolution | Verified In Build |
|---|---|---|---|---|---|---|---|
| **DEF-001** | Plaintext OTP exposed in DB | **S1** | T1 Security | Request OTP for user email; inspect `user_otps` DB table | `send_otp.php` inserted raw numeric OTP | Implemented SHA-256 hashing before DB insertion in `verify_otp.php` | `fix/security-hardening` |
| **DEF-002** | SecureStore Jaap history data loss risk | **S1** | T4 Storage | Upgrade app build on device with 90-day Jaap history | SecureStore key deletion occurred before confirming SQLite insert count | Rewrote `storageMigration.ts` with atomic count verification before key deletion | `fix/storage-sqlite-migration` |
| **DEF-003** | Missing audio file caused runtime crash | **S2** | T2 Audio | Tap Play on a mantra missing `audio_url` | `expo-av` attempted loading null URL string | Added URL validation; hide play button or show "Audio coming soon" | `fix/remove-translate-tts` |
| **DEF-004** | Deprecation warnings on SDK 57 audio playback | **S2** | T3 Audio | Launch app on SDK 57 and play audio | `expo-av` module triggered SDK 57 deprecation warning | Migrated `audioPlayer.ts` to `expo-audio` native module | `fix/migrate-expo-audio` |
| **DEF-005** | Query cache buster param breaking offline cache | **S2** | T5 Offline | Enable Airplane mode and browse category screen | `?t=timestamp` appended to URL prevented TanStack Query key hits | Removed all `?t=${Date.now()}` query buster parameters | `fix/offline-caching` |
| **DEF-006** | Inconsistent field names across screens | **S3** | T6 Schema | View Aarti detail vs Mantra detail screen | Heterogeneous property keys (`title` vs `name` vs `aarti_name`) | Created `normalizer.ts` with canonical property mapping | `fix/canonical-schema` |
| **DEF-007** | PHP string casting syntax error in favorites sync | **S4** | T7 Sync | Post favorites sync payload to backend | Used JS `String()` syntax in PHP file | Replaced with `(string)` PHP type casting | `fix/cloud-sync` |
| **DEF-008** | Consent screen theme import errors | **S4** | E1 Privacy | Run `npx tsc --noEmit` on `app/consent.tsx` | Exported `Colors` misreferenced as `COLORS` | Corrected import destructuring and style property references | `fix/privacy-consent` |

---
*All 8 logged defects have been verified as RESOLVED and PASSED.*
