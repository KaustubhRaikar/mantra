# 📜 MANTRA APP — CHANGELOG & RELEASE NOTES

All notable changes, security enhancements, and structural refactorings implemented across the Mantra app ecosystem are documented below.

---

## 🚀 [2.0.0] - 2026-10-05

### 🔒 Task 1: SECURITY — OTP Abuse & API Hardening (`fix/security-hardening`)
- **Backend Rate Limiting (`backend/config/rate_limit.php`):** Added dual-layer rate limiting for `/auth/send_otp.php` restricting requests to **max 3 per 10 minutes per email** and **max 10 per hour per IP address**, returning HTTP `429 Too Many Requests`.
- **OTP Verification Lock & Expiry (`backend/api/auth/verify_otp.php`):** Enforced a **5-attempt limit** per OTP code, **10-minute TTL expiration**, single-use deletion, and **SHA-256 password hashing** before DB storage (`user_otps` table).
- **V1 API Namespace & Alias (`backend/.htaccess`):** Moved endpoints under `/api/v1/` while preserving backward compatibility for legacy app builds via URL rewrite rules (`/api/*` aliases to `/api/v1/*`).
- **Input Validation & Prepared Statements:** Verified prepared statements across all authentication endpoints (`send_otp.php`, `verify_otp.php`, `verify_session.php`) preventing SQL injection.

### 🎵 Task 2: AUDIO — Google Translate TTS Removal (`fix/remove-translate-tts`)
- **App Fallback Removal:** Removed all occurrences of `translate.google.com/translate_tts` fallback scrapers from detail screens (`app/mantra/[id].tsx`, `app/aarti/[id].tsx`, `app/festival_aarti/[id].tsx`).
- **Batch Audio Pregeneration Script (`backend/scripts/pregenerate_audio.php`):** Created a CLI script using official TTS (Google Cloud TTS `hi-IN` / Azure) to pre-render MP3 audio for entities lacking an `audio_url`, save them to server storage, and update database records.
- **Graceful UI Handling:** Hidden play controls or shown "Audio coming soon" when `audio_url` is absent.

### 🎧 Task 3: AUDIO — Expo-AV to Expo-Audio Migration (`fix/migrate-expo-audio`)
- **Module Migration (`src/utils/audioPlayer.ts`):** Replaced deprecated `expo-av` with `expo-audio` (`setAudioModeAsync`, `AudioPlayer` interface, dynamic event listeners).
- **Package Cleanup (`package.json`):** Removed `expo-av` dependency and verified clean compilation on SDK 57.
- **Background & Silent Mode:** Retained smooth progress animations, background audio playback, and iOS silent mode overrides.

### 💾 Task 4: STORAGE — SecureStore to SQLite Migration (`fix/storage-sqlite-migration`)
- **SQLite Engine (`src/services/db.ts`):** Configured `expo-sqlite` with WAL mode (`PRAGMA journal_mode = WAL`) and initialized tables for `jaap_logs`, `recently_played`, `recent_searches`, and `meta_store`.
- **Atomic Data Migration (`src/services/storageMigration.ts`):** Implemented a one-time migration that transfers existing `SecureStore` data to SQLite on app launch, verifies record counts, and safely removes old keys.
- **90-Day Rolling Window (`src/services/storage.ts`):** Maintained strict 90-day retention cleanup for `JaapLogItem` entries while keeping auth tokens strictly in `SecureStore`.

### 🌐 Task 5: OFFLINE & CACHING — React Query & Offline Audio (`fix/offline-caching`)
- **Persisted Query Cache (`src/services/queryClient.ts`):** Configured `@tanstack/react-query` with `@tanstack/react-query-persist-client` and custom `sqlitePersister`.
- **Cache-Buster Cleanup (`src/services/api.ts`):** Removed all `?t=${Date.now()}` query parameter cache busters across content endpoints.
- **Offline Audio Download Service (`src/services/audioDownloader.ts`):** Added background audio downloading for favorited items using `expo-file-system/legacy` to allow offline playback in airplane mode.

### 📐 Task 6: DATA CONSISTENCY — Canonical Schema & Normalizer (`fix/canonical-schema`)
- **Canonical Schema Documentation (`SCHEMA.md`):** Published complete schema definitions (`id`, `name`, `deity`, `sanskrit`, `transliteration`, `translation_en`, `translation_hi`, `meaning`, `benefits`, `audio_url`, `category_id`) for AI data ingestion.
- **Backend Response Compatibility (`backend/api/mantras/read_single.php`):** Included canonical fields in response objects while retaining legacy aliases (`mantra_name`, `god`, `sanskrit_text`).
- **Client Entity Normalizer (`src/utils/normalizer.ts`):** Added `normalizeEntity`, `normalizeMantra`, `normalizeAarti`, `normalizeChalisa`, and `normalizeStotra` to eliminate scattered fallback expressions.

### ☁️ Task 7: CLOUD SYNC — Multi-Device Sync Engine (`fix/cloud-sync`)
- **Authenticated Backend Sync Endpoints:**
  - `POST/GET /v1/jaap/sync` (`backend/api/jaap/sync.php`): Last-write-wins per date, taking max `total_chants` and `completed_malas`.
  - `POST/GET /v1/favorites/sync` (`backend/api/favorites/sync.php`): Set-union merge with tombstones (`is_deleted: 1`) and timestamp precedence.
- **Client Sync Manager (`src/services/syncManager.ts`):** Automatic background synchronization triggered on user login, app foregrounding, and local data changes (debounced 2.5s). Full offline queue support.

### 📖 Task 8: DOCUMENTATION — Architecture & Verification (`fix/doc-cleanup`)
- **Version Verification (`PROJECT_DOCUMENTATION.md`):** Verified and corrected claims against `package.json` (Expo SDK `57.0.26`, `expo-router` `57.0.24`).
- **Section Renumbering & API Changes Table:** Renumbered section hierarchy and added a comprehensive "API Changes & Architecture Updates" comparison table.

---

## 🛠️ BACKEND DEPLOYMENT REQUIREMENTS

The following deployment steps are required on the Hostinger PHP/MySQL server:

1. **Database Schema Migrations:**
   Run the following SQL DDL statements on MySQL database:
   ```sql
   -- Create Jaap Logs table for Cloud Sync
   CREATE TABLE IF NOT EXISTS user_jaap_logs (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       date VARCHAR(10) NOT NULL,
       formatted_date VARCHAR(50) NOT NULL,
       total_chants INT NOT NULL DEFAULT 0,
       completed_malas INT NOT NULL DEFAULT 0,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       UNIQUE KEY u_user_date (user_id, date)
   );

   -- Create Favorites Sync table with Tombstones
   CREATE TABLE IF NOT EXISTS user_favorites (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       item_id VARCHAR(100) NOT NULL,
       item_data TEXT NULL,
       is_deleted TINYINT(1) NOT NULL DEFAULT 0,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       UNIQUE KEY u_user_item (user_id, item_id)
   );
   ```

2. **Web Server URL Rewrite Rules (`.htaccess`):**
   Ensure Apache `mod_rewrite` is enabled and root `.htaccess` includes:
   ```apache
   RewriteEngine On
   RewriteRule ^api/v1/(.*)$ api/$1 [L,QSA]
   ```

3. **Cron Job Setup for TTS Pregeneration:**
   Configure a recurring server cron job to render audio for newly added mantras:
   ```bash
   0 2 * * * php /home/u123456789/public_html/api/scripts/pregenerate_audio.php >> /var/log/mantra_tts.log 2>&1
   ```

---

## 🧪 MANUAL TEST CHECKLIST (ANDROID & IOS)

### 1. Security & OTP Hardening
- [ ] Attempt 4 consecutive OTP sends for the same email within 10 minutes. Verify the 4th attempt returns `HTTP 429` with a rate-limit error message.
- [ ] Enter 6 incorrect OTP attempts. Verify account verification locks out on the 6th attempt.
- [ ] Test old app build pointing to `/api/mantras/read.php`. Verify request is rewritten and returns `200 OK`.

### 2. Audio Engine
- [ ] Open a Mantra detail view with missing `audio_url`. Verify play button is disabled or displays "Audio coming soon".
- [ ] Play a mantra audio file, lock the screen or background the app on iOS/Android. Verify audio continues playing smoothly.

### 3. Storage Migration
- [ ] Upgrade app build on a seeded device with existing SecureStore Jaap history and searches.
- [ ] Open Profile tab. Verify 90-day Jaap counts and search history match previous data.

### 4. Offline & Caching
- [ ] Turn on Airplane Mode after browsing categories and mantras.
- [ ] Re-open previously visited categories and detail screens. Verify content renders instantly from TanStack Query SQLite cache.
- [ ] Download audio for a favorited item, turn on Airplane Mode, and tap Play. Verify local audio file plays cleanly.

### 5. Data Consistency & Cloud Sync
- [ ] Perform Jaap taps (e.g. 108 chants) on Device A. Log into Device B with the same user account. Verify Device B displays 108 chants for today.
- [ ] Favorite an item on Device A, then delete a favorite on Device B. Verify tombstones sync across both devices.
