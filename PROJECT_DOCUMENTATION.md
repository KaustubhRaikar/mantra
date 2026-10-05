# 📜 MANTRA APP — PROJECT DOCUMENTATION & AI LAYER BLUEPRINT

> **Target Audience:** AI Engineering Team, Mobile Developers, and System Architects  
> **Document Purpose:** Complete architectural breakdown, folder structure, data schemas, API catalog, state management, and actionable blueprints for integrating an AI Layer into the Mantra mobile ecosystem.  
> **Date:** October 2026 | **Version:** 2.0.0 (Hardened & Synchronized)

---

## 📍 1. Executive Summary & Project Nature

### 1.1 Project Overview
**Mantra** is a state-of-the-art Vedic & Spiritual mobile application built with **React Native / Expo SDK 57** (`expo` 57.0.26, `expo-router` 57.0.24) and a lightweight, high-performance **PHP RESTful Backend** (MySQL). The application serves as a sacred digital companion for devotees, offering access to authentic Sanskrit Mantras, Chalisas, Aartis, Festival Aartis, Pooja Vidhis, Stotras, Vrat Kathas, and ancient Upanishads.

### 1.2 Key System Characteristics
* **Cross-Platform Mobile Client:** Universal Expo app running seamlessly on Android, iOS, and Web (`expo-router` file-based routing on SDK 57).
* **Rich Devanagari Typography:** Custom Google Font integration (`TiroDevanagariHindi_400Regular`) for crystal-clear Sanskrit text rendering.
* **Interactive Devotion Tools:** Tactile **Mantra Jaap / Japa Mala Counter** with haptic feedback (`expo-haptics`), target mala goals (21, 54, 108, 1008), and 90-day date-wise persistent SQLite logging.
* **Server-Hosted Audio Engine:** Embedded Audio Player built on `expo-audio` playing high-quality server-hosted audio pre-rendered via official Google Cloud / Azure TTS (no third-party runtime TTS fallback calls).
* **Offline-First Storage Architecture:** Secure credentials (tokens, device ID) stored in `expo-secure-store`; high-performance local SQLite storage (`expo-sqlite`) for Jaap logs, played items, and search history with automatic count-verified migration.
* **Hardened 2-Step OTP Authentication:** Passwordless login using rate-limited, hashed OTP verification (max 3 sends per 10 min per email, 10 per hour per IP; 5 verification attempts max, 10 min TTL).
* **Cloud Sync Engine:** Authenticated multi-device sync for Jaap logs (last-write-wins per date) and Favorites (set-union with tombstones).

---

## 📁 2. Complete Folder & Directory Structure

```
d:\MobileApps\mantra\mantra/
├── app/                           # Expo Router File-Based Routing System (SDK 57)
│   ├── (tabs)/                    # Main Bottom Tab Navigator Screens
│   │   ├── _layout.tsx            # Custom tab bar layout & QueryClientProvider setup
│   │   ├── categories.tsx         # Category exploration screen (Grid & List view toggle)
│   │   ├── favorites.tsx          # Saved items tab (Mantras, Aartis, Chalisas, etc.)
│   │   ├── index.tsx              # Home Screen (Daily Mantra, Jaap Counter, Featured, Sub-menus)
│   │   └── profile.tsx            # Devotee Profile, Jaap Log History modal, App Preferences
│   ├── aarti/
│   │   └── [id].tsx               # Sacred Aarti detail view & expo-audio player
│   ├── category/
│   │   └── [id].tsx               # Category-filtered content list screen
│   ├── chalisa/
│   │   └── [id].tsx               # Chalisa detail view & audio player
│   ├── festival_aarti/
│   │   └── [id].tsx               # Festival Aarti detail view & audio player
│   ├── mantra/
│   │   └── [id].tsx               # Mantra detail view (Collapsing Header, Audio player, Meaning, Benefits)
│   ├── pooja_vidhi/
│   │   └── [id].tsx               # Step-by-step Pooja Vidhi procedure guide
│   ├── search/
│   │   └── index.tsx              # Global multi-entity real-time search engine
│   ├── stotra/
│   │   └── [id].tsx               # Sacred Stotra detail view
│   ├── vrat_katha/
│   │   └── [id].tsx               # Vrat Katha fasting story detail view
│   ├── _layout.tsx                # App root provider wrapper (Auth & Favorites Contexts)
│   ├── index.tsx                  # Root entry router redirect
│   ├── login.tsx                  # 2-Step OTP Authentication Screen
│   └── upanishad.tsx              # Ancient Upanishads library screen
├── assets/                        # Static Assets (Logos, App Icons, Splash Screens)
├── backend/                       # Backend PHP APIs & Server Scripts
│   ├── api/                       # API Endpoints (v1 namespace with legacy rewrite)
│   │   ├── auth/                  # send_otp.php, verify_otp.php, verify_session.php
│   │   ├── favorites/             # sync.php
│   │   ├── jaap/                  # sync.php
│   │   └── mantras/               # read.php, read_single.php, daily.php, featured.php
│   ├── config/                    # database.php, headers.php, rate_limit.php
│   └── scripts/                   # pregenerate_audio.php (TTS batch rendering)
├── src/                           # Shared Application Source Code
│   ├── components/                # Modular UI Components
│   │   ├── CosmicBackground.tsx   # Animated gradient cosmic background layer
│   │   └── CustomTabBar.tsx       # Custom bottom tab navigation bar
│   ├── constants/                 # Theme tokens & design system
│   │   └── theme.ts               # Palette colors, typography, spacing, shadows
│   ├── contexts/                  # React Context Providers (Global State)
│   │   ├── AuthContext.tsx        # Auth state, OTP handling, session verification, Device UUID
│   │   └── FavoritesContext.tsx   # Persistent favorite item toggle & set-union cloud sync
│   ├── services/                  # Business Logic & Backend Connectors
│   │   ├── api.ts                 # Axios HTTP client connecting to /api/v1 endpoints
│   │   ├── audioDownloader.ts     # Offline audio download service using expo-file-system
│   │   ├── db.ts                  # SQLite database initialization & WAL mode setup
│   │   ├── queryClient.ts         # TanStack React Query client with SQLite persister
│   │   ├── storage.ts             # SQLite storage (Jaap logs, search history, played items)
│   │   ├── storageMigration.ts    # One-time SecureStore to SQLite data migration
│   │   └── syncManager.ts         # Multi-device cloud sync manager (Jaap & Favorites)
│   ├── types/                     # TypeScript Interfaces & Definitions
│   │   └── navigation.ts          # Route param lists, Mantra interface, CanonicalEntity
│   └── utils/                     # Utility Functions & Helpers
│       ├── audioPlayer.ts         # Audio playback controller using expo-audio
│       ├── categoryHelper.ts      # Visual theme mapping (icons/colors) per category
│       └── normalizer.ts          # Canonical entity schema normalizer
├── SCHEMA.md                      # Canonical schema reference for AI ingestion
├── app.json                       # Expo configuration manifest (SDK 57, bundle ID, orientation)
├── eslint.config.js               # Code quality linting rules
├── package.json                   # Dependencies & build scripts (Expo SDK 57)
└── tsconfig.json                  # TypeScript compiler settings
```

---

## ⚡ 3. Core App Features & Technical Architecture

### 3.1 Content Delivery & Multilingual Text System
* **Devanagari Font System:** Uses `@expo-google-fonts/tiro-devanagari-hindi` to ensure high-fidelity rendering of Sanskrit Devanagari ligatures.
* **Transliteration & Translations:** Supports side-by-side script viewing with English transliteration, English translation, Hindi translation, and regional language translations.
* **Canonical Data Schema:** Normalized entity attributes (`normalizeEntity`) ensuring uniform access across screens while preserving backward-compatible fields in API responses.

### 3.2 Mantra Jaap / Japa Mala Counter Engine
* **Dynamic Goal Targets:** Selectable mala goals ($21, 54, 108, 1008$).
* **Tactile Haptic Feedback:** Light haptic vibration on single taps; notification feedback sequence upon completing a mala round.
* **Persistent Daily Log System:** Taps are logged to SQLite (`expo-sqlite`) date-wise (`YYYY-MM-DD`), maintaining a 90-day rolling history of total chants and completed malas.

### 3.3 Audio Engine & Server-Hosted Audio
* **Audio Player Component:** Built using `expo-audio` with safe audio mode configuration (`setAudioModeAsync`).
* **Server-Hosted Audio Guarantee:** All playable entities feature server-hosted MP3 audio pre-rendered via official Google Cloud / Azure TTS (`backend/scripts/pregenerate_audio.php`). Runtime fallback calls to third-party TTS services have been completely eliminated.

### 3.4 2-Step OTP Auth & Security Architecture
* **Hardware Device ID Resolution:** Native Android ID (`Application.getAndroidId()`) or iOS Vendor ID (`Application.getIosIdForVendorAsync()`), with cryptographically secure fallback (`expo-crypto` UUID).
* **Token Storage:** Encrypted credential storage via `expo-secure-store`.
* **Rate Limiting & Hardening:** Dual IP and Email rate limiting (HTTP 429 response), 5-attempt OTP lock, 10-minute expiry, single-use deletion, and SHA-256 hashed storage.

---

## 🌐 4. API Endpoints Catalog & Specifications

**Base URL:** `https://mantra.aarambhtech.in/api/v1` (with `/api/*` rewrite support)

### 4.1 Content APIs

| Endpoint | Method | Query Parameters | Description | Sample Response Structure |
|---|---|---|---|---|
| `/categories/read.php` | `GET` | None | Lists all mantra categories | `{ "records": [{ "id": 1, "name": "Shiva", "count": 18 }] }` |
| `/mantras/read.php` | `GET` | `category_id` (optional) | Retrieves mantras (all or filtered) | `{ "records": [{ "id": 1, "name": "Om Namah Shivaya", ... }] }` |
| `/mantras/read_single.php` | `GET` | `id` | Fetches full mantra details (canonical + legacy) | `{ "id": 1, "name": "...", "sanskrit": "...", "deity": "..." }` |
| `/mantras/featured.php` | `GET` | None | Returns featured home screen mantras | `{ "records": [...] }` |
| `/mantras/daily.php` | `GET` | None | Returns Daily Mantra selection | `{ "id": "1", "name": "Om Namah Shivaya", ... }` |
| `/upanishads/read.php` | `GET` | None | Lists Upanishads collection | `{ "records": [...] }` |
| `/upanishads/read_single.php` | `GET` | `id` | Upanishad detail item | `{ "id": "u_1", "name": "Isha Upanishad", ... }` |
| `/aartis/read.php` | `GET` | None | Returns sacred Aartis | `{ "records": [...] }` |
| `/aartis/read_single.php` | `GET` | `id` | Single Aarti details | `{ "id": 1, "aarti_name": "Jai Ganesh Deva", ... }` |
| `/festival_aartis/read.php` | `GET` | None | Returns festival-specific Aartis | `{ "records": [...] }` |
| `/chalisas/read.php` | `GET` | None | Returns Hanuman/Durga Chalisas | `{ "records": [...] }` |
| `/pooja_vidhis/read.php` | `GET` | None | Returns step-by-step ritual guides | `{ "records": [...] }` |
| `/stotras/read.php` | `GET` | None | Returns sacred Stotras | `{ "records": [...] }` |
| `/vrat_kathas/read.php` | `GET` | None | Returns fasting stories (Kathas) | `{ "records": [...] }` |

### 4.2 Auth & Sync APIs

| Endpoint | Method | Payload / Headers | Description |
|---|---|---|---|
| `/auth/send_otp.php` | `POST` | `{ "email": "...", "full_name": "..." }` | Sends 6-digit OTP (Rate limited: 3/10m per email, 10/h per IP) |
| `/auth/verify_otp.php` | `POST` | `{ "email": "...", "otp": "...", "device_id": "...", "device_name": "..." }` | Verifies hashed OTP (Max 5 attempts, single-use) |
| `/auth/verify_session.php` | `POST` | `{ "user_id": 1, "login_token": "...", "device_id": "..." }` | Validates session token & device binding |
| `/jaap/sync.php` | `POST`/`GET` | `{ "user_id": 1, "login_token": "...", "device_id": "...", "jaap_logs": [...] }` | Jaap log cloud sync (last-write-wins per date) |
| `/favorites/sync.php` | `POST`/`GET` | `{ "user_id": 1, "login_token": "...", "device_id": "...", "favorites": [...] }` | Favorites set-union sync with tombstones |

---

## 📊 5. Core Data Models & Canonical Schemas

### 5.1 Canonical Entity Schema (`CanonicalEntity`)
Documented in `SCHEMA.md` for AI ingestion:
```typescript
export interface CanonicalEntity {
  id: string | number;
  name: string;
  deity: string;
  sanskrit: string;
  transliteration?: string;
  translation_en?: string;
  translation_hi?: string;
  meaning?: string | string[];
  benefits?: Array<{ icon: string; text: string }>;
  audio_url?: string;
  category_id?: number;
  category_name?: string;
  [key: string]: any; // Preserves legacy fields
}
```

### 5.2 Jaap Daily Log Model (`JaapLogItem`)
```typescript
export interface JaapLogItem {
  date: string;          // ISO Date format (YYYY-MM-DD)
  formattedDate: string; // Human readable string e.g. "5 Oct 2026"
  totalChants: number;   // Total tap count recorded for the day
  completedMalas: number;// Number of completed 108/54/21 mala rounds
}
```

---

## 🤖 6. AI LAYER INTEGRATION BLUEPRINT (FOR THE AI TEAM)

```
                                  +---------------------------------------+
                                  |         MANTRA MOBILE APP             |
                                  |      (React Native / Expo SDK 57)     |
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTP / WebSocket
                                                      v
                                  +-------------------+-------------------+
                                  |           AI MIDDLEWARE LAYER         |
                                  |       (FastAPI / Python Service)      |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +----------------------+
                     |                                                                 |
                     v                                                                 v
+--------------------+--------------------+                       +--------------------+--------------------+
|         VECTOR DB / RAG ENGINE          |                       |       VOICE & AUDIO EVALUATOR AI          |
|    (PgVector / Weaviate / Pinecone)     |                       |    (Sanskrit Whisper / Wav2Vec2 STT)    |
| - Sacred Scriptures, Upanishads & Veda  |                       | - Real-time Sanskrit Pronunciation Check |
| - Mantra Meanings & Astrological Context|                       | - Cadence, Chanting Pitch & Phoneme score |
+-----------------------------------------+                       +-----------------------------------------+
```

### 6.1 Feature 1: AI Spiritual Assistant & Conversational Guru (RAG Engine)
* **Goal:** Enable devotees to interact with a conversational AI agent for spiritual guidance.
* **Architecture:** RAG Pipeline reading canonical schemas defined in `SCHEMA.md`.
* **Middleware Endpoint:** `/api/v1/ai/chat` (Streaming Response via Server-Sent Events / SSE).

### 6.2 Feature 2: Real-time Voice & Pronunciation Evaluator
* **Goal:** Rate pronunciation accuracy, rhythm, and Vedic accent using fine-tuned Whisper / Wav2Vec2 models.

---

## 🛠️ 7. Development Quickstart & Setup

1. **Clone & Install Dependencies:**
   ```bash
   cd d:\MobileApps\mantra\mantra
   npm install
   ```

2. **Environment Variables Config (`.env`):**
   ```env
   EXPO_PUBLIC_API_URL=https://mantra.aarambhtech.in/api/v1
   EXPO_PUBLIC_AI_SERVICE_URL=https://ai.aarambhtech.in/v1
   ```

3. **Start Development Server:**
   ```bash
   npx expo start
   ```

---

## 🔄 8. API Changes & Architecture Updates

| Area | Prior State | Updated Architecture |
|---|---|---|
| **API Namespace** | `/api/*` | `/api/v1/*` primary with `.htaccess` alias rules for backwards compatibility |
| **OTP Security** | Unrestricted plain-text OTPs | Dual rate-limiting (3/10m per email, 10/h per IP), max 5 verify attempts, SHA-256 hashing |
| **TTS Audio** | Runtime Google Translate TTS scraping | Official server-rendered MP3s (`pregenerate_audio.php`) hosted on backend |
| **Audio Engine** | `expo-av` | `expo-audio` native module on SDK 57 |
| **Local Storage** | `expo-secure-store` for history & logs | `expo-sqlite` WAL mode with one-time count-verified migration script |
| **Caching Engine** | Cache-busting `?t=timestamp` query params | TanStack React Query persistent client with SQLite offline storage & audio file caching |
| **Data Schema** | Heterogeneous field keys (`name`/`title`/`aarti_name`) | Single canonical schema (`normalizeEntity`, `SCHEMA.md`) maintaining legacy fields |
| **Cloud Sync** | Local-only state | `/v1/jaap/sync` (last-write-wins) & `/v1/favorites/sync` (set-union with tombstones) |

---
*Documentation maintained by AI Engineering Team & Core Mobile Developers.*
