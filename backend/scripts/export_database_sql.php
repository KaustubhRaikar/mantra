<?php
/**
 * Export MySQL Database Dump for phpMyAdmin Import
 * Generates standard SQL dump compatible with MySQL 5.7+, MySQL 8.0+, MariaDB, and phpMyAdmin.
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
        throw new RuntimeException("Could not obtain MySQL database connection.");
    }

    $dbDriver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
    if ($dbDriver !== 'mysql') {
        throw new RuntimeException("Export requires MySQL driver, active driver is: " . $dbDriver);
    }

    $currentDbName = $db->query("SELECT DATABASE()")->fetchColumn();
    $allTablesStmt = $db->query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME");
    $tables = $allTablesStmt ? $allTablesStmt->fetchAll(PDO::FETCH_COLUMN) : [];

    $sqlDump = "-- --------------------------------------------------------\n";
    $sqlDump .= "-- Mantra Application & Portal Database Dump\n";
    $sqlDump .= "-- Compatible with phpMyAdmin, MySQL 5.7+, MySQL 8.0+, MariaDB\n";
    $sqlDump .= "-- Database: `" . $currentDbName . "`\n";
    $sqlDump .= "-- Generation Timestamp: " . date('Y-m-d H:i:s') . "\n";
    $sqlDump .= "-- --------------------------------------------------------\n\n";
    $sqlDump .= "SET FOREIGN_KEY_CHECKS = 0;\n";
    $sqlDump .= "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n";
    $sqlDump .= "SET time_zone = '+00:00';\n";
    $sqlDump .= "SET NAMES utf8mb4;\n\n";

    $stats = [];
    $totalRows = 0;

    foreach ($tables as $table) {
        // Drop table statement
        $sqlDump .= "-- --------------------------------------------------------\n";
        $sqlDump .= "-- Table structure for table `{$table}`\n";
        $sqlDump .= "-- --------------------------------------------------------\n\n";
        $sqlDump .= "DROP TABLE IF EXISTS `{$table}`;\n";

        // Create table statement
        $createStmt = $db->query("SHOW CREATE TABLE `{$table}`")->fetch(PDO::FETCH_ASSOC);
        $createSql = $createStmt['Create Table'] ?? '';
        $sqlDump .= $createSql . ";\n\n";

        // Dump data
        $countStmt = $db->query("SELECT COUNT(*) FROM `{$table}`");
        $rowCount = (int)$countStmt->fetchColumn();
        $stats[$table] = $rowCount;
        $totalRows += $rowCount;

        if ($rowCount > 0) {
            $sqlDump .= "-- Dumping data for table `{$table}`\n";
            $dataStmt = $db->query("SELECT * FROM `{$table}`");
            $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

            // Insert in batches of 50 rows for phpMyAdmin efficiency
            $chunks = array_chunk($rows, 50);
            foreach ($chunks as $chunk) {
                $columns = array_keys($chunk[0]);
                $escapedColumns = array_map(function($c) { return "`" . $c . "`"; }, $columns);
                $sqlDump .= "INSERT INTO `{$table}` (" . implode(', ', $escapedColumns) . ") VALUES\n";

                $rowValuesList = [];
                foreach ($chunk as $row) {
                    $escapedValues = [];
                    foreach ($columns as $col) {
                        $val = $row[$col];
                        if ($val === null) {
                            $escapedValues[] = "NULL";
                        } elseif (is_numeric($val) && !preg_match('/^0[0-9]/', (string)$val)) {
                            $escapedValues[] = $val;
                        } else {
                            $escapedValues[] = $db->quote($val);
                        }
                    }
                    $rowValuesList[] = "(" . implode(', ', $escapedValues) . ")";
                }
                $sqlDump .= implode(",\n", $rowValuesList) . ";\n";
            }
            $sqlDump .= "\n";
        }
    }

    $sqlDump .= "SET FOREIGN_KEY_CHECKS = 1;\n";
    $sqlDump .= "-- End of Dump\n";

    // Determine target save directories
    $baseDir = dirname($webBackend, 2); // public_html or repo root
    $databaseDir = $baseDir . '/database';
    if (!is_dir($databaseDir)) {
        @mkdir($databaseDir, 0755, true);
    }
    $targetFile = $databaseDir . '/mantra_db.sql';
    file_put_contents($targetFile, $sqlDump);

    // Also write to webBackend/database/mantra_db.sql if available
    $altDbDir = $webBackend . '/../database';
    if (is_dir($altDbDir)) {
        @file_put_contents($altDbDir . '/mantra_db.sql', $sqlDump);
    }

    if (isset($_GET['download']) && $_GET['download'] === '1') {
        header('Content-Description: File Transfer');
        header('Content-Type: application/sql');
        header('Content-Disposition: attachment; filename="mantra_db.sql"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . strlen($sqlDump));
        echo $sqlDump;
        exit();
    }

    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode([
        "status" => "success",
        "message" => "Database exported successfully.",
        "database" => $currentDbName,
        "total_tables" => count($tables),
        "total_rows" => $totalRows,
        "file_path" => $targetFile,
        "file_size_bytes" => strlen($sqlDump),
        "tables" => $stats,
        "download_url" => "https://mantra.aarambhtech.in/web/backend/scripts/export_database_sql.php?key=sacred_canonical_sync_2026&download=1"
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (Throwable $e) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}
