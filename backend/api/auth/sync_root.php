<?php
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_root_check_2026') {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$publicHtml = dirname(__DIR__, 4);

$indexPhpContent = file_exists($publicHtml . '/index.php') ? file_get_contents($publicHtml . '/index.php') : null;
$htaccessContent = file_exists($publicHtml . '/.htaccess') ? file_get_contents($publicHtml . '/.htaccess') : null;

echo json_encode([
    "index_php_length" => strlen($indexPhpContent ?? ''),
    "index_php_sample" => substr($indexPhpContent ?? '', 0, 800),
    "htaccess_sample" => substr($htaccessContent ?? '', 0, 800)
], JSON_PRETTY_PRINT);
