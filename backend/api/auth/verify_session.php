<?php
/**
 * Verify user session token against device ID.
 * FIXES Task 1: Prepared statements, security check.
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->user_id) || empty($data->login_token) || empty($data->device_id)) {
    http_response_code(400);
    echo json_encode(["is_valid" => false, "message" => "user_id, login_token, and device_id are required."]);
    exit();
}

$user_id     = (int)$data->user_id;
$login_token = trim($data->login_token);
$device_id   = trim($data->device_id);

$stmt = $db->prepare(
    "SELECT u.id, u.email, u.full_name, d.device_id, d.last_active 
     FROM user_device_info d
     JOIN users u ON u.id = d.user_id
     WHERE d.user_id = :user_id 
       AND d.device_id = :device_id 
       AND d.login_token = :token
     LIMIT 1"
);
$stmt->execute([
    ':user_id'   => $user_id,
    ':device_id' => $device_id,
    ':token'     => $login_token
]);

if ($stmt->rowCount() > 0) {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Touch last_active timestamp
    $touch = $db->prepare("UPDATE user_device_info SET last_active = CURRENT_TIMESTAMP WHERE user_id = :user_id AND device_id = :device_id");
    $touch->execute([':user_id' => $user_id, ':device_id' => $device_id]);

    http_response_code(200);
    echo json_encode([
        "is_valid" => true,
        "message"  => "Session is active.",
        "user"     => [
            "id"        => $row['id'],
            "email"     => $row['email'],
            "full_name" => $row['full_name']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        "is_valid" => false,
        "message"  => "Session expired or invalid for this device."
    ]);
}
?>
