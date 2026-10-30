<?php
/**
 * Sacred Production Gateway Synchronizer
 * Synchronizes updated production files from /public_html/web to /public_html/
 */
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_production_sync_2026') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit();
}

$rootDir = '/home/u885706413/domains/mantra.aarambhtech.in/public_html';
$webDir  = $rootDir . '/web';

$filesToSync = [
    // Backend config
    $webDir . '/backend/config/rate_limit.php' => $rootDir . '/config/rate_limit.php',
    // Backend auth APIs
    $webDir . '/backend/api/auth/send_otp.php' => $rootDir . '/api/auth/send_otp.php',
    $webDir . '/backend/api/auth/verify_otp.php' => $rootDir . '/api/auth/verify_otp.php',
    // Backend mantras API
    $webDir . '/backend/api/mantras/read_single.php' => $rootDir . '/api/mantras/read_single.php',
    // Admin portal
    $webDir . '/web/admin/login.php' => $rootDir . '/admin/login.php',
    $webDir . '/web/admin/scriptures.php' => $rootDir . '/admin/scriptures.php',
    $webDir . '/web/admin/users.php' => $rootDir . '/admin/users.php',
];

$results = [];
foreach ($filesToSync as $src => $dest) {
    if (file_exists($src)) {
        $destParent = dirname($dest);
        if (!is_dir($destParent)) {
            @mkdir($destParent, 0755, true);
        }
        $copied = @copy($src, $dest);
        $results[basename($dest)] = $copied ? "SUCCESS" : "FAILED";
    } else {
        $results[basename($dest)] = "SRC_NOT_FOUND: " . $src;
    }
}

echo json_encode([
    "status" => "success",
    "timestamp" => date('c'),
    "root_dir" => $rootDir,
    "web_dir" => $webDir,
    "synced_files" => $results
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
