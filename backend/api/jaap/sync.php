<?php
/**
 * Jaap Logs Cloud Sync API Endpoint
 * Handles GET/POST /v1/jaap/sync
 * DEV Rules:
 * - Derive user_id strictly from validated token in user_device_info (ignores body user_id)
 * - Stores counts per (date, device_id)
 * - Returns SUM(total_chants) and SUM(completed_malas) grouped by date across devices
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true) ?? [];

$token = $_SERVER['HTTP_X_LOGIN_TOKEN'] ?? $data['login_token'] ?? $_GET['login_token'] ?? null;
$deviceId = $_SERVER['HTTP_X_DEVICE_ID'] ?? $data['device_id'] ?? $_GET['device_id'] ?? null;

if (!$token || !$deviceId) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Authentication credentials required (login_token, device_id)."]);
    exit();
}

// Derive user_id strictly from validated token
$authStmt = $db->prepare(
    "SELECT user_id FROM user_device_info WHERE device_id = :device_id AND login_token = :token LIMIT 1"
);
$authStmt->execute([':device_id' => $deviceId, ':token' => $token]);
$authRow = $authStmt->fetch(PDO::FETCH_ASSOC);

if (!$authRow || empty($authRow['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Invalid or expired session token."]);
    exit();
}

$userId = (int)$authRow['user_id'];

// Ensure table user_jaap_logs exists with (user_id, date, device_id) unique key
$db->exec("CREATE TABLE IF NOT EXISTS user_jaap_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date VARCHAR(10) NOT NULL,
    device_id VARCHAR(100) NOT NULL DEFAULT 'default',
    formatted_date VARCHAR(50) NOT NULL,
    total_chants INT NOT NULL DEFAULT 0,
    completed_malas INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY u_user_date_device (user_id, date, device_id)
)");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $incomingLogs = $data['jaap_logs'] ?? [];

    if (is_array($incomingLogs) && count($incomingLogs) > 0) {
        $upsertStmt = $db->prepare("
            INSERT INTO user_jaap_logs (user_id, date, device_id, formatted_date, total_chants, completed_malas, updated_at)
            VALUES (:user_id, :date, :device_id, :formatted_date, :total_chants, :completed_malas, NOW())
            ON DUPLICATE KEY UPDATE
              total_chants = GREATEST(total_chants, VALUES(total_chants)),
              completed_malas = GREATEST(completed_malas, VALUES(completed_malas)),
              updated_at = NOW()
        ");

        foreach ($incomingLogs as $log) {
            if (!empty($log['date'])) {
                $upsertStmt->execute([
                    ':user_id'         => $userId,
                    ':date'            => $log['date'],
                    ':device_id'       => $deviceId,
                    ':formatted_date'  => $log['formattedDate'] ?? $log['formatted_date'] ?? $log['date'],
                    ':total_chants'    => (int)($log['totalChants'] ?? $log['total_chants'] ?? 0),
                    ':completed_malas' => (int)($log['completedMalas'] ?? $log['completed_malas'] ?? 0)
                ]);
            }
        }
    }
}

// Fetch aggregated SUM of counts per date across all user devices
try {
    $fetchStmt = $db->prepare("
        SELECT date, 
               MAX(formatted_date) AS formattedDate, 
               SUM(total_chants) AS totalChants, 
               SUM(completed_malas) AS completedMalas
        FROM user_jaap_logs
        WHERE user_id = :user_id
        GROUP BY date
        ORDER BY date DESC
        LIMIT 90
    ");
    $fetchStmt->execute([':user_id' => $userId]);
    $rows = $fetchStmt->fetchAll(PDO::FETCH_ASSOC);

    $logs = array_map(function($row) {
        return [
            "date"           => $row['date'],
            "formattedDate"  => $row['formattedDate'],
            "totalChants"    => (int)$row['totalChants'],
            "completedMalas" => (int)$row['completedMalas']
        ];
    }, $rows);
} catch (Exception $e) {
    $logs = [];
}

http_response_code(200);
echo json_encode([
    "status"    => "success",
    "user_id"   => $userId,
    "jaap_logs" => $logs
]);
?>
