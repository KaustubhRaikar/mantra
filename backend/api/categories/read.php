<?php
/**
 * Categories Read API Endpoint
 * Returns list of all scripture categories and deities.
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->query("SELECT id, name, icon_url as icon_name, description FROM categories ORDER BY id ASC");
    $records = $stmt ? ($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []) : [];

    http_response_code(200);
    echo json_encode(["records" => $records], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["records" => [], "error" => $e->getMessage()]);
}
