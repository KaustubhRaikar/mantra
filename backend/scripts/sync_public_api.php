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

// 1. Sync config/rate_limit.php, config/headers.php, config/database.php
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

    // Backup existing config/database.php if not yet backed up
    if (file_exists($configDir . '/database.php') && !file_exists($configDir . '/database.php.original_bak')) {
        @copy($configDir . '/database.php', $configDir . '/database.php.original_bak');
    }
    $databaseForwarder = "<?php\n// Forwarder to Git-deployed database.php in web/backend/config\nrequire_once __DIR__ . '/../web/backend/config/database.php';\n";
    if (@file_put_contents($configDir . '/database.php', $databaseForwarder) !== false) {
        $results["files_updated"][] = "config/database.php";
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

// 3. Sync api/mantras forwarders
$mantrasDir = $publicHtml . '/api/mantras';
if (!is_dir($mantrasDir)) {
    @mkdir($mantrasDir, 0755, true);
}
foreach (['read.php', 'read_single.php'] as $mEp) {
    $mContent = "<?php\n// Auto-forwarder to Git repository web/backend/api/mantras/{$mEp}\nrequire_once __DIR__ . '/../../web/backend/api/mantras/{$mEp}';\n";
    if (@file_put_contents($mantrasDir . '/' . $mEp, $mContent) !== false) {
        $results["files_updated"][] = "api/mantras/" . $mEp;
    }
}

// 4. Sync api/categories forwarders
$catsDir = $publicHtml . '/api/categories';
if (!is_dir($catsDir)) {
    @mkdir($catsDir, 0755, true);
}
$catContent = "<?php\n// Auto-forwarder to Git repository web/backend/api/categories/read.php\nrequire_once __DIR__ . '/../../web/backend/api/categories/read.php';\n";
if (@file_put_contents($catsDir . '/read.php', $catContent) !== false) {
    $results["files_updated"][] = "api/categories/read.php";
}

// 5. Sync api/vrat_kathas forwarders
$vkDir = $publicHtml . '/api/vrat_kathas';
if (!is_dir($vkDir)) {
    @mkdir($vkDir, 0755, true);
}
foreach (['read.php', 'read_single.php'] as $vkEp) {
    $vkContent = "<?php\n// Auto-forwarder to Git repository web/backend/api/vrat_kathas/{$vkEp}\nrequire_once __DIR__ . '/../../web/backend/api/vrat_kathas/{$vkEp}';\n";
    if (@file_put_contents($vkDir . '/' . $vkEp, $vkContent) !== false) {
        $results["files_updated"][] = "api/vrat_kathas/" . $vkEp;
    }
}

// 6. Clear response cache files in public_html/cache and web/backend/cache
$cacheFlushed = 0;
foreach ([$publicHtml . '/cache', $webBackend . '/cache'] as $cd) {
    if (is_dir($cd)) {
        foreach (glob($cd . '/*.json') as $cf) {
            if (@unlink($cf)) $cacheFlushed++;
        }
    }
}
$results["cache_files_flushed"] = $cacheFlushed;

// 7. Database connection & Rate Limit Table Purge & Schema Inspection
require_once $webBackend . '/config/database.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    if ($db) {
        // Clear all accumulated rate limit blocks
        $db->exec("DELETE FROM api_sliding_rate_limits");
        $results["db_flush"] = "api_sliding_rate_limits successfully truncated";

        // Diagnostic info
        $currentDbName = $db->query("SELECT DATABASE()")->fetchColumn();
        $dbDriver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
        $results["connected_database"] = [
            "driver" => $dbDriver,
            "database_name" => $currentDbName,
            "bak_file_exists" => file_exists($configDir . '/database.php.original_bak'),
            "bak_snippet" => file_exists($configDir . '/database.php.original_bak') ? substr(file_get_contents($configDir . '/database.php.original_bak'), 0, 500) : null
        ];

        // Schema diagnostics for categories, mantras, vrat_katha
        $schemaDiagnostics = [];
        $tablesToInspect = ['categories', 'mantras', 'vrat_katha', 'vrat_kathas'];
        foreach ($tablesToInspect as $table) {
            try {
                $colsStmt = $db->prepare("SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t ORDER BY ORDINAL_POSITION");
                $colsStmt->execute([':t' => $table]);
                $cols = $colsStmt->fetchAll(PDO::FETCH_ASSOC);

                $countStmt = $db->query("SELECT COUNT(*) FROM `{$table}`");
                $count = $countStmt ? (int)$countStmt->fetchColumn() : 0;

                $schemaDiagnostics[$table] = [
                    "exists" => count($cols) > 0,
                    "row_count" => $count,
                    "columns_count" => count($cols),
                ];
            } catch (Throwable $te) {
                $schemaDiagnostics[$table] = ["error" => $te->getMessage()];
            }
        }
        $results["schema_diagnostics"] = $schemaDiagnostics;

    } else {
        $results["db_flush"] = "Database connection unavailable for flush";
    }
} catch (Throwable $t) {
    $results["db_flush"] = "Error flushing DB: " . $t->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
