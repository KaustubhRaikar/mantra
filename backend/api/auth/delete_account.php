<?php
/**
 * Account & Personal Data Deletion API Endpoint
 * Handles POST /v1/auth/delete_account.php
 * Authenticated endpoint: derives user_id strictly from validated token (DPDP Compliance).
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

// Derive user_id strictly from session token lookup
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

$db->beginTransaction();

try {
    // Get user email before deletion for email-keyed tables
    $emailStmt = $db->prepare("SELECT email FROM users WHERE id = :user_id LIMIT 1");
    $emailStmt->execute([':user_id' => $userId]);
    $userRow = $emailStmt->fetch(PDO::FETCH_ASSOC);
    $userEmail = $userRow['email'] ?? null;

    $tables = [
        "user_jaap_logs",
        "user_favorites",
        "user_consents",
        "user_device_info",
        "users"
    ];

    $deletedCounts = [];

    foreach ($tables as $table) {
        $checkTable = $db->query("SHOW TABLES LIKE '$table'");
        if ($checkTable && $checkTable->rowCount() > 0) {
            $idCol = ($table === 'users') ? 'id' : 'user_id';
            $delStmt = $db->prepare("DELETE FROM $table WHERE $idCol = :user_id");
            $delStmt->execute([':user_id' => $userId]);
            $deletedCounts[$table] = $delStmt->rowCount();
        }
    }

    // Delete email-keyed pending OTPs if email exists
    if ($userEmail) {
        $checkOtps = $db->query("SHOW TABLES LIKE 'pending_otps'");
        if ($checkOtps && $checkOtps->rowCount() > 0) {
            $otpDel = $db->prepare("DELETE FROM pending_otps WHERE email = :email");
            $otpDel->execute([':email' => $userEmail]);
            $deletedCounts['pending_otps'] = $otpDel->rowCount();
        }
    }

    $db->commit();

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Account and all associated personal data have been permanently deleted.",
        "user_id" => $userId,
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
