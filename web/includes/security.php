<?php
/**
 * Mantra Web Security Engine
 * Provides rate limiting, input sanitization, CSRF protection, and session security.
 */

if (session_status() === PHP_SESSION_NONE) {
    // Enforce hardened session cookie parameters
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? 80) == 443;
    
    session_set_cookie_params([
        'lifetime' => 86400, // 24 hours
        'path'     => '/',
        'domain'   => '',
        'secure'   => $isHttps,
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
    session_start();
}

class WebSecurity {

    /**
     * Generate or retrieve the active CSRF token
     */
    public static function getCsrfToken(): string {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * Validate a submitted CSRF token
     */
    public static function verifyCsrfToken(?string $token): bool {
        if (empty($token) || empty($_SESSION['csrf_token'])) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Rotate CSRF token
     */
    public static function regenerateCsrfToken(): string {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        return $_SESSION['csrf_token'];
    }

    /**
     * Sanitize string input (XSS prevention)
     */
    public static function sanitizeString(?string $input, int $maxLength = 1000): string {
        if ($input === null) return '';
        $trimmed = trim($input);
        if (mb_strlen($trimmed, 'UTF-8') > $maxLength) {
            $trimmed = mb_substr($trimmed, 0, $maxLength, 'UTF-8');
        }
        return htmlspecialchars($trimmed, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    /**
     * Strict Email sanitization and validation
     */
    public static function sanitizeEmail(?string $email): ?string {
        if ($email === null) return null;
        $cleaned = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
        return filter_var($cleaned, FILTER_VALIDATE_EMAIL) ? $cleaned : null;
    }

    /**
     * Sanitize Integer
     */
    public static function sanitizeInt($input, int $default = 0): int {
        return filter_var($input, FILTER_VALIDATE_INT) !== false ? (int)$input : $default;
    }

    /**
     * Normalize Sanskrit / Devanagari text using Unicode NFC normalization
     */
    public static function normalizeDevanagari(?string $text): string {
        if ($text === null) return '';
        $trimmed = trim($text);
        if (class_exists('Normalizer')) {
            $normalized = Normalizer::normalize($trimmed, Normalizer::FORM_C);
            return $normalized !== false ? $normalized : $trimmed;
        }
        return $trimmed;
    }

    /**
     * Resolve reliable client IP address
     */
    public static function getClientIp(): string {
        $headers = [
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_REAL_IP',        // Nginx proxy
            'HTTP_X_FORWARDED_FOR',  // Standard proxy chain
            'REMOTE_ADDR'            // Direct connection
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                $ip = trim($ips[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        return '127.0.0.1';
    }

    /**
     * File-based / session token-bucket rate limiter
     *
     * @param string $action Key prefix (e.g., 'admin_login', 'delete_account')
     * @param int $maxAttempts Maximum allowed requests
     * @param int $decaySeconds Window duration in seconds
     * @return array [ 'allowed' => bool, 'remaining' => int, 'retry_after' => int ]
     */
    public static function checkRateLimit(string $action, int $maxAttempts = 5, int $decaySeconds = 900): array {
        $ip = self::getClientIp();
        $rateKey = "rl_{$action}_" . hash('sha256', $ip);
        
        $tempDir = sys_get_temp_dir() . '/mantra_security';
        if (!is_dir($tempDir)) {
            @mkdir($tempDir, 0750, true);
        }

        $filePath = $tempDir . '/' . $rateKey . '.json';
        $now = time();
        $data = ['attempts' => 0, 'first_attempt' => $now];

        if (file_exists($filePath)) {
            $content = @file_get_contents($filePath);
            $parsed = json_decode($content, true);
            if (is_array($parsed)) {
                $data = $parsed;
            }
        }

        // Reset if window expired
        if ($now - $data['first_attempt'] > $decaySeconds) {
            $data = ['attempts' => 0, 'first_attempt' => $now];
        }

        $data['attempts']++;
        @file_put_contents($filePath, json_encode($data), LOCK_EX);

        if ($data['attempts'] > $maxAttempts) {
            $retryAfter = $decaySeconds - ($now - $data['first_attempt']);
            return [
                'allowed'     => false,
                'remaining'   => 0,
                'retry_after' => max(1, $retryAfter)
            ];
        }

        return [
            'allowed'     => true,
            'remaining'   => $maxAttempts - $data['attempts'],
            'retry_after' => 0
        ];
    }

    /**
     * Sliding Window Rate Limiter
     * Tracks discrete request timestamps within a moving window.
     * Prevents burst exploits and boundary hopping.
     *
     * @param string $action Rate limit scope (e.g. 'admin_password', 'admin_otp')
     * @param string $identifier Unique client identifier (IP address, email, or combination)
     * @param int $maxAttempts Allowed attempts within the moving window
     * @param int $windowSeconds Moving window duration in seconds
     * @return array [ 'allowed' => bool, 'remaining' => int, 'retry_after' => int, 'total_in_window' => int ]
     */
    public static function checkSlidingWindowRateLimit(string $action, string $identifier, int $maxAttempts, int $windowSeconds): array {
        $rateKey = "sw_{$action}_" . hash('sha256', $identifier);
        
        $tempDir = sys_get_temp_dir() . '/mantra_security';
        if (!is_dir($tempDir)) {
            @mkdir($tempDir, 0750, true);
        }

        $filePath = $tempDir . '/' . $rateKey . '.json';
        $now = time();
        $timestamps = [];

        if (file_exists($filePath)) {
            $content = @file_get_contents($filePath);
            $parsed = json_decode($content, true);
            if (is_array($parsed)) {
                // Filter out timestamps outside the active sliding window
                $timestamps = array_values(array_filter($parsed, function($ts) use ($now, $windowSeconds) {
                    return is_int($ts) && ($now - $ts) < $windowSeconds;
                }));
            }
        }

        if (count($timestamps) >= $maxAttempts) {
            $oldestTimestamp = min($timestamps);
            $retryAfter = $windowSeconds - ($now - $oldestTimestamp);
            return [
                'allowed'         => false,
                'remaining'       => 0,
                'retry_after'     => max(1, $retryAfter),
                'total_in_window' => count($timestamps)
            ];
        }

        // Record current attempt timestamp
        $timestamps[] = $now;
        @file_put_contents($filePath, json_encode($timestamps), LOCK_EX);

        return [
            'allowed'         => true,
            'remaining'       => max(0, $maxAttempts - count($timestamps)),
            'retry_after'     => 0,
            'total_in_window' => count($timestamps)
        ];
    }

    /**
     * Reset sliding window rate limit for an identifier
     */
    public static function resetSlidingWindowRateLimit(string $action, string $identifier): void {
        $rateKey = "sw_{$action}_" . hash('sha256', $identifier);
        $tempDir = sys_get_temp_dir() . '/mantra_security';
        $filePath = $tempDir . '/' . $rateKey . '.json';
        if (file_exists($filePath)) {
            @unlink($filePath);
        }
    }

    /**
     * Reset rate limit upon successful action
     */
    public static function resetRateLimit(string $action): void {
        $ip = self::getClientIp();
        $rateKey = "rl_{$action}_" . hash('sha256', $ip);
        $tempDir = sys_get_temp_dir() . '/mantra_security';
        $filePath = $tempDir . '/' . $rateKey . '.json';
        if (file_exists($filePath)) {
            @unlink($filePath);
        }
    }
}

