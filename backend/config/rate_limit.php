<?php
/**
 * IP and Email Rate Limiter with Proxy-Safe Client IP Resolution
 * Prevents X-Forwarded-For header spoofing unless request originates from a trusted reverse proxy.
 */

function getTrustedClientIp(): string {
    $remoteIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    
    // Only parse X-Forwarded-For if explicitly configured via environment or trusted reverse proxy subnet
    $trustedProxies = defined('TRUSTED_PROXIES') ? TRUSTED_PROXIES : ['127.0.0.1', '::1'];
    $isTrustedProxy = in_array($remoteIp, $trustedProxies, true);

    if ($isTrustedProxy && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $clientIp = trim($ips[0]);
        if (filter_var($clientIp, FILTER_VALIDATE_IP)) {
            return $clientIp;
        }
    }

    return $remoteIp;
}

function checkRateLimit(PDO $db, string $action, string $identifier, int $maxAttempts = 5, int $windowSeconds = 600, string $customMessage = ''): void {
    if (empty($identifier)) {
        return;
    }

    // Clean up expired records
    try {
        $cleanup = $db->prepare("DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL 1 DAY");
        $cleanup->execute();
    } catch (Exception $e) {}

    // Count recent attempts for action + identifier in window
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
            "status" => "error",
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
