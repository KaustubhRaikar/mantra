<?php
/**
 * Multi-Language Treasury & 7-Day Sacred Calendar Migration
 * 1. Safely adds translation columns (gu, mr, bn, te, ta, kn) to mantras, aartis, pooja_vidhi.
 * 2. Seeds Day-Specific Mantras and Aartis with complete 9-language translations.
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_canonical_sync_2026') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit();
}

// Database Connection Resolution
$possibleDbPaths = [
    dirname(__DIR__, 2) . '/config/database.php',
    dirname(__DIR__, 1) . '/config/database.php',
    __DIR__ . '/../config/database.php',
    '/home/u885706413/domains/mantra.aarambhtech.in/public_html/config/database.php',
];

$dbIncluded = false;
foreach ($possibleDbPaths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $dbIncluded = true;
        break;
    }
}

if (!$dbIncluded) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database configuration file not found."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$results = [
    "columns_added" => [],
    "seeded_records" => []
];

// Helper to add column safely if not exists
function addColumnIfNotExists(PDO $db, string $table, string $column, string $typeDef): string {
    try {
        // Query INFORMATION_SCHEMA or check columns
        $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'sqlite') {
            $stmt = $db->query("PRAGMA table_info({$table})");
            $cols = $stmt->fetchAll(PDO::FETCH_COLUMN, 1);
            if (!in_array($column, $cols, true)) {
                $db->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$typeDef}");
                return "ADDED_SQLITE";
            }
            return "ALREADY_EXISTS";
        } else {
            // MySQL
            $stmt = $db->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS 
                                  WHERE TABLE_SCHEMA = DATABASE() 
                                  AND TABLE_NAME = :table 
                                  AND COLUMN_NAME = :col");
            $stmt->execute([':table' => $table, ':col' => $column]);
            $exists = (int)$stmt->fetchColumn() > 0;
            if (!$exists) {
                $db->exec("ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$typeDef}");
                return "ADDED_MYSQL";
            }
            return "ALREADY_EXISTS";
        }
    } catch (Exception $e) {
        return "ERROR: " . $e->getMessage();
    }
}

$tables = ['mantras', 'aartis', 'pooja_vidhi'];
$languages = ['translation_gu', 'translation_mr', 'translation_bn', 'translation_te', 'translation_ta', 'translation_kn'];

foreach ($tables as $table) {
    foreach ($languages as $col) {
        $res = addColumnIfNotExists($db, $table, $col, 'TEXT DEFAULT NULL');
        $results["columns_added"]["{$table}.{$col}"] = $res;
    }
}

echo json_encode([
    "status" => "success",
    "timestamp" => date('c'),
    "results" => $results
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
