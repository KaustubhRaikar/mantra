<?php
/**
 * Synchronize public_html/api and public_html/config to forward to web/backend
 * and flush stale rate limits from the database.
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_canonical_sync_2026') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit();
}

$results = [
    "timestamp" => date('c'),
    "files_updated" => [],
    "db_flush" => null,
    "status" => "success"
];

// Determine public_html directory path
$publicHtml = dirname(__DIR__, 3); // from web/backend/scripts to public_html
if (!is_dir($publicHtml . '/web')) {
    // Try alternate resolution
    $publicHtml = '/home/u885706413/domains/mantra.aarambhtech.in/public_html';
}

$results["public_html_detected"] = $publicHtml;
$webBackend = $publicHtml . '/web/backend';

// 1. Sync config/rate_limit.php
$configDir = $publicHtml . '/config';
if (is_dir($configDir)) {
    $rateLimitForwarder = "<?php\n// Forwarder to latest Git-deployed rate_limit.php in web/backend/config\nrequire_once __DIR__ . '/../web/backend/config/rate_limit.php';\n";
    if (@file_put_contents($configDir . '/rate_limit.php', $rateLimitForwarder) !== false) {
        $results["files_updated"][] = "config/rate_limit.php";
    }

    $headersForwarder = "<?php\n// Forwarder to latest Git-deployed headers.php in web/backend/config\nrequire_once __DIR__ . '/../web/backend/config/headers.php';\n";
    if (@file_put_contents($configDir . '/headers.php', $headersForwarder) !== false) {
        $results["files_updated"][] = "config/headers.php";
    }
}

// 2. Sync api/auth forwarders
$authDir = $publicHtml . '/api/auth';
if (!is_dir($authDir)) {
    @mkdir($authDir, 0755, true);
}

$authEndpoints = ['send_otp.php', 'verify_otp.php', 'verify_session.php', 'delete_account.php', 'export_data.php', 'consent.php'];
foreach ($authEndpoints as $ep) {
    $content = "<?php\n// Auto-forwarder to Git repository web/backend/api/auth/{$ep}\nrequire_once __DIR__ . '/../../web/backend/api/auth/{$ep}';\n";
    if (@file_put_contents($authDir . '/' . $ep, $content) !== false) {
        $results["files_updated"][] = "api/auth/" . $ep;
    }
}

// 3. Database connection & Rate Limit Table Purge
require_once $webBackend . '/config/database.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    if ($db) {
        // Clear all accumulated rate limit blocks
        $db->exec("DELETE FROM api_sliding_rate_limits");
        $results["db_flush"] = "api_sliding_rate_limits successfully truncated";
    } else {
        $results["db_flush"] = "Database connection unavailable for flush";
    }
} catch (Throwable $t) {
    $results["db_flush"] = "Error flushing DB: " . $t->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
