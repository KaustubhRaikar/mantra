<?php
/**
 * User DPDP Consent API Endpoint
 * Handles GET/POST /v1/auth/consent.php
 * DEV Rule #4: Derives user_id strictly from validated token in user_device_info.
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
    echo json_encode(["status" => "error", "message" => "Authentication required (login_token, device_id)."]);
    exit();
}

// Derive user_id strictly from token lookup
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

// Ensure table user_consents exists
$db->exec("CREATE TABLE IF NOT EXISTS user_consents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    analytics_consent TINYINT(1) NOT NULL DEFAULT 0,
    notifications_consent TINYINT(1) NOT NULL DEFAULT 0,
    ai_consent TINYINT(1) NOT NULL DEFAULT 0,
    policy_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY u_user (user_id)
)");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $analytics = !empty($data['analytics']) ? 1 : 0;
    $notifications = !empty($data['notifications']) ? 1 : 0;
    $ai = !empty($data['ai']) ? 1 : 0;
    $version = $data['policy_version'] ?? '1.0';

    $stmt = $db->prepare("
        INSERT INTO user_consents (user_id, analytics_consent, notifications_consent, ai_consent, policy_version, updated_at)
        VALUES (:user_id, :analytics, :notifications, :ai, :version, NOW())
        ON DUPLICATE KEY UPDATE
          analytics_consent = VALUES(analytics_consent),
          notifications_consent = VALUES(notifications_consent),
          ai_consent = VALUES(ai_consent),
          policy_version = VALUES(policy_version),
          updated_at = NOW()
    ");

    $stmt->execute([
        ':user_id' => $userId,
        ':analytics' => $analytics,
        ':notifications' => $notifications,
        ':ai' => $ai,
        ':version' => $version
    ]);

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Consent preferences saved successfully.",
        "user_id" => $userId,
        "consent" => [
            "analytics" => (bool)$analytics,
            "notifications" => (bool)$notifications,
            "ai" => (bool)$ai,
            "policy_version" => $version
        ]
    ]);
    exit();
}

// GET request: retrieve consent settings
$fetchStmt = $db->prepare("SELECT analytics_consent, notifications_consent, ai_consent, policy_version, updated_at FROM user_consents WHERE user_id = :user_id LIMIT 1");
$fetchStmt->execute([':user_id' => $userId]);
$row = $fetchStmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "user_id" => $userId,
        "consent" => [
            "analytics" => (bool)$row['analytics_consent'],
            "notifications" => (bool)$row['notifications_consent'],
            "ai" => (bool)$row['ai_consent'],
            "policy_version" => $row['policy_version'],
            "updated_at" => $row['updated_at']
        ]
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "user_id" => $userId,
        "consent" => null
    ]);
}
?>
