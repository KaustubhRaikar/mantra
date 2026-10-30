<?php
/**
 * Vrat Kathas Read Single API Endpoint
 * Returns single sacred narrative by ID.
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID is required."]);
    exit();
}

try {
    $stmt = $db->prepare("SELECT * FROM vrat_katha WHERE id = :id LIMIT 1");
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($item) {
        // Decode JSON fields if stored as string
        if (!empty($item['chapters']) && is_string($item['chapters'])) {
            $item['chapters'] = json_decode($item['chapters'], true);
        }
        if (!empty($item['katha_chapters']) && is_string($item['katha_chapters'])) {
            $item['katha_chapters'] = json_decode($item['katha_chapters'], true);
        }

        http_response_code(200);
        echo json_encode($item, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Katha not found."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
