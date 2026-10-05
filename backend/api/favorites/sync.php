<?php
/**
 * Favorites Cloud Sync API Endpoint
 * Handles GET/POST /v1/favorites/sync
 * Validates user_id, login_token, and device_id.
 * Set-union sync strategy with tombstones (is_deleted = 1) for removals.
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

// Ensure table user_favorites exists
$db->exec("CREATE TABLE IF NOT EXISTS user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    item_data TEXT NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY u_user_item (user_id, item_id)
)");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $incomingFavorites = $data['favorites'] ?? [];

    if (is_array($incomingFavorites) && count($incomingFavorites) > 0) {
        $upsertStmt = $db->prepare("
            INSERT INTO user_favorites (user_id, item_id, item_data, is_deleted, updated_at)
            VALUES (:user_id, :item_id, :item_data, :is_deleted, :updated_at)
            ON DUPLICATE KEY UPDATE
              item_data = IF(VALUES(updated_at) >= updated_at, VALUES(item_data), item_data),
              is_deleted = IF(VALUES(updated_at) >= updated_at, VALUES(is_deleted), is_deleted),
              updated_at = GREATEST(updated_at, VALUES(updated_at))
        ");

        foreach ($incomingFavorites as $fav) {
            $itemId = (string)($fav['id'] ?? '');
            if ($itemId !== '') {
                $isDeleted = !empty($fav['is_deleted']) ? 1 : 0;
                $updatedAtMs = (float)($fav['updated_at'] ?? (time() * 1000));
                $updatedAtStr = date('Y-m-d H:i:s', (int)($updatedAtMs / 1000));

                $upsertStmt->execute([
                    ':user_id'    => $userId,
                    ':item_id'    => $itemId,
                    ':item_data'  => json_encode($fav),
                    ':is_deleted' => $isDeleted,
                    ':updated_at' => $updatedAtStr
                ]);
            }
        }
    }
}

// Fetch active & tombstoned favorites for user
try {
    $fetchStmt = $db->prepare("
        SELECT item_id, item_data, is_deleted, UNIX_TIMESTAMP(updated_at)*1000 AS updated_at
        FROM user_favorites
        WHERE user_id = :user_id
    ");
    $fetchStmt->execute([':user_id' => $userId]);
    $rows = $fetchStmt->fetchAll(PDO::FETCH_ASSOC);

    $favorites = [];
    foreach ($rows as $row) {
        $itemData = json_decode($row['item_data'], true) ?? [];
        $itemData['id'] = $row['item_id'];
        $itemData['is_deleted'] = (int)$row['is_deleted'];
        $itemData['updated_at'] = (float)$row['updated_at'];
        $favorites[] = $itemData;
    }
} catch (Exception $e) {
    $favorites = [];
}

http_response_code(200);
echo json_encode([
    "status" => "success",
    "user_id" => (int)$userId,
    "favorites" => $favorites
]);
?>
