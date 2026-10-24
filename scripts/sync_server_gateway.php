<?php
/**
 * Server Gateway Synchronizer & Rate Limit Table Initializer
 * Synchronizes backend security configs from the Git deploy directory to root public_html
 */

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_canonical_sync_2026') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Unauthorized access."]);
    exit();
}

$report = [
    "timestamp" => date('c'),
    "files_copied" => [],
    "db_table_created" => false,
    "cache_dir_ready" => false,
    "errors" => []
];

try {
    $rootDir = '/home/u885706413/domains/mantra.aarambhtech.in/public_html';
    $gitDir = $rootDir . '/web';

    // 1. Files to synchronize to public_html root
    $filesToSync = [
        $gitDir . '/backend/config/rate_limit.php' => $rootDir . '/config/rate_limit.php',
        $gitDir . '/backend/config/cache.php'      => $rootDir . '/config/cache.php',
        $gitDir . '/backend/config/headers.php'    => $rootDir . '/config/headers.php',
        $gitDir . '/web/delete-account.html'       => $rootDir . '/delete-account.html',
    ];

    foreach ($filesToSync as $src => $dest) {
        if (file_exists($src)) {
            $destDir = dirname($dest);
            if (!is_dir($destDir)) {
                @mkdir($destDir, 0755, true);
            }
            if (copy($src, $dest)) {
                $report["files_copied"][] = [
                    "from" => str_replace($rootDir, '', $src),
                    "to"   => str_replace($rootDir, '', $dest),
                    "status" => "SUCCESS"
                ];
            } else {
                $report["errors"][] = "Failed copying " . basename($src) . " to " . $dest;
            }
        } else {
            $report["errors"][] = "Source file missing: " . $src;
        }
    }

    // 2. Ensure cache directory exists and is secured
    $cacheDir = $rootDir . '/cache';
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0755, true);
    }
    @file_put_contents($cacheDir . '/.htaccess', "Deny from all\n");
    $report["cache_dir_ready"] = is_dir($cacheDir) && is_writable($cacheDir);

    // 3. Initialize MySQL sliding rate limit table
    require_once $rootDir . '/config/database.php';
    $database = new Database();
    $db = $database->getConnection();

    if ($db) {
        $db->exec("CREATE TABLE IF NOT EXISTS api_sliding_rate_limits (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            client_key VARCHAR(64) NOT NULL,
            created_at INT UNSIGNED NOT NULL,
            INDEX idx_client_sliding (client_key, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
        $report["db_table_created"] = true;

        // Verify row count
        $stmt = $db->query("SELECT COUNT(*) FROM api_sliding_rate_limits");
        $report["current_rate_limit_records"] = (int)$stmt->fetchColumn();
    }

    $report["success"] = count($report["errors"]) === 0;
    http_response_code(200);
    echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    $report["success"] = false;
    $report["error"] = $e->getMessage();
    echo json_encode($report, JSON_PRETTY_PRINT);
}
?>
