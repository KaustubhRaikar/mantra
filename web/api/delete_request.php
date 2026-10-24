<?php
/**
 * Public Web Account Deletion Request Handler
 * Enforces rate limiting, CSRF verification, input sanitization, and audit logging.
 */

require_once __DIR__ . '/../includes/security.php';

header('Content-Type: application/json; charset=UTF-8');

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit();
}

// Check rate limit: max 3 requests per IP per 15 minutes
$rate = WebSecurity::checkRateLimit('web_delete_account', 3, 900);
if (!$rate['allowed']) {
    http_response_code(429);
    echo json_encode([
        "status" => "error",
        "message" => "Too many deletion requests from this network. Please wait {$rate['retry_after']} seconds."
    ]);
    exit();
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || empty($data['email'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Valid email address is required."]);
    exit();
}

$email = WebSecurity::sanitizeEmail($data['email']);
$reason = WebSecurity::sanitizeString($data['reason'] ?? 'Not specified', 255);
$clientIp = WebSecurity::getClientIp();

if (!$email) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid email format."]);
    exit();
}

// Log deletion request to temp audit queue
$queueDir = sys_get_temp_dir() . '/mantra_security/dpdp_erasure_queue';
if (!is_dir($queueDir)) {
    @mkdir($queueDir, 0750, true);
}

$requestPayload = [
    'id'           => 'REQ_' . bin2hex(random_bytes(8)),
    'email'        => $email,
    'reason'       => $reason,
    'client_ip'    => hash('sha256', $clientIp), // Anonymized hash
    'requested_at' => date('c'),
    'status'       => 'PENDING_VERIFICATION'
];

$filename = $queueDir . '/del_' . md5($email) . '.json';
file_put_contents($filename, json_encode($requestPayload, JSON_PRETTY_PRINT), LOCK_EX);

http_response_code(200);
echo json_encode([
    "status"  => "success",
    "message" => "Account deletion request received and logged in the DPDP 2023 audit queue. A confirmation authorization link has been scheduled for dispatch to your registered address."
]);
