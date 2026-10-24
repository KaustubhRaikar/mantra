# 📱 MANTRA APP — PRODUCT REQUIREMENTS DOCUMENT (PRD)

> **Document Identifier:** MANTRA-DOC-PRD-002  
> **Product Name:** Mantra (Vedic & Spiritual Mobile App)  
> **Target Audience:** Product Managers, UX/UI Designers, Mobile Engineers, QA Engineers  
> **Version:** 2.0.0  
> **Status:** Released Baseline  
> **Release Target:** Android (Google Play) & iOS (App Store)  

---

## 1. Product Overview & Purpose

**Mantra** is an authentic, serene, and technologically advanced digital sanctuary designed for spiritual seekers and devout practitioners. The product provides verified Hindu scriptures (Mantras, Aartis, Festival Aartis, Chalisas, Pooja Vidhis, Stotras, Vrat Kathas, and Upanishads) accompanied by high-fidelity audio recitations, Sanskrit Devanagari typography, a tactile Japa Mala counter, and an ethical AI Spiritual Companion.

---

## 2. User Problem Statements & Value Proposition

### 2.1 Problem Statements
1. **Scriptural Degradation:** Existing applications display misspelled Sanskrit text with broken conjunct characters (samyuktaksaras) and lacking authentic English transliteration.
2. **Devotional Interruption:** Invasive audio/video popup advertisements interrupt meditation and morning prayers.
3. **Loss of Ritual Discipline:** Devotees struggle to track their 108-bead Japa Mala rounds across days without carrying physical wooden beads.
4. **Lack of Deeper Understanding:** Devotees chant verses without understanding the root meaning, benefits, or phonetic nuances.
5. **Connectivity Dependency:** Apps fail inside temple sanctums, rural ashrams, or during flights due to always-online dependencies.

### 2.2 Value Proposition
* **Uninterrupted Reverence:** Zero advertising, pure spiritual focus.
* **Typographic Perfection:** Custom Devanagari typography (`Tiro Devanagari Hindi`) with crystal-clear legibility.
* **Tactile Japa Mala:** Vibration-based counter with customizable mala goals (21, 54, 108, 1008) and 90-day progress history.
* **Intelligent Guidance:** Contextual Vedic AI explaining etymology, philosophical commentary, and evaluating chanting phonetics.
* **Offline Resilience:** Local SQLite-backed storage and offline audio downloads.

---

## 3. Product Personas & Use Cases

### Persona A: Smt. Gayatri Devi (58, Traditional Sadhak)
* **Goal:** Reads Hanuman Chalisa and Vishnu Sahasranama every morning at 6:00 AM; chants 3 malas of Gayatri Mantra.
* **Needs:** Large text mode, high-contrast Devanagari font, haptic buzz every 108 chants so she doesn't have to look at the screen.

### Persona B: Rohan Sharma (26, Tech Professional & Seeker)
* **Goal:** Wants to learn the Maha Mrityunjaya Mantra with correct Sanskrit pronunciation while commuting.
* **Needs:** English transliteration, word-by-word English translation, looping audio player, and AI pronunciation feedback.

### Persona C: Pandit Vivek Joshi (34, Ritual Organizer)
* **Goal:** Conducts Satyanarayan Pooja and Navratri fasts.
* **Needs:** Step-by-step Pooja Vidhi checklists, complete Vrat Kathas with offline capability.

---

## 4. Epic & Feature Specifications

### Epic 1: Sacred Content Catalog & Multilingual Text System

| Feature ID | Feature Name | User Story | Acceptance Criteria |
|---|---|---|---|
| **FEAT-1.1** | Multi-Entity Scripture Reader | As a devotee, I want to browse mantras, aartis, chalisas, stotras, pooja vidhis, vrat kathas, and upanishads. | • Tabulated or categorized browsing.<br>• Search filter with instant debounced query response (<150ms).<br>• Normalized entity structure conforming to `SCHEMA.md`. |
| **FEAT-1.2** | Devanagari & Transliteration Display | As a reader, I want to read authentic Sanskrit with Latin transliteration and translations. | • Custom font `TiroDevanagariHindi_400Regular` loaded without layout shifts.<br>• Side-by-side or stacked toggles for Devanagari, English Transliteration, Hindi, and English translation.<br>• Meaning cards broken down by word or stanza. |
| **FEAT-1.3** | Spiritual Benefits & Metadata | As a seeker, I want to know the astrological/mental benefits of chanting a mantra. | • Icon-tagged benefits cards (e.g., Peace, Protection, Focus, Prosperity).<br>• Deity and category badges displayed prominently. |

---

### Epic 2: Tactile Japa Mala Counter

| Feature ID | Feature Name | User Story | Acceptance Criteria |
|---|---|---|---|
| **FEAT-2.1** | Mala Count & Target Goals | As a practitioner, I want to set a goal of 21, 54, 108, or 1008 repetitions and count my chants. | • Circular progress indicator displaying current beads / goal.<br>• Selector buttons for 21, 54, 108, and 1008 malas.<br>• Tap anywhere on the sacred counter orb to increment count. |
| **FEAT-2.2** | Tactile Haptic & Audio Feedback | As a devotee meditating with closed eyes, I want physical feedback on every count and on completion. | • Light haptic feedback (`expo-haptics`) on every single tap.<br>• Distinct notification vibration sequence and gentle temple bell chime upon completing a full mala.<br>• Audible speech counter for visually impaired users (accessibility toggle). |
| **FEAT-2.3** | 90-Day Rolling Japa History | As a disciplined user, I want to track my daily chanting habits over time. | • Stores counts in local SQLite DB by `YYYY-MM-DD`.<br>• Automatically prunes records older than 90 days.<br>• Displays calendar heatmap and weekly mala streak statistics in user profile. |

---

### Epic 3: High-Definition Audio Engine

| Feature ID | Feature Name | User Story | Acceptance Criteria |
|---|---|---|---|
| **FEAT-3.1** | Native Audio Playback | As a listener, I want to play, pause, seek, and loop sacred audio tracks. | • Built on `expo-audio` with low-latency initialization.<br>• Background playback capability when screen locks or app minimizes.<br>• Audio session configured for mixing or ducking respectful of iOS silent mode switch. |
| **FEAT-3.2** | Graceful Absence & Pregenerated Fallback | As a user, I want a graceful experience when official vocals are not yet recorded. | • If `audio_url` is absent, UI gracefully hides playback or indicates "Vocal Recording Coming Soon".<br>• Fully purged legacy unstable Google TTS web-scraping dependencies. |
| **FEAT-3.3** | Offline Audio Download | As a traveler, I want to download audio tracks of my favorite prayers for offline listening. | • Download button on audio player.<br>• Downloads MP3 to local sandbox directory with progress bar.<br>• Plays local file when offline. |

---

### Epic 4: Passwordless Authentication & Session Security

| Feature ID | Feature Name | User Story | Acceptance Criteria |
|---|---|---|---|
| **FEAT-4.1** | 2-Step Email OTP Login | As a user, I want to log in using only my email and a 6-digit verification code. | • Email validation and rate limiting (max 3 sends per 10 mins).<br>• 6-digit OTP delivery within 10 seconds.<br>• Max 5 verification attempts before token invalidation. |
| **FEAT-4.2** | Device Binding & Token Security | As a user, I want my session locked securely to my physical device. | • Binds login session token to hardware Android ID or iOS Vendor ID.<br>• Tokens stored strictly in hardware-backed `expo-secure-store`.<br>• Non-blocking background session verification on app cold start. |

---

### Epic 5: Privacy Governance & DPDP 2023 Compliance

| Feature ID | Feature Name | User Story | Acceptance Criteria |
|---|---|---|---|
| **FEAT-5.1** | First-Launch Consent Modal | As a citizen, I want clear disclosure of data practices before using cloud services. | • Granular toggles: Functional (mandatory), Analytics (optional), AI Assistance (optional).<br>• Explicit accept/reject recording in backend database. |
| **FEAT-5.2** | Right to Erasure & Data Export | As a user, I want to export or permanently delete all my stored prayers and Japa logs. | • One-click "Export My Data" generates encrypted JSON download.<br>• "Delete Account & Data" invokes hard deletion across all relational tables and vector databases. |

---

### Epic 6: AI Spiritual Companion & Pronunciation Coach (Phase 2)

| Feature ID | Feature Name | User Story | Acceptance Criteria |
|---|---|---|---|
| **FEAT-6.1** | AI Spiritual Guru Chat | As a seeker, I want to ask questions regarding Vedic philosophy and ritual timings. | • Streaming SSE responses with <1.5s time-to-first-token.<br>• Scripture-grounded retrieval from vector database with source citation links.<br>• Strict safety boundaries: no medical, legal, financial, or superstitious advice. |
| **FEAT-6.2** | Sanskrit Pronunciation Coach | As a student, I want real-time feedback on my Sanskrit chanting pronunciation. | • Captures audio via microphone, compares against canonical Devanagari text.<br>• Returns syllable-by-syllable visual coloring (Green = Accurate, Orange = Acceptable, Red = Mispronounced). |

---

## 5. Non-Functional Requirements (NFRs)

```
+---------------------------------------------------------------------------------+
|                          NON-FUNCTIONAL SPECIFICATIONS                          |
+----------------------+--------------------------+-------------------------------+
| Category             | Requirement              | Target Benchmark              |
+----------------------+--------------------------+-------------------------------+
| Performance          | App Cold Startup         | < 1.2s on mid-tier Android    |
| Performance          | Audio Playback Latency   | < 250ms on tap                |
| Performance          | Search Query Response    | < 100ms debounced             |
| Reliability          | Crash-Free Sessions      | ≥ 99.85%                      |
| Offline Capability   | Core Content Readability | 100% available without network|
| Battery & Power      | Japa Counter Consumption | < 2% battery per 108 mala     |
| Security             | Transport Layer          | TLS 1.3 enforced everywhere   |
| Accessibility        | Contrast & Screen Reader | WCAG 2.1 AA Compliance        |
+----------------------+--------------------------+-------------------------------+
```

---

## 6. Release Milestones & Phasing

* **Phase 1 (Current Release - v1.0.0):**
  * Core Content Catalog (Mantras, Aartis, Chalisas, Pooja Vidhis, Stotras, Kathas, Upanishads)
  * Native `expo-audio` Player & Background Audio
  * Tactile Japa Mala Counter with SQLite persistence
  * 2-Step OTP Authentication & Device Fingerprinting
  * DPDP Consent Management, Data Export, and Account Deletion
  * TanStack Query Offline Caching
* **Phase 2 (Target: Q1 2027):**
  * AI Spiritual Guru (FastAPI + PgVector RAG Middleware)
  * Sanskrit Voice Pronunciation Coach (Whisper STT)
  * Personalized AI Mantra Recommendation Feed
  * Sankalp & Anushthan ritual tracker
