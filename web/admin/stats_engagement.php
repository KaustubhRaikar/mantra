<?php
/**
 * 2. User Engagement Dashboard (Metrics 26–45)
 * Session cadence, screen telemetry, feature usage, and notification engagement.
 */

$pageTitle = "User Engagement (Metrics 26–45)";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/../includes/analytics.php';

$analytics = new AnalyticsEngine();
$eng = $analytics->getUserEngagementStats();
?>

<?php include __DIR__ . '/includes/stats_nav.php'; ?>

<!-- ── Part 1: Usage Frequency & Durations (Metrics 26–31) ── -->
<div class="glass-card">
    <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
        Usage Frequency & Sadhana Duration
    </h2>
    <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 20px;">
        Daily spiritual habits, average chanting session lengths, and time intervals between sessions.
    </p>

    <div class="stat-grid-3">
        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metrics 26, 27, 28</span>
            <div class="stat-title">Sessions Per User (Day / Week / Month)</div>
            <div class="stat-val"><?= $eng['daily_sessions_per_user'] ?> <span style="font-size: 1.1rem; color: var(--text-mid);">/ <?= $eng['weekly_sessions_per_user'] ?> / <?= $eng['monthly_sessions_per_user'] ?></span></div>
            <div class="stat-sub">Average app openings per active devotee</div>
        </div>

        <div class="stat-card stat-card-purple">
            <span class="stat-num-badge">Metrics 29 & 30</span>
            <div class="stat-title">Session Duration (Average vs Median)</div>
            <div class="stat-val"><?= $eng['avg_session_duration_min'] ?> <span style="font-size: 1.1rem; color: var(--text-mid);">m (Avg) / <?= $eng['median_session_duration_min'] ?> m (Med)</span></div>
            <div class="stat-sub">Includes Mala chanting & Aarti recitations</div>
        </div>

        <div class="stat-card stat-card-blue">
            <span class="stat-num-badge">Metric 31</span>
            <div class="stat-title">Time Between Sessions</div>
            <div class="stat-val"><?= $eng['avg_time_between_sessions_hours'] ?> <span style="font-size: 1.1rem; color: var(--text-mid);">hours</span></div>
            <div class="stat-sub">Devotees return twice daily (Morning & Evening)</div>
        </div>
    </div>
</div>

<!-- ── Part 2: Screen Telemetry (Metrics 32–35) ── -->
<div class="two-column-layout">
    <div class="glass-card">
        <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">
            📺 Metric 32 & 33: Screen Exploration
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-mid); margin-bottom: 16px;">
            Total screens visited and density of interaction per session.
        </p>

        <div class="stat-grid-2" style="margin-bottom: 16px;">
            <div class="stat-card">
                <span class="stat-num-badge">Metric 32</span>
                <div class="stat-title">Screens Per Session</div>
                <div class="stat-val"><?= $eng['screens_per_session'] ?></div>
                <div class="stat-sub">Focused navigation pattern</div>
            </div>
            <div class="stat-card stat-card-green">
                <span class="stat-num-badge">Metric 33</span>
                <div class="stat-title">Total Screen Views</div>
                <div class="stat-val"><?= number_format($eng['total_screen_views']) ?></div>
                <div class="stat-sub">Real telemetry views logged</div>
            </div>
        </div>
    </div>

    <div class="glass-card">
        <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">
            🔥 Metrics 34 & 35: Most & Least Visited Screens
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-mid); margin-bottom: 16px;">
            Screen views grouped by view telemetry.
        </p>

        <h4 style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 8px;">Top Visited Screens</h4>
        <table class="data-table" style="margin-top: 0; margin-bottom: 16px;">
            <thead><tr><th>Screen</th><th>Total Views</th></tr></thead>
            <tbody>
                <?php if (empty($eng['most_visited_screens'])): ?>
                    <tr><td colspan="2" style="color: var(--text-low); text-align: center;">No screen view events recorded</td></tr>
                <?php else: ?>
                    <?php foreach ($eng['most_visited_screens'] as $row): ?>
                        <tr>
                            <td><?= htmlspecialchars($row['screen_name'], ENT_QUOTES, 'UTF-8') ?></td>
                            <td style="font-weight: 700; color: #fff;"><?= number_format($row['views']) ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- ── Part 3: Feature Adoption & Completion (Metrics 36–41) ── -->
<div class="glass-card">
    <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
        Feature Performance, Adoption & Mala Completion
    </h2>
    <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 20px;">
        Metrics 36–41: Adoption percentages, 108-count completion rate, and time allocated per feature.
    </p>

    <div class="stat-grid-4">
        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metric 38</span>
            <div class="stat-title">Feature Adoption Rate</div>
            <div class="stat-val"><?= $eng['feature_adoption_rate_pct'] ?>%</div>
            <div class="stat-sub">Devotees utilizing interactive tools</div>
        </div>

        <div class="stat-card stat-card-purple">
            <span class="stat-num-badge">Metric 39</span>
            <div class="stat-title">Feature Usage Frequency</div>
            <div class="stat-val"><?= $eng['feature_usage_frequency'] ?> <span style="font-size: 1.1rem; color: var(--text-mid);">actions</span></div>
            <div class="stat-sub">Actions per participating devotee</div>
        </div>

        <div class="stat-card stat-card-green">
            <span class="stat-num-badge">Metric 40</span>
            <div class="stat-title">Mala Completion Rate</div>
            <div class="stat-val"><?= $eng['feature_completion_rate_pct'] ?>%</div>
            <div class="stat-sub">Complete full 108 bead chants</div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metrics 36 & 37</span>
            <div class="stat-title">Top Features Used</div>
            <div style="margin-top: 6px; font-size: 0.85rem;">
                <?php if (empty($eng['most_used_features'])): ?>
                    <span style="color: var(--text-low);">Japa Counter, Sacred Audio, Search</span>
                <?php else: ?>
                    <?php foreach (array_slice($eng['most_used_features'], 0, 3) as $f): ?>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span><?= htmlspecialchars($f['feature_name'], ENT_QUOTES, 'UTF-8') ?></span>
                            <span style="color: #fff; font-weight: 700;"><?= number_format($f['taps']) ?></span>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- ── Part 4: Push, Search & Referral Engagement (Metrics 42–45) ── -->
<div class="glass-card">
    <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
        Outreach, Search & Devotee Sharing
    </h2>
    <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 20px;">
        Metrics 42–45: Brahma Muhurta notification response, in-app scriptural search, and sacred shloka sharing.
    </p>

    <div class="stat-grid-4">
        <div class="stat-card">
            <span class="stat-num-badge">Metric 42</span>
            <div class="stat-title">Notification Open Rate</div>
            <div class="stat-val"><?= $eng['notification_open_rate_pct'] ?>%</div>
            <div class="stat-sub">Devotees opening morning/evening prompts</div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 43</span>
            <div class="stat-title">Notification CTR</div>
            <div class="stat-val"><?= $eng['notification_ctr_pct'] ?>%</div>
            <div class="stat-sub">Click-through directly to Daily Mantra</div>
        </div>

        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metric 44</span>
            <div class="stat-title">Search Usage Rate</div>
            <div class="stat-val"><?= $eng['search_usage_rate_pct'] ?>%</div>
            <div class="stat-sub">Devotees querying mantras & suktas</div>
        </div>

        <div class="stat-card stat-card-purple">
            <span class="stat-num-badge">Metric 45</span>
            <div class="stat-title">Share & Referral Rate</div>
            <div class="stat-val"><?= $eng['share_activity_rate_pct'] ?>%</div>
            <div class="stat-sub">Organic sacred scripture sharing</div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
