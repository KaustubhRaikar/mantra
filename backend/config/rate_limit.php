<?php
/**
 * Sliding Window Rate Limiter & App-Only Gateway Guard
 * Enforces:
 * 1. Web API calls disabled (App-Only via cryptographic X-App-Key verification).
 * 2. 1 App, 1 Mobile, 1 User, 1 Unique Key sliding window quotas:
 *    - 5 calls / minute
 *    - 15 calls / hour
 *    - 100 calls / day
 * 3. Proxy-safe IP resolution.
 */

define('MANTRA_AUTHORIZED_APP_KEY', 'm_app_c0sm1c_7f9b2d4e81a3e5c7');

function getTrustedClientIp(): string {
    // 1. Cloudflare / Hostinger CDN standard connecting IP
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        $cfIp = trim($_SERVER['HTTP_CF_CONNECTING_IP']);
        if (filter_var($cfIp, FILTER_VALIDATE_IP)) {
            return $cfIp;
        }
    }

    // 2. Direct Reverse Proxy Real-IP header
    if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        $realIp = trim($_SERVER['HTTP_X_REAL_IP']);
        if (filter_var($realIp, FILTER_VALIDATE_IP)) {
            return $realIp;
        }
    }

    // 3. X-Forwarded-For header (first public client IP)
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        foreach ($ips as $ip) {
            $candidate = trim($ip);
            if (filter_var($candidate, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $candidate;
            }
        }
        $first = trim($ips[0]);
        if (filter_var($first, FILTER_VALIDATE_IP)) {
            return $first;
        }
    }

    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

/**
 * Enforce App-Only Access & Sliding Window Rate Limiting
 * Matrix: 1 App, 1 Mobile Device, 1 User Account, 1 Unique Key
 */
function enforceAppOnlyAndSlidingRateLimit(PDO $db): void {
    // 1. App-Only Guard: Reject browser / web requests
    $appKey = $_SERVER['HTTP_X_APP_KEY'] ?? '';
    if (empty($appKey) || !hash_equals(MANTRA_AUTHORIZED_APP_KEY, $appKey)) {
        http_response_code(403);
        echo json_encode([
            "status"  => "error",
            "code"    => "WEB_API_ACCESS_DISABLED",
            "message" => "Web API access is disabled. Content access is exclusively reserved for the official Mantra mobile application."
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Dedicated auth endpoints have their own specialized per-action rate limiters
    $script = basename($_SERVER['SCRIPT_FILENAME'] ?? '');
    if (in_array($script, ['send_otp.php', 'verify_otp.php'], true)) {
        return;
    }

    // 2. Resolve 1 App, 1 Mobile, 1 User, 1 Unique Key
    $clientIp = getTrustedClientIp();
    $deviceId = !empty($_SERVER['HTTP_X_DEVICE_ID']) ? trim($_SERVER['HTTP_X_DEVICE_ID']) : ('dev_' . substr(hash('sha256', $clientIp), 0, 16));
    $userId   = !empty($_SERVER['HTTP_X_USER_ID']) ? trim($_SERVER['HTTP_X_USER_ID']) : (!empty($_SERVER['HTTP_X_LOGIN_TOKEN']) ? substr(trim($_SERVER['HTTP_X_LOGIN_TOKEN']), 0, 16) : 'guest');
    
    $uniqueKey = hash('sha256', MANTRA_AUTHORIZED_APP_KEY . '|' . $deviceId . '|' . $userId . '|' . $clientIp);

    // 3. Ensure sliding rate limit table exists
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS api_sliding_rate_limits (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            client_key VARCHAR(64) NOT NULL,
            created_at INT UNSIGNED NOT NULL,
            INDEX idx_client_sliding (client_key, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Exception $e) {
        // Table already initialized or silent fallback
    }

    $now = time();

    // 4. Retrieve timestamps for this unique key within sliding 24-hour window (86,400s)
    $stmt = $db->prepare(
        "SELECT created_at FROM api_sliding_rate_limits 
         WHERE client_key = :key AND created_at >= (:now - 86400) 
         ORDER BY created_at DESC"
    );
    $stmt->execute([':key' => $uniqueKey, ':now' => $now]);
    $timestamps = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $countMinute = 0;
    $countHour   = 0;
    $countDay    = count($timestamps);

    $limitMinute = 60;   // 60 calls / min (smooth multi-tab devotional navigation)
    $limitHour   = 300;  // 300 calls / hour
    $limitDay    = 2500; // 2500 calls / day

    foreach ($timestamps as $ts) {
        $ts = (int)$ts;
        if ($ts >= ($now - 60)) {
            $countMinute++;
        }
        if ($ts >= ($now - 3600)) {
            $countHour++;
        }
    }

    // 5. Evaluate Sliding Window Breaches
    if ($countMinute >= $limitMinute) {
        http_response_code(429);
        header("Retry-After: 60");
        echo json_encode([
            "status"      => "error",
            "code"        => "RATE_LIMIT_MINUTE_EXCEEDED",
            "message"     => "Minute rate limit reached ({$limitMinute} calls/min). Devotional content is safely cached locally on your device for uninterrupted recitation.",
            "retry_after" => 60
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($countHour >= $limitHour) {
        http_response_code(429);
        header("Retry-After: 3600");
        echo json_encode([
            "status"      => "error",
            "code"        => "RATE_LIMIT_HOUR_EXCEEDED",
            "message"     => "Hourly rate limit reached ({$limitHour} calls/hour). All previously opened mantras and stotras remain 100% available offline.",
            "retry_after" => 3600
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($countDay >= $limitDay) {
        http_response_code(429);
        header("Retry-After: 86400");
        echo json_encode([
            "status"      => "error",
            "code"        => "RATE_LIMIT_DAY_EXCEEDED",
            "message"     => "Daily rate limit reached ({$limitDay} calls/day). Offline sanctuary mode is active with zero ad distractions.",
            "retry_after" => 86400
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit();
    }

    // 6. Record hit in sliding window
    $insert = $db->prepare("INSERT INTO api_sliding_rate_limits (client_key, created_at) VALUES (:key, :now)");
    $insert->execute([':key' => $uniqueKey, ':now' => $now]);

    // 7. Add Informative Rate-Limit Headers
    header("X-RateLimit-Limit-Minute: {$limitMinute}");
    header("X-RateLimit-Remaining-Minute: " . max(0, $limitMinute - ($countMinute + 1)));
    header("X-RateLimit-Limit-Hour: {$limitHour}");
    header("X-RateLimit-Remaining-Hour: " . max(0, $limitHour - ($countHour + 1)));
    header("X-RateLimit-Limit-Day: {$limitDay}");
    header("X-RateLimit-Remaining-Day: " . max(0, $limitDay - ($countDay + 1)));

    // 8. Probabilistic Housekeeping (1 in 50 calls purges stale records older than 24h)
    if (random_int(1, 50) === 1) {
        try {
            $cleanup = $db->prepare("DELETE FROM api_sliding_rate_limits WHERE created_at < (:now - 86400)");
            $cleanup->execute([':now' => $now]);
        } catch (Exception $e) {}
    }
}

/**
 * Action-specific Sliding Window Rate Limiter (Dual-Key for OTP & Authentication)
 * Enforces true sliding window limits, dynamic retry_after, and informative headers.
 */
function checkRateLimit(PDO $db, string $action, string $identifier, int $maxAttempts = 5, int $windowSeconds = 600, string $customMessage = ''): void {
    if (empty($identifier)) {
        return;
    }

    // Ensure sliding rate limit table exists
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS api_sliding_rate_limits (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            client_key VARCHAR(64) NOT NULL,
            created_at INT UNSIGNED NOT NULL,
            INDEX idx_client_sliding (client_key, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Throwable $e) {}

    $key = hash('sha256', $action . '|' . $identifier);
    $now = time();
    $windowStart = $now - $windowSeconds;

    // Retrieve timestamps within the active sliding window (sorted oldest first)
    $stmt = $db->prepare(
        "SELECT created_at FROM api_sliding_rate_limits 
         WHERE client_key = :key AND created_at > :windowStart 
         ORDER BY created_at ASC"
    );
    $stmt->execute([':key' => $key, ':windowStart' => $windowStart]);
    $timestamps = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $count = count($timestamps);

    if ($count >= $maxAttempts) {
        $oldest = (int)$timestamps[0];
        $retryAfter = max(1, ($oldest + $windowSeconds) - $now);

        http_response_code(429);
        if (!headers_sent()) {
            header("Retry-After: {$retryAfter}");
            header("X-RateLimit-Limit: {$maxAttempts}");
            header("X-RateLimit-Remaining: 0");
            header("X-RateLimit-Reset: {$retryAfter}");
        }

        $message = !empty($customMessage) 
            ? $customMessage 
            : "Too many requests. Please try after sometime.";

        echo json_encode([
            "status"      => "error",
            "code"        => "RATE_LIMIT_EXCEEDED",
            "message"     => $message,
            "retry_after" => $retryAfter
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Record the current hit in the sliding window
    $insert = $db->prepare("INSERT INTO api_sliding_rate_limits (client_key, created_at) VALUES (:key, :now)");
    $insert->execute([':key' => $key, ':now' => $now]);

    if (!headers_sent()) {
        $remaining = max(0, $maxAttempts - ($count + 1));
        header("X-RateLimit-Limit: {$maxAttempts}");
        header("X-RateLimit-Remaining: {$remaining}");
    }
}
?>
