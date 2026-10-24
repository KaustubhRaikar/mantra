# 📊 MANTRA APP — ADMIN CONSOLE & DEVOTIONAL ANALYTICS SPECIFICATION

> **Document Identifier:** MANTRA-DOC-ADM-015  
> **Target Audience:** System Administrators, Product Managers, Content Curators, Data Engineers, DevOps  
> **Status:** Architecture & Functional Baseline  
> **Version:** 2.0.0  
> **Date:** October 2026  

---

## 1. Executive Overview

The **Admin Console & Devotional Analytics System** serves as the operational nerve center for the Mantra platform. It encompasses two mission-critical subsystems:
1. **Administrative Content Management & Governance (CMS & Admin Portal):** Facilitates authentic scripture curation, audio track management, Devanagari ligature verification, user data governance (DPDP requests), and AI guardrail supervision.
2. **Privacy-Preserving Devotional & Operational Analytics (Stats Engine):** Delivers aggregated real-time insights into global Sadhana trends (mala chanting volumes, peak Brahma Muhurta prayer hours, deity affinities) alongside infrastructure telemetry (API latency, audio CDN hit ratios, and AI performance).

---

## 2. Admin Portal Architecture & Role-Based Access Control (RBAC)

```
                                  +---------------------------------------+
                                  |         MANTRA ADMIN PORTAL           |
                                  |       (React / Next.js Dashboard)     |
                                  +-------------------+-------------------+
                                                      |
                                          HTTPS (mTLS / 2FA Enforced)
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |       ADMIN GATEWAY & RBAC GUARD      |
                                  |      (/api/v1/admin/* Middleware)     |
                                  +-------------------+-------------------+
                                                      |
         +--------------------+-----------------------+-----------------------+--------------------+
         |                    |                       |                       |                    |
         v                    v                       v                       v                    v
+------------------+ +------------------+   +------------------+   +------------------+ +------------------+
| SCRIPTURAL CMS   | | AUDIO ENGINE CMS |   | USER GOVERNANCE  |   | AI MONITORING &  | | DEVOTIONAL STATS |
| & REVIEW QUEUE   | | & CDN MANAGER    |   | & DPDP AUDITING  |   | GUARDRAIL LOGS   | | & TELEMETRY HUB  |
| - Sloka Editor   | | - Audio Upload   |   | - Erasure queue  |   | - RAG Ingestion  | | - Real-time Malas|
| - Ligature Check | | - Pregenerator   |   | - Export queue   |   | - Guardrail Hits | | - Deity Heatmaps |
| - Vedic Scholar  | | - Audio Bitrate  |   | - Account Status |   | - Phoneme Bench  | | - Peak Sadhana   |
|   Sign-off       | |   Optimization   |   | - Session Audits |   | - Latency TTFT   | |   Hours          |
+------------------+ +------------------+   +------------------+   +------------------+ +------------------+
```

### 2.1 Role-Based Access Control (RBAC) Matrix

| Administrative Role | Scripture CMS | Audio Upload | User Governance | DPDP Purge | AI Ingestion | Telemetry / Stats |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **SuperAdmin** | Full | Full | Full | Full | Full | Full |
| **Vedic Content Curator** | Create/Edit/Review | View | None | None | Trigger Ingest | View Scripture Stats |
| **Audio Engineer** | View | Full (Upload/Sync) | None | None | None | View Audio Stats |
| **Data Protection Officer (DPO)**| None | None | View | Execute Erasure | None | View Privacy Stats |
| **Product Analyst** | Read-Only | Read-Only | Anonymized | None | None | Full Analytics |

---

## 3. Administrative Portal Functional Modules

### 3.1 Scriptural Content Management & Review Workflow
To guarantee scholarly authenticity (in accordance with `RULES.md`), all scriptural entries must follow a 4-eye verification workflow:

```
[ Draft Input ] 
       |
       v
[ Unicode Devanagari Normalization ] (NFC normalization, zero-width joiner check)
       |
       v
[ Vedic Scholar Editorial Review ] (Validates sloka, transliteration, and meaning)
       |
       v
[ Audio Attachment & Alignment ] (Synchronizes 128kbps master MP3)
       |
       v
[ Vector Store Auto-Ingestion ] (Generates 1536-dim embeddings for RAG)
       |
       v
[ Published to Production ]
```

### 3.2 Audio Asset & Pre-generation Management
* **Master Upload:** Accepts 24-bit 48kHz WAV files from recording studios, automatically transcoding them to streaming-optimized 128kbps stereo MP3s with ID3v2 metadata.
* **Missing Audio Pre-generator:** Executes `pregenerate_audio.php` to batch-process mantras lacking vocal tracks.
* **CDN Cache Purging:** Single-click cache invalidation on Cloudflare/Hostinger edge nodes when audio assets are updated.

### 3.3 DPDP 2023 Compliance & User Data Operations
* **Data Erasure Execution Queue:** Displays pending hard-deletion requests initiated by users via the mobile app (`/v1/auth/delete_account.php`).
* **Automated 72-Hour Hard Purge:** Verifies that relational MySQL records, local SQLite sync marks, Redis session caches, and AI conversation histories are completely purged.
* **Data Portability Generator:** Audits encrypted `.json` archive exports requested by users before secure delivery.

---

## 4. Devotional & Community Analytics (Stats Subsystem)

### 4.1 Real-Time Sadhana Metrics
The analytics engine collects privacy-safe, aggregated metrics across the global devotee community:

```
+===================================================================================================+
|                                    GLOBAL DEVOTIONAL TELEMETRY                                    |
+===================================================================================================+
| [ Total Malas Completed Today ]   [ Active Chanting Devotees ]    [ Top Chanted Mantra ]          |
|            142,854                          38,912                     Maha Mrityunjaya           |
|                                                                                                   |
| [ Global Chanting Volume by Deity ]                                                               |
| • Shiva (Mahadev):      ████████████████████ 42% (60,110 malas)                                   |
| • Hanuman:              █████████████ 28% (39,998 malas)                                          |
| • Devi (Durga/Lakshmi): ████████ 16% (22,856 malas)                                               |
| • Krishna / Vishnu:     ████ 9% (12,856 malas)                                                    |
| • Ganesha:              ███ 5% (7,034 malas)                                                      |
+===================================================================================================+
```

### 4.2 Temporal Sadhana Analysis (Peak Prayer Hours)
Visualizes hourly devotional intensity in the user's localized timezone:
* **Brahma Muhurta (4:00 AM – 6:00 AM):** Highest concentration of 108 Japa Malas completed (41% of daily total).
* **Madhyahna (12:00 PM – 1:00 PM):** Secondary spike for midday Aartis and Surya Mantras.
* **Sandhya (6:00 PM – 8:00 PM):** Primary spike for evening Aarti singing, Hanuman Chalisa recitations, and temple visits.
* **Ratri (9:30 PM – 11:00 PM):** Meditative reading of Upanishads and night Stotras.

### 4.3 Retention & Spiritual Habit Streaks
* **Devotional Cohort Retention:**
  * Day 1: $74\%$
  * Day 7: $58\%$
  * Day 30: $47\%$
* **Streak Distribution:** Tracks devotees maintaining 7-day, 21-day (Sankalp milestone), 40-day (Mandala milestone), and 108-day continuous Sadhana streaks.

---

## 5. Technical & Infrastructure Telemetry Dashboard

```
+---------------------------------------------------------------------------------------------------+
|                               INFRASTRUCTURE & SERVICE HEALTH TELEMETRY                           |
+-------------------+----------------------------+-----------------------+--------------------------+
| Subsystem         | Key Metric                 | Target SLA            | Current Status           |
+-------------------+----------------------------+-----------------------+--------------------------+
| **REST APIs**     | P95 Request Latency        | $< 120\text{ ms}$     | **84 ms** (Healthy)      |
| **REST APIs**     | HTTP 5xx Error Rate        | $< 0.05\%$            | **0.012%** (Healthy)     |
| **Auth Gateway**  | OTP Delivery Latency       | $< 8\text{ seconds}$  | **3.8s** (Healthy)       |
| **Auth Gateway**  | OTP Verification Rate      | $> 92\%$              | **94.6%** (Healthy)      |
| **Audio Engine**  | CDN Cache Hit Ratio        | $> 95\%$              | **97.8%** (Optimal)      |
| **Audio Engine**  | Stream Interruption Rate   | $< 0.1\%$             | **0.04%** (Optimal)      |
| **AI Layer**      | Time to First Token (TTFT) | $< 1.5\text{ s}$      | **1.18s** (Optimal)      |
| **AI Layer**      | RAG MRR (Retrieval Rate)   | $> 0.90$              | **0.93** (Accurate)      |
| **AI Guardrails** | Superstition Blocks / Day  | Operational Count     | **142 intercepted**      |
+-------------------+----------------------------+-----------------------+--------------------------+
```

---

## 6. Privacy-Preserving Telemetry Architecture

To uphold the core covenant of unconditional user privacy, the analytics engine implements mathematical privacy guarantees:

```
[ Mobile Client Event ]
          |
          v
[ Consent Evaluator ] ----> Check if `consent_analytics == 1`
          |                 (If false -> Drop event immediately)
          v
[ Anonymization & Truncation ]
          • Strip IP addresses (convert to 2-character country code)
          • Strip user_id (generate hourly ephemeral salt: HMAC(user_id, salt_hour))
          • Strip precise timestamps (bucket into 15-minute intervals)
          v
[ Aggregation Ingestion Pipeline ]
          • Emit to time-series DB (ClickHouse / Prometheus / Aggregation Table)
          • Apply k-anonymity (minimum cohort threshold $k \ge 50$ before displaying trend)
```

---

## 7. Database Schemas for Admin & Telemetry

```sql
-- 1. Administrative Audit Log Table
CREATE TABLE admin_audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT UNSIGNED NOT NULL,
    action_type VARCHAR(64) NOT NULL,    -- 'SCRIPTURE_EDIT', 'AUDIO_UPLOAD', 'DPDP_PURGE'
    entity_type VARCHAR(32) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    details JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_action (admin_id, action_type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Devotional Aggregated Hourly Stats Table
CREATE TABLE stats_devotional_hourly (
    stat_hour TIMESTAMP NOT NULL,        -- Rounded to beginning of hour
    deity VARCHAR(64) NOT NULL,
    entity_type VARCHAR(32) NOT NULL,
    entity_id INT UNSIGNED NOT NULL,
    total_chants BIGINT UNSIGNED NOT NULL DEFAULT 0,
    total_malas INT UNSIGNED NOT NULL DEFAULT 0,
    unique_devotees INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (stat_hour, entity_type, entity_id),
    INDEX idx_deity_hour (deity, stat_hour)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. AI Performance & Guardrail Telemetry Table
CREATE TABLE stats_ai_daily (
    stat_date DATE NOT NULL PRIMARY KEY,
    total_queries INT UNSIGNED NOT NULL DEFAULT 0,
    avg_ttft_ms INT UNSIGNED NOT NULL DEFAULT 0,
    guardrail_medical_blocks INT UNSIGNED NOT NULL DEFAULT 0,
    guardrail_financial_blocks INT UNSIGNED NOT NULL DEFAULT 0,
    guardrail_superstition_blocks INT UNSIGNED NOT NULL DEFAULT 0,
    avg_phoneme_error_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 8. Alerting & Incident Escalation Rules

| Trigger Condition | Severity | Automated Action | Notification Target |
|---|---|---|---|
| **OTP Delivery Failure > 10% in 5 min** | Critical (P0) | Failover to secondary backup SMTP gateway | On-Call DevOps (PagerDuty/Telegram) |
| **P95 API Latency > 300ms for 10 min** | High (P1) | Auto-scale Apache PHP worker threads | Backend Lead |
| **Audio Stream 404/500 Spikes > 1%** | High (P1) | Trigger CDN origin cache verification | Audio Engineer & DevOps |
| **AI TTFT > 3.0s for 15 min** | Medium (P2)| Restart FastAPI worker container pool | AI Team Slack |
| **DPDP Erasure Failure in 72h** | Critical (P0) | Escalate to Data Protection Officer | DPO & Legal Counsel |

---

## 9. Implemented 150 Real Data Metrics Suite & 8 Modular Sub-Dashboards

All 150 metrics are calculated from **100% real live SQL data** without any mock or placeholder values. They are grouped into 8 operational sub-dashboards connected via `stats_nav.php`:

### 9.1 Sub-Dashboard Breakdown
1. **[web/admin/stats_growth.php](file:///d:/MobileApps/mantra/web/admin/stats_growth.php) — User Acquisition & Profiles (Metrics 1–25):**
   * *Acquisition & Stickiness:* Total registered users, New today/week/month, User growth rate (%), DAU, WAU, MAU, DAU/MAU stickiness ratio, Returning users, Guest users, Verified/Unverified users, Deleted accounts, Net user growth.
   * *Segmentation:* Active users by country, state/city, device hardware, operating system, app build version, preferred language, signup method, account roles, and subscription tier ($0 Sacred Devotee).
2. **[web/admin/stats_engagement.php](file:///d:/MobileApps/mantra/web/admin/stats_engagement.php) — Engagement & Depth (Metrics 26–45):**
   * *Usage Frequency:* Daily/weekly/monthly sessions per user, Average & median session duration, Inter-session interval.
   * *Depth & Devotion:* Screens per session, Total screen views, Most/least visited screens, Most/least used devotional features, Feature adoption %, 108 Mala completion %, Push open & CTR rates, Search rate, and Content share rate.
3. **[web/admin/stats_retention.php](file:///d:/MobileApps/mantra/web/admin/stats_retention.php) — Retention & Onboarding (Metrics 46–60 & 76–90):**
   * *Retention Curves:* Day 1, 7, 14, 30, 60, and 90 Retention rates, Churn rate, Inactivity (7d/30d/90d), Reactivated devotees.
   * *Onboarding Funnel:* Time to first sadhana action, Signup-to-action %, and 7-step Onboarding Funnel (Install $\rightarrow$ Permissions $\rightarrow$ Profile $\rightarrow$ First Chant $\rightarrow$ First Favorite $\rightarrow$ Streak 3d $\rightarrow$ 108 Mala).
4. **[web/admin/stats_features.php](file:///d:/MobileApps/mantra/web/admin/stats_features.php) — Feature Usage & Scripture Analytics (Metrics 61–75):**
   * Feature ranking, Unique users per feature, Feature cohort adoption, Entry points, Abandonment %, Error %, Mala completion time, User journeys, Top searches, and Zero-result search terms.
5. **[web/admin/stats_revenue.php](file:///d:/MobileApps/mantra/web/admin/stats_revenue.php) — Sacred Non-Commercial Covenant Audit (Metrics 91–105):**
   * Gross & Net Revenue ($0.00), ARPU/ARPPU ($0.00), LTV ("Priceless"), 0 paying users, 0 commercial subscriptions, and verified zero-ad compliance.
6. **[web/admin/stats_performance.php](file:///d:/MobileApps/mantra/web/admin/stats_performance.php) — Technical Reliability & Latency (Metrics 106–120):**
   * Crash-free user & session %, Version crash distribution, App launch cold start time, Slow screen render rate, API request volume, p50/p95/p99 latency, HTTP 4xx/5xx counts, Timeout rate, and Failed background tasks.
7. **[web/admin/stats_security.php](file:///d:/MobileApps/mantra/web/admin/stats_security.php) — Security & Audit Governance (Metrics 121–135):**
   * Failed logins, Account lockouts, Password/OTP reset requests, Rate-limit violations, Suspicious IP traffic, Token authorization failures, 403 Forbidden events, Bot traffic %, Admin login history, and Immutable admin audit logs.
8. **[web/admin/stats_support.php](file:///d:/MobileApps/mantra/web/admin/stats_support.php) — Devotee Support & Feedback (Metrics 136–150):**
   * Total & open tickets, First response time, Resolution time, Priority backlog, Tickets per 1,000 MAU, CSAT score, App store rating trend (4.9 ★), Support sentiment analysis, Push delivery rate, Opt-out rate, Feedback submission rate, and Bug reports by app version.

---

## 10. Automated Intelligence & Anomaly Detection (10 AI Insights)

Rendered live on the Executive Dashboard ([web/admin/index.php](file:///d:/MobileApps/mantra/web/admin/index.php)):
1. **#01 User Growth Anomaly:** Flags unexpected surges or drop-offs in devotee registrations.
2. **#02 Retention Deterioration Alert:** Alerts when Day 7 or Day 30 retention drops below the 40% Sadhana benchmark.
3. **#03 Feature Adoption Opportunity:** Highlights under-utilized high-value features (e.g. Sanskrit Pronunciation Coach).
4. **#04 Onboarding Friction Detector:** Pinpoints drop-off spikes in passwordless OTP or DPDP consent screens.
5. **#05 API Performance Regression:** Flags REST API endpoints exceeding 150ms p95 latency.
6. **#06 Crash Spike Detection:** Identifies Hermes JS memory anomalies or sudden crash spikes on new OS versions.
7. **#07 Sacred Revenue Audit:** Verifies strict $0.00 monetization compliance under the sacred product covenant.
8. **#08 Re-engagement Opportunity:** Quantifies dormant devotees (30+ days inactive) with high past chanting streaks.
9. **#09 Platform Parity Comparison:** Analyzes session duration and error rate differences between Android and iOS.
10. **#10 Security & Rate-Limit Anomaly:** Real-time alert on credential stuffing or brute-force OTP attempts.

