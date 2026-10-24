<?php
/**
 * Centralized Security Headers & Mobile Gateway Guard
 * Include this at the top of every API endpoint.
 * Enforces:
 * 1. CORS Preflight & Allowed Origins
 * 2. Strict Security Headers
 * 3. Mobile App-Only Guard & Sliding Window Rate Limiting (5/min, 15/hr, 100/day)
 * 4. High-Performance Output Buffer Cache Engine
 */

// --- CORS: Whitelist allowed origins ---
$allowedOrigins = [
    'https://mantra.aarambhtech.in',
    'http://localhost:8081',   // Expo Go local dev
    'http://localhost:19006',  // Expo Web dev
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Vary: Origin");
} elseif (empty($origin)) {
    // Allow requests with no Origin (native mobile apps, curl, Postman)
    header("Access-Control-Allow-Origin: https://mantra.aarambhtech.in");
}

// --- CORS Preflight ---
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Device-ID, X-App-Key, X-Login-Token, X-User-ID");
header("Access-Control-Max-Age: 86400");

// Handle OPTIONS preflight immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// --- Strict Security Headers ---
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("Referrer-Policy: no-referrer");
header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
header("Content-Type: application/json; charset=UTF-8");

// --- Gatekeeper: Sliding Window Rate Limit & App-Only Guard ---
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/rate_limit.php';
require_once __DIR__ . '/cache.php';

try {
    $dbInstance = new Database();
    $conn = $dbInstance->getConnection();
    if ($conn) {
        enforceAppOnlyAndSlidingRateLimit($conn);
    }
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode([
        "status"  => "error",
        "code"    => "SECURITY_SERVICE_UNAVAILABLE",
        "message" => "Rate limiting service temporarily unavailable."
    ]);
    exit();
}

// --- Initialize High-Performance Response Cache for Read Endpoints ---
initApiCache(3600); // 1-hour cache TTL with 304 ETag revalidation
?>
