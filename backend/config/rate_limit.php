<?php
/**
 * IP and Email Rate Limiter
 * Uses database table rate_limits to track request counts.
 * Fixes Task 1: OTP abuse & API hardening
 */

function checkRateLimit(PDO $db, string $action, string $identifier, int $maxAttempts = 5, int $windowSeconds = 600, string $customMessage = ''): void {
    if (empty($identifier)) {
        return;
    }

    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ip = trim(explode(',', $ip)[0]);

    // Clean up expired records older than 24 hours
    try {
        $cleanup = $db->prepare("DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL 1 DAY");
        $cleanup->execute();
    } catch (Exception $e) {
        // Silently catch cleanup errors to prevent execution halting
    }

    // Count recent attempts for this action + identifier in window
    $check = $db->prepare(
        "SELECT COUNT(*) AS cnt FROM rate_limits 
         WHERE action = :action AND ip_address = :identifier 
         AND created_at > NOW() - INTERVAL :window SECOND"
    );
    $check->execute([
        ':action'     => $action,
        ':identifier' => $identifier,
        ':window'     => $windowSeconds
    ]);
    $row = $check->fetch(PDO::FETCH_ASSOC);

    if ($row && (int)$row['cnt'] >= $maxAttempts) {
        http_response_code(429);
        $message = !empty($customMessage) 
            ? $customMessage 
            : "Too many attempts. Please wait " . ceil($windowSeconds / 60) . " minutes and try again.";
        echo json_encode([
            "message" => $message,
            "retry_after" => $windowSeconds
        ]);
        exit();
    }

    // Log this attempt
    $insert = $db->prepare(
        "INSERT INTO rate_limits (ip_address, action) VALUES (:identifier, :action)"
    );
    $insert->execute([
        ':identifier' => $identifier,
        ':action'     => $action
    ]);
}
?>
