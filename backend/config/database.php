<?php
/**
 * Database Connection Gateway
 * Provides secure PDO MySQL connection with self-healing fallback for local development.
 */

if (!class_exists('Database')) {
class Database {
    private ?PDO $conn = null;

    public function getConnection(): ?PDO {
        if ($this->conn !== null) {
            return $this->conn;
        }

        // Parse environment variables from .env if present
        $envPaths = [
            dirname(__DIR__, 3) . '/.env',
            dirname(__DIR__, 2) . '/.env',
            dirname(__DIR__, 1) . '/.env',
            '/home/u885706413/domains/mantra.aarambhtech.in/public_html/.env'
        ];
        foreach ($envPaths as $envFile) {
            if (file_exists($envFile)) {
                $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    if (strpos(trim($line), '#') === 0) continue;
                    $parts = explode('=', $line, 2);
                    if (count($parts) === 2) {
                        $varName = trim($parts[0]);
                        $varVal  = trim($parts[1]);
                        if (!getenv($varName)) {
                            putenv("{$varName}={$varVal}");
                            $_ENV[$varName] = $varVal;
                        }
                    }
                }
                break;
            }
        }

        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $db   = getenv('DB_NAME') ?: 'mantra_db';
        $user = getenv('DB_USER') ?: 'root';
        $pass = getenv('DB_PASS') ?: '';
        $port = getenv('DB_PORT') ?: '3306';

        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
            $this->conn = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (Throwable $e) {
            // Development fallback to embedded SQLite if local MySQL is offline
            $sqliteDir = sys_get_temp_dir() . '/mantra_security';
            if (!is_dir($sqliteDir)) {
                @mkdir($sqliteDir, 0750, true);
            }
            $sqliteFile = $sqliteDir . '/mantra_local.sqlite';
            try {
                $this->conn = new PDO("sqlite:" . $sqliteFile, null, null, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
            } catch (Throwable $sqle) {
                $this->conn = null;
            }
        }

        if ($this->conn) {
            $this->ensureTables();
        }

        return $this->conn;
    }

    private function ensureTables(): void {
        try {
            $driver = $this->conn->getAttribute(PDO::ATTR_DRIVER_NAME);
            if ($driver === 'sqlite') {
                $this->conn->exec("CREATE TABLE IF NOT EXISTS pending_otps (
                    email TEXT PRIMARY KEY,
                    full_name TEXT NOT NULL,
                    otp_hash TEXT NOT NULL,
                    expires_at TEXT NOT NULL,
                    attempts INTEGER DEFAULT 0
                );");
                $this->conn->exec("CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    full_name TEXT NOT NULL DEFAULT 'Devotee',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );");
                $this->conn->exec("CREATE TABLE IF NOT EXISTS user_device_info (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    device_id TEXT NOT NULL,
                    device_name TEXT DEFAULT 'Devotee Device',
                    login_token TEXT NOT NULL,
                    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, device_id)
                );");
                $this->conn->exec("CREATE TABLE IF NOT EXISTS api_sliding_rate_limits (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_key TEXT NOT NULL,
                    created_at INTEGER NOT NULL
                );");
                $this->conn->exec("CREATE INDEX IF NOT EXISTS idx_client_sliding ON api_sliding_rate_limits(client_key, created_at);");
            } else {
                $this->conn->exec("CREATE TABLE IF NOT EXISTS pending_otps (
                    email VARCHAR(255) PRIMARY KEY,
                    full_name VARCHAR(100) NOT NULL,
                    otp_hash VARCHAR(64) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    attempts INT NOT NULL DEFAULT 0,
                    INDEX idx_exp (expires_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->conn->exec("CREATE TABLE IF NOT EXISTS users (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    full_name VARCHAR(150) NOT NULL DEFAULT 'Devotee',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                $this->conn->exec("CREATE TABLE IF NOT EXISTS user_device_info (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    user_id BIGINT UNSIGNED NOT NULL,
                    device_id VARCHAR(128) NOT NULL,
                    device_name VARCHAR(100) DEFAULT 'Devotee Device',
                    login_token VARCHAR(128) NOT NULL,
                    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY uk_user_device (user_id, device_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

                // Self-healing column verification for older table schemas
                try {
                    $cols = $this->conn->query("SHOW COLUMNS FROM pending_otps")->fetchAll(PDO::FETCH_COLUMN);
                    if (!in_array('full_name', $cols, true)) {
                        $this->conn->exec("ALTER TABLE pending_otps ADD COLUMN full_name VARCHAR(100) NOT NULL DEFAULT 'Devotee' AFTER email;");
                    }
                    if (!in_array('otp_hash', $cols, true)) {
                        $this->conn->exec("ALTER TABLE pending_otps ADD COLUMN otp_hash VARCHAR(64) NOT NULL DEFAULT '' AFTER full_name;");
                    }
                    if (!in_array('attempts', $cols, true)) {
                        $this->conn->exec("ALTER TABLE pending_otps ADD COLUMN attempts INT NOT NULL DEFAULT 0 AFTER expires_at;");
                    }
                } catch (Throwable $colErr) {}

                $this->conn->exec("CREATE TABLE IF NOT EXISTS api_sliding_rate_limits (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    client_key VARCHAR(64) NOT NULL,
                    created_at INT UNSIGNED NOT NULL,
                    INDEX idx_client_sliding (client_key, created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

                // One-time unblock reset for legacy proxy-locked rate limit records
                $unblockMarker = sys_get_temp_dir() . '/mantra_rate_limit_reset_v292.lock';
                if (!file_exists($unblockMarker)) {
                    try {
                        $this->conn->exec("DELETE FROM api_sliding_rate_limits;");
                        @touch($unblockMarker);
                    } catch (Throwable $t) {}
                }
            }
        } catch (Throwable $e) {}
    }
}
}
