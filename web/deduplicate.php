<?php
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_mantra_dedup_2026') {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

// Possible database.php locations
$candidates = [
    __DIR__ . '/../config/database.php',
    __DIR__ . '/../../config/database.php',
    __DIR__ . '/config/database.php',
    '/home/u885706413/domains/mantra.aarambhtech.in/public_html/config/database.php',
    dirname(__DIR__) . '/config/database.php',
    dirname(dirname(__DIR__)) . '/config/database.php'
];

$loaded = false;
$loaded_path = '';

foreach ($candidates as $path) {
    if (file_exists($path)) {
        include_once $path;
        $loaded = true;
        $loaded_path = $path;
        break;
    }
}

if (!$loaded) {
    http_response_code(500);
    echo json_encode([
        "error" => "database.php not found",
        "checked" => $candidates,
        "current_dir" => __DIR__
    ], JSON_PRETTY_PRINT);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $log = [
        "loaded_config" => $loaded_path
    ];

    // 1. Check existing categories 15, 16, 19, 20
    $stmt = $db->query("SELECT id, name FROM categories WHERE id IN (15, 16, 19, 20)");
    $log['found_before'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

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

    // 5. Total categories count and sample
    $stmt = $db->query("SELECT id, name FROM categories ORDER BY id ASC");
    $log['all_categories'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "log" => $log], JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage(), "loaded_path" => $loaded_path], JSON_PRETTY_PRINT);
}
