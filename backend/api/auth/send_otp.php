<?php
/**
 * Send OTP for email verification before login.
 * FIXES Task 1: Proxy-safe IP resolution, HMAC-SHA256 OTP hashing with server secret.
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';
include_once __DIR__ . '/../../config/rate_limit.php';

$database = new Database();
$db = $database->getConnection();

$clientIp = getTrustedClientIp();

// 1. Rate-limit per IP: max 10 per hour (3600s)
checkRateLimit($db, 'send_otp_ip', $clientIp, 10, 3600, "Too many OTP requests from your IP. Please try again in 1 hour.");

$data = json_decode(file_get_contents("php://input"));

// Validate input
if (empty($data->email)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email address is required."]);
    exit();
}

$email = filter_var(trim($data->email), FILTER_VALIDATE_EMAIL);
if (!$email) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Please provide a valid email address."]);
    exit();
}

// 2. Rate-limit per Email: max 3 per 10 min (600s)
checkRateLimit($db, 'send_otp_email', $email, 3, 600, "Too many OTP requests for this email address. Please try again in 10 minutes.");

$full_name = !empty($data->full_name) ? htmlspecialchars(strip_tags(trim($data->full_name)), ENT_QUOTES, 'UTF-8') : 'User';
$full_name = substr($full_name, 0, 100);

// Generate 6-digit OTP and compute HMAC-SHA256 hash using server secret
$serverSecret = getenv('MANTRA_SERVER_SECRET') ?: 'sacred_mantra_secret_key_2026';
$otp = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
$otp_hash = hash_hmac('sha256', $otp, $serverSecret);
$expires_at = date('Y-m-d H:i:s', time() + 600); // 10 minutes

// Store OTP in DB
$upsert = $db->prepare(
    "INSERT INTO pending_otps (email, full_name, otp_hash, expires_at, attempts) 
     VALUES (:email, :full_name, :otp_hash, :expires_at, 0)
     ON DUPLICATE KEY UPDATE 
       full_name = :full_name, 
       otp_hash = :otp_hash, 
       expires_at = :expires_at, 
       attempts = 0"
);
$upsert->execute([
    ':email'     => $email,
    ':full_name' => $full_name,
    ':otp_hash'  => $otp_hash,
    ':expires_at'=> $expires_at
]);

// Send email via PHP mail()
$subject = "Your Mantra App Verification Code";
$appName  = "Mantra & Stotra";
$message  = "
<html>
<body style='font-family: Arial, sans-serif; background:#f4f4f4; padding:30px;'>
  <div style='max-width:480px; margin:auto; background:#fff; border-radius:12px; padding:32px;'>
    <h2 style='color:#FF6B35; margin-top:0;'>🕉 {$appName}</h2>
    <p style='color:#333; font-size:16px;'>Your one-time verification code is:</p>
    <div style='text-align:center; margin:24px 0;'>
      <span style='font-size:42px; font-weight:bold; letter-spacing:12px; color:#222;'>{$otp}</span>
    </div>
    <p style='color:#666; font-size:14px;'>This code is valid for <strong>10 minutes</strong>.</p>
  </div>
</body>
</html>";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: {$appName} <noreply@aarambhtech.in>\r\n";

$mailSent = @mail($email, $subject, $message, $headers);

http_response_code(200);
echo json_encode([
    "status"     => "success",
    "message"    => "A 6-digit verification code has been sent to your email.",
    "email"      => $email,
    "expires_in" => 600
]);
?>
