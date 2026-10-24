<?php
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_root_check_2026') {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

// In web/backend/api/auth/, __DIR__ is .../public_html/web/backend/api/auth
// So dirname(__DIR__, 4) is .../public_html!
$publicHtml = dirname(__DIR__, 4);

$files = scandir($publicHtml);

echo json_encode([
    "public_html" => $publicHtml,
    "files" => $files,
    "has_index" => file_exists($publicHtml . '/index.html'),
    "has_htaccess" => file_exists($publicHtml . '/.htaccess'),
    "index_preview" => file_exists($publicHtml . '/index.html') ? substr(file_get_contents($publicHtml . '/index.html'), 0, 300) : null
], JSON_PRETTY_PRINT);
