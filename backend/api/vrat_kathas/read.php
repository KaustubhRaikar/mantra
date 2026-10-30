<?php
/**
 * Vrat Kathas Read API Endpoint
 * Returns collection of all sacred narratives and fasting stories.
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $category = $_GET['category'] ?? null;
    $sql = "SELECT id, title, katha_name, sanskrit, sanskrit_title, category, category_label, 
                   deity, deity_name, duration, synopsis, vrat_significance, katha_text,
                   translation_hi, translation_en, translation_gu, translation_mr, audio_url
            FROM vrat_katha";

    if ($category) {
        $sql .= " WHERE category = :cat";
    }
    $sql .= " ORDER BY id ASC";

    $stmt = $db->prepare($sql);
    if ($category) {
        $stmt->bindParam(':cat', $category);
    }
    $stmt->execute();
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    http_response_code(200);
    echo json_encode(["records" => $records], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["records" => [], "error" => $e->getMessage()]);
}
