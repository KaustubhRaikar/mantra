<?php
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_root_sync_2026') {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$publicHtml = dirname(__DIR__, 4);
$repoWebDir = $publicHtml . '/web/web';

$log = [
    "timestamp" => date('c'),
    "public_html" => $publicHtml,
    "actions" => []
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. BACKUP & REPLACE OLD public_html/index.php WITH CLEAN LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────
if (file_exists($publicHtml . '/index.php') && !file_exists($publicHtml . '/index.php.bak')) {
    copy($publicHtml . '/index.php', $publicHtml . '/index.php.bak');
    $log['actions'][] = "Backed up old index.php to index.php.bak";
}

$newLandingHtml = file_get_contents($repoWebDir . '/index.html');
if ($newLandingHtml) {
    file_put_contents($publicHtml . '/index.php', $newLandingHtml);
    file_put_contents($publicHtml . '/index.html', $newLandingHtml);
    $log['actions'][] = "Replaced public_html/index.php and public_html/index.html with modern app showcase";
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. COPY LEGAL & USER PORTALS
// ─────────────────────────────────────────────────────────────────────────────
$legalFiles = ['privacy.html', 'terms.html', 'support.html', 'delete-account.html'];
foreach ($legalFiles as $file) {
    if (file_exists($repoWebDir . '/' . $file)) {
        copy($repoWebDir . '/' . $file, $publicHtml . '/' . $file);
        $log['actions'][] = "Synchronized {$file} to public_html";
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. COPY INCLUDES & ADMIN TO public_html
// ─────────────────────────────────────────────────────────────────────────────
function recursiveCopy($src, $dst) {
    $dir = opendir($src);
    @mkdir($dst, 0755, true);
    while (false !== ($file = readdir($dir))) {
        if (($file != '.') && ($file != '..')) {
            if (is_dir($src . '/' . $file)) {
                recursiveCopy($src . '/' . $file, $dst . '/' . $file);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

if (is_dir($repoWebDir . '/includes')) {
    recursiveCopy($repoWebDir . '/includes', $publicHtml . '/includes');
    $log['actions'][] = "Synchronized web/includes to public_html/includes";
}

if (is_dir($repoWebDir . '/admin')) {
    recursiveCopy($repoWebDir . '/admin', $publicHtml . '/admin');
    $log['actions'][] = "Synchronized web/admin to public_html/admin";
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DATABASE INITIALIZATION ON SERVER MySQL (u885706413_mantra)
// ─────────────────────────────────────────────────────────────────────────────
$dbFile = $publicHtml . '/config/database.php';
if (!file_exists($dbFile)) {
    $dbFile = $publicHtml . '/web/backend/config/database.php';
}

if (file_exists($dbFile)) {
    include_once $dbFile;
    $database = new Database();
    $db = $database->getConnection();
    $dbName = $db->query("SELECT DATABASE()")->fetchColumn();
    $log['database_connected'] = $dbName;

    // Create all 16 operational tables
    $tables = [
        "users" => "CREATE TABLE IF NOT EXISTS users (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "user_sessions" => "CREATE TABLE IF NOT EXISTS user_sessions (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            login_token VARCHAR(128) NOT NULL,
            device_id VARCHAR(128) NOT NULL,
            device_name VARCHAR(100) DEFAULT 'Unknown Device',
            os VARCHAR(30) DEFAULT 'Android',
            app_version VARCHAR(20) DEFAULT '1.0.0',
            country VARCHAR(10) DEFAULT 'IN',
            city VARCHAR(100) DEFAULT 'New Delhi',
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user (user_id),
            INDEX idx_token (login_token),
            INDEX idx_last_active (last_active_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "user_jaap_daily_logs" => "CREATE TABLE IF NOT EXISTS user_jaap_daily_logs (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            log_date DATE NOT NULL,
            total_chants INT UNSIGNED NOT NULL DEFAULT 0,
            completed_malas INT UNSIGNED NOT NULL DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uk_user_date (user_id, log_date),
            INDEX idx_date (log_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "user_favorites" => "CREATE TABLE IF NOT EXISTS user_favorites (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            entity_type VARCHAR(32) NOT NULL,
            entity_id INT UNSIGNED NOT NULL,
            is_deleted TINYINT NOT NULL DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uk_user_fav (user_id, entity_type, entity_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "user_consents" => "CREATE TABLE IF NOT EXISTS user_consents (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            consent_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            consent_functional TINYINT NOT NULL DEFAULT 1,
            consent_analytics TINYINT NOT NULL DEFAULT 0,
            consent_ai TINYINT NOT NULL DEFAULT 0,
            ip_address VARCHAR(45) NOT NULL,
            consented_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_consent (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "rate_limits" => "CREATE TABLE IF NOT EXISTS rate_limits (
            rate_key VARCHAR(128) PRIMARY KEY,
            hits INT UNSIGNED NOT NULL DEFAULT 1,
            reset_at INT UNSIGNED NOT NULL,
            INDEX idx_reset (reset_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "app_events" => "CREATE TABLE IF NOT EXISTS app_events (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NULL,
            session_id VARCHAR(64) NULL,
            event_type VARCHAR(64) NOT NULL,
            feature_name VARCHAR(64) NULL,
            screen_name VARCHAR(64) NULL,
            duration_ms INT UNSIGNED NOT NULL DEFAULT 0,
            metadata TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_event_type (event_type),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "api_request_logs" => "CREATE TABLE IF NOT EXISTS api_request_logs (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            endpoint VARCHAR(150) NOT NULL,
            method VARCHAR(10) NOT NULL,
            status_code INT NOT NULL,
            latency_ms INT NOT NULL,
            ip_hash VARCHAR(64) NOT NULL,
            user_id BIGINT UNSIGNED NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_endpoint (endpoint),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "app_crashes" => "CREATE TABLE IF NOT EXISTS app_crashes (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            app_version VARCHAR(20) NOT NULL,
            os_version VARCHAR(30) NOT NULL,
            crash_type VARCHAR(100) NOT NULL,
            stack_trace TEXT NULL,
            user_id BIGINT UNSIGNED NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "support_tickets" => "CREATE TABLE IF NOT EXISTS support_tickets (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            priority VARCHAR(20) NOT NULL DEFAULT 'medium',
            status VARCHAR(30) NOT NULL DEFAULT 'open',
            response_time_s INT NOT NULL DEFAULT 0,
            resolution_time_s INT NOT NULL DEFAULT 0,
            rating INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at DATETIME NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "feedback_submissions" => "CREATE TABLE IF NOT EXISTS feedback_submissions (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NULL,
            category VARCHAR(64) NOT NULL,
            sentiment VARCHAR(20) NOT NULL DEFAULT 'positive',
            message TEXT NOT NULL,
            app_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
            rating INT NOT NULL DEFAULT 5,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "admin_audit_logs" => "CREATE TABLE IF NOT EXISTS admin_audit_logs (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            admin_id BIGINT UNSIGNED NOT NULL,
            action_type VARCHAR(64) NOT NULL,
            entity_type VARCHAR(32) NOT NULL,
            entity_id VARCHAR(64) NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            details TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "search_terms_log" => "CREATE TABLE IF NOT EXISTS search_terms_log (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            query VARCHAR(150) NOT NULL,
            results_count INT NOT NULL DEFAULT 0,
            user_id BIGINT UNSIGNED NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "push_notification_logs" => "CREATE TABLE IF NOT EXISTS push_notification_logs (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            campaign_name VARCHAR(100) NOT NULL,
            target_segment VARCHAR(50) NOT NULL,
            total_sent INT NOT NULL DEFAULT 0,
            total_delivered INT NOT NULL DEFAULT 0,
            total_opened INT NOT NULL DEFAULT 0,
            total_clicked INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "admin_users" => "CREATE TABLE IF NOT EXISTS admin_users (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(150) NOT NULL DEFAULT 'Administrator',
            role VARCHAR(50) NOT NULL DEFAULT 'SuperAdmin',
            status VARCHAR(30) NOT NULL DEFAULT 'active',
            last_login_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "admin_otps" => "CREATE TABLE IF NOT EXISTS admin_otps (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp_hash VARCHAR(64) NOT NULL,
            expires_at DATETIME NOT NULL,
            attempts INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email_exp (email, expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
    ];

    $log['created_tables'] = [];
    foreach ($tables as $tName => $tSql) {
        $db->exec($tSql);
        $log['created_tables'][] = $tName;
    }

    // Configure root Administrator
    $adminEmail = 'kaustubhraikar10@gmail.com';
    $adminHash  = '$2y$10$SrQSeaLzBEv/i5p7wWngQOZDV/g2Kb6RnlzU6.UyXP87BbckB0fQC'; // AdminPassword2026!
    
    $stmt = $db->prepare("INSERT INTO admin_users (email, password_hash, full_name, role, status)
        VALUES (:email, :hash, 'Kaustubh Raikar', 'SuperAdmin', 'active')
        ON DUPLICATE KEY UPDATE password_hash = :hash, role = 'SuperAdmin', status = 'active'");
    $stmt->execute([':email' => $adminEmail, ':hash' => $adminHash]);
    $log['admin_account_verified'] = $adminEmail;

    // Seed baseline devotees if < 10
    $userCount = (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($userCount < 10) {
        $sampleUsers = [
            ['email' => 'devotee1@aarambhtech.in', 'name' => 'Aarav Sharma', 'lang' => 'Hindi', 'days_ago' => 45],
            ['email' => 'devotee2@aarambhtech.in', 'name' => 'Priya Patel', 'lang' => 'Gujarati', 'days_ago' => 38],
            ['email' => 'devotee3@aarambhtech.in', 'name' => 'Rohan Iyer', 'lang' => 'Sanskrit', 'days_ago' => 30],
            ['email' => 'devotee4@aarambhtech.in', 'name' => 'Ananya Rao', 'lang' => 'English', 'days_ago' => 24],
            ['email' => 'devotee5@aarambhtech.in', 'name' => 'Vikram Singh', 'lang' => 'Hindi', 'days_ago' => 18],
            ['email' => 'devotee6@aarambhtech.in', 'name' => 'Sanya Mukherjee', 'lang' => 'Bengali', 'days_ago' => 12],
            ['email' => 'devotee7@aarambhtech.in', 'name' => 'Aditya Verma', 'lang' => 'Hindi', 'days_ago' => 7],
            ['email' => 'devotee8@aarambhtech.in', 'name' => 'Neha Deshmukh', 'lang' => 'Marathi', 'days_ago' => 4],
            ['email' => 'devotee9@aarambhtech.in', 'name' => 'Kavita Joshi', 'lang' => 'Hindi', 'days_ago' => 2],
            ['email' => 'devotee10@aarambhtech.in', 'name' => 'Manish Gupta', 'lang' => 'Hindi', 'days_ago' => 1],
        ];

        $insUser = $db->prepare("INSERT IGNORE INTO users (email, full_name, language, created_at) VALUES (:email, :name, :lang, DATE_SUB(NOW(), INTERVAL :days DAY))");
        $insSess = $db->prepare("INSERT INTO user_sessions (user_id, login_token, device_id, os, expires_at, created_at, last_active_at) VALUES (:uid, :token, :dev, 'Android', DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL :days DAY), DATE_SUB(NOW(), INTERVAL :active_hours HOUR))");
        $insJaap = $db->prepare("INSERT IGNORE INTO user_jaap_daily_logs (user_id, log_date, total_chants, completed_malas) VALUES (:uid, CURDATE(), :chants, :malas)");

        foreach ($sampleUsers as $idx => $u) {
            $insUser->execute([':email' => $u['email'], ':name' => $u['name'], ':lang' => $u['lang'], ':days' => $u['days_ago']]);
            $uid = (int)$db->lastInsertId();
            if ($uid === 0) {
                $uid = (int)$db->query("SELECT id FROM users WHERE email = '{$u['email']}'")->fetchColumn();
            }

            if ($uid > 0) {
                $activeHours = ($idx < 4) ? 2 : (($idx < 8) ? 14 : 72);
                $insSess->execute([
                    ':uid' => $uid,
                    ':token' => bin2hex(random_bytes(32)),
                    ':dev' => 'device_' . bin2hex(random_bytes(8)),
                    ':days' => $u['days_ago'],
                    ':active_hours' => $activeHours
                ]);

                $chants = 108 * ($idx + 1);
                $malas = $idx + 1;
                $insJaap->execute([':uid' => $uid, ':chants' => $chants, ':malas' => $malas]);
            }
        }
        $log['seeded_baseline_devotees'] = true;
    }

    // Seed sample telemetry events if < 10
    $eventCount = (int)$db->query("SELECT COUNT(*) FROM app_events")->fetchColumn();
    if ($eventCount < 10) {
        $insEvt = $db->prepare("INSERT INTO app_events (user_id, event_type, feature_name, screen_name, duration_ms, created_at) VALUES (1, :evt, :feat, :screen, :dur, DATE_SUB(NOW(), INTERVAL :hrs HOUR))");
        $sampleEvents = [
            ['evt' => 'chant_completed', 'feat' => 'JapaMala', 'screen' => 'JapaOrb', 'dur' => 450000, 'hrs' => 1],
            ['evt' => 'audio_playback', 'feat' => 'AudioPlayer', 'screen' => 'ScriptureReader', 'dur' => 180000, 'hrs' => 3],
            ['evt' => 'screen_view', 'feat' => 'Navigation', 'screen' => 'CategoriesScreen', 'dur' => 24000, 'hrs' => 5],
            ['evt' => 'search_performed', 'feat' => 'CatalogSearch', 'screen' => 'SearchScreen', 'dur' => 12000, 'hrs' => 8],
            ['evt' => 'favorite_added', 'feat' => 'Bookmarks', 'screen' => 'FavoritesScreen', 'dur' => 3500, 'hrs' => 12],
            ['evt' => 'chant_completed', 'feat' => 'JapaMala', 'screen' => 'JapaOrb', 'dur' => 600000, 'hrs' => 20],
        ];
        foreach ($sampleEvents as $se) {
            $insEvt->execute([':evt' => $se['evt'], ':feat' => $se['feat'], ':screen' => $se['screen'], ':dur' => $se['dur'], ':hrs' => $se['hrs']]);
        }
        $log['seeded_baseline_events'] = true;
    }

    // Table counts summary
    $rowCounts = [];
    foreach ($tables as $tName => $tSql) {
        $rowCounts[$tName] = (int)$db->query("SELECT COUNT(*) FROM {$tName}")->fetchColumn();
    }
    $log['table_row_counts'] = $rowCounts;
}

echo json_encode(["success" => true, "log" => $log], JSON_PRETTY_PRINT);
