# 🗄️ Pure MySQL Database & phpMyAdmin Architecture Guide

> **Status:** Production Ready • Zero Coded DB • Strict MySQL Gateway  
> **Last Verified:** October 2026  
> **SQL Dump File:** [`database/mantra_db.sql`](file:///d:/MobileApps/mantra/mantra/database/mantra_db.sql) (1.89 MB, 32 Tables, 2,311 Records)

---

## 📌 Executive Summary

All previous embedded/hardcoded ("coded db") TypeScript fallback arrays and silent local SQLite fallbacks have been completely eliminated. The Mantra ecosystem (Android/iOS Mobile App, Web Portal, Admin Dashboard, and REST API) operates exclusively on a production-grade **MySQL** database.

---

## 🔑 Database Connection Specifications

### Production Environment (Hostinger Cloud)
| Parameter | Value | Notes |
|---|---|---|
| **DBMS** | MySQL 8.0+ / MariaDB | UTF-8 (`utf8mb4_unicode_ci`) |
| **Database Name** | `u885706413_mantra` | Live production database |
| **DB User** | `u885706413_mantra` | Dedicated application user |
| **Internal Host** | `127.0.0.1` | Used by PHP scripts running on server |
| **External Host** | `srv844.hstgr.io` | Remote connection gateway |
| **Port** | `3306` | Standard MySQL port |
| **Server Root** | `/home/u885706413/domains/mantra.aarambhtech.in/public_html` | Subdomain document root |

### Local Environment (XAMPP / Localhost)
| Parameter | Value |
|---|---|
| **DB_HOST** | `127.0.0.1` |
| **DB_NAME** | `mantra_db` or `u885706413_mantra` |
| **DB_USER** | `root` |
| **DB_PASS** | `""` (empty by default) |
| **DB_PORT** | `3306` |

---

## 🖥️ How to Access phpMyAdmin

### 1. In Hostinger hPanel
> [!IMPORTANT]
> **Why you may not see the database under `mantra.aarambhtech.in`:**  
> In Hostinger hPanel, databases are indexed by the parent website under which they were provisioned. The database `u885706413_mantra` is attached to **`aarambhtech.in`**.
> If you select `mantra.aarambhtech.in` in the top dropdown, Hostinger filters and shows zero databases.

**Follow these exact steps to open the database in Hostinger phpMyAdmin:**
1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com).
2. In the top navigation or Websites list, select **`aarambhtech.in`**.
3. In the left sidebar, click **Databases** ➔ **Management**.
4. Scroll to the database named **`u885706413_mantra`**.
5. Click the purple **Enter phpMyAdmin** button next to it.
6. All 32 tables and 2,311 records will be immediately visible and editable.

### 2. In Local XAMPP
1. Start Apache & MySQL in the XAMPP Control Panel.
2. Navigate to `http://localhost/phpmyadmin` in your browser.
3. Click **New**, name the database `mantra_db` (or `u885706413_mantra`), collation `utf8mb4_unicode_ci`.
4. Click the **Import** tab.
5. Select [`database/mantra_db.sql`](file:///d:/MobileApps/mantra/mantra/database/mantra_db.sql) from this repository.
6. Click **Import** (or **Go**). The entire treasury will be imported in seconds.

---

## 📦 Complete Table Inventory (32 Tables, 2,311 Rows)

| Table Name | Rows | Description |
|---|---|---|
| `mantras` | **2,040** | Full canonical chants with Sanskrit, Roman Transliteration, Hindi & English translations, audio links |
| `upanishads` | **48** | Complete Upanishadic verses, commentaries, and philosophical treatises |
| `stotra` | **40** | Sacred stotras, ashtakams, and suktas |
| `aartis` | **40** | Full lyrics, chorus sections, and step-by-step instructions for deity aartis |
| `vrat_katha` / `vrat_kathas` | **18** | Comprehensive multi-chapter stories with vrat significance, synopsis, and translations |
| `categories` | **19** | Deity, liturgical, and Vedic taxonomy categories |
| `festival_aartis` | **19** | Mahaparva and seasonal festive aartis |
| `chalisa` | **11** | Forty-verse devotional poems (Hanuman Chalisa, Shiv Chalisa, etc.) |
| `users` | **13** | Registered devotee user profiles |
| `user_sessions` | **10** | Active device authentication sessions |
| `user_jaap_daily_logs` | **10** | Japa Mala tracking counters and completion history |
| `pooja_vidhi` | **10** | Detailed step-by-step rituals with samagri lists and vidhi instructions |
| `app_events` | **6** | Telemetry and liturgical usage events |
| `rate_limits` | **4** | Dynamic API protection rules |
| `user_device_info` | **3** | Device tokens and hardware profiles |
| `admin_users` | **1** | Admin dashboard credential store |
| `pending_otps` | **1** | Secure hashed OTP store for passwordless email authentication |
| *Other Tables (Logs & Stubs)* | **0** | `api_request_logs`, `api_sliding_rate_limits`, `app_crashes`, `favorites`, `user_favorites`, `feedback_submissions`, `search_history`, `search_terms_log`, `support_tickets`, `push_notification_logs`, `seasonal_aartis`, `user_consents`, `admin_audit_logs`, `admin_otps` |

---

## 🔄 Live Database Export & Backup Utility

A dedicated automated database exporter is configured in the repository:
- **Local File:** [`backend/scripts/export_database_sql.php`](file:///d:/MobileApps/mantra/mantra/backend/scripts/export_database_sql.php)
- **Live Server Trigger (JSON summary):**
  ```
  GET https://mantra.aarambhtech.in/web/backend/scripts/export_database_sql.php?key=sacred_canonical_sync_2026
  ```
- **Direct SQL Download Link:**
  ```
  GET https://mantra.aarambhtech.in/web/backend/scripts/export_database_sql.php?key=sacred_canonical_sync_2026&download=1
  ```

---

## 🛠️ Codebase Changes: Elimination of "Coded DB"

### 1. Mobile App Client ([`src/services/api.ts`](file:///d:/MobileApps/mantra/mantra/src/services/api.ts))
- **Previous Behavior:** Looked up records in hardcoded TypeScript arrays (`CANONICAL_KATHAS`, `CANONICAL_7_DAYS_WORSHIP`) and substituted remote API records.
- **Current Behavior:** Strictly queries remote REST endpoints (`/vrat_kathas/read.php`, `/mantras/read_single.php`, `/pooja_vidhis/read.php`). On-device cache (`meta_store`) is strictly an offline fallback cache.

### 2. Client Liturgical Cache ([`src/services/liturgicalCache.ts`](file:///d:/MobileApps/mantra/mantra/src/services/liturgicalCache.ts))
- **Previous Behavior:** Embedded hardcoded canonical datasets on cache misses.
- **Current Behavior:** Dynamically queries `api.getKathas()` and `api.getPoojaVidhis()` from MySQL and caches responses in SQLite on device for zero-latency offline access.

### 3. Backend Gateway ([`backend/config/database.php`](file:///d:/MobileApps/mantra/mantra/backend/config/database.php))
- **Previous Behavior:** Had a `catch (Throwable $e)` block that initialized a temporary SQLite file in `/tmp/mantra_security/mantra_local.sqlite`.
- **Current Behavior:** Pure MySQL PDO connection. Throws descriptive errors if MySQL credentials fail; zero silent fallback to SQLite.

### 4. Web Portal & Admin Store ([`web/includes/db.php`](file:///d:/MobileApps/mantra/mantra/web/includes/db.php))
- **Previous Behavior:** Initialized `mantra_analytics.sqlite` when MySQL was unreachable.
- **Current Behavior:** Strictly requires MySQL and auto-loads `.env` from server and project roots.
