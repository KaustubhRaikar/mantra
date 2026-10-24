<?php
/**
 * Favorites Cloud Sync API Endpoint
 * Handles GET/POST /v1/favorites/sync
 * DEV Rules:
 * - Derive user_id strictly from validated token in user_device_info
 * - Uses server-assigned version sequence for set-union tombstone sync
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

// Ensure table user_favorites exists with server-assigned version column
$db->exec("CREATE TABLE IF NOT EXISTS user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    item_data TEXT NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    version INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY u_user_item (user_id, item_id)
)");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $incomingFavorites = $data['favorites'] ?? [];

    if (is_array($incomingFavorites) && count($incomingFavorites) > 0) {
        $upsertStmt = $db->prepare("
            INSERT INTO user_favorites (user_id, item_id, item_data, is_deleted, version, updated_at)
            VALUES (:user_id, :item_id, :item_data, :is_deleted, 1, NOW())
            ON DUPLICATE KEY UPDATE
              item_data = IF(VALUES(version) >= version OR VALUES(is_deleted) = 1, VALUES(item_data), item_data),
              is_deleted = IF(VALUES(version) >= version, VALUES(is_deleted), is_deleted),
              version = version + 1,
              updated_at = NOW()
        ");

        foreach ($incomingFavorites as $fav) {
            $itemId = (string)($fav['id'] ?? '');
            if ($itemId !== '') {
                $isDeleted = !empty($fav['is_deleted']) ? 1 : 0;
                $upsertStmt->execute([
                    ':user_id'    => $userId,
                    ':item_id'    => $itemId,
                    ':item_data'  => json_encode($fav),
                    ':is_deleted' => $isDeleted,
                ]);
            }
        }
    }
}

// Fetch active & tombstoned favorites for user
try {
    $fetchStmt = $db->prepare("
        SELECT item_id, item_data, is_deleted, version, UNIX_TIMESTAMP(updated_at)*1000 AS updated_at
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
        $itemData['version'] = (int)$row['version'];
        $itemData['updated_at'] = (float)$row['updated_at'];
        $favorites[] = $itemData;
    }
} catch (Exception $e) {
    $favorites = [];
}

http_response_code(200);
echo json_encode([
    "status"    => "success",
    "user_id"   => $userId,
    "favorites" => $favorites
]);
?>
