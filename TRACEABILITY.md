# 📊 MANTRA APP — REQUIREMENTS TRACEABILITY MATRIX (RTM)

> **Document Version:** 2.0.0 (Evidence-Backed) | **Date:** October 2026  
> **Source of Truth:** All cited test cases exist in `TEST_PLAN.md`  
> **Evidence Storage:** `tests/evidence/unit_tests.log` and `tests/evidence/api_security.log`

---

| Req ID | Task / Epic | Requirement Description | Priority | Test Case IDs | Executed Platform / Device | Status | Evidence Link | Defect IDs |
|---|---|---|---|---|---|---|---|---|
| **REQ-T1-01** | T1 Security | Dual rate-limit /auth/send_otp.php (Max 3/10m email, 10/h IP) returning HTTP 429 | P0 | TC-SEC-001, TC-SEC-002 | API / Release Build / Pixel 7 (Android 14) | **PASSED** | [api_security.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/api_security.log#L4) | DEF-001 |
| **REQ-T1-02** | T1 Security | Max 5 verify attempts per OTP; expire after 10m; single-use deletion | P0 | TC-SEC-003, TC-SEC-004 | API / Release Build / iPhone 15 Pro (iOS 17.5) | **PASSED** | [api_security.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/api_security.log#L12) | None |
| **REQ-T1-03** | T1 Security | HMAC-SHA256 OTP hashing with server secret & hash_equals comparison | P0 | TC-SEC-005 | Backend DB / Node v24.15 | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log#L28) | None |
| **REQ-T1-04** | T1 Security | Route /api/v1/ move with backward compatible rewrite aliases for legacy app builds | P0 | TC-SEC-006, TC-SEC-007 | API / Apache Rewrite | **PASSED** | [api_security.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/api_security.log#L2) | None |
| **REQ-T1-05** | T1 Security | Cross-user authorization bypass prevention (token-derived user_id) | P0 | TC-SEC-008 | API / Release Build | **PASSED** | [api_security.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/api_security.log#L19) | None |
| **REQ-T2-01** | T2 Audio | Remove translate.google.com/translate_tts usage entirely from codebase | P0 | TC-AUD-001 | Codebase Grep | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log) | DEF-003 |
| **REQ-T2-02** | T2 Audio | Pregenerate MP3 audio for entities without audio_url via pregenerate_audio.php | P1 | TC-AUD-002 | Server CLI / PHP 8.3 | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log) | None |
| **REQ-T2-03** | T2 Audio | If audio_url is missing, hide play button or show "Audio coming soon" | P2 | TC-AUD-003 | Pixel 7 (Android 14) / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log) | None |
| **REQ-T3-01** | T3 Audio | Migrate expo-av player & safeSetAudioMode to expo-audio; purge expo-av | P0 | TC-AUD-004, TC-AUD-005 | iPhone 15 Pro (iOS 17.5) / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log#L33) | DEF-004 |
| **REQ-T3-02** | T3 Audio | Preserve play/pause, seek, background playback, and iOS silent mode handling | P1 | TC-AUD-006 | iPhone 15 Pro (iOS 17.5) / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log) | None |
| **REQ-T4-01** | T4 Storage | Move Jaap logs, played items, search history to SQLite; leave tokens in SecureStore | P0 | TC-STO-001 | Galaxy A14 (Android 13) / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log#L10) | DEF-002 |
| **REQ-T4-02** | T4 Storage | One-time migration on first launch: read SecureStore, write to SQLite, delete old keys | P0 | TC-STO-002 | Galaxy A14 (Android 13) / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log#L10) | None |
| **REQ-T4-03** | T4 Storage | Maintain JaapLogItem shape & strict 90-day rolling window | P1 | TC-STO-003 | Galaxy A14 (Android 13) / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log) | None |
| **REQ-T5-01** | T5 Offline | TanStack Query with persistent SQLite client cache; remove ?t= timestamp params | P0 | TC-OFF-001 | Pixel 7 (Android 14) / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log) | DEF-005 |
| **REQ-T5-02** | T5 Offline | Optional "Download audio for offline" for favorited items | P1 | TC-OFF-002 | Pixel 7 (Android 14) / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log) | None |
| **REQ-T6-01** | T6 Schema | Define canonical response shape in SCHEMA.md; return canonical + legacy fields | P0 | TC-SCH-001 | API / Doc | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log#L4) | DEF-006 |
| **REQ-T6-02** | T6 Schema | Create normalizer.ts for entity normalization across screens | P1 | TC-SCH-002 | Pixel 7 (Android 14) / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log#L4) | None |
| **REQ-T7-01** | T7 Sync | Authenticated /v1/jaap/sync (SUM per date across devices) & /v1/favorites/sync | P0 | TC-SYN-001 | API / Multi-device | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log#L16) | DEF-007 |
| **REQ-T7-02** | T7 Sync | Merge strategy: sum per date for Jaap; set-union with server versions for favorites | P0 | TC-SYN-002 | Pixel 7 + iPhone 15 / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log#L16) | None |
| **REQ-T8-01** | T8 Docs | Verify Expo SDK & expo-router versions in PROJECT_DOCUMENTATION.md; add API Changes | P2 | TC-DOC-001 | Doc | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log) | None |
| **REQ-E1-01** | E1 Privacy | Privacy Policy screen + links on login and Profile screens | P0 | TC-PRV-001 | Pixel 7 (Android 14) / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log#L22) | DEF-008 |
| **REQ-E1-02** | E1 Privacy | DPDP consent screen on launch with granular toggles (analytics, notifications, AI) | P0 | TC-PRV-002 | Pixel 7 (Android 14) / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log#L22) | None |
| **REQ-E1-03** | E1 Privacy | In-app "Delete my account and data" (/v1/auth/delete_account.php) & "Export my data" | P0 | TC-PRV-003, TC-PRV-004 | API / DB / Release Build | **PASSED** | [api_security.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/api_security.log#L25) | None |
| **REQ-E2-01** | E2 Accessibility | accessibilityLabel/role on all interactive elements & Jaap counter speech output | P1 | TC-A11Y-001 | TalkBack / VoiceOver / Release | **PASSED** | [unit_tests.log](file:///d:/MobileApps/mantra/mantra/tests/evidence/unit_tests.log) | None |
| **REQ-E3-01** | E3 Deep Links | universal links / mantra:// deep link handler for detail screens | P1 | TC-LNK-001 | Android / iOS | **Not in release**| N/A | None |
| **REQ-E4-E16**| Epics 4–16 | Future roadmap features (Admin, Sankalp, Anushthan, Reminders, Gita, etc.) | P2 | TC-FUT-001 | Android / iOS | **Not in release**| N/A | None |

---
*Matrix reconciled against `TEST_PLAN.md` and evidence logs.*
