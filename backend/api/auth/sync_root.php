<?php
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_root_check_2026') {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$publicHtml = dirname(__DIR__, 4);
$webDir = $publicHtml . '/web';

echo json_encode([
    "web_files" => is_dir($webDir) ? scandir($webDir) : null,
    "has_web_web" => is_dir($webDir . '/web'),
    "has_web_index" => file_exists($webDir . '/web/index.html'),
    "has_direct_index" => file_exists($webDir . '/index.html')
], JSON_PRETTY_PRINT);
