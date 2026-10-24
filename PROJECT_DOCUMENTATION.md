# 📜 MANTRA APP — PROJECT DOCUMENTATION & AI LAYER BLUEPRINT

> **Target Audience:** AI Engineering Team, Mobile Developers, and System Architects  
> **Document Purpose:** Complete architectural breakdown, folder structure, data schemas, API catalog, state management, and actionable blueprints for integrating an AI Layer into the Mantra mobile ecosystem.  
> **Date:** October 2026 | **Version:** 1.0.0

---

## 📍 1. Executive Summary & Project Nature

### 1.1 Project Overview
**Mantra** is a state-of-the-art Vedic & Spiritual mobile application built with **React Native / Expo SDK 57** and a lightweight, high-performance **PHP RESTful Backend**. The application serves as a sacred digital companion for devotees, offering access to authentic Sanskrit Mantras, Chalisas, Aartis, Festival Aartis, Pooja Vidhis, Stotras, Vrat Kathas, and ancient Upanishads.

### 1.2 Key System Characteristics
* **Cross-Platform Mobile Client:** Universal Expo app running seamlessly on Android, iOS, and Web (`expo-router` v4 file-based routing).
* **Rich Devanagari Typography:** Custom Google Font integration (`TiroDevanagariHindi_400Regular`) with generous line-height scaling (`fontSize * 1.6`) for zero-clipping Sanskrit conjunct ligatures.
* **Interactive Devotion Tools:** Tactile **Mantra Jaap / Japa Mala Counter Orb** (`JapaOrb.tsx`) with haptic feedback (`expo-haptics`), target mala goals (21, 54, 108, 1008), radial pulsing animations, and date-wise persistent logging.
* **Offline Devotional Storage Partitioning:** Partitioned storage architecture using local SQLite (`mantra_devotion.db`) for Jaap counts, favorite bookmarks, and search history, with `expo-secure-store` reserved strictly for hardware-backed auth tokens and device UUIDs.
* **Smart Offline Audio Engine:** Built on `expo-audio` with offline native `expo-speech` (`hi-IN`) devotional voice synthesis fallback for Sanskrit Devanagari pronunciation when custom studio recordings are absent (zero third-party web scraping).
* **2-Step Passwordless OTP Authentication:** Login using email-based 6-digit OTP verification bound with cryptographically generated device fingerprints and HMAC-SHA256 server verification with constant-time `hash_equals()`.
* **DPDP Act 2023 & Google Play Compliance:** Granular consent toggles on first launch, in-app export & deletion flows, and public web deletion portal (`https://mantra.aarambhtech.in/delete-account.html`).

---

## 📁 2. Complete Folder & Directory Structure

```
d:\MobileApps\mantra/
├── docs/                          # Comprehensive Architectural & System Specifications
│   ├── ADMIN_AND_STATS.md         # 150 Real-data metrics & 8 sub-dashboards
│   ├── AGENTS.md                  # Multi-agent Vedic swarm architecture
│   ├── AUTHENTICATION.md          # 2-step OTP & device binding lifecycle
│   ├── BRD.md                     # Business requirements & OKRs
│   ├── DB_DESIGN.md               # SQLite client & MySQL server schemas
│   ├── DEPLOYMENT.md              # EAS pipelines, Hostinger cloud & web portal
│   ├── MEMORY.md                  # 4-tier AI memory hierarchy & DPDP purge
│   ├── PRD.md                     # Product requirements & user stories
│   ├── RULES.md                   # Sacred product covenant (zero ads, zero superstition)
│   ├── SECURITY_MEASURES_AND_PRACTICES.md # STRIDE threat model & HMAC verification
│   ├── SYSTEM_ARCHITECTURE.md     # Multi-tier topology & boundaries
│   ├── SYSTEM_DESIGN.md           # Component hierarchy & algorithm specs
│   ├── TRD.md                     # Technical requirements & test plan
│   ├── UI_DESIGN.md               # Cosmic Vedic Glassmorphism tokens & component library
│   └── UX_DESIGN.md               # Devotional flows & accessibility guidelines
├── web/                           # Public Web Portal & Admin Console (Hostinger Cloud)
│   ├── index.html                 # Mobile App Showcase landing page (zero mantras, zero tech refs)
│   ├── privacy.html               # Public DPDP Act 2023 & Google Play privacy policy
│   ├── delete-account.html        # Public Google Play account deletion portal
│   ├── terms.html                 # Terms of Service & Devotional use covenant
│   ├── support.html               # Devotee Support Center & FAQ
│   ├── admin/                     # Unlisted Admin Governance Console (Direct /admin/login.php)
│   │   ├── login.php              # 2-step OTP portal with strict sliding window rate limiting
│   │   ├── index.php              # Executive Dashboard with 10 AI Insights & live telemetry
│   │   └── scriptures.php         # Scriptural Content CMS
│   └── includes/                  # Web Security & Analytics Engine
│       ├── security.php           # Sliding window rate limiter & CSRF defense
│       ├── db.php                 # MySQL 8.0 schema manager & fallback
│       └── analytics.php          # 150 live telemetry metric calculators
│   ├── .well-known/assetlinks.json# Android App Links SHA-256 release fingerprint
│   └── api/                       # Telemetry ingestion & public deletion API
└── mantra/                        # Mobile Application Source (React Native / Expo SDK 57)
    ├── app/                       # Expo Router File-Based Routing System
    │   ├── (tabs)/                # Main Bottom Tab Navigator Screens
    │   │   ├── _layout.tsx        # Custom tab bar layout & icon routing
    │   │   ├── categories.tsx     # Category exploration screen (GlassCard & search)
    │   │   ├── favorites.tsx      # Saved items tab (ScriptureCard & EmptyState)
    │   │   ├── index.tsx          # Home Screen (JapaOrb, Daily Mantra, Audio player)
    │   │   └── profile.tsx        # Devotee Profile, DPDP Consent toggles, Jaap logs
    │   ├── aarti/[id].tsx         # Sacred Aarti detail view (ScriptureReader)
    │   ├── category/[id].tsx      # Category-filtered content list screen
    │   ├── chalisa/[id].tsx       # Chalisa detail view (ScriptureReader)
    │   ├── festival_aarti/[id].tsx# Festival Aarti detail view (ScriptureReader)
    │   ├── mantra/[id].tsx        # Mantra detail view (ScriptureReader)
    │   ├── pooja_vidhi/[id].tsx   # Step-by-step Pooja Vidhi (ScriptureReader)
    │   ├── search/index.tsx       # Global multi-entity real-time search engine
    │   ├── stotra/[id].tsx        # Sacred Stotra detail view (ScriptureReader)
    │   ├── vrat_katha/[id].tsx    # Vrat Katha fasting story (ScriptureReader)
    │   ├── _layout.tsx            # Global Tiro Devanagari font preloader & theme
    │   ├── index.tsx              # Root router redirect to tabs
    │   ├── login.tsx              # 2-Step OTP Authentication Screen
    │   ├── consent.tsx            # Granular DPDP Consent Manager
    │   ├── privacy.tsx            # In-app DPDP Data Rights Policy
    │   └── upanishad.tsx          # Ancient Upanishads library screen
    ├── assets/images/             # App icons, splash, and logos
    ├── src/
    │   ├── components/            # Unified Cosmic Vedic Component Library (12 components)
    │   │   ├── AudioPlayerBar.tsx # Docked audio playback scrubber
    │   │   ├── CosmicBackground.tsx # Celestial dark canvas with radiant nebulae
    │   │   ├── CustomTabBar.tsx   # Celestial glass bottom navigation dock
    │   │   ├── EmptyState.tsx     # Serene devotional empty states
    │   │   ├── GlassCard.tsx      # Frosted glass card with glow variants
    │   │   ├── GlassHeader.tsx    # Unified header with 48x48dp touch targets
    │   │   ├── JapaOrb.tsx        # Pulsing Golden Chanting Orb with goal tracking
    │   │   ├── ScriptureCard.tsx  # Devanagari verse item with favorite toggle
    │   │   ├── ScriptureReader.tsx# Unified scripture engine for all 7 detail routes
    │   │   ├── SearchBar.tsx      # Dark glass search bar with clear button
    │   │   ├── SkeletonLoader.tsx # Shimmering dark glass skeleton loader
    │   │   └── SpiritualButton.tsx# Radiant saffron gradient & glass buttons
    │   ├── constants/theme.ts     # Cosmic Vedic Glassmorphism tokens & Typography
    │   ├── contexts/              # Global state (AuthContext, FavoritesContext)
    │   ├── services/              # API client, SQLite database, syncManager, storage
    │   ├── types/navigation.ts    # TypeScript interfaces & route parameters
    │   └── utils/                 # AudioPlayer (expo-audio & Speech), scriptureParser
    ├── app.json                   # Expo configuration manifest with verified App Links
    ├── package.json               # Dependencies (Expo SDK 57, React Native 0.86.3)
    └── release.keystore           # Production Android signing certificate
```

---

## ⚡ 3. Core App Features & Technical Architecture

### 3.1 Content Delivery & Multilingual Text System
* **Devanagari Font System:** Uses `@expo-google-fonts/tiro-devanagari-hindi` to ensure high-fidelity rendering of Sanskrit Devanagari ligatures.
* **Transliteration & Translations:** Supports side-by-side script viewing with English transliteration, English translation, Hindi translation, and regional language translations.
* **Consolidated Scripture Reader:** All 7 detail categories use `<ScriptureReader />` with adjustable font size scaling (`A-`/`A+`) and segmented views.

### 3.2 Mantra Jaap / Japa Mala Counter Engine
* **Tactile Japa Orb:** Interactive 220dp Golden Orb (`JapaOrb.tsx`) with dynamic goal targets ($21, 54, 108, 1008$) and radial pulsing animations.
* **Tactile Haptic Feedback:** Light haptic vibration on single taps; notification feedback sequence upon completing a mala round.
* **Persistent Daily Log System:** Taps are logged to SQLite (`mantra_devotion.db`) date-wise (`YYYY-MM-DD`), maintaining a 90-day rolling history of total chants and completed malas.

### 3.3 Audio Engine & Voice Synthesis Fallback
* **Audio Player Component:** Built using `expo-audio` with safe audio mode configuration.
* **Devotional Speech Voice Fallback:** When custom studio audio is absent, the app synthesizes reverent Devanagari pronunciation locally using `expo-speech` configured with deep devotional pitch ($0.92$) and slower chanting cadence ($0.82$).

### 3.4 2-Step OTP Auth & Security Architecture
* **Hardware Device ID Resolution:** Native Android ID (`Application.getAndroidId()`) or iOS Vendor ID (`Application.getIosIdForVendorAsync()`), with cryptographically secure fallback (`expo-crypto` UUID).
* **Token Storage:** Encrypted credential storage via `expo-secure-store`.
* **HMAC-SHA256 OTP Verification:** All OTP verification runs server-side with secret pepper and constant-time string comparison (`hash_equals()`).

---

## 🌐 4. API Endpoints Catalog & Specifications

**Base URL:** `https://mantra.aarambhtech.in/api`

### 4.1 Content APIs

| Endpoint | Method | Query Parameters | Description | Sample Response Structure |
|---|---|---|---|---|
| `/categories/read.php` | `GET` | None | Lists all mantra categories | `{ "records": [{ "id": 1, "name": "Shiva", "count": 18 }] }` |
| `/mantras/read.php` | `GET` | `category_id` (optional) | Retrieves mantras (all or filtered) | `{ "records": [{ "id": 1, "name": "Om Namah Shivaya", ... }] }` |
| `/mantras/read_single.php` | `GET` | `id` | Fetches full mantra details | `{ "id": 1, "sanskrit": "ॐ नमः शिवाय", "meaning": [...] }` |
| `/mantras/featured.php` | `GET` | None | Returns featured home screen mantras | `{ "records": [...] }` |
| `/mantras/daily.php` | `GET` | None | Returns Daily Mantra selection | `{ "id": "1", "name": "Om Namah Shivaya", ... }` |
| `/upanishads/read.php` | `GET` | `t={timestamp}` | Lists Upanishads collection | `{ "records": [...] }` |
| `/upanishads/read_single.php` | `GET` | `id`, `t={timestamp}` | Upanishad detail item | `{ "id": "u_1", "name": "Isha Upanishad", ... }` |
| `/aartis/read.php` | `GET` | `t={timestamp}` | Returns sacred Aartis | `{ "records": [...] }` |
| `/aartis/read_single.php` | `GET` | `id`, `t={timestamp}` | Single Aarti details | `{ "id": 1, "aarti_name": "Jai Ganesh Deva", ... }` |
| `/festival_aartis/read.php` | `GET` | `t={timestamp}` | Returns festival-specific Aartis | `{ "records": [...] }` |
| `/chalisas/read.php` | `GET` | `t={timestamp}` | Returns Hanuman/Durga Chalisas | `{ "records": [...] }` |
| `/pooja_vidhis/read.php` | `GET` | `t={timestamp}` | Returns step-by-step ritual guides | `{ "records": [...] }` |
| `/stotras/read.php` | `GET` | `t={timestamp}` | Returns sacred Stotras | `{ "records": [...] }` |
| `/vrat_kathas/read.php` | `GET` | `t={timestamp}` | Returns fasting stories (Kathas) | `{ "records": [...] }` |

### 4.2 Auth APIs

| Endpoint | Method | Payload | Description |
|---|---|---|---|
| `/auth/send_otp.php` | `POST` | `{ "email": "user@example.com", "full_name": "Devotee" }` | Sends 6-digit OTP code to user's email |
| `/auth/verify_otp.php` | `POST` | `{ "email": "...", "otp": "123456", "device_id": "...", "device_name": "..." }` | Verifies OTP code and returns session token |
| `/auth/verify_session.php` | `POST` | `{ "user_id": 1, "login_token": "...", "device_id": "..." }` | Validates session token & device binding |

---

## 📊 5. Core Data Models & Schemas

### 5.1 Mantra Data Model (`Mantra`)
```typescript
export interface Mantra {
  id: string | number;
  name?: string;
  mantra_name?: string;
  title?: string;
  god?: string;
  deity_name?: string;
  
  sanskrit?: string;
  sanskrit_text?: string;
  sanskrit_title?: string;
  transliteration?: string;
  
  translation_english?: string;
  translation_hindi?: string;
  translation_regional?: string;
  
  meaning?: string | string[];
  benefits?: Array<{ icon: string; text: string }>;
  
  category_id?: number;
  category_name?: string;
  audio_url?: string;
  views_count?: number;
  likes_count?: number;
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

### 5.3 Favorite Item Model (`FavoriteItem`)
```typescript
export interface FavoriteItem {
  id: string | number;
  name?: string;
  title?: string;
  god?: string;
  deity_name?: string;
  sanskrit?: string;
  category?: string;
  path?: string; // e.g., 'mantra', 'aarti', 'chalisa', 'pooja_vidhi', 'stotra', 'vrat_katha'
}
```

---

## 🤖 6. AI LAYER INTEGRATION BLUEPRINT (FOR THE AI TEAM)

This blueprint outlines the recommended AI features, architectural touchpoints, middleware design, vector storage, and data pipelines to integrate an advanced AI Layer into the Mantra mobile app.

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
* **Goal:** Enable devotees to interact with a conversational AI agent for spiritual guidance (e.g., *"Which mantra is recommended for anxiety during exams?"*, *"Explain the philosophical core of Isha Upanishad"*).
* **Architecture:**
  * **RAG Pipeline:** Vectorize all mantra texts, Sanskrit meanings, Upanishad verses, benefits metadata, and Vedic commentaries into a Vector DB (**PgVector** or **Qdrant**).
  * **Middleware Endpoint:** `/api/v1/ai/chat` (Streaming Response via Server-Sent Events / SSE).
  * **App Touchpoint:** Add an `AIChatScreen` or floating AI Guru assistant button in `app/(tabs)/index.tsx`.

### 6.2 Feature 2: Real-time Voice & Pronunciation Evaluator
* **Goal:** Analyze the user’s live audio stream while chanting Sanskrit mantras to rate pronunciation accuracy, rhythm, and Vedic accent.
* **Architecture:**
  * **Audio Capture:** Use `expo-av` recording API to stream PCM audio chunks or send recorded audio sample to AI service.
  * **Speech-to-Text Model:** Fine-tuned **Whisper / Wav2Vec2** model trained on Sanskrit phonemes and Devanagari script.
  * **Evaluation Metric:** Levenshtein Distance & Phoneme Error Rate (PER) comparing spoken audio transcript with canonical Devanagari text (`MANTRA_DATA.sanskrit`).
  * **App Touchpoint:** Extend `app/mantra/[id].tsx` with a **"Practice Pronunciation with AI"** interactive audio recorder widget.

### 6.3 Feature 3: Personalized AI Mantra Recommendation Engine
* **Goal:** Deliver context-aware, hyper-personalized mantra recommendations tailored to user devotional habits, current time of day (Brahma Muhurta, Pradosh), and user Jaap logs.
* **Architecture:**
  * **Input Signals:** Local Jaap history (`storage.getJaapLogs()`), user favorite categories (`FavoritesContext`), time of day, and optional astrological transit data (tithi/graha).
  * **Recommendation Algorithm:** Hybrid Filtering (Collaborative Filtering + Embedding Similarity on Mantra Benefits).
  * **App Touchpoint:** Dynamic "Recommended for You by AI" carousel on the Home Screen (`app/(tabs)/index.tsx`).

### 6.4 Feature 4: Interactive AI Pooja Vidhi Companion
* **Goal:** An AI-powered step-by-step voice guide that assists users during live rituals, listening for step completions and automatically advancing to the next step.
* **Architecture:**
  * **Voice Activity Detection (VAD):** Detect when user finishes reciting ritual slokas.
  * **App Touchpoint:** Enhanced workflow inside `app/pooja_vidhi/[id].tsx`.

---

## 🛠️ 8. Development Quickstart & AI Integration Setup

1. **Clone & Install Dependencies:**
   ```bash
   cd d:\MobileApps\mantra\mantra
   npm install
   ```

2. **Environment Variables Config (`.env`):**
   ```env
   EXPO_PUBLIC_API_URL=https://mantra.aarambhtech.in/api
   EXPO_PUBLIC_AI_SERVICE_URL=https://ai.aarambhtech.in/v1
   ```

3. **Start Development Server:**
   ```bash
   npx expo start
   ```

---
*Documentation maintained by AI Engineering Team & Core Mobile Developers.*
