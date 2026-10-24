<?php
/**
 * 4. Feature & Product Analytics Dashboard (Metrics 61–75)
 * Feature rankings, journeys, cohort adoption, entry points, and search telemetry.
 */

$pageTitle = "Feature & Product Analytics (Metrics 61–75)";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/../includes/analytics.php';

$analytics = new AnalyticsEngine();
$feat = $analytics->getFeatureStats();
?>

<?php include __DIR__ . '/includes/stats_nav.php'; ?>

<!-- ── Part 1: Feature Ranking & Unique Devotees (Metrics 61 & 62) ── -->
<div class="glass-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
            <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
                Feature Usage Ranking & Unique Devotees (Metrics 61 & 62)
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-mid);">
                Aggregated from real app events logged across all active installations.
            </p>
        </div>
        <span class="badge-live">Live Event Stream</span>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th>Rank</th>
                <th>Feature / Interactive Component</th>
                <th>Total Uses</th>
                <th>Unique Devotees</th>
                <th>Engagement Share</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($feat['feature_ranking'])): ?>
                <tr>
                    <td colspan="5" style="color: var(--text-low); text-align: center; padding: 24px;">
                        No feature events recorded yet. Ready to capture live events via <code>/api/telemetry.php</code>.
                    </td>
                </tr>
            <?php else: ?>
                <?php $rank = 1; foreach ($feat['feature_ranking'] as $item): ?>
                    <tr>
                        <td style="font-weight: 700; color: var(--accent-gold);">#<?= $rank++ ?></td>
                        <td style="font-weight: 600; color: #ffffff;"><?= htmlspecialchars($item['feature_name'], ENT_QUOTES, 'UTF-8') ?></td>
                        <td><?= number_format($item['total_uses']) ?></td>
                        <td><?= number_format($item['unique_users']) ?></td>
                        <td><span class="sla-pill sla-healthy">High Priority</span></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<!-- ── Part 2: Feature Health, Timing & Errors (Metrics 68–70) ── -->
<div class="stat-grid-3">
    <div class="stat-card stat-card-purple">
        <span class="stat-num-badge">Metric 68</span>
        <div class="stat-title">Feature Abandonment Rate</div>
        <div class="stat-val"><?= $feat['feature_abandonment_pct'] ?>%</div>
        <div class="stat-sub">Devotees exiting mid-session before completing mala</div>
    </div>

    <div class="stat-card stat-card-green">
        <span class="stat-num-badge">Metric 69</span>
        <div class="stat-title">Feature Error Rate</div>
        <div class="stat-val" style="color: var(--success);"><?= $feat['feature_error_rate_pct'] ?>%</div>
        <div class="stat-sub">Audio playback or state exceptions</div>
    </div>

    <div class="stat-card stat-card-gold">
        <span class="stat-num-badge">Metric 70</span>
        <div class="stat-title">Avg Mala Completion Time</div>
        <div class="stat-val"><?= round($feat['feature_completion_time_sec'] / 60, 1) ?> <span style="font-size: 1.1rem; color: var(--text-mid);">minutes</span></div>
        <div class="stat-sub">480s median for full 108 Sanskrit recitations</div>
    </div>
</div>

<!-- ── Part 3: User Journeys & Entry Points (Metrics 67, 71, 72) ── -->
<div class="two-column-layout">
    <div class="glass-card">
        <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">
            🧭 Metrics 71 & 72: Most Common Devotional Journeys
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-mid); margin-bottom: 16px;">
            Sequences of screens traversed during typical spiritual sessions.
        </p>

        <?php foreach ($feat['user_journeys'] as $j): ?>
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-glass); border-radius: 10px; padding: 12px 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.88rem; color: #ffffff; font-weight: 500;"><?= htmlspecialchars($j['path'], ENT_QUOTES, 'UTF-8') ?></span>
                <span class="sla-pill sla-optimal"><?= htmlspecialchars($j['share'], ENT_QUOTES, 'UTF-8') ?></span>
            </div>
        <?php endforeach; ?>
    </div>

    <div class="glass-card">
        <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">
            🚪 Metric 67: Feature Entry Points
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-mid); margin-bottom: 16px;">
            Where devotees originate when initiating a chanting session.
        </p>

        <?php foreach ($feat['entry_points'] as $ep): ?>
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-glass); border-radius: 10px; padding: 12px 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.88rem; color: #ffffff; font-weight: 500;"><?= htmlspecialchars($ep['entry'], ENT_QUOTES, 'UTF-8') ?></span>
                <span style="color: var(--accent-gold); font-weight: 700;"><?= htmlspecialchars($ep['percentage'], ENT_QUOTES, 'UTF-8') ?></span>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<!-- ── Part 4: Search Queries & Content Gaps (Metrics 73, 74, 75) ── -->
<div class="glass-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
            <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
                Search Intelligence & Content Gaps (Metrics 73, 74, 75)
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-mid);">
                Top queries searched by devotees, and searches returning 0 results requiring CMS catalog additions.
            </p>
        </div>
        <span style="font-size: 0.85rem; color: var(--accent-gold);"><?= htmlspecialchars($feat['trends_summary'], ENT_QUOTES, 'UTF-8') ?></span>
    </div>

    <div class="two-column-layout" style="margin-bottom: 0;">
        <div>
            <h4 style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 8px;">Top Search Terms (Metric 74)</h4>
            <table class="data-table" style="margin-top: 0;">
                <thead><tr><th>Query Term</th><th>Search Frequency</th></tr></thead>
                <tbody>
                    <?php if (empty($feat['top_search_terms'])): ?>
                        <tr><td colspan="2" style="color: var(--text-low); text-align: center;">No search logs available yet</td></tr>
                    <?php else: ?>
                        <?php foreach ($feat['top_search_terms'] as $q): ?>
                            <tr>
                                <td style="font-weight: 600; color: #fff;">"<?= htmlspecialchars($q['query'], ENT_QUOTES, 'UTF-8') ?>"</td>
                                <td style="font-weight: 700; color: var(--accent-gold);"><?= number_format($q['frequency']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>

        <div>
            <h4 style="font-size: 0.75rem; text-transform: uppercase; color: var(--danger); margin-bottom: 8px;">Zero-Result Searches (Metric 73 - Add to CMS!)</h4>
            <table class="data-table" style="margin-top: 0;">
                <thead><tr><th>Missing Query</th><th>Missing Hits</th><th>Action</th></tr></thead>
                <tbody>
                    <?php if (empty($feat['zero_result_searches'])): ?>
                        <tr><td colspan="3" style="color: var(--text-low); text-align: center;">All seeker queries found matching scriptures!</td></tr>
                    <?php else: ?>
                        <?php foreach ($feat['zero_result_searches'] as $zr): ?>
                            <tr>
                                <td style="color: #fff;">"<?= htmlspecialchars($zr['query'], ENT_QUOTES, 'UTF-8') ?>"</td>
                                <td style="color: var(--danger); font-weight: 700;"><?= number_format($zr['count']) ?></td>
                                <td><a href="scriptures.php" class="btn-action btn-gold" style="font-size: 0.7rem; padding: 4px 8px;">Add Scripture</a></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
