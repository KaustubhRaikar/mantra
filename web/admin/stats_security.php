<?php
/**
 * 7. Security, Abuse and Operational Monitoring Dashboard (Metrics 121–135)
 * Intrusion detection, rate limiting, authentication failures, and immutable audit logs.
 */

$pageTitle = "Security & Operational Monitoring (Metrics 121–135)";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/../includes/analytics.php';

$analytics = new AnalyticsEngine();
$sec = $analytics->getSecurityStats();
?>

<?php include __DIR__ . '/includes/stats_nav.php'; ?>

<!-- ── Security Alerts Overview (Metric 135) ── -->
<div class="glass-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
            <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
                Active Security Posture & Alerts (Metric 135)
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-mid);">
                Evaluates rate limits, credential stuffing attempts, and token anomalies.
            </p>
        </div>
        <span class="sla-pill sla-optimal">Threat Defenses Armed</span>
    </div>

    <div class="stat-grid-4">
        <div class="stat-card stat-card-red">
            <span class="stat-num-badge">Critical</span>
            <div class="stat-title">Critical Threats</div>
            <div class="stat-val"><?= $sec['security_alerts']['critical'] ?></div>
            <div class="stat-sub">Zero active zero-day exploits</div>
        </div>

        <div class="stat-card" style="border-top: 3px solid #ff9933;">
            <span class="stat-num-badge">High</span>
            <div class="stat-title">High Severity Alerts</div>
            <div class="stat-val"><?= $sec['security_alerts']['high'] ?></div>
            <div class="stat-sub">Zero brute-force breakthroughs</div>
        </div>

        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Medium</span>
            <div class="stat-title">Medium Level Events</div>
            <div class="stat-val"><?= $sec['security_alerts']['medium'] ?></div>
            <div class="stat-sub">Enforced rate limit throttling</div>
        </div>

        <div class="stat-card stat-card-green">
            <span class="stat-num-badge">Low</span>
            <div class="stat-title">Low / Info Events</div>
            <div class="stat-val"><?= $sec['security_alerts']['low'] ?></div>
            <div class="stat-sub">Routine TLS handshake checks</div>
        </div>
    </div>
</div>

<!-- ── Part 2: Threat Detection & Rate Limiting (Metrics 121–131) ── -->
<div class="glass-card">
    <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.15rem; margin-bottom: 6px;">
        Authentication & Abuse Telemetry (Metrics 121–131)
    </h3>
    <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 20px;">
        Rate-limiting counters and token validations protecting API endpoints.
    </p>

    <div class="stat-grid-4">
        <div class="stat-card">
            <span class="stat-num-badge">Metric 121 & 123</span>
            <div class="stat-title">Failed Logins & Lockouts</div>
            <div class="stat-val"><?= number_format($sec['failed_login_attempts']) ?> <span style="font-size: 1.1rem; color: var(--danger);">(<?= $sec['account_lockouts'] ?> locked)</span></div>
            <div class="stat-sub">5-attempt lockout rule active</div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 124 & 125</span>
            <div class="stat-title">OTP Resends / Violations</div>
            <div class="stat-val"><?= number_format($sec['password_reset_requests']) ?> <span style="font-size: 1rem; color: var(--text-mid);">/ <?= $sec['rate_limit_violations'] ?></span></div>
            <div class="stat-sub">OTP triggers & Rate-limit blocks</div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 127 & 128</span>
            <div class="stat-title">Token / Authz Denials</div>
            <div class="stat-val"><?= number_format($sec['auth_token_failures']) ?> <span style="font-size: 1rem; color: var(--text-mid);">/ <?= $sec['authz_denied_requests'] ?></span></div>
            <div class="stat-sub">401 Unauthenticated / 403 Forbidden</div>
        </div>

        <div class="stat-card stat-card-purple">
            <span class="stat-num-badge">Metric 129 & 130</span>
            <div class="stat-title">Invalid Requests & Bot %</div>
            <div class="stat-val"><?= $sec['invalid_request_rate_pct'] ?>% <span style="font-size: 1rem; color: var(--text-mid);">(Bot: <?= $sec['bot_traffic_estimate_pct'] ?>%)</span></div>
            <div class="stat-sub"><?= htmlspecialchars($sec['account_creation_spikes'], ENT_QUOTES, 'UTF-8') ?></div>
        </div>
    </div>
</div>

<!-- ── Part 3: Admin Actions & Immutable Audit Log (Metrics 132–134) ── -->
<div class="glass-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
            <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.15rem; margin-bottom: 6px;">
                Admin Actions & Sensitive Modifications (Metrics 132–134)
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-mid);">
                Cryptographically tracked administrative operations and DPDP erasure execution logs.
            </p>
        </div>
        <span class="stat-num-badge" style="font-size: 0.8rem;"><?= $sec['sensitive_changes_count'] ?> Sensitive Events</span>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>Admin ID</th>
                <th>Action Type</th>
                <th>Target ID</th>
                <th>Client IP</th>
                <th>Details</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($sec['admin_audit_logs'])): ?>
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-low); padding: 20px;">
                        No audit events recorded yet. Administrative actions are logged automatically upon mutation.
                    </td>
                </tr>
            <?php else: ?>
                <?php foreach ($sec['admin_audit_logs'] as $log): ?>
                    <tr>
                        <td style="font-size: 0.82rem;"><?= htmlspecialchars($log['created_at'] ?? 'Just now', ENT_QUOTES, 'UTF-8') ?></td>
                        <td style="font-weight: 700; color: var(--accent-gold);"><?= htmlspecialchars($log['admin_id'] ?? '1', ENT_QUOTES, 'UTF-8') ?></td>
                        <td><span class="sla-pill sla-healthy"><?= htmlspecialchars($log['action_type'] ?? 'ACTION', ENT_QUOTES, 'UTF-8') ?></span></td>
                        <td><?= htmlspecialchars($log['target_id'] ?? '—', ENT_QUOTES, 'UTF-8') ?></td>
                        <td style="font-family: monospace; font-size: 0.82rem; color: var(--text-mid);"><?= htmlspecialchars($log['ip_address'] ?? '127.0.0.1', ENT_QUOTES, 'UTF-8') ?></td>
                        <td style="font-size: 0.82rem;"><?= htmlspecialchars($log['details'] ?? 'Executed by SuperAdmin', ENT_QUOTES, 'UTF-8') ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
