<?php
/**
 * Jaap Logs Cloud Sync API Endpoint
 * Handles GET/POST /v1/jaap/sync
 * Validates user_id, login_token, and device_id.
 * Merges daily Jaap logs taking max totalChants and max completedMalas per date.
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true) ?? [];

// Auth Validation
$userId = $_SERVER['HTTP_X_USER_ID'] ?? $data['user_id'] ?? null;
$token = $_SERVER['HTTP_X_LOGIN_TOKEN'] ?? $data['login_token'] ?? null;
$deviceId = $_SERVER['HTTP_X_DEVICE_ID'] ?? $data['device_id'] ?? null;

if (!$userId || !$token || !$deviceId) {
    http_response_code(401);
    echo json_encode(["message" => "Authentication credentials required (user_id, login_token, device_id)."]);
    exit();
}

$authStmt = $db->prepare(
    "SELECT id FROM user_device_info WHERE user_id = :user_id AND device_id = :device_id AND login_token = :token LIMIT 1"
);
$authStmt->execute([':user_id' => $userId, ':device_id' => $deviceId, ':token' => $token]);
if ($authStmt->rowCount() === 0) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid or expired session token."]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $incomingLogs = $data['jaap_logs'] ?? [];

    if (is_array($incomingLogs) && count($incomingLogs) > 0) {
        // Ensure table user_jaap_logs exists
        $db->exec("CREATE TABLE IF NOT EXISTS user_jaap_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            date VARCHAR(10) NOT NULL,
            formatted_date VARCHAR(50) NOT NULL,
            total_chants INT NOT NULL DEFAULT 0,
            completed_malas INT NOT NULL DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY u_user_date (user_id, date)
        )");

        $upsertStmt = $db->prepare("
            INSERT INTO user_jaap_logs (user_id, date, formatted_date, total_chants, completed_malas, updated_at)
            VALUES (:user_id, :date, :formatted_date, :total_chants, :completed_malas, NOW())
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
                    ':formatted_date'  => $log['formattedDate'] ?? $log['formatted_date'] ?? $log['date'],
                    ':total_chants'    => (int)($log['totalChants'] ?? $log['total_chants'] ?? 0),
                    ':completed_malas' => (int)($log['completedMalas'] ?? $log['completed_malas'] ?? 0)
                ]);
            }
        }
    }
}

// Fetch merged logs
try {
    $fetchStmt = $db->prepare("
        SELECT date, formatted_date AS formattedDate, total_chants AS totalChants, completed_malas AS completedMalas
        FROM user_jaap_logs
        WHERE user_id = :user_id
        ORDER BY date DESC
        LIMIT 90
    ");
    $fetchStmt->execute([':user_id' => $userId]);
    $logs = $fetchStmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $logs = [];
}

http_response_code(200);
echo json_encode([
    "status" => "success",
    "user_id" => (int)$userId,
    "jaap_logs" => $logs
]);
?>
