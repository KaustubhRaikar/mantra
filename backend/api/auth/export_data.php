<?php
/**
 * User Personal Data Export API Endpoint
 * Handles GET/POST /v1/auth/export_data.php
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

$exportData = [
    "export_date" => date('Y-m-d H:i:s'),
    "user_id"     => $userId,
    "profile"     => null,
    "consents"    => null,
    "jaap_logs"   => [],
    "favorites"   => [],
    "devices"     => []
];

// Profile
try {
    $pStmt = $db->prepare("SELECT id, email, full_name, created_at FROM users WHERE id = :user_id LIMIT 1");
    $pStmt->execute([':user_id' => $userId]);
    $exportData['profile'] = $pStmt->fetch(PDO::FETCH_ASSOC) ?: null;
} catch (Exception $e) {}

// Consents
try {
    $cStmt = $db->prepare("SELECT analytics_consent, notifications_consent, ai_consent, policy_version, updated_at FROM user_consents WHERE user_id = :user_id LIMIT 1");
    $cStmt->execute([':user_id' => $userId]);
    $exportData['consents'] = $cStmt->fetch(PDO::FETCH_ASSOC) ?: null;
} catch (Exception $e) {}

// Jaap Logs
try {
    $jStmt = $db->prepare("SELECT date, device_id, formatted_date, total_chants, completed_malas, updated_at FROM user_jaap_logs WHERE user_id = :user_id ORDER BY date DESC");
    $jStmt->execute([':user_id' => $userId]);
    $exportData['jaap_logs'] = $jStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
} catch (Exception $e) {}

// Favorites
try {
    $fStmt = $db->prepare("SELECT item_id, item_data, is_deleted, version, updated_at FROM user_favorites WHERE user_id = :user_id");
    $fStmt->execute([':user_id' => $userId]);
    $exportData['favorites'] = $fStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
} catch (Exception $e) {}

// Devices
try {
    $dStmt = $db->prepare("SELECT device_id, device_name, updated_at FROM user_device_info WHERE user_id = :user_id");
    $dStmt->execute([':user_id' => $userId]);
    $exportData['devices'] = $dStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
} catch (Exception $e) {}

http_response_code(200);
echo json_encode([
    "status" => "success",
    "data"   => $exportData
]);
?>
