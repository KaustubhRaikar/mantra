# 📊 MANTRA APP — REQUIREMENTS TRACEABILITY MATRIX (RTM)

> **Document Version:** 1.0.0 | **Date:** October 2026  
> **Scope:** Fix Tasks T1–T8 & Feature Epics E1–E16  
> **Source:** Dev Prompts, `PROJECT_DOCUMENTATION.md`, `SCHEMA.md`, `CHANGELOG.md`

---

| Req ID | Task / Epic | Requirement Description | Priority | Test Case IDs | Platform | Status | Evidence Link | Defect IDs |
|---|---|---|---|---|---|---|---|---|
| **REQ-T1-01** | T1 Security | Dual rate-limit /auth/send_otp.php (Max 3/10m email, 10/h IP) returning HTTP 429 | P0 | TC-SEC-001, TC-SEC-002 | API / Android / iOS | **PASSED** | [rate_limit.php](file:///d:/MobileApps/mantra/mantra/backend/config/rate_limit.php) | None |
| **REQ-T1-02** | T1 Security | Max 5 verify attempts per OTP; expire after 10m; single-use deletion | P0 | TC-SEC-003, TC-SEC-004 | API / Android / iOS | **PASSED** | [verify_otp.php](file:///d:/MobileApps/mantra/mantra/backend/api/auth/verify_otp.php) | None |
| **REQ-T1-03** | T1 Security | Hashed OTP storage (SHA-256) in database | P0 | TC-SEC-005 | Backend DB | **PASSED** | [verify_otp.php](file:///d:/MobileApps/mantra/mantra/backend/api/auth/verify_otp.php#L60) | None |
| **REQ-T1-04** | T1 Security | Route /api/v1/ move with backward compatible rewrite aliases for legacy app builds | P0 | TC-SEC-006, TC-SEC-007 | API | **PASSED** | [.htaccess](file:///d:/MobileApps/mantra/mantra/backend/.htaccess) | None |
| **REQ-T1-05** | T1 Security | Input validation & prepared statements on all endpoints (No SQLi) | P0 | TC-SEC-008 | API | **PASSED** | [api.ts](file:///d:/MobileApps/mantra/mantra/src/services/api.ts) | None |
| **REQ-T2-01** | T2 Audio | Remove translate.google.com/translate_tts usage entirely from codebase | P0 | TC-AUD-001 | Android / iOS | **PASSED** | [mantra/[id].tsx](file:///d:/MobileApps/mantra/mantra/app/mantra/[id].tsx) | None |
| **REQ-T2-02** | T2 Audio | Pregenerate MP3 audio for entities without audio_url via pregenerate_audio.php | P1 | TC-AUD-002 | Backend CLI | **PASSED** | [pregenerate_audio.php](file:///d:/MobileApps/mantra/mantra/backend/scripts/pregenerate_audio.php) | None |
| **REQ-T2-03** | T2 Audio | If audio_url is missing, hide play button or show "Audio coming soon" | P2 | TC-AUD-003 | Android / iOS | **PASSED** | [mantra/[id].tsx](file:///d:/MobileApps/mantra/mantra/app/mantra/[id].tsx) | None |
| **REQ-T3-01** | T3 Audio | Migrate expo-av player & safeSetAudioMode to expo-audio; purge expo-av | P0 | TC-AUD-004, TC-AUD-005 | Android / iOS | **PASSED** | [audioPlayer.ts](file:///d:/MobileApps/mantra/mantra/src/utils/audioPlayer.ts) | None |
| **REQ-T3-02** | T3 Audio | Preserve play/pause, seek, background playback, and iOS silent mode handling | P1 | TC-AUD-006 | Android / iOS | **PASSED** | [package.json](file:///d:/MobileApps/mantra/mantra/package.json) | None |
| **REQ-T4-01** | T4 Storage | Move Jaap logs, played items, search history to SQLite; leave tokens in SecureStore | P0 | TC-STO-001 | Android / iOS | **PASSED** | [db.ts](file:///d:/MobileApps/mantra/mantra/src/services/db.ts) | None |
| **REQ-T4-02** | T4 Storage | One-time migration on first launch: read SecureStore, write to SQLite, delete old keys | P0 | TC-STO-002 | Android / iOS | **PASSED** | [storageMigration.test.ts](file:///d:/MobileApps/mantra/mantra/src/services/__tests__/storageMigration.test.ts) | None |
| **REQ-T4-03** | T4 Storage | Maintain JaapLogItem shape & strict 90-day rolling window | P1 | TC-STO-003 | Android / iOS | **PASSED** | [storage.ts](file:///d:/MobileApps/mantra/mantra/src/services/storage.ts#L25) | None |
| **REQ-T5-01** | T5 Offline | TanStack Query with persistent SQLite client cache; remove ?t= timestamp params | P0 | TC-OFF-001 | Android / iOS | **PASSED** | [queryClient.ts](file:///d:/MobileApps/mantra/mantra/src/services/queryClient.ts) | None |
| **REQ-T5-02** | T5 Offline | Optional "Download audio for offline" for favorited items | P1 | TC-OFF-002 | Android / iOS | **PASSED** | [audioDownloader.ts](file:///d:/MobileApps/mantra/mantra/src/services/audioDownloader.ts) | None |
| **REQ-T6-01** | T6 Schema | Define canonical response shape in SCHEMA.md; return canonical + legacy fields | P0 | TC-SCH-001 | API / Doc | **PASSED** | [SCHEMA.md](file:///d:/MobileApps/mantra/mantra/SCHEMA.md) | None |
| **REQ-T6-02** | T6 Schema | Create normalizer.ts for entity normalization across screens | P1 | TC-SCH-002 | Android / iOS | **PASSED** | [normalizer.test.ts](file:///d:/MobileApps/mantra/mantra/src/utils/__tests__/normalizer.test.ts) | None |
| **REQ-T7-01** | T7 Sync | Authenticated /v1/jaap/sync & /v1/favorites/sync endpoints | P0 | TC-SYN-001 | API | **PASSED** | [jaap/sync.php](file:///d:/MobileApps/mantra/mantra/backend/api/jaap/sync.php) | None |
| **REQ-T7-02** | T7 Sync | Merge strategy: last-write-wins per date for Jaap; set-union with tombstones for favorites | P0 | TC-SYN-002 | API / Client | **PASSED** | [syncManager.test.ts](file:///d:/MobileApps/mantra/mantra/src/services/__tests__/syncManager.test.ts) | None |
| **REQ-T8-01** | T8 Docs | Verify Expo SDK & expo-router versions in PROJECT_DOCUMENTATION.md; add API Changes | P2 | TC-DOC-001 | Doc | **PASSED** | [PROJECT_DOCUMENTATION.md](file:///d:/MobileApps/mantra/mantra/PROJECT_DOCUMENTATION.md) | None |
| **REQ-E1-01** | E1 Privacy | Privacy Policy screen + links on login and Profile screens | P0 | TC-PRV-001 | Android / iOS | **PASSED** | [privacy.tsx](file:///d:/MobileApps/mantra/mantra/app/privacy.tsx) | None |
| **REQ-E1-02** | E1 Privacy | DPDP consent screen on launch with granular toggles (analytics, notifications, AI) | P0 | TC-PRV-002 | Android / iOS | **PASSED** | [consent.tsx](file:///d:/MobileApps/mantra/mantra/app/consent.tsx) | None |
| **REQ-E1-03** | E1 Privacy | In-app "Delete my account and data" (/v1/auth/delete_account.php) & "Export my data" | P0 | TC-PRV-003, TC-PRV-004 | API / Client | **PASSED** | [privacyConsent.test.ts](file:///d:/MobileApps/mantra/mantra/src/services/__tests__/privacyConsent.test.ts) | None |
| **REQ-E2-01** | E2 Accessibility | accessibilityLabel/role on all interactive elements & Jaap counter speech output | P1 | TC-A11Y-001 | Android / iOS | **READY FOR TEST** | [consent.tsx](file:///d:/MobileApps/mantra/mantra/app/consent.tsx#L55) | None |
| **REQ-E3-01** | E3 Deep Links | universal links / mantra:// deep link handler for detail screens | P1 | TC-LNK-001 | Android / iOS | **PLANNED** | Pending PR | None |
| **REQ-E4-01** | E4 Error Report | content_reports table & "Report an error" modal on detail pages | P2 | TC-REP-001 | API / Client | **PLANNED** | Pending PR | None |
| **REQ-E5-01** | E5 Admin | Admin dashboard web panel for content CRUD, verification & push notification composer | P2 | TC-ADM-001 | Web | **PLANNED** | Pending PR | None |
| **REQ-E6-01** | E6 Sankalp | Sankalp prompt before Jaap, jaap_sessions storage & volume-button counting (Android only) | P1 | TC-SKP-001 | Android / iOS | **PLANNED** | Pending PR | None |
| **REQ-E7-01** | E7 Anushthan | Anushthan mode templates, day tracking, missed day policy & completion screen | P1 | TC-ANU-001 | Android / iOS | **PLANNED** | Pending PR | None |

---
*Matrix updated automatically upon test execution.*
