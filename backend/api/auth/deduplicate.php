<?php
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_mantra_dedup_2026') {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$db_file = __DIR__ . '/../../config/database.php';
if (!file_exists($db_file)) {
    http_response_code(500);
    echo json_encode(["error" => "database.php not found at: " . $db_file]);
    exit();
}

include_once $db_file;

try {
    $database = new Database();
    $db = $database->getConnection();

    $log = [];

    // 1. Check existing categories 15, 16, 19, 20
    $stmt = $db->query("SELECT id, name FROM categories WHERE id IN (15, 16, 19, 20)");
    $found = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $log['found_before'] = $found;

    // 2. Merge category 20 -> 19
    $stmt = $db->prepare("UPDATE mantras SET category_id = 19 WHERE category_id = 20");
    $stmt->execute();
    $log['mantras_20_to_19_moved'] = $stmt->rowCount();

    $stmt = $db->prepare("DELETE FROM categories WHERE id = 20");
    $stmt->execute();
    $log['category_20_deleted'] = $stmt->rowCount();

    // 3. Merge category 16 -> 15
    $stmt = $db->prepare("UPDATE mantras SET category_id = 15 WHERE category_id = 16");
    $stmt->execute();
    $log['mantras_16_to_15_moved'] = $stmt->rowCount();

    $stmt = $db->prepare("DELETE FROM categories WHERE id = 16");
    $stmt->execute();
    $log['category_16_deleted'] = $stmt->rowCount();

    // 4. Check for any remaining duplicate names
    $stmt = $db->query("SELECT name, COUNT(*) as cnt FROM categories GROUP BY name HAVING cnt > 1");
    $log['remaining_duplicates'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Total categories now
    $stmt = $db->query("SELECT id, name FROM categories ORDER BY id ASC");
    $log['all_categories'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "log" => $log], JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
