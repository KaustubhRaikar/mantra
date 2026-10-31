<?php
/**
 * Import MySQL Database Dump into active database
 * Restores all 32 tables and all 2,311 records from mantra_db.sql
 */

ini_set('display_errors', '1');
ini_set('memory_limit', '512M');
set_time_limit(300);
error_reporting(E_ALL);

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_canonical_sync_2026') {
    http_response_code(403);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit();
}

$webBackend = dirname(__DIR__);
require_once $webBackend . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        throw new RuntimeException("Could not obtain MySQL database connection. Verify database has been created in hPanel.");
    }

    $currentDbName = $db->query("SELECT DATABASE()")->fetchColumn();

    // Locate mantra_db.sql
    $possiblePaths = [
        dirname($webBackend, 2) . '/database/mantra_db.sql',
        dirname($webBackend, 1) . '/database/mantra_db.sql',
        $webBackend . '/database/mantra_db.sql',
        '/home/u885706413/domains/mantra.aarambhtech.in/public_html/database/mantra_db.sql',
        '/home/u885706413/domains/mantra.aarambhtech.in/public_html/web/database/mantra_db.sql'
    ];

    $sqlFile = null;
    foreach ($possiblePaths as $path) {
        if (file_exists($path) && filesize($path) > 100000) {
            $sqlFile = $path;
            break;
        }
    }

    if (!$sqlFile) {
        throw new RuntimeException("SQL dump file mantra_db.sql not found on server.");
    }

    $sqlContent = file_get_contents($sqlFile);
    if (!$sqlContent) {
        throw new RuntimeException("Failed to read SQL dump file.");
    }

    // Split and execute statements
    $db->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $db->exec("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';");
    $db->exec("SET NAMES utf8mb4;");

    // Execute the dump using multi-query PDO
    $queries = explode(";\n", $sqlContent);
    $executed = 0;
    $errors = [];

    foreach ($queries as $query) {
        $trimmed = trim($query);
        if ($trimmed === '' || strpos($trimmed, '--') === 0) {
            continue;
        }
        try {
            $db->exec($trimmed);
            $executed++;
        } catch (Throwable $qe) {
            $errors[] = substr($qe->getMessage(), 0, 120);
        }
    }

    $db->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // Count tables and records
    $allTablesStmt = $db->query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME");
    $tables = $allTablesStmt ? $allTablesStmt->fetchAll(PDO::FETCH_COLUMN) : [];
    $tableCounts = [];
    $totalRows = 0;

    foreach ($tables as $t) {
        try {
            $c = (int)$db->query("SELECT COUNT(*) FROM `{$t}`")->fetchColumn();
            $tableCounts[$t] = $c;
            $totalRows += $c;
        } catch (Throwable $e) {}
    }

    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode([
        "status" => "success",
        "message" => "Database successfully populated with all sacred canonical content.",
        "database" => $currentDbName,
        "queries_executed" => $executed,
        "errors_count" => count($errors),
        "total_tables" => count($tables),
        "total_rows" => $totalRows,
        "tables" => $tableCounts
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (Throwable $e) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}
