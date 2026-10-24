<?php
/**
 * Sacred Devotional Telemetry & Events API Endpoint
 * Ingests real-time client events, screen views, feature usage, and crashes.
 * Enforces rate limiting, input sanitization, and structured database storage.
 */

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

require_once __DIR__ . '/../includes/security.php';
require_once __DIR__ . '/../includes/db.php';

// Rate limiting: 120 requests per minute per IP
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
if (!WebSecurity::checkRateLimit('telemetry_' . $clientIp, 120, 60)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Rate limit exceeded. Please throttle telemetry beacons.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Empty payload received.']);
    exit;
}

$payload = json_decode($rawInput, true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload.']);
    exit;
}

try {
    $db = DatabaseManager::getConnection();
    $events = isset($payload['events']) && is_array($payload['events']) ? $payload['events'] : [$payload];
    $processed = 0;

    $stmtEvent = $db->prepare("
        INSERT INTO app_events (user_id, session_id, event_type, screen_name, feature_name, duration_ms, metadata, created_at)
        VALUES (:user_id, :session_id, :event_type, :screen_name, :feature_name, :duration_ms, :metadata, datetime('now'))
    ");

    $stmtCrash = $db->prepare("
        INSERT INTO app_crashes (app_version, os, device_model, error_message, stack_trace, user_id, created_at)
        VALUES (:app_version, :os, :device_model, :error_message, :stack_trace, :user_id, datetime('now'))
    ");

    $stmtSearch = $db->prepare("
        INSERT INTO search_terms_log (query, user_id, results_count, created_at)
        VALUES (:query, :user_id, :results_count, datetime('now'))
    ");

    foreach ($events as $ev) {
        if (!is_array($ev) || empty($ev['event_type'])) {
            continue;
        }

        $eventType   = WebSecurity::sanitizeString($ev['event_type'], 64);
        $userId      = isset($ev['user_id']) ? (int)$ev['user_id'] : null;
        $sessionId   = isset($ev['session_id']) ? WebSecurity::sanitizeString($ev['session_id'], 128) : null;
        $screenName  = isset($ev['screen_name']) ? WebSecurity::sanitizeString($ev['screen_name'], 128) : null;
        $featureName = isset($ev['feature_name']) ? WebSecurity::sanitizeString($ev['feature_name'], 128) : null;
        $durationMs  = isset($ev['duration_ms']) ? (int)$ev['duration_ms'] : 0;
        $metadata    = isset($ev['metadata']) ? json_encode($ev['metadata']) : null;

        $stmtEvent->execute([
            ':user_id'      => $userId,
            ':session_id'   => $sessionId,
            ':event_type'   => $eventType,
            ':screen_name'  => $screenName,
            ':feature_name' => $featureName,
            ':duration_ms'  => $durationMs,
            ':metadata'     => $metadata
        ]);
        $processed++;

        // Special handling for crash events
        if ($eventType === 'app_crash') {
            $stmtCrash->execute([
                ':app_version'   => WebSecurity::sanitizeString($ev['app_version'] ?? '1.0.0', 32),
                ':os'            => WebSecurity::sanitizeString($ev['os'] ?? 'Android', 32),
                ':device_model'  => WebSecurity::sanitizeString($ev['device_model'] ?? 'Device', 64),
                ':error_message' => WebSecurity::sanitizeString($ev['error_message'] ?? 'Unknown Exception', 255),
                ':stack_trace'   => substr($ev['stack_trace'] ?? '', 0, 2000),
                ':user_id'       => $userId
            ]);
        }

        // Special handling for search queries
        if ($eventType === 'search' && !empty($ev['query'])) {
            $stmtSearch->execute([
                ':query'         => WebSecurity::sanitizeString($ev['query'], 128),
                ':user_id'       => $userId,
                ':results_count' => isset($ev['results_count']) ? (int)$ev['results_count'] : 0
            ]);
        }
    }

    echo json_encode([
        'success'   => true,
        'processed' => $processed,
        'timestamp' => time()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database persistence exception.']);
}
