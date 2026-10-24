# 📜 MANTRA APP — SYSTEM, BUSINESS & ENGINEERING RULES

> **Document Identifier:** MANTRA-DOC-RUL-009  
> **Target Audience:** All Engineers, Product Managers, Content Curators, System Administrators  
> **Status:** Mandatory Governance Standard  
> **Version:** 2.0.0  
> **Enforcement:** Automated via CI/CD Linters, Static Analysis, Code Reviews & Runtime Guards  

---

## 1. Sacred Product & Business Rules

```
+===================================================================================================+
|                                  THE SACRED COVENANT (PRODUCT RULES)                              |
+===================================================================================================+
| RULE 1: ZERO THIRD-PARTY ADVERTISEMENTS                                                           |
| Under no circumstances will commercial third-party banner, interstitial, or video ads ever be     |
| integrated into the application. Reverence and focus during Sadhana are inviolable.               |
+---------------------------------------------------------------------------------------------------+
| RULE 2: SCHOLARLY AUTHENTICITY & CANONICAL FIDELITY                                              |
| Every Sanskrit sloka, mantra, chalisa, and transliteration must originate from canonical Vedic  |
| recensions and be validated by certified scholars. No colloquial paraphrasing of Sanskrit hymns. |
+---------------------------------------------------------------------------------------------------+
| RULE 3: PROHIBITION OF SUPERSTITIOUS FORTUNE-TELLING                                              |
| The AI spiritual assistant and content recommendations must NEVER provide financial predictions,  |
| medical diagnoses, guaranteed miracles, or superstitious astrological prophecies.                  |
+---------------------------------------------------------------------------------------------------+
| RULE 4: UNCONDITIONAL PRIVACY (DPDP COMPLIANCE)                                                   |
| Devotional habits, prayer logs, and Japa counts belong exclusively to the devotee. Data is never   |
| shared, brokered, or monetized. Account deletion must permanently purge all user records.         |
+===================================================================================================+
```

---

## 2. Technical Architecture & Storage Rules

### RULE-TECH-01: Strict Storage Partitioning
* **SecureStore Rule:** `expo-secure-store` is strictly reserved for small, sensitive cryptographic artifacts:
  - `session_token`
  - `hardware_device_uuid`
  - `user_profile_metadata`
* **SQLite Rule:** All unbounded or high-volume datasets (Japa daily logs, search queries, audio playback history, cached entities) MUST be stored in `expo-sqlite`. Storing arrays or logs in `expo-secure-store` will fail automated linting and code review.

### RULE-TECH-02: Audio Subsystem Invariants
* **`expo-audio` Rule:** All audio operations MUST use `expo-audio`. `expo-av` is deprecated and prohibited in the codebase to prevent conflicting native audio listeners.
* **Google TTS Ban:** Direct web scraping of `translate.google.com/translate_tts` is completely forbidden due to instability and legal risk. Unrecorded prayers must display graceful fallback UI or use pregenerated server audio.

### RULE-TECH-03: Canonical Entity Normalization
* Every screen, component, and API client receiving entity data MUST route through `normalizer.ts` implementing `CanonicalEntity`. Ad-hoc property access like `item.mantra_name || item.title || item.name` inside leaf components is prohibited.

---

## 3. Backend & Security Engineering Rules

### RULE-SEC-01: Constant-Time HMAC Verification
* Stored OTP codes must be hashed using `hash_hmac('sha256', $otp, $secret)`.
* Comparison must be executed using PHP `hash_equals()` to prevent timing attacks. Plain `==` or `===` string comparisons on cryptographic hashes are strictly forbidden.

### RULE-SEC-02: Dual-Key Rate Limiting
* All public or semi-public authentication endpoints (`/auth/send_otp.php`, `/auth/verify_otp.php`) MUST implement dual rate-limiting checking both the **Target Identifier (Email)** and the **Originating IP Address**.

### RULE-SEC-03: Zero Cross-User Privilege Escalation
* Endpoints must NEVER accept or trust a client-supplied `user_id` in request payloads to perform modifications. The `user_id` MUST be derived authoritatively on the server by validating the `X-Login-Token` and `X-Device-ID` against the `user_sessions` database table.

### RULE-SEC-04: Mandatory Parameterized Queries
* Raw SQL concatenation (e.g., `WHERE id = " . $_GET['id']`) is prohibited under penalty of immediate deployment rejection. All database interactions MUST use PDO prepared statements with explicit parameter binding.

### RULE-SEC-05: App-Only API Restriction & Sliding Window Rate Limiting
* **Web API Ban:** Direct browser-based API access is disabled. Content endpoints are exclusively reserved for the official Mantra mobile application verified via cryptographic `X-App-Key`.
* **Sliding Window Quotas:** All API calls are tracked across a composite key ($1\text{ App} + 1\text{ Mobile} + 1\text{ User} = 1\text{ Unique Key}$) enforcing strict sliding windows:
  - **Minute Window:** Max 5 calls / 60 seconds
  - **Hourly Window:** Max 15 calls / 3,600 seconds
  - **Daily Window:** Max 100 calls / 86,400 seconds
* **High-Speed Caching:** Read endpoints must check NVMe-backed response cache and support HTTP 304 ETag revalidation to minimize latency.

---

## 4. UI/UX & Typography Rules

### RULE-UI-01: Devanagari Typography Fidelity
* Sanskrit and Hindi text MUST use `@expo-google-fonts/tiro-devanagari-hindi`. Standard system sans-serif fonts must not be applied to Sanskrit verses to prevent ligature clipping.

### RULE-UI-02: Haptic Synchronization
* Every Japa Mala tap MUST trigger haptic feedback (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`). The 108-bead milestone must trigger `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`.

### RULE-UI-03: Cosmic Palette Consistency
* Colors must be imported from `src/constants/theme.ts`. Hardcoded hex codes outside the design tokens are disallowed.

---

## 5. Code Quality & Version Control Rules

1. **TypeScript Strictness:** `"strict": true` enforced in `tsconfig.json`. Use of `any` without explicit justification will fail pull request CI checks.
2. **Conventional Commits:** Git commits must follow the conventional commit specification:
   * `feat: add offline audio download manager`
   * `fix: correct HMAC constant-time verification`
   * `docs: update system design specifications`
   * `refactor: migrate Japa storage to expo-sqlite`
3. **Automated Testing:** All core services (`storage.ts`, `normalizer.ts`, `audioPlayer.ts`) must maintain unit test coverage exceeding $85\%$.
