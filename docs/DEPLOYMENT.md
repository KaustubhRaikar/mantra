# 🚀 MANTRA APP — DEPLOYMENT & DEVOPS STRATEGY

> **Document Identifier:** MANTRA-DOC-DEP-013  
> **Target Audience:** DevOps Engineers, Release Managers, Full-Stack Architects  
> **Status:** Active Deployment Baseline  
> **Version:** 2.0.0  
> **Environments:** Development, Staging, Production  

---

## 1. Multi-Tier Deployment Topology

The Mantra platform consists of three distinct deployment targets:
1. **Client Tier:** Mobile App binary distribution via Expo Application Services (**EAS Build**) to Google Play Store & Apple App Store.
2. **REST Backend Tier:** PHP 8.3 / Apache web service hosted on **Hostinger Cloud Infrastructure**.
3. **AI Middleware Tier:** Dockerized FastAPI service deployed on a scalable container host with PostgreSQL/pgvector.

```
+===================================================================================================+
|                                    DEPLOYMENT PIPELINE OVERVIEW                                   |
+===================================================================================================+
| [ Mobile Client ]          [ REST Backend ]                         [ AI Middleware ]             |
| Expo SDK 57                Hostinger Cloud                          Docker Container              |
|   |                          |                                        |                           |
|   v EAS Build                v Git Webhook / SSH Deploy               v Docker Compose / K8s      |
| Google Play (.aab)         Apache 2.4 / PHP 8.3                     FastAPI / Uvicorn             |
| App Store (.ipa)           Hostinger MySQL 8.0                      Postgres 16 + pgvector        |
| release.keystore           `mantra.aarambhtech.in`                  `ai.aarambhtech.in`           |
+===================================================================================================+
```

---

## 2. Mobile App Deployment (EAS & App Stores)

### 2.1 EAS Build Configuration (`eas.json`)
The application defines three release profiles in `eas.json`:
* `development`: Internal dev client with Expo Go debugging tools enabled.
* `preview`: Standalone APK (`buildType: "apk"`) for internal QA and physical device testing.
* `production`: Production App Bundle (`.aab` for Android, `.ipa` for iOS) with Hermes bytecode optimization and code stripping.

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      }
    }
  }
}
```

### 2.2 Android Keystore & Release Signing
* **Production Keystore:** Stored securely at `d:\MobileApps\mantra\mantra\release.keystore`.
* **Signing Configuration:**
  ```properties
  RELEASE_STORE_FILE=release.keystore
  RELEASE_STORE_PASSWORD=***REDACTED***
  RELEASE_KEY_ALIAS=mantra-release-key
  RELEASE_KEY_PASSWORD=***REDACTED***
  ```
* **Build Command:**
  ```bash
  # Standalone QA APK
  eas build --platform android --profile preview --local

  # Production Google Play Bundle
  eas build --platform android --profile production
  ```

---

## 3. Hostinger REST Backend Deployment

### 3.1 Directory Layout & Apache Virtual Host
The backend is deployed to the root web directory on Hostinger Cloud:
```
/public_html/
├── api/
│   └── v1/
│       ├── auth/
│       │   ├── send_otp.php
│       │   ├── verify_otp.php
│       │   ├── verify_session.php
│       │   ├── consent.php
│       │   └── delete_account.php
│       ├── mantras/
│       ├── aartis/
│       ├── jaap/
│       │   └── sync.php
│       └── favorites/
│           └── sync.php
├── config/
│   ├── database.php
│   ├── headers.php
│   └── rate_limit.php
└── .htaccess
```

### 3.2 Apache URL Rewriting (`.htaccess`)
To maintain backward compatibility with legacy app versions while migrating all traffic to `/api/v1/`:
```apache
RewriteEngine On
RewriteBase /

# Force HTTPS & TLS
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Route legacy /api/ endpoints to /api/v1/
RewriteRule ^api/auth/(.*)$ api/v1/auth/$1 [L,QSA]
RewriteRule ^api/mantras/(.*)$ api/v1/mantras/$1 [L,QSA]
RewriteRule ^api/jaap/(.*)$ api/v1/jaap/$1 [L,QSA]
RewriteRule ^api/favorites/(.*)$ api/v1/favorites/$1 [L,QSA]
```

---

## 4. AI Middleware Deployment (FastAPI + Docker)

### 4.1 Docker Containerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 4.2 Docker Compose Topology
```yaml
version: '3.8'

services:
  ai-api:
    build: .
    restart: always
    ports:
      - "8000:8000"
    environment:
      - POSTGRES_URL=postgresql://user:pass@db:5432/mantra_vectors
      - REDIS_URL=redis://redis:6379/0
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis

  db:
    image: pgvector/pgvector:pg16
    restart: always
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=mantra_vectors
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass

  redis:
    image: redis:7-alpine
    restart: always

volumes:
  pgdata:
```

---

## 5. Environment Configurations (`.env`)

| Variable | Target Value (Production) | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `https://mantra.aarambhtech.in/api/v1` | Primary REST API URL |
| `EXPO_PUBLIC_AI_SERVICE_URL` | `https://ai.aarambhtech.in/v1` | Streaming AI Middleware URL |
| `DB_HOST` | `127.0.0.1` | Hostinger MySQL Socket/Host |
| `DB_NAME` | `u123456_mantra` | Production Database Name |
| `SERVER_PEPPER_SECRET` | `***CRITICAL_32_BYTE_HEX***` | OTP HMAC Hashing Pepper |

---

## 6. Health Checks, Rollback & Disaster Recovery

### 6.1 Automated Health Checks
* `GET /api/v1/health.php` checks database connection pool and returns HTTP 200 with `{ "status": "ok", "db": "connected" }`.
* Ping monitoring via UptimeRobot every 60 seconds; alerts sent to Telegram/Email upon downtime.

### 6.2 Rollback Procedures
* **Mobile Client:** EAS Update channels allow rolling over-the-air (OTA) JS/asset rollbacks within 60 seconds if a breaking UI bug occurs.
* **REST Backend:** Git branch tags (`v2.0.0`, `v1.9.8`) allow instant zero-downtime symlink rollbacks on the Hostinger server.

---

## 7. Web Portal, Public Legal Disclosures & Admin Suite Deployment

The `web/` directory contains all public-facing web pages and the internal administrative portal deployed to `https://mantra.aarambhtech.in`:

```
/public_html/
├── index.html                   # Cosmic Vedic landing page matching mobile app UI
├── privacy.html                 # DPDP Act 2023 & Google Play compliant privacy policy
├── delete-account.html          # Mandatory Google Play public data deletion portal
├── terms.html                   # Terms of Service & Spiritual personal use covenant
├── support.html                 # Devotee Support Center & FAQ
├── .htaccess                    # Hardened CSP, HSTS, rate limits & security headers
├── .well-known/
│   └── assetlinks.json          # Android App Links SHA-256 fingerprint verification
├── admin/                       # Administrative telemetry & CMS suite
│   ├── index.php                # Executive Dashboard & 10 AI Insights
│   ├── login.php                # Rate-limited admin authentication (CSRF + IP bucket)
│   ├── logout.php               # Session invalidation & cookie clearance
│   ├── scriptures.php           # Devanagari Scripture CMS & audio tags
│   ├── users.php                # Devotee governance & DPDP 72-hour erasure queue
│   ├── stats_growth.php         # User Acquisition & Segmentation (Metrics 1–25)
│   ├── stats_engagement.php     # Engagement & Devotional Depth (Metrics 26–45)
│   ├── stats_retention.php      # Cohort Retention & Onboarding (Metrics 46–60, 76–90)
│   ├── stats_features.php       # Feature Adoption & Scripture Analytics (Metrics 61–75)
│   ├── stats_revenue.php        # Sacred Non-Commercial Covenant Audit (Metrics 91–105)
│   ├── stats_performance.php    # Technical Latency & Crash Parity (Metrics 106–120)
│   ├── stats_security.php       # Security & Immutable Audit Logs (Metrics 121–135)
│   ├── stats_support.php        # Support Tickets & Play Store CSAT (Metrics 136–150)
│   └── includes/
│       └── stats_nav.php        # Universal horizontal navigation bar
├── includes/
│   ├── db.php                   # MySQL PDO manager with auto-fallback to SQLite
│   ├── security.php             # CSRF, XSS, NFC normalization & dual-key rate limiter
│   └── analytics.php            # AnalyticsEngine computing all 150 real SQL metrics
└── api/
    ├── delete_request.php       # Rate-limited public web deletion request endpoint
    └── telemetry.php            # Batch ingestion endpoint for app events
```

### 7.1 Android App Links Fingerprint Verification
The release keystore fingerprint configured in `.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.aarambhtech.mantra",
    "sha256_cert_fingerprints": [
      "75:62:DE:7B:87:65:8C:C8:54:8C:04:74:09:0D:61:96:8C:C4:C7:E8:F6:A1:52:F6:86:BF:BD:75:E4:EA:00:C8"
    ]
  }
}]
```

