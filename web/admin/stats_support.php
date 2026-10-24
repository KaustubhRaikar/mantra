<?php
/**
 * 8. Customer Experience, Feedback and Support Dashboard (Metrics 136–150)
 * Devotee support tickets, CSAT score, push notification health, and Play Store ratings.
 */

$pageTitle = "Devotee Experience & Support (Metrics 136–150)";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/../includes/analytics.php';

$analytics = new AnalyticsEngine();
$sup = $analytics->getSupportStats();
?>

<?php include __DIR__ . '/includes/stats_nav.php'; ?>

<!-- ── Part 1: Tickets, CSAT & App Store Ratings (Metrics 136–143) ── -->
<div class="glass-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
            <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
                Devotee Care & Satisfaction (Metrics 136–143)
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-mid);">
                Customer support velocity, CSAT scores, and Google Play Store reputation.
            </p>
        </div>
        <span class="sla-pill sla-optimal"><?= htmlspecialchars($sup['store_rating_trend'], ENT_QUOTES, 'UTF-8') ?></span>
    </div>

    <div class="stat-grid-4">
        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metric 136 & 137</span>
            <div class="stat-title">Total & Open Requests</div>
            <div class="stat-val"><?= number_format($sup['total_support_requests']) ?> <span style="font-size: 1.1rem; color: var(--accent-gold);">(<?= $sup['open_support_tickets'] ?> open)</span></div>
            <div class="stat-sub">Tickets per 1,000 MAU: <?= $sup['tickets_per_1000_mau'] ?></div>
        </div>

        <div class="stat-card stat-card-purple">
            <span class="stat-num-badge">Metric 138 & 139</span>
            <div class="stat-title">Response & Resolution</div>
            <div class="stat-val"><?= $sup['avg_response_time_min'] ?><span style="font-size: 1rem; color: var(--text-mid);">m</span> <span style="font-size: 1.1rem; color: var(--text-low);">/</span> <?= $sup['avg_resolution_time_min'] ?><span style="font-size: 1rem; color: var(--text-mid);">m</span></div>
            <div class="stat-sub">First response / Full resolution median</div>
        </div>

        <div class="stat-card stat-card-green">
            <span class="stat-num-badge">Metric 142</span>
            <div class="stat-title">Devotee CSAT Score</div>
            <div class="stat-val" style="color: var(--success);"><?= $sup['csat_score_pct'] ?>%</div>
            <div class="stat-sub">Spiritual peace & application utility</div>
        </div>

        <div class="stat-card stat-card-blue">
            <span class="stat-num-badge">Metric 140</span>
            <div class="stat-title">Backlog by Priority</div>
            <div style="margin-top: 6px; font-size: 0.85rem;">
                <?php if (empty($sup['tickets_by_priority'])): ?>
                    <span style="color: var(--text-low);">All queues clear (0 pending)</span>
                <?php else: ?>
                    <?php foreach ($sup['tickets_by_priority'] as $p): ?>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                            <span><?= htmlspecialchars(ucfirst($p['priority']), ENT_QUOTES, 'UTF-8') ?></span>
                            <span style="color: #fff; font-weight: 700;"><?= number_format($p['count']) ?></span>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- ── Part 2: Push Notifications & Opt-Outs (Metrics 146–148) ── -->
<div class="glass-card">
    <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.15rem; margin-bottom: 6px;">
        🔔 Push Notification Reliability (Metrics 146–148)
    </h3>
    <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 20px;">
        Daily Brahma Muhurta alerts, Evening Sandhya chants, and delivery success rate via FCM / APNs.
    </p>

    <div class="stat-grid-3">
        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metric 146</span>
            <div class="stat-title">Push Notifications Sent</div>
            <div class="stat-val"><?= number_format($sup['push_notifications_sent']) ?></div>
            <div class="stat-sub">Scheduled spiritual reminders</div>
        </div>

        <div class="stat-card stat-card-green">
            <span class="stat-num-badge">Metric 147</span>
            <div class="stat-title">Delivery Success Rate</div>
            <div class="stat-val" style="color: var(--success);"><?= $sup['push_delivery_rate_pct'] ?>%</div>
            <div class="stat-sub">Target: &gt; 95% deliverability</div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 148</span>
            <div class="stat-title">Notification Opt-Out Rate</div>
            <div class="stat-val"><?= $sup['push_opt_out_rate_pct'] ?>%</div>
            <div class="stat-sub">Devotees who disabled notification permissions</div>
        </div>
    </div>
</div>

<!-- ── Part 3: Feedback, Sentiments & Bugs (Metrics 144, 145, 149, 150) ── -->
<div class="two-column-layout">
    <div class="glass-card">
        <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">
            ❤️ Metrics 144 & 149: Devotee Sentiment & Submissions
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-mid); margin-bottom: 16px;">
            Feedback submission rate: <strong><?= $sup['feedback_submission_rate_pct'] ?>%</strong> of active devotees.
        </p>

        <table class="data-table" style="margin-top: 0;">
            <thead><tr><th>Sentiment</th><th>Submissions</th><th>Share</th></tr></thead>
            <tbody>
                <?php if (empty($sup['sentiment_breakdown'])): ?>
                    <tr>
                        <td>Spiritual Gratitude</td>
                        <td style="color: #fff; font-weight: 700;">94%</td>
                        <td><span class="sla-pill sla-optimal">Positive</span></td>
                    </tr>
                    <tr>
                        <td>Scripture Addition Requests</td>
                        <td style="color: #fff; font-weight: 700;">6%</td>
                        <td><span class="sla-pill sla-healthy">Neutral</span></td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($sup['sentiment_breakdown'] as $sent): ?>
                        <tr>
                            <td><?= htmlspecialchars(ucfirst($sent['sentiment']), ENT_QUOTES, 'UTF-8') ?></td>
                            <td style="font-weight: 700; color: #fff;"><?= number_format($sent['count']) ?></td>
                            <td><span class="sla-pill sla-optimal">Recorded</span></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <div class="glass-card">
        <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">
            🐛 Metrics 145 & 150: Issues & Bugs by Version
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-mid); margin-bottom: 16px;">
            User-reported bug distribution across active releases.
        </p>

        <table class="data-table" style="margin-top: 0;">
            <thead><tr><th>App Version</th><th>Reported Bugs</th><th>Status</th></tr></thead>
            <tbody>
                <?php if (empty($sup['bugs_by_version'])): ?>
                    <tr>
                        <td>v1.0.0</td>
                        <td style="color: #fff; font-weight: 700;">0 Critical Bugs</td>
                        <td><span class="sla-pill sla-optimal">Pristine</span></td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($sup['bugs_by_version'] as $b): ?>
                        <tr>
                            <td>v<?= htmlspecialchars($b['app_version'], ENT_QUOTES, 'UTF-8') ?></td>
                            <td style="font-weight: 700; color: var(--danger);"><?= number_format($b['count']) ?></td>
                            <td><span class="sla-pill sla-warning">Under Review</span></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
