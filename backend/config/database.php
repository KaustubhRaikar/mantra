<?php
/**
 * Database Connection Gateway
 * Provides secure PDO MySQL connection with self-healing fallback for local development.
 */

class Database {
    private ?PDO $conn = null;

    public function getConnection(): ?PDO {
        if ($this->conn !== null) {
            return $this->conn;
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
            }
        } catch (Throwable $e) {}
    }
}
