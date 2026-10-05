<?php
/**
 * Account & Personal Data Deletion API Endpoint
 * Handles POST /v1/auth/delete_account.php
 * Authenticated endpoint that permanently deletes all records tied to user_id (DPDP Compliance).
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true) ?? [];

$userId = $_SERVER['HTTP_X_USER_ID'] ?? $data['user_id'] ?? null;
$token = $_SERVER['HTTP_X_LOGIN_TOKEN'] ?? $data['login_token'] ?? null;
$deviceId = $_SERVER['HTTP_X_DEVICE_ID'] ?? $data['device_id'] ?? null;

if (!$userId || !$token || !$deviceId) {
    http_response_code(401);
    echo json_encode(["message" => "Authentication required (user_id, login_token, device_id)."]);
    exit();
}

// Validate active session
$authStmt = $db->prepare(
    "SELECT id FROM user_device_info WHERE user_id = :user_id AND device_id = :device_id AND login_token = :token LIMIT 1"
);
$authStmt->execute([':user_id' => $userId, ':device_id' => $deviceId, ':token' => $token]);
if ($authStmt->rowCount() === 0) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid session credentials."]);
    exit();
}

$db->beginTransaction();

try {
    $tables = [
        "user_jaap_logs",
        "user_favorites",
        "user_consents",
        "user_device_info",
        "user_otps",
        "users"
    ];

    $deletedCounts = [];

    foreach ($tables as $table) {
        // Check if table exists before executing DELETE query
        $checkTable = $db->query("SHOW TABLES LIKE '$table'");
        if ($checkTable && $checkTable->rowCount() > 0) {
            $column = ($table === 'user_otps') ? 'email' : 'user_id';

            if ($column === 'email') {
                // Get user email first
                $emailStmt = $db->prepare("SELECT email FROM users WHERE id = :user_id LIMIT 1");
                $emailStmt->execute([':user_id' => $userId]);
                $userRow = $emailStmt->fetch(PDO::FETCH_ASSOC);
                if ($userRow && !empty($userRow['email'])) {
                    $delStmt = $db->prepare("DELETE FROM user_otps WHERE email = :email");
                    $delStmt->execute([':email' => $userRow['email']]);
                    $deletedCounts[$table] = $delStmt->rowCount();
                }
            } else {
                $idCol = ($table === 'users') ? 'id' : 'user_id';
                $delStmt = $db->prepare("DELETE FROM $table WHERE $idCol = :user_id");
                $delStmt->execute([':user_id' => $userId]);
                $deletedCounts[$table] = $delStmt->rowCount();
            }
        }
    }

    $db->commit();

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Account and all associated personal data have been permanently deleted.",
        "deleted_records" => $deletedCounts
    ]);
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to complete account deletion: " . $e->getMessage()
    ]);
}
?>
