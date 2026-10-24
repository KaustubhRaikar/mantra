<?php
/**
 * Server Gateway Synchronizer
 * Syncs bootstrap endpoint to root public_html/api/home
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_canonical_sync_2026') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Unauthorized access."]);
    exit();
}

$rootDir = '/home/u885706413/domains/mantra.aarambhtech.in/public_html';
$gitDir = $rootDir . '/web';

$destDir = $rootDir . '/api/home';
if (!is_dir($destDir)) {
    @mkdir($destDir, 0755, true);
}

$src = $gitDir . '/backend/api/home/bootstrap.php';
$dest = $destDir . '/bootstrap.php';

$success = copy($src, $dest);

echo json_encode([
    "success" => $success,
    "copied_bootstrap" => $dest,
    "timestamp" => date('c')
], JSON_PRETTY_PRINT);
?>
