# 📜 MANTRA APP — CHANGELOG & RELEASE NOTES

All notable changes, security enhancements, and structural refactorings implemented across the Mantra app ecosystem are documented below.

## 🚀 [2.8.0] - 2026-10-30

### 🌐 9-Language Translation Engine, 7-Day Liturgical Sacred Worship & High-Performance Device Caching

#### 1. Multi-Language Translation Engine & Language Context
- **9 Supported Regional Indian Languages:** Implemented `LanguageContext` supporting Sanskrit (`sa`), Hindi (`hi`), English (`en`), Gujarati (`gu`), Marathi (`mr`), Bengali (`bn`), Telugu (`te`), Tamil (`ta`), and Kannada (`kn`).
- **Resilient Fallback Resolver (`translationEngine.ts`):** Hierarchical resolution checks regional language translation &rarr; Hindi (`hi`) &rarr; English (`en`), preventing blank views while displaying subtle informative fallback badges (`✨ Gujarati (हिन्दी भावार्थ)`).
- **Persistent Device Caching:** User language preference is stored directly in SQLite `meta_store` and memory for 0ms startup retrieval.
- **Dynamic Translation Tabs (`ScriptureReader.tsx`):** The Scripture Reader tab dynamically displays the devotee's active regional language (`ગુજરાતી`, `मराठी`, `తెలుగు`, etc.) and renders accurate translations.
- **9-Language Profile Modal (`app/(tabs)/profile.tsx`):** Devotees can switch their preferred language with 1 tap through a modal displaying native scripts and transliterated titles.

#### 2. Day-Specific Sacred Worship (दैनिक वार पूजा व मंत्र)
- **Home Screen Sacred Calendar (`DaySpecificWorshipCard.tsx`):** Added a dynamic day-of-week component located below the Panchang card, highlighting today's presiding deity (Surya, Shiva, Hanuman, Ganesha, Vishnu, Mahalakshmi, Shani), ruling celestial planet, sacred flower offerings, naivedya/bhog, primary mantra, and step-by-step daily pooja vidhi.
- **Interactive 7-Day Browsing Strip:** Allows devotees to browse worship guidance, rules, and procedures for any day of the week (Sunday through Saturday).
- **Direct 1-Tap Navigation:** Quick action buttons to chant the day's mantra or start the day's pooja vidhi reader.

#### 3. Canonical Treasury Expansions & Mahaparva Pooja Vidhis
- **Expanded Liturgical Repository (`canonicalTreasuryExpansion.ts`):** Complete canonical datasets for 7-Day cyclical worship, 7-Day Aartis, Day-Specific & Navagraha Mantras, and 5 Mahaparva Pooja Vidhis:
  - *Shri Satyanarayan Vrat Katha & Shodashopachara Vidhi*
  - *Navratri Shailputri-to-Siddhidatri Navadurga Kalash Sthapana & Pooja Vidhi*
  - *Mahashivratri Char Pahar Rudrabhisheka Vidhi*
  - *Deepawali Shubh Muhurat Lakshmi-Ganesha-Kuber Pooja Vidhi*
  - *Ganesh Chaturthi Sthapana & Visarjan Shodashopachara Vidhi*

#### 4. High-Performance Client Device Caching Engine (`liturgicalCache.ts`)
- **Double-Tier Device Caching:** L1 in-memory cache + L2 SQLite `meta_store` persistence. All 7 days of worship, Mahaparva vidhis, and canonical translations load in 0ms with zero network dependency.
- **Background Preloading:** Preloads all liturgical datasets asynchronously on app launch.

#### 5. Backend Database Schema & Hostinger Deployment
- **Multi-Language Migration Script (`migrate_multilang_treasury.php`):** Added `translation_gu`, `translation_mr`, `translation_bn`, `translation_te`, `translation_ta`, `translation_kn` columns to `mantras`, `aartis`, and `pooja_vidhi`.
- **Enhanced Unified Bootstrap Feed (`bootstrap.php`):** Added `day_specific_worship` to the single-request bootstrap response.

---

## 🚀 [2.7.0] - 2026-10-25

### 🪔 Liturgical Streams Architecture, Sweet Shanti Rate Limiting & Active-Tab TTS Engine

#### 1. Curated Sacred Deities & Home Screen Liturgical Tabs
- **Curated Top 6 Deities Grid:** Replaced cluttered generic categories on the Home Screen with the Top 6 Sacred Deities (Lord Ganesha, Lord Shiva, Lord Hanuman, Maa Durga/Devi, Lord Vishnu & Krishna, Maa Lakshmi), featuring high-contrast icon badges, subtitle descriptions, and verse counts.
- **View All Portal Card:** Added an elevated portal card taking devotees directly to the complete 18+ category catalog (`/(tabs)/categories`).
- **Liturgical Tabs Selector:** Integrated a dedicated 4-stream switcher (`Mantras (मंत्र)` | `Stotras & Suktas (स्तोत्र)` | `Chalisas (चालीसा)` | `Pooja Vidhi (पूजा विधि)`) on the Home Screen to dynamically display the corresponding liturgical shelf without visual clutter.

#### 2. Strict Partitioning of Liturgical Streams
- **Clean Devotional Boundaries:** Mantras (Japa Mala focus), Stotras/Suktas (Archana & 1008 Namavalis), Chalisas (40-chaupai stanzas), and Pooja Vidhis (step-by-step ritual checklists) now maintain strictly segregated hubs, shelves, and detail reader models.

#### 3. Ambient Shanti Sanctuary Rate-Limit Wrapping
- **Sweet Devotional Notification (`ShantiBanner.tsx`):** Eliminated raw network error popups and technical warnings. HTTP 429 and rate-limited queries trigger a serene saffron/gold floating Shanti toast:
  `"शांतिः • Offline Sanctuary Active — Prayers continue seamlessly while network rests."`
- **Transparent Local SQLite Fallback:** The Axios response interceptor in `src/services/api.ts` transparently serves cached records from the device's SQLite `meta_store` without breaking user navigation.
- **Sweet OTP Limiting:** Wrapped OTP send and resend errors in `login.tsx` with tranquil, devotional mindful breathing messages.

#### 4. Dedicated Aarti & Festival Aarti Hubs & Hymn Routes
- **Dedicated Aarti Directory (`app/aarti/index.tsx`):** Created a dedicated Aarti Sangrah directory with instant search, deity filtering (Ganesh, Shiva, Hanuman, Durga, Krishna, Rama, Lakshmi), and direct navigation to `/aarti/[id]`.
- **Dedicated Festival Aarti Directory (`app/festival_aarti/index.tsx`):** Created a dedicated festival screen with festival chips (Navaratri, Diwali, Shivaratri, Ganesh Chaturthi, Janmashtami) linking to `/festival_aarti/[id]`.
- **Vedic Hymns Routing:** Linked "Sacred Stotras & Hymns" (`sub_stotras`) directly to `/stotra`, cleanly uniting Vedic Suktas, Sahasranamas, and sacred hymns.

#### 5. Active-Tab-Focused TTS Chanting Engine
- **Context-Aware Chanting (`ScriptureReader.tsx`):** Chanting automatically vocalizes the text of whichever tab is active:
  - **Sanskrit Tab:** Chants authentic Sanskrit / Devanagari verse.
  - **Hindi Tab:** Reads the Hindi meaning / translation.
  - **Translit Tab:** Pronounces the IAST transliteration.
- **Tab Switch Reset:** Switching tabs gracefully resets the audio player so devotees immediately hear the text in the newly selected language.
- **Generic Label Elimination (`audioPlayer.ts`):** `sanitizeDevotionalText()` blacklists generic UI placeholders (`"Mantra Details"`, `"Aarti Sangrah"`, `"Details"`, `"Untitled"`), falling back to sacred Devanagari invocations (`"ॐ नमः शिवाय"`) and ensuring TTS never utters English screen labels.

---

## 🚀 [2.6.0] - 2026-10-25

### 🛡️ App-Only API Restriction, Sliding Window Rate Limiting & High-Speed Caching

#### 🌐 1. Elimination of Web API Calls (Web Origin & Privacy Defense)
- **Web Frontend Hardening:** Removed all client-side `fetch()` API calls from `web/delete-account.html`.
- **Direct Privacy Channel:** Replaced web API deletion requests with secure DPDP 2023 email verification link (`mailto:privacy@aarambhtech.in`) and in-app deletion instructions, completely insulating backend endpoints from browser-based scraping and CSRF vectors.
- **Server-Side Web Ban:** Endpoints reject direct browser requests without the mobile app signature with `HTTP 403 Forbidden` (`WEB_API_ACCESS_DISABLED`).

#### ⏱️ 2. Sliding Window Rate Limiter (1 App, 1 Mobile, 1 User, 1 Unique Key)
- **Composite Identity Matrix:** Computes a unique 256-bit SHA-256 hash combining:
  - **1 App:** Cryptographic signature `X-App-Key: m_app_c0sm1c_...`
  - **1 Mobile:** Secure hardware installation UUID (`X-Device-ID`)
  - **1 User:** Authenticated user account token / ID (`X-User-ID`, `X-Login-Token`)
  - **1 Origin:** Proxy-safe client IP address
- **Sliding Window Quotas:**
  - **Minute Window:** Max 5 calls / 60 seconds (`HTTP 429` on exceed)
  - **Hourly Window:** Max 15 calls / 3,600 seconds (`HTTP 429` on exceed)
  - **Daily Window:** Max 100 calls / 86,400 seconds (`HTTP 429` on exceed)
- **Informative Response Headers:** Injected `X-RateLimit-Limit-*` and `X-RateLimit-Remaining-*` on all successful mobile requests.
- **Probabilistic Housekeeping:** Background cleanup automatically purges sliding window records older than 24 hours.

#### ⚡ 3. High-Performance NVMe Server Cache Engine
- **Atomic File Cache:** GET requests for canonical scriptures (`categories`, `mantras`, `stotras`, `chalisas`, `aartis`, `pooja_vidhis`, `vrat_kathas`, `upanishads`) check disk cache prior to executing database queries.
- **Conditional Validation (HTTP 304):** Supports `If-None-Match` with MD5 ETags, responding in $<1\text{ms}$ with zero payload bandwidth for unchanged data.
- **Output Buffering:** Automatically intercepts and caches valid 200 OK JSON responses.

#### 📱 4. Mobile Client Request Interceptor (`api.ts`)
- **Axios Interceptor:** Automatically injects `X-App-Key`, `X-Device-ID`, `X-Login-Token`, and `X-User-ID` on all outgoing network requests.
- **Graceful Fallback:** Aligns with TanStack Query and local SQLite cache to ensure seamless offline sanctuary reading if quotas are reached.

---

## 🚀 [2.5.0] - 2026-10-25

### 🕉️ Canonical Treasury Expansion & Interactive Archana (नामार्चन) Mode

#### 🏛️ 1. Database Ingestion on Hostinger Cloud MySQL (`u885706413_mantra`)
- **Pancha-Devata Sahasranama Stotrams (5 Stotras, 1008 Names Each):**
  - *Shri Vishnu Sahasranama Stotram* (Mahabharata Anushasana Parva / Veda Vyasa) with complete Dhyana, Shlokas, Phalasruti, and 1,000 structured Namavali offerings.
  - *Shri Shiva Sahasranama Stotram* (Mahabharata / Shiva Purana) with 1008 divine names of Mahadeva.
  - *Shri Lalita Sahasranama Stotram* (Brahmanda Purana / Hayagriva-Agastya Samvada) with Sri Vidya sacred names.
  - *Shri Ganesha Sahasranama Stotram* (Ganesha Purana) for obstacle destruction and wisdom.
  - *Shri Gopal Sahasranama Stotram* (Sammohana Tantra) for Santana Gopala and divine love.
- **108 Ashtottara Shatanamavalis (5 Full 108-Name Chants):**
  - *Shri Vishnu 108 Ashtottara Shatanamavali* with individual mantra offerings and Hindi meanings.
  - *Shri Shiva 108 Ashtottara Shatanamavali* for Bilva-archana and Pradosha worship.
  - *Shri Ganapati 108 Ashtottara Shatanamavali* for Durva offering and auspicious beginnings.
  - *Shri Durga 108 Ashtottara Shatanamavali* (Shatanam Stotram) for Navratri Kumkuma-archana.
  - *Shri Krishna 108 Ashtottara Shatanamavali* for Tulasi-patra devotion.
- **Maha Vedic Suktas (7 Sovereign Hymns):**
  - *Purusha Suktam* (Rigveda 10.90) — 16 complete Riks celebrating the Supreme Cosmic Person.
  - *Sri Suktam* (Rigveda Khila) — 16 complete Riks invoking Goddess Mahalakshmi and dispelling Alakshmi.
  - *Sri Rudram (Namakam & Chamakam)* — Sacred Krishna Yajurveda mantras for peace and prosperity.
  - *Narayana Suktam* (Taittiriya Aranyaka) — Cosmic meditation on the Divine Light within the heart lotus.
  - *Medha Suktam* (Rigveda / Yajurveda) — Vedic invocations for sharp intellect, memory, and wisdom.
  - *Durga Suktam* (Mahanarayana Upanishad) — Deliverance across the ocean of worldly trials.
  - *Ayushya Suktam* (Taittiriya Aranyaka) — Vedic prayer for longevity, vital prana, and radiant health.
- **Protective Armor Kavachas (6 Infallible Shields):**
  - *Narayana Kavacham* (Srimad Bhagavatam 6.8 / Vishvarupa) — Omnipresent Vaishnava armor.
  - *Narasimha Kavacham* (Brahmanda Purana / Prahlada Maharaja) — Invincible protection against dark energies.
  - *Devi Kavacham / Chandi Kavacham* (Durga Saptashati) — Complete anatomical and directional armor by the 9 Durgas.
  - *Shiva Kavacham* (Skanda Purana / Rishi Bharadvaja) — Mahamrityunjaya-grade protection.
  - *Hanuman Vadavanala Stotram & Bajrang Baan* (Vibhishana Kritam) — Fire of protection destroying calamities.
  - *Surya Kavacham* (Yajnavalkya Rishi) — Dispeller of illnesses, eye ailments, and conferring vitality.
- **Revered Ashtakams (7 Sacred Octets):**
  - *Madhurashtakam* (Jagadguru Shri Vallabhacharya) — "Adharam madhuram vadanam madhuram".
  - *Lingashtakam* (Traditional) — "Brahma Murari Surarchita Lingam".
  - *Bilvashtakam* (Traditional) — "Tridalam trigunakaram trinetram cha triyayudham".
  - *Achyutashtakam* (Adi Shankaracharya) — "Achyutam keshavam rama narayanam".
  - *Kalabhairavashtakam* (Adi Shankaracharya) — "Devaraja sevyamana pavananghripankajam".
  - *Sankashtanashana Ganesha Stotram* (Narada Purana) — 12 obstacle-destroying names of Vinayaka.
  - *Shri Annapurna Ashtakam* (Adi Shankaracharya) — "Nityanandakaree varabhayakaree".
- **Complete Missing Chalisas (5 Sacred Chalisas):**
  - *Shri Krishna Chalisa*, *Shri Shani Chalisa*, *Shri Saraswati Chalisa*, *Shri Surya Chalisa*, and *Shri Bhairav Chalisa*.
- **Nitya Karma Daily Mantras (7 Core Mantras in `mantras` Table):**
  - *Pratah Karadarshanam*, *Prithvi Kshama Prarthana*, *Snana Mantra*, *Deepa Jyoti Mantra*, *Bhojana Mantra*, *Sarve Bhavantu Sukhinah*, and *Shayan Mantra*.
- **Database Metrics:** Elevated `stotra` table from 10 to **40** canonical hymns, `chalisa` from 6 to **11**, and `mantras` to **2,040** rows.

#### 🌸 2. Interactive Archana (नामार्चन) Mode in ScriptureReader
- **Dual-Mode Switcher (`src/components/ScriptureReader.tsx`):** Added `[ 📖 श्लोक पाठ | 🌸 नामार्चन ]` tabs for Sahasranama and 108-Namavali scriptures.
- **Pushpanjali Offering Progress:** Real-time visual progress counter (`X / 108 नाम पुष्प समर्पित`) with gold-gradient progress bar.
- **Tactile Pushpanjali Buttons:** Each sacred name card includes individual audio chant trigger and a flower offering toggle (`💮 अर्पण` / `🌸 समर्पित`) with golden radiant glow.
- **Quick Action Bar:** Features `🌸 सर्व समर्पणम् (Offer All)` and `↺ पुनः आरम्भ (Reset)` buttons for devotees during ritual worship.
- **Curated Stotra Catalog Filtering (`app/stotra/index.tsx`):** Category filter chips (`समस्त`, `सहस्रनाम`, `१०८ नामावली`, `वैदिक सूक्त`, `रक्षा कवच`, `अष्टकम्`) and real-time instant search.

---

## 🚀 [2.4.0] - 2026-10-24

### 🌌 Horizon Expansion: Panchang, Sankalpa Tracker & Yantra Trātaka Engine

#### ☀️ 1. Sacred Daily Panchang & Astronomical Muhurta Engine
- **Local Ephemeris Math (`src/utils/panchangEngine.ts`):** Implemented on-device astronomical calculation for Sunrise, Sunset, Solar Noon, Tithi (1–30), Paksha (Shukla/Krishna), Nakshatra (27 lunar mansions), and Yoga without external API tracking.
- **Liturgical Auspicious Windows:** Real-time calculation of **Brahma Muhurta** (48-min meditation window), **Pratah Sandhya**, **Abhijit Muhurta** (midday victory window), and **Sayam Sandhya**.
- **Caution Timings & Choghadiya:** Precise calculation of **Rahu Kaal**, **Yamaganda**, and the 8-period Day Choghadiya table (Amrit, Shubh, Labh, Char, Rog, Kaal, Udveg).
- **Home Hub Celestial Card (`src/components/PanchangCard.tsx`):** Docked atop the Home screen, providing immediate solar/lunar awareness and active Muhurta alerts.
- **Dedicated Almanac Screen (`app/panchang.tsx`):** Complete day breakdown with yesterday/today/tomorrow navigation and fasting detection (Ekadashi, Pradosh, Purnima, Sankashti).

#### 📿 2. Multi-Day Sankalpa & Anushthan Tracker
- **SQLite Vow Persistence (`src/services/sankalpaStorage.ts` & `src/services/db.ts`):** Created `user_anushthans` table to manage multi-day spiritual vows locally on-device.
- **Shastra-Aligned Presets & Custom Vows:** Built-in templates for *21-Day Gayatri Mahamantra (11 Malas/day)*, *40-Day Hanuman Chalisa (11 Chants/day)*, *16-Somvar Shiva Sankalpa*, and *9-Day Navratri Chandi Path*, plus fully custom vows.
- **Seamless JapaOrb Integration:** Chanting on the Home Screen `JapaOrb` directly increments daily vow progress in real time via `sankalpaStorage.recordAnushthanProgress(1)`.
- **Home Progress Widget (`src/components/SankalpaProgressCard.tsx`):** Visual progress bar tracking days elapsed, completed malas, and continuous day streak (`🔥 X दिन निरंतर`).
- **Dashboard & Poorna-Ahuti Liturgy (`app/sankalpa/index.tsx`, `create.tsx`):** Complete vow management, Sanskrit initiation shlokas, and concluding Poorna-Ahuti rites.

#### 📐 3. Dynamic Sacred Yantra & Trātaka Meditation Engine
- **Mathematical Vector SVGs (`src/components/yantras/`):**
  - **Sri Yantra (`SriYantra.tsx`):** 9 interlocking Shiva/Shakti triangles creating 43 sub-triangles, 24 concentric lotus petals, 3 Mekhala circles, and 4-gate Bhupura.
  - **Shiva Yantra (`ShivaYantra.tsx`):** Sacred Shatkona (hexagram) geometry with 12 petals and central Bindu.
  - **Gayatri Yantra (`GayatriYantra.tsx`):** Solar 24-akshara petal matrix with glowing Savitur Bindu.
- **Fullscreen Trātaka Meditation Session (`app/yantra/[id].tsx`):** Immersive dark mode canvas with breath-synchronized central Bindu pulsing (Sama Vritti 4s Inhale - 4s Hold - 4s Exhale - 4s Hold), session countdown timer (3m, 5m, 11m, 21m), and haptic bells.
- **Yantra Gallery (`app/yantra/index.tsx`):** Philosophical significance and visual meditation guidance.

---

## 🚀 [2.3.0] - 2026-10-24

### 🪔 Pooja Vidhi Interactive Step Cards & Samagri Architecture
- **Parsed Structured Scripture Payloads (`src/utils/scriptureParser.ts`):** Resolved raw JSON string dumps (`[{"step":1,"name":"..."}]`) by decoding backend JSON arrays for `steps`, `required_items`, `katha_chapters`, and metadata into strongly typed models (`ParsedPoojaStep[]`, `ParsedSamagriItem[]`, `ParsedVidhiMeta`).
- **Interactive Step Cards (`src/components/ScriptureReader.tsx`):** Implemented dedicated step-by-step cards featuring:
  - Step counter badges (`चरण १`, `चरण २`...) with saffron accent highlights.
  - Sanskrit/Hindi ritual step titles and clear Devanagari instructional text.
  - Individual step chant buttons for listening to specific ritual instructions.
  - Devotional completion checkmarks allowing devotees to mark progress during rituals.
- **Dedicated "पूजा सामग्री (Samagri)" View:** Replaced raw text with a structured preparation checklist featuring item names, quantities (`21 गांठें`, `1 कटोरी`), and interactive checkboxes.
- **Ceremony Details & Significance Tab:** Organized ceremony duration, auspicious timing, day of the week, benefits, and scriptural precautions into formatted glassmorphic cards with sacred iconography.

### 🎙️ Natural Human-Like TTS & Strict Audio Engine
- **Fixed URL Vocalization Bug (`src/utils/audioPlayer.ts`):** Completely eradicated the bug where URL paths or file locations were passed to speech synthesis. Implemented `sanitizeDevotionalText()` to strictly discard URL schemes (`http://`, `https://`, `file://`), file extensions (`.mp3`, `.wav`), and filesystem paths.
- **Enhanced Natural Neural Voice Discovery:** Implemented dynamic device voice detection via `Speech.getAvailableVoicesAsync()`, automatically prioritizing Google Neural2/WaveNet and Apple Enhanced Siri voices for natural, reverent Devanagari pronunciation.
- **Tap-to-Chant Verses & Steps:** Devotees can now tap the "मंत्र पाठ सुनें (Listen)" button or individual step audio icons to hear verses recited naturally.
- **Japa Loop & Repetition Presets (`src/components/AudioPlayerBar.tsx`):**
  - Integrated top-docked repetition selector supporting sacred Vedic counts: `1x` (Single), `11x` (Auspicious), `21x` (Devotional), `108x` (Full Mala Japa), and `∞` (Continuous Loop).
  - Real-time cycle tracking (`जप चक्र: 1 / 108`) with automatic smooth looping between recitations.
- **Graceful Audio Availability Handling:** When no audio recording is uploaded, the player cleanly displays "ध्वनि रिकॉर्डिंग जल्द उपलब्ध होगी (Audio coming soon)" with disabled playback controls, completely preventing erroneous speech synthesis.

---

## 🚀 [2.2.0] - 2026-10-24

### 🌐 Public Website Overhaul & Zero-Architecture Privacy
- **Clean App Showcase Landing Page (`web/index.html`):** Completely transformed public web presence into a high-converting mobile app landing page. Removed all raw mantra texts, Sanskrit verse displays, transliterations, and word meanings.
- **Removed Technical & Architecture References:** Completely expunged references to internal tech stacks, database engines (SQLite/MySQL/PostgreSQL), API endpoints (`/api/...`), and server file paths from the public web client and legal policies.
- **Unlisted Administrative Governance:** Removed all Admin Portal, CMS, Telemetry, and architecture links from public website navigation and footer.
- **Interactive Japa Mala Demo:** Integrated a distraction-free, interactive 108 bead counter orb demo with audio chimes and streak counters with zero mantra text exposure.

### 🛡️ Admin 2-Step OTP Authentication & Sliding Window Rate Limiting
- **Dedicated Administrator:** Configured root administrative authentication exclusively for `kaustubhraikar10@gmail.com`.
- **Strict Sliding Window Rate Limiting (`web/includes/security.php`):**
  - **Password Attempts:** Enforced maximum 3 attempts per 15-minute moving sliding window.
  - **OTP Verification Attempts:** Enforced maximum 3 attempts per 5-minute moving sliding window.
  - Implemented moving window timestamp filtering with precise `retry_after` countdowns.
- **Email-Based 2-Step OTP Delivery (`web/admin/login.php`):** Generated cryptographically secure 6-digit one-time authorization codes with 5-minute TTL, dispatched via PHP `mail()` in branded HTML format.

### 🗄️ Server MySQL Database Initialization (`u885706413_mantra`)
- **Complete Schema Provisioning:** Created and verified all 16 operational tables on live Hostinger production database: `users`, `user_sessions`, `user_jaap_daily_logs`, `user_favorites`, `user_consents`, `rate_limits`, `app_events`, `api_request_logs`, `app_crashes`, `support_tickets`, `feedback_submissions`, `admin_audit_logs`, `search_terms_log`, `push_notification_logs`, `admin_users`, and `admin_otps`.
- **Baseline Devotee & Telemetry Seeding:** Seeded baseline devotees, sessions, and telemetry events so administrative executive dashboards render live metric charts immediately upon sign-in.

---

## 🚀 [2.1.0] - 2026-10-24

### ☀️ Theme Contrast & Light Mode Overhaul
- **Dynamic Text Colors:** Audited and resolved low-contrast text across the entire application in Light Mode (`#F8F6F0` Sacred Ivory). Dynamic `useTheme().colors` bindings applied to `ScriptureCard`, `ScriptureReader`, `JapaOrb`, `CosmicBackground`, `GlassHeader`, `CustomTabBar`, `HomeScreen`, `CategoriesScreen`, `FavoritesScreen`, `ProfileScreen`, `SearchScreen`, `LoginScreen`, `ConsentScreen`, `PrivacyScreen`, and `UpanishadsScreen`.
- **High-Contrast Typography:** Configured Devanagari verse typography with `#171426` high-contrast slate text and `#4E4968` secondary labels in light mode, preserving `#FFFFFF` in dark mode.

### 🌸 Adaptive Splash Screen
- **Clean Centered Lotus Icon:** Replaced legacy splash image with high-resolution transparent vector lotus logo from `adaptive-icon.png` without plain text artifacts.
- **Adaptive Theme Background:** Configured `app.json` with Sacred Ivory `#F8F6F0` in light mode and Celestial Midnight `#080711` in dark mode.

### 🗄️ Database & Frontend Category Deduplication
- **Production MySQL Deduplication:** Executed database merge and cleanup on live Hostinger production database (`u885706413_mantra`):
  - Migrated mantras from category 20 to category 19, deleted duplicate category 20 ("Bhakti Movement Hymns").
  - Migrated mantras from category 16 to category 15, deleted duplicate category 16 ("Tantric & Sri Vidya Mantras").
- **Defensive Frontend Deduplication:** Added normalization deduplication (`Set<string>`) in `app/(tabs)/categories.tsx` and filtered out top-level section collisions (`Aartis`, `Chalisas`, `Pooja Vidhi`, `Stotras`, `Vrat Katha`, `Upanishads`).

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
