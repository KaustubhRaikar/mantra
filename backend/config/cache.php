<?php
/**
 * High-Performance API Cache Engine
 * Provides:
 * 1. Pre-execution file cache lookup with HTTP 304 ETag validation.
 * 2. Output buffer capture to cache valid JSON responses automatically.
 * 3. Enforces private, must-revalidate cache control so origin sliding window rate limiting is always enforced.
 */

function initApiCache(int $ttlSeconds = 3600): void {
    // Only cache GET requests
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        return;
    }

    $cacheDir = __DIR__ . '/../cache';
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0755, true);
        @file_put_contents($cacheDir . '/.htaccess', "Deny from all\n");
    }

    if (!is_writable($cacheDir)) {
        $cacheDir = sys_get_temp_dir() . '/mantra_api_cache';
        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0755, true);
        }
    }

    $cacheKey = md5(($_SERVER['SCRIPT_NAME'] ?? '') . '?' . http_build_query($_GET));
    $cacheFile = $cacheDir . '/' . $cacheKey . '.json';

    // 1. Check if fresh server cache exists
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $ttlSeconds) {
        $etag = '"' . md5_file($cacheFile) . '"';
        header("ETag: " . $etag);
        header("Cache-Control: private, no-cache, must-revalidate");
        header("X-Cache: HIT");

        // Conditional GET check
        $ifNoneMatch = $_SERVER['HTTP_IF_NONE_MATCH'] ?? '';
        if (trim($ifNoneMatch) === $etag) {
            http_response_code(304);
            exit();
        }

        readfile($cacheFile);
        exit();
    }

    // 2. Start output buffering to capture and cache response
    ob_start(function($buffer) use ($cacheFile, $ttlSeconds) {
        $statusCode = http_response_code();
        if ($statusCode >= 200 && $statusCode < 300 && !empty($buffer)) {
            // Write to temp file then atomic rename
            $tmpFile = $cacheFile . '.' . bin2hex(random_bytes(4)) . '.tmp';
            if (@file_put_contents($tmpFile, $buffer, LOCK_EX) !== false) {
                @rename($tmpFile, $cacheFile);
            }
            header("X-Cache: MISS");
            header("Cache-Control: private, no-cache, must-revalidate");
        }
        return $buffer;
    });
}
?>
