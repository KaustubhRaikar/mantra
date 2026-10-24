# ⚙️ MANTRA APP — TECHNICAL REQUIREMENTS DOCUMENT (TRD)

> **Document Identifier:** MANTRA-DOC-TRD-003  
> **Target Audience:** Principal Architects, Mobile Engineers, Backend Engineers, DevOps  
> **Status:** Active Engineering Baseline  
> **Version:** 2.0.0  
> **Codebase Reference:** `d:\MobileApps\mantra\mantra`  

---

## 1. System Technology Stack

### 1.1 Mobile Client Stack
* **Framework:** React Native 0.76+ with Expo SDK 57 (New Architecture enabled).
* **Navigation:** `expo-router` v4 (File-based hierarchical routing).
* **Language & Compiler:** TypeScript 5.3+, strict mode enabled.
* **Storage Layer:**
  * **Local Relational DB:** `expo-sqlite` (high-capacity structured data: Japa logs, search history, entity caches).
  * **Encrypted Keychain:** `expo-secure-store` (sensitive credentials: session token, hardware device UUID).
* **Audio Engine:** `expo-audio` replacing deprecated `expo-av`, native audio focus, background playback modes.
* **Network & Cache:** Axios HTTP client + TanStack React Query v5 (offline persistence adapter with SQLite).
* **Haptics & Sensors:** `expo-haptics` (impact/notification patterns).
* **Typography:** `@expo-google-fonts/tiro-devanagari-hindi` for ligatures and conjunct Sanskrit glyphs.

### 1.2 Primary REST Backend Stack (Hostinger Cloud)
* **Web Server:** Apache 2.4 with `mod_rewrite`, `mod_headers`, `mod_security`.
* **Runtime:** PHP 8.3 (strict types, PDO MySQL drivers).
* **Database:** MySQL 8.0 Enterprise / MariaDB 10.11 with utf8mb4 encoding.
* **Security & Crypto:** OpenSSL with `hash_equals()`, `hash_hmac('sha256')`, CSP headers, CORS isolation.

### 1.3 AI Middleware Layer Stack (Phase 2 Target)
* **Framework:** Python 3.11+ with FastAPI & Uvicorn (Asynchronous ASGI).
* **Vector Database:** PostgreSQL 16 with `pgvector` or Qdrant cluster.
* **Embeddings:** `text-embedding-3-small` or local HuggingFace `intfloat/multilingual-e5-large`.
* **Speech Evaluation Model:** Sanskrit-finetuned Whisper / Wav2Vec2 STT engine for Phoneme Error Rate (PER) calculation.
* **Streaming Protocol:** HTTP/2 Server-Sent Events (SSE) with keep-alive heartbeats.

---

## 2. Architecture & Subsystem Technical Requirements

### 2.1 Storage & Data Persistence Subsystem (REQ-T4)

```
+---------------------------------------------------------------------------------+
|                         CLIENT DATA STORAGE TOPOLOGY                            |
+------------------------------------+--------------------------------------------+
| expo-secure-store (OS Keychain)    | expo-sqlite (Local Database)              |
+------------------------------------+--------------------------------------------+
| • session_token (Bearer JWT/HMAC)  | • jaap_daily_logs (date, count, malas)     |
| • hardware_device_uuid             | • played_items (id, entity_type, timestamp)|
| • user_profile_metadata            | • search_history (query, timestamp)        |
|                                    | • cached_entities (offline JSON blobs)     |
|                                    | • download_queue & offline audio tracks    |
+------------------------------------+--------------------------------------------+
```

1. **Strict Partitioning:** Large structured or unbounded history (Jaap logs, search history, played items) MUST be stored in `expo-sqlite`. Under no circumstances may unbounded logs be placed into `expo-secure-store` due to Android KeyStore byte limits and iOS Keychain size quotas.
2. **Migration On First Launch:** App initializes with a self-executing migration runner (`storageMigration.ts`). It inspects legacy SecureStore keys, writes them into SQLite, validates row counts, and purges legacy keys.
3. **90-Day Rolling Window:** SQL trigger or transaction pruning queries must automatically purge Japa log entries where `date < DATE('now', '-90 days')`.

---

### 2.2 Audio Engine & Playback Subsystem (REQ-T2, REQ-T3)

```
+---------------------------------------------------------------------------------+
|                           AUDIO SUBSYSTEM PIPELINE                              |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [ Content Entity ]                                                             |
|          |                                                                      |
|          +---> Has `audio_url`?                                                 |
|                   |                                                             |
|                   +--- YES ---> [ Check Local SQLite Audio Cache ]              |
|                   |                      |                                      |
|                   |                      +--- Local file exists?                |
|                   |                      |       |--- YES -> Play Local Path    |
|                   |                      |       |--- NO  -> Stream from Server |
|                   |                      v                                      |
|                   |             [ expo-audio Player Engine ]                    |
|                   |             - Audio Mode: staysActiveInBackground = true    |
|                   |             - playsInSilentModeIOS = true                   |
|                   |             - InterruptionMode: DuckOthers / DoNotMix       |
|                   |                                                             |
|                   +--- NO ----> [ UI Graceful Degradation ]                     |
|                                 - Hide play controls or show "Audio Soon"       |
|                                 - NO Google Translate TTS web scraping          |
+---------------------------------------------------------------------------------+
```

1. **Native Implementation:** Built on `expo-audio`. `expo-av` must be completely eradicated from `package.json` to avoid conflicting native audio session listeners.
2. **Audio Mode Configuration:** The audio session must be initialized using `safeSetAudioMode`:
   * `allowsRecordingIOS: false`
   * `staysActiveInBackground: true`
   * `playsInSilentModeIOS: true`
   * `shouldDuckAndroid: true`
3. **Pregenerated Audio Pipeline:** Official high-quality studio/Vedic recordings pre-rendered into 128kbps stereo MP3s hosted via CDN. Direct TTS web scraping is forbidden.

---

### 2.3 Data Normalization Subsystem (REQ-T6)

All backend endpoints and local caching layers must route through `normalizer.ts` implementing the `CanonicalEntity` interface:

```typescript
export interface CanonicalEntity {
  id: string | number;
  name: string;
  deity: string;
  sanskrit: string;
  transliteration: string;
  translation_en: string;
  translation_hi: string;
  meaning: string | string[];
  benefits: Array<{ icon: string; text: string }>;
  audio_url: string | null;
  category_id: number | null;
  category_name: string;
  path: 'mantra' | 'aarti' | 'chalisa' | 'pooja_vidhi' | 'stotra' | 'vrat_katha' | 'upanishad';
}
```

* **Backward Compatibility:** Normalizer handles legacy API keys (`mantra_name`, `title`, `god`, `sanskrit_text`) seamlessly, converting them into canonical representations for React components.

---

### 2.4 Cloud Synchronization Protocol (REQ-T7)

When user authenticates, synchronization occurs via authenticated POST endpoints:
1. **Jaap Counter Sync (`/v1/jaap/sync.php`):**
   * **Payload:** Array of `{ date: "YYYY-MM-DD", total_chants: number, completed_malas: number }`.
   * **Merge Rule:** **SUM Aggregation**. If local has 108 chants on `2026-10-24` and server has 216 chants (performed on a tablet), the synced result is `324` chants.
2. **Favorites Sync (`/v1/favorites/sync.php`):**
   * **Payload:** Array of `{ entity_type: string, entity_id: number, modified_at: string }`.
   * **Merge Rule:** **Set Union with Timestamp Conflict Resolution**. Deleted items retain a tombstone flag (`is_deleted = 1`).

---

### 2.5 Security, Crypto & Rate Limiting Requirements (REQ-T1)

1. **Rate Limiting:**
   * `/auth/send_otp.php`: Max 3 requests per 10 minutes per email address; Max 10 requests per hour per IP. HTTP 429 returned upon breach.
   * `/auth/verify_otp.php`: Max 5 failed attempts per OTP token; Max 10 attempts per 10 minutes per IP.
2. **HMAC-SHA256 Secret Hashing:**
   * Stored OTPs are hashed using a cryptographically random pepper secret: `hash_hmac('sha256', $otp, $server_secret)`.
   * Timing-attack-resistant comparison: `hash_equals($db_hash, $calculated_hash)`.
3. **Session Verification:**
   * Every authenticated request requires headers: `X-User-ID`, `X-Login-Token`, `X-Device-ID`.
   * Database validates that `token` is active, unexpired, and strictly associated with `user_id` AND `device_id`.

---

## 3. Requirements Traceability Matrix (RTM Mapping)

| Req ID | Module | Implementation File | Verification Test |
|---|---|---|---|
| **REQ-T1-01** | Security | `backend/api/auth/send_otp.php` | `TC-SEC-001` (Dual rate limit) |
| **REQ-T1-02** | Security | `backend/api/auth/verify_otp.php` | `TC-SEC-003` (Max 5 attempts) |
| **REQ-T1-03** | Security | `backend/api/auth/verify_otp.php` | `TC-SEC-005` (HMAC constant time) |
| **REQ-T2-01** | Audio | `src/utils/audioPlayer.ts` | `TC-AUD-001` (Purge Google TTS) |
| **REQ-T3-01** | Audio | `src/utils/audioPlayer.ts` | `TC-AUD-004` (Migrate to expo-audio)|
| **REQ-T4-01** | Storage | `src/services/sqliteStorage.ts` | `TC-STO-001` (SQLite Japa logs) |
| **REQ-T5-01** | Offline | `src/services/queryClient.ts` | `TC-OFF-001` (TanStack SQLite cache)|
| **REQ-T6-01** | Schema | `src/utils/normalizer.ts` | `TC-SCH-001` (Canonical mapping) |
| **REQ-T7-01** | Sync | `backend/api/jaap/sync.php` | `TC-SYN-001` (SUM Jaap merge) |
| **REQ-E1-01** | Privacy | `app/privacy.tsx` | `TC-PRV-001` (DPDP consent & policy) |
