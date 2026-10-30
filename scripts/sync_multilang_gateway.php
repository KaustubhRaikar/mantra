<?php
/**
 * Sacred Production Multi-Language & Bootstrap Synchronizer
 */
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_canonical_sync_2026') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit();
}

$rootDir = '/home/u885706413/domains/mantra.aarambhtech.in/public_html';
$webDir  = $rootDir . '/web';

$filesToSync = [
    $webDir . '/backend/api/home/bootstrap.php' => $rootDir . '/api/home/bootstrap.php',
    $webDir . '/backend/scripts/migrate_multilang_treasury.php' => $rootDir . '/scripts/migrate_multilang_treasury.php',
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
    "synced_files" => $results
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
