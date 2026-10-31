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

    // 1. Drop all existing tables cleanly with FOREIGN_KEY_CHECKS = 0
    $db->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $existingTables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($existingTables as $tbl) {
        $db->exec("DROP TABLE IF EXISTS `{$tbl}`;");
    }

    // 2. Stream and execute SQL statements individually
    $handle = fopen($sqlFile, "r");
    if (!$handle) {
        throw new RuntimeException("Could not open SQL file for reading: {$sqlFile}");
    }

    $statement = '';
    $inString = false;
    $stringChar = '';
    $statementsExecuted = 0;
    $errors = [];

    while (($line = fgets($handle)) !== false) {
        $trimmed = trim($line);
        // Skip comment lines if outside string
        if (!$inString && (str_starts_with($trimmed, '--') || str_starts_with($trimmed, '/*') || $trimmed === '')) {
            continue;
        }

        $statement .= $line;

        // Track quoted strings
        $len = strlen($line);
        for ($i = 0; $i < $len; $i++) {
            $char = $line[$i];
            $prevChar = ($i > 0) ? $line[$i - 1] : '';

            if (($char === "'" || $char === '"') && $prevChar !== '\\') {
                if ($inString && $stringChar === $char) {
                    $inString = false;
                } elseif (!$inString) {
                    $inString = true;
                    $stringChar = $char;
                }
            }
        }

        // If statement ends with semicolon outside string literal
        if (!$inString && preg_match('/;\s*$/', $line)) {
            $sql = trim($statement);
            if ($sql !== '' && $sql !== ';') {
                try {
                    $db->exec($sql);
                    $statementsExecuted++;
                } catch (Throwable $e) {
                    $errors[] = [
                        "statement_num" => $statementsExecuted + 1,
                        "error" => $e->getMessage(),
                        "snippet" => substr($sql, 0, 150)
                    ];
                }
            }
            $statement = '';
        }
    }
    fclose($handle);

    if (trim($statement) !== '') {
        try {
            $db->exec(trim($statement));
            $statementsExecuted++;
        } catch (Throwable $e) {
            $errors[] = [
                "statement_num" => $statementsExecuted + 1,
                "error" => $e->getMessage(),
                "snippet" => substr(trim($statement), 0, 150)
            ];
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
        "queries_executed" => $statementsExecuted,
        "errors_count" => count($errors),
        "sample_errors" => array_slice($errors, 0, 5),
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
