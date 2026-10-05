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
* **Rich Devanagari Typography:** Custom Google Font integration (`TiroDevanagariHindi_400Regular`) for crystal-clear Sanskrit text rendering.
* **Interactive Devotion Tools:** Tactile **Mantra Jaap / Japa Mala Counter** with haptic feedback (`expo-haptics`), target mala goals (21, 54, 108, 1008), and 90-day date-wise persistent logging.
* **Smart Audio Engine:** Embedded Audio Player with smooth progress animations and a dynamic **Google Translate TTS fallback** engine for Sanskrit Devanagari pronunciation when custom audio recordings are absent.
* **Offline-First Security & State:** Local encryption and token storage using `expo-secure-store`, managing user session tokens, favorite bookmarks, and recent search history.
* **2-Step OTP Authentication:** Passwordless login using email-based 6-digit OTP verification bound with cryptographically generated device fingerprints.

---

## 📁 2. Complete Folder & Directory Structure

```
d:\MobileApps\mantra\mantra/
├── app/                           # Expo Router File-Based Routing System
│   ├── (tabs)/                    # Main Bottom Tab Navigator Screens
│   │   ├── _layout.tsx            # Custom tab bar layout & icon routing
│   │   ├── categories.tsx         # Category exploration screen (Grid & List view toggle)
│   │   ├── favorites.tsx          # Saved items tab (Mantras, Aartis, Chalisas, etc.)
│   │   ├── index.tsx              # Home Screen (Daily Mantra, Jaap Counter, Featured, Sub-menus)
│   │   └── profile.tsx            # Devotee Profile, Jaap Log History modal, App Preferences
│   ├── aarti/
│   │   └── [id].tsx               # Sacred Aarti detail view & player
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
│   └── images/                    # Visual assets & logos (`logo.png`)
├── src/                           # Shared Application Source Code
│   ├── components/                # Modular UI Components
│   │   ├── CosmicBackground.tsx   # Animated gradient cosmic background layer
│   │   └── CustomTabBar.tsx       # Custom bottom tab navigation bar
│   ├── constants/                 # Theme tokens & design system
│   │   └── theme.ts               # Palette colors, typography, spacing, shadows
│   ├── contexts/                  # React Context Providers (Global State)
│   │   ├── AuthContext.tsx        # Auth state, OTP handling, session verification, Device UUID
│   │   └── FavoritesContext.tsx   # Persistent favorite item toggle & state normalization
│   ├── services/                  # Business Logic & Backend Connectors
│   │   ├── api.ts                 # Axios HTTP client connecting to Hostinger REST APIs
│   │   └── storage.ts             # SecureStore wrapper (Jaap logs, search history, played items)
│   ├── types/                     # TypeScript Interfaces & Definitions
│   │   └── navigation.ts          # Route param lists, Mantra interface, ViewMode types
│   └── utils/                     # Utility Functions & Helpers
│       ├── audioPlayer.ts         # Audio playback initializer with graceful error handling
│       └── categoryHelper.ts      # Visual theme mapping (icons/colors) per category
├── app.json                       # Expo configuration manifest (SDK 57, bundle ID, orientation)
├── eslint.config.js               # Code quality linting rules
├── package.json                   # Dependencies, build scripts, native dependencies
└── tsconfig.json                  # TypeScript compiler settings
```

---

## ⚡ 3. Core App Features & Technical Architecture

### 3.1 Content Delivery & Multilingual Text System
* **Devanagari Font System:** Uses `@expo-google-fonts/tiro-devanagari-hindi` to ensure high-fidelity rendering of Sanskrit Devanagari ligatures.
* **Transliteration & Translations:** Supports side-by-side script viewing with English transliteration, English translation, Hindi translation, and regional language translations.
* **Deep Meaning & Benefits Cards:** Structurally categorizes word-by-word meanings and icon-based spiritual benefits (e.g., Peace, Prosperity, Protection).

### 3.2 Mantra Jaap / Japa Mala Counter Engine
* **Dynamic Goal Targets:** Selectable mala goals ($21, 54, 108, 1008$).
* **Tactile Haptic Feedback:** Light haptic vibration on single taps; notification feedback sequence upon completing a mala round.
* **Persistent Daily Log System:** Taps are logged to `expo-secure-store` date-wise (`YYYY-MM-DD`), maintaining a 90-day rolling history of total chants and completed malas.

### 3.3 Audio Engine & Voice Synthesis Fallback
* **Audio Player Component:** Built using `expo-av` and `expo-audio` with safe audio mode configuration (`safeSetAudioMode`).
* **TTS Voice Fallback:** When a custom recording is unavailable on the server, the app automatically generates high-quality Hindi/Sanskrit audio using Google TTS API:
  `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=hi&q={encodedSanskritText}`

### 3.4 2-Step OTP Auth & Security Architecture
* **Hardware Device ID Resolution:** Native Android ID (`Application.getAndroidId()`) or iOS Vendor ID (`Application.getIosIdForVendorAsync()`), with cryptographically secure fallback (`expo-crypto` UUID).
* **Token Storage:** Encrypted credential storage via `expo-secure-store`.
* **Background Session Validation:** Automatic token verification against `/auth/verify_session.php` without blocking app startup.

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
  * **App Touchpoint:** Add an `AIChatScreen` or floating floating AI Guru assistant button in `app/(tabs)/index.tsx`.

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

## 🛠️ 7. Development Quickstart & AI Integration Setup

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
