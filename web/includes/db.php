<?php
/**
 * Database Connection & Analytics Store Manager
 * Connects to MySQL with automatic self-healing SQLite fallback for local development.
 * Automatically initializes and migrates telemetry and analytics tables on first run.
 */

class DatabaseManager {
    private static ?PDO $pdo = null;
    private static string $driver = 'mysql';

    public static function getConnection(): PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $db   = getenv('DB_NAME') ?: 'mantra_db';
        $user = getenv('DB_USER') ?: 'root';
        $pass = getenv('DB_PASS') ?: '';
        $port = getenv('DB_PORT') ?: '3306';

        // Try MySQL first
        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
            self::$pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
            self::$driver = 'mysql';
        } catch (Throwable $e) {
            // Self-healing fallback: Embedded local SQLite database
            $sqliteDir = sys_get_temp_dir() . '/mantra_security';
            if (!is_dir($sqliteDir)) {
                @mkdir($sqliteDir, 0750, true);
            }
            $sqliteFile = $sqliteDir . '/mantra_analytics.sqlite';
            self::$pdo = new PDO("sqlite:" . $sqliteFile, null, null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            self::$driver = 'sqlite';
        }

        self::initializeSchema();
        return self::$pdo;
    }

    public static function getDriver(): string {
        return self::$driver;
    }

    /**
     * Initializes all core tables if they do not exist
     */
    private static function initializeSchema(): void {
        $db = self::$pdo;
        $isSqlite = (self::$driver === 'sqlite');

        $autoInc = $isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY';
        $intPk   = $isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT UNSIGNED AUTO_INCREMENT PRIMARY KEY';
        $nowDef  = $isSqlite ? "DATETIME DEFAULT CURRENT_TIMESTAMP" : "TIMESTAMP DEFAULT CURRENT_TIMESTAMP";

        // 1. Users Table
        $db->exec("CREATE TABLE IF NOT EXISTS users (
            id {$autoInc},
            email VARCHAR(255) NOT NULL UNIQUE,
            full_name VARCHAR(150) NOT NULL DEFAULT 'Devotee',
            status VARCHAR(32) NOT NULL DEFAULT 'active',
            role VARCHAR(32) NOT NULL DEFAULT 'devotee',
            language VARCHAR(20) NOT NULL DEFAULT 'Hindi',
            country VARCHAR(10) NOT NULL DEFAULT 'IN',
            os VARCHAR(20) NOT NULL DEFAULT 'Android',
            app_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
            signup_method VARCHAR(30) NOT NULL DEFAULT 'email_otp',
            subscription_tier VARCHAR(30) NOT NULL DEFAULT 'free',
            created_at {$nowDef},
            updated_at {$nowDef}
        );");

        // 2. User Sessions Table
        $db->exec("CREATE TABLE IF NOT EXISTS user_sessions (
            id {$autoInc},
            user_id BIGINT NOT NULL,
            login_token VARCHAR(128) NOT NULL,
            device_id VARCHAR(128) NOT NULL,
            device_name VARCHAR(100) DEFAULT 'Unknown Device',
            os VARCHAR(30) DEFAULT 'Android',
            app_version VARCHAR(20) DEFAULT '1.0.0',
            country VARCHAR(10) DEFAULT 'IN',
            city VARCHAR(100) DEFAULT 'New Delhi',
            expires_at DATETIME NOT NULL,
            created_at {$nowDef},
            last_active_at {$nowDef}
        );");

        // 3. User Jaap Daily Logs Table
        $db->exec("CREATE TABLE IF NOT EXISTS user_jaap_daily_logs (
            id {$autoInc},
            user_id BIGINT NOT NULL,
            log_date DATE NOT NULL,
            total_chants INT NOT NULL DEFAULT 0,
            completed_malas INT NOT NULL DEFAULT 0,
            updated_at {$nowDef}
        );");

        // 4. User Favorites Table
        $db->exec("CREATE TABLE IF NOT EXISTS user_favorites (
            id {$autoInc},
            user_id BIGINT NOT NULL,
            entity_type VARCHAR(32) NOT NULL,
            entity_id INT NOT NULL,
            is_deleted INT NOT NULL DEFAULT 0,
            updated_at {$nowDef}
        );");

        // 5. User Consents Table
        $db->exec("CREATE TABLE IF NOT EXISTS user_consents (
            id {$autoInc},
            user_id BIGINT NOT NULL,
            consent_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            consent_functional INT NOT NULL DEFAULT 1,
            consent_analytics INT NOT NULL DEFAULT 0,
            consent_ai INT NOT NULL DEFAULT 0,
            ip_address VARCHAR(45) NOT NULL,
            consented_at {$nowDef}
        );");

        // 6. Rate Limits Table
        $db->exec("CREATE TABLE IF NOT EXISTS rate_limits (
            rate_key VARCHAR(128) PRIMARY KEY,
            hits INT NOT NULL DEFAULT 1,
            reset_at INT NOT NULL
        );");

        // 7. App Telemetry Events Table
        $db->exec("CREATE TABLE IF NOT EXISTS app_events (
            id {$autoInc},
            user_id BIGINT NULL,
            session_id VARCHAR(64) NULL,
            event_type VARCHAR(64) NOT NULL,
            feature_name VARCHAR(64) NULL,
            screen_name VARCHAR(64) NULL,
            duration_ms INT NOT NULL DEFAULT 0,
            metadata TEXT NULL,
            created_at {$nowDef}
        );");

        // 8. API Request Logs Table
        $db->exec("CREATE TABLE IF NOT EXISTS api_request_logs (
            id {$autoInc},
            endpoint VARCHAR(150) NOT NULL,
            method VARCHAR(10) NOT NULL,
            status_code INT NOT NULL,
            latency_ms INT NOT NULL,
            ip_hash VARCHAR(64) NOT NULL,
            user_id BIGINT NULL,
            created_at {$nowDef}
        );");

        // 9. App Crashes Table
        $db->exec("CREATE TABLE IF NOT EXISTS app_crashes (
            id {$autoInc},
            app_version VARCHAR(20) NOT NULL,
            os_version VARCHAR(30) NOT NULL,
            crash_type VARCHAR(100) NOT NULL,
            stack_trace TEXT NULL,
            user_id BIGINT NULL,
            created_at {$nowDef}
        );");

        // 10. Support Tickets Table
        $db->exec("CREATE TABLE IF NOT EXISTS support_tickets (
            id {$autoInc},
            user_id BIGINT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            priority VARCHAR(20) NOT NULL DEFAULT 'medium',
            status VARCHAR(30) NOT NULL DEFAULT 'open',
            response_time_s INT NOT NULL DEFAULT 0,
            resolution_time_s INT NOT NULL DEFAULT 0,
            rating INT NULL,
            created_at {$nowDef},
            resolved_at DATETIME NULL
        );");

        // 11. Feedback Submissions Table
        $db->exec("CREATE TABLE IF NOT EXISTS feedback_submissions (
            id {$autoInc},
            user_id BIGINT NULL,
            category VARCHAR(64) NOT NULL,
            sentiment VARCHAR(20) NOT NULL DEFAULT 'positive',
            message TEXT NOT NULL,
            app_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
            rating INT NOT NULL DEFAULT 5,
            created_at {$nowDef}
        );");

        // 12. Admin Audit Logs Table
        $db->exec("CREATE TABLE IF NOT EXISTS admin_audit_logs (
            id {$autoInc},
            admin_id BIGINT NOT NULL,
            action_type VARCHAR(64) NOT NULL,
            entity_type VARCHAR(32) NOT NULL,
            entity_id VARCHAR(64) NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            details TEXT NULL,
            created_at {$nowDef}
        );");

        // 13. Scripture Search Terms Table
        $db->exec("CREATE TABLE IF NOT EXISTS search_terms_log (
            id {$autoInc},
            query VARCHAR(150) NOT NULL,
            results_count INT NOT NULL DEFAULT 0,
            user_id BIGINT NULL,
            created_at {$nowDef}
        );");

        // 14. Push Notification Logs Table
        $db->exec("CREATE TABLE IF NOT EXISTS push_notification_logs (
            id {$autoInc},
            campaign_name VARCHAR(100) NOT NULL,
            target_segment VARCHAR(50) NOT NULL,
            total_sent INT NOT NULL DEFAULT 0,
            total_delivered INT NOT NULL DEFAULT 0,
            total_opened INT NOT NULL DEFAULT 0,
            total_clicked INT NOT NULL DEFAULT 0,
            created_at {$nowDef}
        );");
    }
}
