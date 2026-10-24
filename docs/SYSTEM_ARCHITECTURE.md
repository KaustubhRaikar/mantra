# 🏛️ MANTRA APP — SYSTEM ARCHITECTURE DOCUMENT (SAD)

> **Document Identifier:** MANTRA-DOC-ARCH-004  
> **Target Audience:** Enterprise Architects, Cloud Engineers, Lead Developers, Security Reviewers  
> **Status:** Production Architecture Baseline  
> **Version:** 2.0.0  
> **Date:** October 2026  

---

## 1. Architectural Overview & Design Philosophy

The Mantra platform is engineered around three foundational pillars:
1. **Sacred Reverence & Distraction-Free UX:** Zero latency in scriptural reading, zero third-party ads, offline reliability.
2. **Offline-First Resilience:** Devotees must be able to chant, count malas, and read sacred texts in subterranean temple sanctums or remote rural environments without active internet connectivity.
3. **Cryptographically Secure & Private Identity:** Strict adherence to the Digital Personal Data Protection (DPDP) Act 2023, featuring passwordless OTP authentication bound to cryptographic device fingerprints.

---

## 2. High-Level Enterprise Architecture Diagram

```
+===================================================================================================+
|                                    CLIENT TIER (Cross-Platform)                                   |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                           MANTRA MOBILE APP (Expo SDK 57 / React Native)                    |  |
|  |                                                                                             |  |
|  |   [ UI Layer ]                 [ State & Caching ]                 [ Local Storage ]        |  |
|  |   - Expo Router v4             - TanStack Query v5                 - expo-sqlite            |  |
|  |   - Tiro Devanagari Fonts      - Auth Context                      - expo-secure-store      |  |
|  |   - Cosmic Background Canvas   - Favorites Context                 - FileSystem (Audio MP3) |  |
|  |   - Tactile Jaap Mala          - Normalizer Engine                                          |  |
|  |   - expo-audio Player                                                                       |  |
|  +---------------------------------------------------------------------------------------------+  |
+===================================================================================================+
                                 |                                    |
          HTTPS / REST (v1 APIs) |              HTTPS / SSE Streaming | Audio Multipart Upload
                                 v                                    v
+================================================+   +==============================================+
|             HOSTINGER REST TIER                |   |              AI MIDDLEWARE TIER              |
|                                                |   |                                              |
|  +------------------------------------------+  |   |  +----------------------------------------+  |
|  | Apache 2.4 Web Server (mod_rewrite / SSL)|  |   |  | FastAPI ASGI Engine (Python 3.11+)     |  |
|  +------------------------------------------+  |   |  +----------------------------------------+  |
|  | Rate Limiting Middleware (IP & Email)    |  |   |  | Multi-Agent Orchestrator (LangGraph)   |  |
|  | Authentication & Device Binding Guard    |  |   |  | Conversational Vedic Guru Engine       |  |
|  | Canonical Entity Normalizers             |  |   |  | RAG Context Retriever & BM25 Ranker    |  |
|  | Jaap Aggregation & Favorites Sync Engine |  |   |  | Sanskrit Whisper Pronunciation Coach   |  |
|  +------------------------------------------+  |   |  +----------------------------------------+  |
+================================================+   +==============================================+
                         |                                                   |
                         v                                                   v
+================================================+   +==============================================+
|             RELATIONAL DATA TIER               |   |            VECTOR & EMBEDDING TIER           |
|                                                |   |                                              |
|  +------------------------------------------+  |   |  +----------------------------------------+  |
|  | MySQL 8.0 Enterprise / MariaDB 10.11     |  |   |  | PostgreSQL 16 + pgvector / Qdrant      |  |
|  +------------------------------------------+  |   |  +----------------------------------------+  |
|  | - users, user_sessions                   |  |   |  | - scripture_embeddings (1536-dim)      |  |
|  | - pending_otps (HMAC-SHA256)             |  |   |  | - verse_commentaries                   |  |
|  | - mantras, aartis, chalisas, stotras     |  |   |  | - user_spiritual_profiles (opt-in)     |  |
|  | - pooja_vidhis, vrat_kathas, upanishads  |  |   |  | - phoneme_reference_models             |  |
|  | - user_jaap_daily_logs                   |  |   +----------------------------------------+  |
|  | - user_favorites, user_consents          |  |                                                  |
|  +------------------------------------------+  |   +------------------------------------------+   |
|                                                |   | Object Storage (Cloudflare R2 / AWS S3)  |   |
|  +------------------------------------------+  |   | - High-Def Audio MP3 Master Tracks       |   |
|  | Hostinger NVMe Storage Engine            |  |   | - Pre-computed Pronunciation Spectrograms|   |
|  +------------------------------------------+  |   +------------------------------------------+   |
+================================================+==================================================+
```

---

## 3. Subsystem Breakdown & Communications

### 3.1 Client Navigation & Route Architecture
* Built on `expo-router` v4 file-based routing with deep linking support (`mantra://` and universal links).
* Root layout provides `QueryClientProvider`, `AuthProvider`, `FavoritesProvider`, and `CosmicThemeProvider`.
* Bottom Tab Layout routes:
  1. `index.tsx`: Sacred Home feed, Daily Mantra, Japa Mala quick access, Spiritual carousels.
  2. `categories.tsx`: Hierarchical Vedic catalog (Shiva, Vishnu, Devi, Ganesha, Hanuman, Vedic).
  3. `favorites.tsx`: Offline-ready bookmarks with filter pills.
  4. `profile.tsx`: Sadhak devotional statistics, 90-day Japa heatmap, preferences, and privacy controls.

### 3.2 Primary REST Backend Subsystem
* Hosted on Hostinger Cloud with TLS 1.3 encryption.
* Clean separation of concerns:
  * `/config/`: Headers, database connection pool, rate limiting policies.
  * `/api/v1/`: Versioned endpoints for scripture entities, auth, sync, and DPDP compliance.
  * `.htaccess`: Rewrites legacy paths to `/api/v1/` transparently while preserving backward compatibility for older mobile app releases.

### 3.3 Offline-First Storage Subsystem
* **Hybrid Storage Architecture:**
  * Sensitive data (session tokens, hardware IDs) -> `expo-secure-store`.
  * High-volume relational data (Japa daily logs, search queries, cached content) -> `expo-sqlite`.
  * Audio track cache -> Native file system sandbox (`FileSystem.documentDirectory`).
* **Cache Management:** TanStack React Query stores serialized cache snapshots in SQLite. Query keys are structured hierarchically: `['entities', category, id]`.

### 3.4 AI Layer & RAG Architecture
* **FastAPI Service:** Runs in containerized Docker instances behind NGINX reverse proxy.
* **Vector Ingestion Pipeline:** Automated script pulls canonical JSON from `/api/v1/` endpoints, chunks verses into Sanskrit slokas and English commentaries, computes embeddings via `text-embedding-3-small`, and stores them in `pgvector` with HNSW indexing.
* **Streaming Engine:** Chat completions stream token-by-token using HTTP/2 Server-Sent Events (SSE) with `<1.5s` Time To First Token (TTFT).

---

## 4. Hardware Device Binding & Identity Trust Boundary

```
+-------------------------------------------------------------------------------+
|                      IDENTITY TRUST BOUNDARY DIAGRAM                          |
+-------------------------------------------------------------------------------+
|                                                                               |
|   [ Mobile Device ]                                                           |
|     - Android ID / iOS Vendor ID                                              |
|     - SecureStore Device UUID                                                 |
|              |                                                                |
|              | (1) POST /auth/send_otp.php (email)                            |
|              v                                                                |
|   [ Hostinger Auth Guard ]                                                    |
|     - Rate limit checks (IP & Email)                                          |
|     - Generate 6-digit CSPRNG OTP                                             |
|     - Compute HMAC-SHA256(otp, server_secret)                                 |
|     - Insert into `pending_otps`                                              |
|     - Dispatch via SMTP                                                       |
|              |                                                                |
|              | (2) Devotee enters OTP                                         |
|              |     POST /auth/verify_otp.php (email, otp, device_id)          |
|              v                                                                |
|   [ Hostinger Verification Engine ]                                           |
|     - Verify attempts <= 5, expires_at > NOW()                                |
|     - Validate hash_equals(db_hash, hmac(otp, secret))                        |
|     - Generate 64-char crypto login token                                     |
|     - Upsert `users` & insert `user_sessions(user_id, token, device_id)`      |
|     - Delete from `pending_otps` (single-use)                                 |
|              |                                                                |
|              | (3) Return Session Token & User Profile                        |
|              v                                                                |
|   [ Client App ]                                                              |
|     - Store token securely in expo-secure-store                               |
|     - Attach X-User-ID, X-Login-Token, X-Device-ID on all future calls        |
+-------------------------------------------------------------------------------+
```

---

## 5. Reliability, Availability & Scalability (RAS)

### 5.1 Fault Tolerance & Failover
* **Read-Only Fallback:** If the backend database becomes temporarily unreachable, the mobile client enters autonomous offline mode, serving content exclusively from the local SQLite cache.
* **Audio Playback Resilience:** If an external audio track fails to stream, the app displays a clear retry state without crashing or disrupting the UI.

### 5.2 Scalability Targets
* **REST Backend:** Handles up to 2,500 requests per second with Apache MPM event worker model and PDO connection reuse.
* **AI Middleware:** Horizontally scalable Kubernetes/Docker deployment capable of handling concurrent SSE streams with automatic worker scaling.

---

## 6. Observability & Logging Strategy
* **Structured Logs:** Backend uses RFC 5424 structured logging for authentication and sync events.
* **Anonymization:** User IP addresses are truncated/masked in logs to protect user privacy.
* **Security Auditing:** Failed verification attempts and rate limit triggers are recorded in `api_security.log` for anomaly detection.
