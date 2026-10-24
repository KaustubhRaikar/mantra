<?php
/**
 * Admin Authentication & Session Security Guard
 */

require_once __DIR__ . '/../../includes/security.php';

function requireAdmin(): array {
    if (empty($_SESSION['admin_user'])) {
        header('Location: login.php?msg=auth_required');
        exit();
    }

    $admin = $_SESSION['admin_user'];

    // Session inactivity timeout (30 minutes)
    $maxInactivity = 1800;
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $maxInactivity)) {
        session_unset();
        session_destroy();
        header('Location: login.php?msg=session_expired');
        exit();
    }
    $_SESSION['last_activity'] = time();

    // Browser fingerprint verification to block session hijacking
    $currentFingerprint = hash('sha256', ($_SERVER['HTTP_USER_AGENT'] ?? '') . WebSecurity::getClientIp());
    if (empty($_SESSION['admin_fingerprint'])) {
        $_SESSION['admin_fingerprint'] = $currentFingerprint;
    } elseif (!hash_equals($_SESSION['admin_fingerprint'], $currentFingerprint)) {
        session_unset();
        session_destroy();
        header('Location: login.php?msg=security_violation');
        exit();
    }

    return $admin;
}
