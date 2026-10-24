<?php
/**
 * Verify OTP and issue a session token.
 * FIXES Task 1 & DEV Rule #2: HMAC-SHA256 verification using hash_equals() constant-time comparison.
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';
include_once __DIR__ . '/../../config/rate_limit.php';

$database = new Database();
$db = $database->getConnection();

$clientIp = getTrustedClientIp();

// Rate limit: max 10 OTP verification attempts per IP per 10 minutes
checkRateLimit($db, 'verify_otp_ip', $clientIp, 10, 600, "Too many verification attempts from this IP. Please wait 10 minutes.");

$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (empty($data->email) || empty($data->otp) || empty($data->device_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email, OTP, and device_id are required."]);
    exit();
}

$email       = filter_var(trim($data->email), FILTER_VALIDATE_EMAIL);
$otp_input   = trim($data->otp);
$device_id   = trim($data->device_id);
$device_name = !empty($data->device_name) ? htmlspecialchars(strip_tags(trim($data->device_name)), ENT_QUOTES, 'UTF-8') : 'Unknown Device';
$device_name = substr($device_name, 0, 100);

if (!$email) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid email address."]);
    exit();
}

if (!preg_match('/^\d{6}$/', $otp_input)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "OTP must be a 6-digit number."]);
    exit();
}

// Fetch pending OTP record
$fetch = $db->prepare(
    "SELECT full_name, otp_hash, expires_at, attempts 
     FROM pending_otps 
     WHERE email = :email 
     LIMIT 1"
);
$fetch->execute([':email' => $email]);

if ($fetch->rowCount() === 0) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "No pending verification found for this email. Please request a new code."]);
    exit();
}

$pending = $fetch->fetch(PDO::FETCH_ASSOC);

// Check expiry (10 min)
if (strtotime($pending['expires_at']) < time()) {
    $db->prepare("DELETE FROM pending_otps WHERE email = :email")->execute([':email' => $email]);
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Verification code has expired. Please request a new one."]);
    exit();
}

// Check attempt count (max 5 per OTP)
if ((int)$pending['attempts'] >= 5) {
    $db->prepare("DELETE FROM pending_otps WHERE email = :email")->execute([':email' => $email]);
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Too many incorrect attempts. Verification code invalidated. Please request a new one."]);
    exit();
}

// HMAC-SHA256 constant-time hash comparison
$serverSecret = getenv('MANTRA_SERVER_SECRET') ?: 'sacred_mantra_secret_key_2026';
$expectedHash = $pending['otp_hash'];
$computedHash = hash_hmac('sha256', $otp_input, $serverSecret);

if (!hash_equals($expectedHash, $computedHash)) {
    $db->prepare("UPDATE pending_otps SET attempts = attempts + 1 WHERE email = :email")
       ->execute([':email' => $email]);
    
    $remainingAttempts = 4 - (int)$pending['attempts'];
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Incorrect verification code." . ($remainingAttempts > 0 ? " You have {$remainingAttempts} attempt(s) remaining." : " Code invalidated.")
    ]);
    exit();
}

// OTP is valid. Delete immediately (single-use invalidation)
$db->prepare("DELETE FROM pending_otps WHERE email = :email")->execute([':email' => $email]);

$full_name = $pending['full_name'];

// Find or create user
$user_query = $db->prepare("SELECT id, full_name, email FROM users WHERE email = :email LIMIT 1");
$user_query->execute([':email' => $email]);

$user_id = null;
if ($user_query->rowCount() > 0) {
    $row       = $user_query->fetch(PDO::FETCH_ASSOC);
    $user_id   = (int)$row['id'];
    $full_name = !empty($row['full_name']) ? $row['full_name'] : $full_name;
} else {
    $insert_user = $db->prepare("INSERT INTO users (email, full_name) VALUES (:email, :full_name)");
    $insert_user->execute([':email' => $email, ':full_name' => $full_name]);
    $user_id = (int)$db->lastInsertId();
}

// Generate cryptographically secure session token
$token = bin2hex(random_bytes(32));

// Register / update device session
$session_query = $db->prepare(
    "INSERT INTO user_device_info (user_id, device_id, device_name, login_token) 
     VALUES (:user_id, :device_id, :device_name, :token) 
     ON DUPLICATE KEY UPDATE 
       device_id    = :device_id, 
       device_name  = :device_name, 
       login_token  = :token,
       last_active  = CURRENT_TIMESTAMP"
);
$session_query->execute([
    ':user_id'     => $user_id,
    ':device_id'   => $device_id,
    ':device_name' => $device_name,
    ':token'       => $token
]);

http_response_code(200);
echo json_encode([
    "status"  => "success",
    "message" => "Login successful.",
    "user"    => [
        "id"        => $user_id,
        "email"     => $email,
        "full_name" => $full_name
    ],
    "session" => [
        "token"     => $token,
        "device_id" => $device_id
    ]
]);
?>
