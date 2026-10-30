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
* **Canonical Treasury & Interactive Archana (नामार्चन) Mode:** 40 live canonical Stotras & Suktas (including Pancha-Devata Sahasranamas, 108 Ashtottara Namavalis, Maha Vedic Suktas, Protective Kavachas, and Revered Ashtakams), 11 complete Chalisas, and 2,040 mantras on Hostinger Cloud MySQL (`u885706413_mantra`). Supported by dual-mode `[ 📖 श्लोक पाठ | 🌸 नामार्चन ]` ScriptureReader with tap-to-offer Pushpanjali counters and natural Indic TTS vocalization.
* **On-Device Astronomical Panchang & Sacred Yantras:** Real-time ephemeris calculator for Tithi, Nakshatra, Yoga, Brahma Muhurta, Rahu Kaal, and Choghadiya, accompanied by vector sacred geometry (Sri Yantra, Shiva Yantra, Gayatri Yantra) for Trātaka meditation sessions.
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
    │   │   ├── categories.tsx     # Category exploration screen (Curated deities & 11 sub-sections)
    │   │   ├── favorites.tsx      # Saved items tab (ScriptureCard & EmptyState)
    │   │   ├── index.tsx          # Home Screen (JapaOrb, Liturgical Tabs, Curated Deities, Panchang)
    │   │   └── profile.tsx        # Devotee Profile, DPDP Consent toggles, Jaap logs
    │   ├── aarti/                 # Sacred Aarti Sangrah & Hymns
    │   │   ├── index.tsx          # Dedicated Aarti directory screen with deity filtering & search
    │   │   └── [id].tsx           # Sacred Aarti detail view (ScriptureReader)
    │   ├── category/[id].tsx      # Category-filtered content list screen
    │   ├── chalisa/               # Complete Devotional Chalisas
    │   │   ├── index.tsx          # Chalisa Sangrah directory
    │   │   └── [id].tsx           # Chalisa detail view (ScriptureReader)
    │   ├── festival_aarti/        # Festive Season Special Aartis
    │   │   ├── index.tsx          # Dedicated Festival Aarti directory with festival filters
    │   │   └── [id].tsx           # Festival Aarti detail view (ScriptureReader)
    │   ├── mantra/[id].tsx        # Mantra detail view (Active Tab TTS & ScriptureReader)
    │   ├── pooja_vidhi/           # Step-by-step Pooja Vidhi & Samagri
    │   │   ├── index.tsx          # Pooja Vidhi directory
    │   │   └── [id].tsx           # Step-by-step Pooja Vidhi (ScriptureReader)
    │   ├── search/index.tsx       # Global multi-entity real-time search engine
    │   ├── stotra/                # Sacred Stotras, Suktas & Sahasranama
    │   │   ├── index.tsx          # Stotra directory with Suktas & Hymns
    │   │   └── [id].tsx           # Sacred Stotra detail view (ScriptureReader)
    │   ├── vrat_katha/            # Vrat Kathas fasting stories
    │   │   ├── index.tsx          # Vrat Katha directory
    │   │   └── [id].tsx           # Vrat Katha fasting story (ScriptureReader)
    │   ├── _layout.tsx            # Global Tiro Devanagari font preloader, ShantiBanner & theme
    │   ├── index.tsx              # Root router redirect to tabs
    │   ├── login.tsx              # 2-Step OTP Authentication Screen (with sweet Shanti rate limit)
    │   ├── consent.tsx            # Granular DPDP Consent Manager
    │   ├── privacy.tsx            # In-app DPDP Data Rights Policy
    │   └── upanishad.tsx          # Ancient Upanishads library screen
    ├── assets/images/             # App icons, splash, and logos
    ├── src/
    │   ├── components/            # Unified Cosmic Vedic Component Library (14 components)
    │   │   ├── AudioPlayerBar.tsx # Docked audio playback scrubber
    │   │   ├── CosmicBackground.tsx # Celestial dark canvas with radiant nebulae
    │   │   ├── CustomTabBar.tsx   # Celestial glass bottom navigation dock
    │   │   ├── EmptyState.tsx     # Serene devotional empty states
    │   │   ├── GlassCard.tsx      # Frosted glass card with glow variants
    │   │   ├── GlassHeader.tsx    # Unified header with 48x48dp touch targets
    │   │   ├── JapaOrb.tsx        # Pulsing Golden Chanting Orb with goal tracking
    │   │   ├── PanchangCard.tsx   # Real-time Hindu calendar & Muhurta widget
    │   │   ├── SankalpaProgressCard.tsx # Active Anushthan & Sankalpa tracker
    │   │   ├── ScriptureCard.tsx  # Devanagari verse item with favorite toggle
    │   │   ├── ScriptureReader.tsx# Unified scripture engine with active-tab TTS chanting
    │   │   ├── SearchBar.tsx      # Dark glass search bar with clear button
    │   │   ├── ShantiBanner.tsx   # Ambient Shanti Sanctuary floating rate-limit toast
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
* **Consolidated Scripture Reader (`ScriptureReader.tsx`):** All 7 detail categories use `<ScriptureReader />` with adjustable font size scaling (`A-`/`A+`) and segmented views.
* **Pooja Vidhi Step Cards & Samagri Architecture:** Dedicated ritual viewer converting backend JSON step arrays into interactive, numbered step cards (`चरण १, २...`) with progress tracking checkmarks, individual step chant buttons, a dedicated "पूजा सामग्री (Samagri)" preparation checklist with item quantities, and ceremony details (Duration, Best Time, Day, Benefits, Precautions).

### 3.2 Mantra Jaap / Japa Mala Counter Engine
* **Tactile Japa Orb:** Interactive 220dp Golden Orb (`JapaOrb.tsx`) with dynamic goal targets ($21, 54, 108, 1008$) and radial pulsing animations.
* **Tactile Haptic Feedback:** Light haptic vibration on single taps; notification feedback sequence upon completing a mala round.
* **Persistent Daily Log System:** Taps are logged to SQLite (`mantra_devotion.db`) date-wise (`YYYY-MM-DD`), maintaining a 90-day rolling history of total chants and completed malas.

### 3.3 Audio Engine, Neural Voice Synthesis & Japa Looping
* **Audio Player Component:** Built using `expo-audio` with safe audio mode configuration and full URL resolution for Hostinger server media uploads.
* **Devotional Neural Speech Synthesis:** When custom studio audio is absent or when devotees tap to chant a verse or step, the app synthesizes reverent Devanagari pronunciation locally using `expo-speech` with automatic device neural voice selection (prioritizing Google WaveNet / Neural2 and Apple Enhanced Siri voices) tuned with deep devotional pitch ($0.95$) and meditative chanting cadence ($0.80$).
* **Strict Vocalization Sanitization:** Enforces strict regex validation discarding any URL schemes (`http://`, `https://`, `file://`), file extensions (`.mp3`, `.wav`), and filesystem paths, guaranteeing that audio locations are never spoken aloud.
* **Japa Repetition & Loop Selector:** Top-docked presets (`1x`, `11x`, `21x`, `108x`, `∞`) with live cycle counters (`जप चक्र: 1 / 108`) for tracking completed repetitions during daily prayer.
* **Coming-Soon Availability Indicator:** Gracefully displays "ध्वनि रिकॉर्डिंग जल्द उपलब्ध होगी" with disabled controls when recordings are not yet available on the server.

### 3.4 2-Step OTP Auth & Security Architecture
* **Hardware Device ID Resolution:** Native Android ID (`Application.getAndroidId()`) or iOS Vendor ID (`Application.getIosIdForVendorAsync()`), with cryptographically secure fallback (`expo-crypto` UUID).
* **Token Storage:** Encrypted credential storage via `expo-secure-store`.
* **HMAC-SHA256 OTP Verification:** All OTP verification runs server-side with secret pepper and constant-time string comparison (`hash_equals()`).

### 3.5 Sacred Astronomical Panchang & Muhurta Subsystem
* **On-Device Ephemeris Engine (`panchangEngine.ts`):** Calculates local solar/lunar astronomical timings without external APIs or telemetry: Sunrise, Sunset, Solar Noon, Tithi (1–30), Paksha (Shukla/Krishna), Nakshatra (27 lunar mansions), and Yoga.
* **Auspicious Muhurta Windows:** Calculates Brahma Muhurta (96–48 min before sunrise), Pratah Sandhya, Abhijit Muhurta (solar noon victory window), and Sayam Sandhya.
* **Caution & Choghadiya:** Calculates Rahu Kaal, Yamaganda, and 8-period Day Choghadiya tables (Amrit, Shubh, Labh, Char, Rog, Kaal, Udveg).
* **Home Screen Integration:** Rendered as a glassmorphic `<PanchangCard />` with dedicated detail navigation (`/panchang`).

### 3.6 Multi-Day Sankalpa & Anushthan Subsystem
* **Local SQLite Vow Persistence (`sankalpaStorage.ts`):** Implements `user_anushthans` table managing active and historical multi-day vows.
* **Shastric Presets & Custom Vows:** Templates for 21-Day Gayatri Sadhana, 40-Day Hanuman Chalisa, 16-Somvar Vrat, and 9-Day Navratri Chandi Path.
* **JapaOrb Auto-Sync:** Chanting on the Home Screen `JapaOrb` directly increments active Sankalpa beads and daily quotas.
* **Dashboard & Poorna-Ahuti:** Dedicated dashboard (`/sankalpa`) with streak tracking and completion ceremony.

### 3.7 Dynamic Sacred Yantra & Trātaka Meditation Subsystem
* **Pure Mathematical Vector SVGs (`src/components/yantras/`):**
  - **Sri Yantra:** 9 interlocking Shiva/Shakti triangles (43 sub-triangles), 24 lotus petals, 3 Mekhala circles, and 4-gate Bhupura citadel.
  - **Shiva Yantra:** Shatkona hexagram geometry with 12 petals and central Bindu.
  - **Gayatri Yantra:** 24 solar petals representing Gayatri syllables with central Savitur Bindu.
* **Fullscreen Trātaka Visual Focus (`app/yantra/[id].tsx`):** Immersive dark mode session with breath-synchronized Bindu pulsing (Sama Vritti 4s-4s-4s-4s), session timer (3m, 5m, 11m, 21m), and haptic completion bells.

---

## 🌐 4. API Endpoints Catalog & Specifications

**Base URL:** `https://mantra.aarambhtech.in/api`

> [!IMPORTANT]
> **App-Only API Access Policy & Sliding Window Rate Limiting:**
> - Direct web browser API requests are disabled (HTTP 403 Forbidden). Content APIs require the cryptographic mobile signature `X-App-Key: m_app_c0sm1c_...`.
> - Rate limits are tracked across a sliding window per **1 App, 1 Mobile Device, 1 User Account, 1 Unique Key**:
>   - **5 calls / minute** (60s sliding window)
>   - **15 calls / hour** (3600s sliding window)
>   - **100 calls / day** (86400s sliding window)
> - All scripture read endpoints utilize an NVMe server-side response cache with HTTP 304 ETag revalidation for $<1\text{ms}$ latency and zero redundant bandwidth consumption.

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
| `/vrat_kathas/read.php` | `GET` | `t={timestamp}`, `category` | Returns fasting stories & sacred narratives (Kathas) | `{ "records": [...] }` |
| `/vrat_kathas/read_single.php` | `GET` | `id={katha_id}` | Returns single Katha with chapters, translations & rituals | `{ "id": "katha_satyanarayan", ... }` |

### 4.2 Auth APIs

| Endpoint | Method | Payload | Description |
|---|---|---|---|
| `/auth/send_otp.php` | `POST` | `{ "email": "user@example.com", "full_name": "Devotee" }` | Sends 6-digit OTP code to devotee's email from `no-reply@mantra.aarambhtech.in` |
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
