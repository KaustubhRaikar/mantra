<?php
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_mantra_dedup_2026') {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$candidates = [
    __DIR__ . '/../../../../config/database.php',
    __DIR__ . '/../../../config/database.php',
    __DIR__ . '/../../config/database.php',
    '/home/u885706413/domains/mantra.aarambhtech.in/public_html/config/database.php'
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

try {
    $database = new Database();
    $db = $database->getConnection();

    $db_name = $db->query("SELECT DATABASE()")->fetchColumn();

    // Fetch all categories
    $all = $db->query("SELECT id, name FROM categories ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

    // Run delete duplicate 20 and 16 if they exist
    $db->exec("UPDATE mantras SET category_id = 19 WHERE category_id = 20");
    $del20 = $db->exec("DELETE FROM categories WHERE id = 20");

    $db->exec("UPDATE mantras SET category_id = 15 WHERE category_id = 16");
    $del16 = $db->exec("DELETE FROM categories WHERE id = 16");

    $after = $db->query("SELECT id, name FROM categories ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "database" => $db_name,
        "del20_count" => $del20,
        "del16_count" => $del16,
        "before_categories" => $all,
        "after_categories" => $after
    ], JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
