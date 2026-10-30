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

// 1. Rate-limit per IP: max 5 per hour (3600s) sliding window
checkRateLimit($db, 'send_otp_ip', $clientIp, 5, 3600, "Too many requests. Please try after sometime.");

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

// 2. Rate-limit per Email: max 2 per 15 min (900s) sliding window
checkRateLimit($db, 'send_otp_email', $email, 2, 900, "Too many requests. Please try after sometime.");

$full_name = !empty($data->full_name) ? htmlspecialchars(strip_tags(trim($data->full_name)), ENT_QUOTES, 'UTF-8') : 'User';
$full_name = substr($full_name, 0, 100);

// Generate 6-digit OTP and compute HMAC-SHA256 hash using server secret
$serverSecret = getenv('MANTRA_SERVER_SECRET') ?: 'sacred_mantra_secret_key_2026';
$otp = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
$otp_hash = hash_hmac('sha256', $otp, $serverSecret);
$expires_at = date('Y-m-d H:i:s', time() + 600); // 10 minutes

// Store OTP in DB
try {
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
} catch (Throwable $dbErr) {
    error_log("OTP DB Error: " . $dbErr->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Unable to store verification record. Please try again."]);
    exit();
}

// Send email via PHP mail() from official subdomain address
$fromEmail = "no-reply@mantra.aarambhtech.in";
$appName   = "Mantra & Stotra";
$subject   = "Your Sacred Mantra Verification Code: {$otp}";

$message  = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <title>Mantra Verification Code</title>
</head>
<body style='margin:0; padding:0; background-color:#080711; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>
  <table role='presentation' width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#080711; padding: 40px 20px;'>
    <tr>
      <td align='center'>
        <table role='presentation' width='100%' border='0' cellspacing='0' cellpadding='0' style='max-width:480px; background-color:#141126; border-radius:20px; border:1px solid rgba(255, 153, 51, 0.3); overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.6);'>
          <!-- Header Banner -->
          <tr>
            <td style='background: linear-gradient(135deg, #FF9933, #7A68EE); padding: 28px 24px; text-align:center;'>
              <div style='font-size:36px; line-height:1; color:#FFFFFF; margin-bottom:6px;'>ॐ</div>
              <div style='font-size:22px; font-weight:800; color:#FFFFFF; letter-spacing:2px;'>MANTRA</div>
              <div style='font-size:12px; color:rgba(255,255,255,0.9); text-transform:uppercase; letter-spacing:1px; margin-top:2px;'>Sacred Vedic Sanctuary</div>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style='padding: 36px 32px;'>
              <p style='color:#FFFFFF; font-size:16px; margin:0 0 8px 0; font-weight:600;'>Namaste " . htmlspecialchars($full_name, ENT_QUOTES, 'UTF-8') . " 🙏</p>
              <p style='color:#B8B5D1; font-size:14px; line-height:1.6; margin:0 0 24px 0;'>Here is your one-time verification code to sign in to your sacred sadhana account:</p>
              
              <!-- OTP Box -->
              <table role='presentation' width='100%' border='0' cellspacing='0' cellpadding='0'>
                <tr>
                  <td align='center' style='background: rgba(255, 153, 51, 0.08); border: 1.5px dashed rgba(255, 153, 51, 0.5); border-radius: 12px; padding: 20px 10px;'>
                    <span style='font-family: monospace, Courier, sans-serif; font-size:40px; font-weight:800; letter-spacing:12px; color:#FF9933; display:inline-block; margin-left:12px;'>{$otp}</span>
                  </td>
                </tr>
              </table>

              <p style='color:#736F94; font-size:12px; line-height:1.5; margin:24px 0 0 0; text-align:center;'>
                ⏳ Valid for <strong>10 minutes</strong>. For your security, never share this sacred code with anyone.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style='background-color:#0E0C1F; padding: 20px 32px; border-top:1px solid rgba(255,255,255,0.06); text-align:center;'>
              <p style='color:#736F94; font-size:11px; margin:0; line-height:1.4;'>
                This is an automated message sent from <span style='color:#B8B5D1;'>{$fromEmail}</span>.<br>
                Please do not reply directly to this email as the inbox is unmonitored.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: {$appName} <{$fromEmail}>\r\n";
$headers .= "Reply-To: {$fromEmail}\r\n";
$headers .= "Return-Path: {$fromEmail}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$mailSent = @mail($email, $subject, $message, $headers, "-f" . $fromEmail);

http_response_code(200);
echo json_encode([
    "status"     => "success",
    "message"    => "A 6-digit verification code has been sent to your email.",
    "email"      => $email,
    "expires_in" => 600
]);
?>
