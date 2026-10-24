<?php
/**
 * 6. App Performance and Reliability Dashboard (Metrics 106–120)
 * Stability monitoring, cold launch benchmarks, and REST API telemetry.
 */

$pageTitle = "App Performance & Reliability (Metrics 106–120)";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/../includes/analytics.php';

$analytics = new AnalyticsEngine();
$perf = $analytics->getPerformanceStats();
?>

<?php include __DIR__ . '/includes/stats_nav.php'; ?>

<!-- ── Part 1: Client Stability & Crashes (Metrics 106–111) ── -->
<div class="glass-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
            <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
                Client Application Stability (Metrics 106–111)
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-mid);">
                Monitors React Native / Hermes JS engine exceptions and native Android crashes.
            </p>
        </div>
        <span class="sla-pill <?= ($perf['crash_free_sessions_pct'] >= 99.0) ? 'sla-optimal' : 'sla-warning' ?>">
            <?= ($perf['crash_free_sessions_pct'] >= 99.0) ? 'Target: >99% Crash-Free (Passed)' : 'Attention Required' ?>
        </span>
    </div>

    <div class="stat-grid-4">
        <div class="stat-card stat-card-green">
            <span class="stat-num-badge">Metric 106 & 107</span>
            <div class="stat-title">Crash-Free Users / Sessions</div>
            <div class="stat-val" style="color: var(--success);"><?= $perf['crash_free_sessions_pct'] ?>%</div>
            <div class="stat-sub">Users: <?= $perf['crash_free_users_pct'] ?>% &bull; Sessions: <?= $perf['crash_free_sessions_pct'] ?>%</div>
        </div>

        <div class="stat-card stat-card-purple">
            <span class="stat-num-badge">Metric 108 & 109</span>
            <div class="stat-title">Total Crashes Recorded</div>
            <div class="stat-val"><?= number_format($perf['total_app_crashes']) ?></div>
            <div class="stat-sub">Across all distributed APK / AAB releases</div>
        </div>

        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metric 110</span>
            <div class="stat-title">Cold App Launch Time</div>
            <div class="stat-val"><?= number_format($perf['app_launch_time_ms']) ?> <span style="font-size: 1.1rem; color: var(--text-mid);">ms</span></div>
            <div class="stat-sub">Hermes bytecode pre-compilation active</div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 111</span>
            <div class="stat-title">Slow Screen Load Rate</div>
            <div class="stat-val"><?= $perf['slow_screen_load_pct'] ?>%</div>
            <div class="stat-sub">Renders exceeding 16ms / dropped frames</div>
        </div>
    </div>
</div>

<!-- ── Part 2: REST API Latency & Health (Metrics 112–118) ── -->
<div class="glass-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
            <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
                REST API Performance & Latency (Metrics 112–118)
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-mid);">
                Server-side response percentiles computed from <code>api_request_logs</code>.
            </p>
        </div>
        <span class="badge-live">
            <span class="badge-dot"></span>
            <span>REST API Online</span>
        </span>
    </div>

    <div class="stat-grid-4">
        <div class="stat-card">
            <span class="stat-num-badge">Metric 112</span>
            <div class="stat-title">Total API Request Volume</div>
            <div class="stat-val"><?= number_format($perf['api_request_volume']) ?></div>
            <div class="stat-sub">Scripture & sync requests served</div>
        </div>

        <div class="stat-card stat-card-blue">
            <span class="stat-num-badge">Metric 113, 114, 115</span>
            <div class="stat-title">API Response (p50 / p95 / p99)</div>
            <div class="stat-val"><?= $perf['api_p95_ms'] ?><span style="font-size: 1.1rem; color: var(--text-mid);">ms</span></div>
            <div class="stat-sub">p50: <?= $perf['api_p50_ms'] ?>ms &bull; p99: <?= $perf['api_p99_ms'] ?>ms</div>
        </div>

        <div class="stat-card stat-card-green">
            <span class="stat-num-badge">Metric 116</span>
            <div class="stat-title">Overall API Error Rate</div>
            <div class="stat-val" style="color: var(--success);"><?= $perf['api_error_rate_pct'] ?>%</div>
            <div class="stat-sub">Target: &lt; 0.5% (Optimal)</div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 117 & 118</span>
            <div class="stat-title">HTTP 4xx / 5xx Error Counts</div>
            <div class="stat-val"><?= number_format($perf['http_4xx_count']) ?> <span style="font-size: 1.1rem; color: var(--text-low);">/ <?= number_format($perf['http_5xx_count']) ?></span></div>
            <div class="stat-sub">4xx Client errors / 5xx Server errors</div>
        </div>
    </div>
</div>

<!-- ── Part 3: Timeouts & Background Tasks (Metrics 119 & 120) ── -->
<div class="stat-grid-2">
    <div class="stat-card">
        <span class="stat-num-badge">Metric 119</span>
        <div class="stat-title">Network Timeout Rate</div>
        <div class="stat-val"><?= $perf['network_timeout_rate_pct'] ?>%</div>
        <div class="stat-sub">Network requests timing out after 10,000ms threshold</div>
    </div>

    <div class="stat-card stat-card-green">
        <span class="stat-num-badge">Metric 120</span>
        <div class="stat-title">Failed Background Jobs</div>
        <div class="stat-val"><?= $perf['failed_background_tasks'] ?></div>
        <div class="stat-sub">Cron jobs, DPDP queue purges & notification dispatch</div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
