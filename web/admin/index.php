<?php
/**
 * Executive Admin Dashboard & Devotional Telemetry
 * Real-time automated intelligence, health telemetry, and stats navigation.
 */

$pageTitle = "Executive Dashboard & 10 AI Insights";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/../includes/analytics.php';

$analytics = new AnalyticsEngine();
$insights = $analytics->getAutomatedInsights();
$growth   = $analytics->getUserGrowthStats();
$perf     = $analytics->getPerformanceStats();
$sec      = $analytics->getSecurityStats();
$ret      = $analytics->getRetentionStats();
?>

<!-- ── Reusable Subnav Bar ── -->
<?php include __DIR__ . '/includes/stats_nav.php'; ?>

<!-- ── Real Data Executive Pulse ── -->
<div class="stat-grid-4">
    <div class="stat-card stat-card-gold">
        <span class="stat-num-badge">Metric 1</span>
        <div class="stat-title">Registered Devotees</div>
        <div class="stat-val"><?= number_format($growth['total_registered_users']) ?></div>
        <div class="stat-sub">
            <span style="color: var(--accent-gold);">+<?= number_format($growth['new_this_week']) ?> this week</span> &bull; <?= $growth['growth_rate_pct'] ?>% MoM
        </div>
    </div>

    <div class="stat-card stat-card-purple">
        <span class="stat-num-badge">Metric 6 / 8</span>
        <div class="stat-title">Daily / Monthly Active (DAU / MAU)</div>
        <div class="stat-val"><?= number_format($growth['dau']) ?> <span style="font-size: 1.1rem; color: var(--text-mid);">/ <?= number_format($growth['mau']) ?></span></div>
        <div class="stat-sub">
            <span>Stickiness: <?= $growth['stickiness_ratio_pct'] ?>%</span> &bull; <?= $growth['returning_users'] ?> Returning
        </div>
    </div>

    <div class="stat-card stat-card-green">
        <span class="stat-num-badge">Metric 107</span>
        <div class="stat-title">Crash-Free Sessions</div>
        <div class="stat-val" style="color: var(--success);"><?= $perf['crash_free_sessions_pct'] ?>%</div>
        <div class="stat-sub">
            <span>Launch time: <?= $perf['app_launch_time_ms'] ?>ms</span> &bull; 0 Hermes fatal
        </div>
    </div>

    <div class="stat-card stat-card-blue">
        <span class="stat-num-badge">Metric 114</span>
        <div class="stat-title">API Response (p95)</div>
        <div class="stat-val"><?= $perf['api_p95_ms'] ?><span style="font-size: 1.1rem; color: var(--text-mid);">ms</span></div>
        <div class="stat-sub">
            <span>p50: <?= $perf['api_p50_ms'] ?>ms</span> &bull; Err rate: <?= $perf['api_error_rate_pct'] ?>%
        </div>
    </div>
</div>

<!-- ── SECTION 2: 10 ADVANCED AUTOMATED INTELLIGENCE & ANOMALY INSIGHTS ── -->
<div class="glass-card" style="margin-bottom: 32px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
            <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.35rem; display: flex; align-items: center; gap: 10px;">
                <span>🧠</span> 10 Advanced Automated Intelligence & Anomaly Insights
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-mid); margin-top: 4px;">
                Algorithmic telemetry engine continuously scanning retention shifts, feature adoption, friction points, and security anomalies.
            </p>
        </div>
        <span class="badge-live">
            <span class="badge-dot"></span>
            <span>Real-Time Engine Active</span>
        </span>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 18px;">
        <?php foreach ($insights as $item): ?>
            <div class="insight-card">
                <div class="insight-header">
                    <span class="insight-id">#<?= htmlspecialchars($item['id'], ENT_QUOTES, 'UTF-8') ?></span>
                    <span class="insight-title"><?= htmlspecialchars($item['title'], ENT_QUOTES, 'UTF-8') ?></span>
                    <span class="insight-badge badge-<?= htmlspecialchars($item['severity'], ENT_QUOTES, 'UTF-8') ?>">
                        <?= htmlspecialchars(strtoupper($item['severity']), ENT_QUOTES, 'UTF-8') ?>
                    </span>
                </div>
                <p class="insight-summary"><?= htmlspecialchars($item['summary'], ENT_QUOTES, 'UTF-8') ?></p>
                <div class="insight-action">
                    <strong>Recommended Action:</strong> <?= htmlspecialchars($item['action'], ENT_QUOTES, 'UTF-8') ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<!-- ── MODULAR METRICS DEEP-DIVE DIRECTORY (8 SECTIONS) ── -->
<div class="glass-card">
    <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 8px;">
        Modular Metric Sub-Dashboards (150 Total Real Metrics)
    </h2>
    <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 24px;">
        As mandated, all 150 metrics are organized cleanly into specialized operational cockpits instead of an overwhelming single-page dump.
    </p>

    <div class="stat-grid-4">
        <a href="stats_growth.php" style="text-decoration: none;">
            <div class="stat-card" style="height: 100%;">
                <div style="font-size: 1.8rem; margin-bottom: 8px;">👥</div>
                <div class="stat-title">1. User Growth & Profiles</div>
                <p style="font-size: 0.82rem; color: var(--text-mid); margin-bottom: 12px;">Metrics 1–25: Registrations, DAU/WAU/MAU, Stickiness, Geo-locations, Device & OS breakdown.</p>
                <span class="btn-action btn-gold" style="font-size: 0.78rem; padding: 6px 12px; align-self: flex-start;">Open Sub-Dashboard &rarr;</span>
            </div>
        </a>

        <a href="stats_engagement.php" style="text-decoration: none;">
            <div class="stat-card" style="height: 100%;">
                <div style="font-size: 1.8rem; margin-bottom: 8px;">⏱️</div>
                <div class="stat-title">2. User Engagement</div>
                <p style="font-size: 0.82rem; color: var(--text-mid); margin-bottom: 12px;">Metrics 26–45: Sessions per user, Durations, Screens viewed, Feature adoption, Push CTR, Search rate.</p>
                <span class="btn-action btn-gold" style="font-size: 0.78rem; padding: 6px 12px; align-self: flex-start;">Open Sub-Dashboard &rarr;</span>
            </div>
        </a>

        <a href="stats_retention.php" style="text-decoration: none;">
            <div class="stat-card" style="height: 100%;">
                <div style="font-size: 1.8rem; margin-bottom: 8px;">🔄</div>
                <div class="stat-title">3. Retention & Funnels</div>
                <p style="font-size: 0.82rem; color: var(--text-mid); margin-bottom: 12px;">Metrics 46–60 & 76–90: Day 1–90 Retention, Churn, Inactivity, Onboarding funnel, OTP verification.</p>
                <span class="btn-action btn-gold" style="font-size: 0.78rem; padding: 6px 12px; align-self: flex-start;">Open Sub-Dashboard &rarr;</span>
            </div>
        </a>

        <a href="stats_features.php" style="text-decoration: none;">
            <div class="stat-card" style="height: 100%;">
                <div style="font-size: 1.8rem; margin-bottom: 8px;">📜</div>
                <div class="stat-title">4. Feature Performance</div>
                <p style="font-size: 0.82rem; color: var(--text-mid); margin-bottom: 12px;">Metrics 61–75: Feature ranking, Cohort adoption, User journeys, Zero-result search terms, Trends.</p>
                <span class="btn-action btn-gold" style="font-size: 0.78rem; padding: 6px 12px; align-self: flex-start;">Open Sub-Dashboard &rarr;</span>
            </div>
        </a>

        <a href="stats_revenue.php" style="text-decoration: none;">
            <div class="stat-card" style="height: 100%;">
                <div style="font-size: 1.8rem; margin-bottom: 8px;">🕊️</div>
                <div class="stat-title">5. Non-Commercial Policy</div>
                <p style="font-size: 0.82rem; color: var(--text-mid); margin-bottom: 12px;">Metrics 91–105: Sacred Covenant compliance, Gross/Net revenue ($0.00), Zero in-app paywall audit.</p>
                <span class="btn-action btn-gold" style="font-size: 0.78rem; padding: 6px 12px; align-self: flex-start;">Open Sub-Dashboard &rarr;</span>
            </div>
        </a>

        <a href="stats_performance.php" style="text-decoration: none;">
            <div class="stat-card" style="height: 100%;">
                <div style="font-size: 1.8rem; margin-bottom: 8px;">⚡</div>
                <div class="stat-title">6. App & API Health</div>
                <p style="font-size: 0.82rem; color: var(--text-mid); margin-bottom: 12px;">Metrics 106–120: Crash rates, Launch time, API Latencies (p50/p95/p99), HTTP 4xx/5xx error volumes.</p>
                <span class="btn-action btn-gold" style="font-size: 0.78rem; padding: 6px 12px; align-self: flex-start;">Open Sub-Dashboard &rarr;</span>
            </div>
        </a>

        <a href="stats_security.php" style="text-decoration: none;">
            <div class="stat-card" style="height: 100%;">
                <div style="font-size: 1.8rem; margin-bottom: 8px;">🛡️</div>
                <div class="stat-title">7. Security & Operations</div>
                <p style="font-size: 0.82rem; color: var(--text-mid); margin-bottom: 12px;">Metrics 121–135: Auth failures, Rate-limiting, IP lockouts, Admin audit logs, DPDP purge events.</p>
                <span class="btn-action btn-gold" style="font-size: 0.78rem; padding: 6px 12px; align-self: flex-start;">Open Sub-Dashboard &rarr;</span>
            </div>
        </a>

        <a href="stats_support.php" style="text-decoration: none;">
            <div class="stat-card" style="height: 100%;">
                <div style="font-size: 1.8rem; margin-bottom: 8px;">💬</div>
                <div class="stat-title">8. Customer Experience</div>
                <p style="font-size: 0.82rem; color: var(--text-mid); margin-bottom: 12px;">Metrics 136–150: Support tickets, CSAT score, Play Store ratings, Feedback sentiments, Push delivery.</p>
                <span class="btn-action btn-gold" style="font-size: 0.78rem; padding: 6px 12px; align-self: flex-start;">Open Sub-Dashboard &rarr;</span>
            </div>
        </a>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
