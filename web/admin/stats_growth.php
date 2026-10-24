<?php
/**
 * 1. User Acquisition and Growth Dashboard (Metrics 1–25)
 * Live database telemetry & profile segmentation
 */

$pageTitle = "User Acquisition & Growth (Metrics 1–25)";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/../includes/analytics.php';

$analytics = new AnalyticsEngine();
$growth = $analytics->getUserGrowthStats();
?>

<?php include __DIR__ . '/includes/stats_nav.php'; ?>

<!-- ── Part 1: Acquisition & Growth Velocities (Metrics 1–5) ── -->
<div class="glass-card">
    <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
        Acquisition & Growth Velocity
    </h2>
    <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 20px;">
        Real registration counts directly computed from the <code>users</code> table across distinct temporal horizons.
    </p>

    <div class="stat-grid-4">
        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metric 1</span>
            <div class="stat-title">Total Registered Users</div>
            <div class="stat-val"><?= number_format($growth['total_registered_users']) ?></div>
            <div class="stat-sub">Confirmed Devotee Profiles</div>
        </div>

        <div class="stat-card stat-card-purple">
            <span class="stat-num-badge">Metric 2</span>
            <div class="stat-title">New Registrations Today</div>
            <div class="stat-val"><?= number_format($growth['new_today']) ?></div>
            <div class="stat-sub">Since Midnight (UTC)</div>
        </div>

        <div class="stat-card stat-card-blue">
            <span class="stat-num-badge">Metric 3</span>
            <div class="stat-title">New Registrations This Week</div>
            <div class="stat-val"><?= number_format($growth['new_this_week']) ?></div>
            <div class="stat-sub">Rolling 7-Day Window</div>
        </div>

        <div class="stat-card stat-card-green">
            <span class="stat-num-badge">Metric 4 & 5</span>
            <div class="stat-title">New This Month / Growth Rate</div>
            <div class="stat-val"><?= number_format($growth['new_this_month']) ?></div>
            <div class="stat-sub">
                <span style="color: var(--success); font-weight: 700;">+<?= $growth['growth_rate_pct'] ?>% MoM Growth</span>
            </div>
        </div>
    </div>
</div>

<!-- ── Part 2: Active User Cadence & Stickiness (Metrics 6–15) ── -->
<div class="glass-card">
    <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
        Active Engagement & Account Lifecycle
    </h2>
    <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 20px;">
        DAU, WAU, MAU, stickiness coefficients, guest seekers, and net user expansion.
    </p>

    <div class="stat-grid-4">
        <div class="stat-card">
            <span class="stat-num-badge">Metric 6</span>
            <div class="stat-title">Daily Active Users (DAU)</div>
            <div class="stat-val"><?= number_format($growth['dau']) ?></div>
            <div class="stat-sub">Active in past 24 hours</div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 7</span>
            <div class="stat-title">Weekly Active Users (WAU)</div>
            <div class="stat-val"><?= number_format($growth['wau']) ?></div>
            <div class="stat-sub">Active in past 7 days</div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 8</span>
            <div class="stat-title">Monthly Active Users (MAU)</div>
            <div class="stat-val"><?= number_format($growth['mau']) ?></div>
            <div class="stat-sub">Active in past 30 days</div>
        </div>

        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metric 9</span>
            <div class="stat-title">DAU/MAU Stickiness Ratio</div>
            <div class="stat-val"><?= $growth['stickiness_ratio_pct'] ?>%</div>
            <div class="stat-sub"><?= ($growth['stickiness_ratio_pct'] > 20) ? '★ High Habitual Practice' : 'Growing Routine' ?></div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 10</span>
            <div class="stat-title">Returning Users</div>
            <div class="stat-val"><?= number_format($growth['returning_users']) ?></div>
            <div class="stat-sub">Active devotees aged > 1 day</div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 11</span>
            <div class="stat-title">Guest Users (Unauthenticated)</div>
            <div class="stat-val"><?= number_format($growth['guest_users']) ?></div>
            <div class="stat-sub">Browsing sacred scriptures without account</div>
        </div>

        <div class="stat-card stat-card-green">
            <span class="stat-num-badge">Metric 12 & 13</span>
            <div class="stat-title">Verified vs Unverified</div>
            <div class="stat-val"><?= number_format($growth['verified_users']) ?> <span style="font-size: 1rem; color: var(--text-low);">/ <?= number_format($growth['unverified_users']) ?></span></div>
            <div class="stat-sub">OTP verified active identities</div>
        </div>

        <div class="stat-card stat-card-red">
            <span class="stat-num-badge">Metric 14 & 15</span>
            <div class="stat-title">Deleted vs Net Growth</div>
            <div class="stat-val">+<?= number_format($growth['net_growth']) ?></div>
            <div class="stat-sub">
                <span style="color: var(--danger);"><?= number_format($growth['deleted_accounts']) ?> DPDP purged</span>
            </div>
        </div>
    </div>
</div>

<!-- ── Part 3: Devotee Profiles & Demographic Segments (Metrics 16–25) ── -->
<div class="two-column-layout">
    <!-- Geography -->
    <div class="glass-card">
        <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">
            🌍 Metric 16 & 17: Geographic Distribution
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-mid); margin-bottom: 16px;">
            Aggregated by coarse country code & state/city without exposing raw IP addresses.
        </p>

        <h4 style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 8px;">Top Countries</h4>
        <table class="data-table" style="margin-top: 0; margin-bottom: 20px;">
            <thead>
                <tr>
                    <th>Country</th>
                    <th>Active Devotees</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($growth['by_country'])): ?>
                    <tr><td colspan="2" style="color: var(--text-low); text-align: center;">No geo telemetry logged yet</td></tr>
                <?php else: ?>
                    <?php foreach ($growth['by_country'] as $row): ?>
                        <tr>
                            <td><?= htmlspecialchars($row['country'] ?: 'Global / Unspecified', ENT_QUOTES, 'UTF-8') ?></td>
                            <td style="font-weight: 700; color: #fff;"><?= number_format($row['total']) ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>

        <h4 style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 8px;">Top Cities / States</h4>
        <table class="data-table" style="margin-top: 0;">
            <thead>
                <tr>
                    <th>City / Region</th>
                    <th>Active Devotees</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($growth['by_city'])): ?>
                    <tr><td colspan="2" style="color: var(--text-low); text-align: center;">Awaiting city-level beacons</td></tr>
                <?php else: ?>
                    <?php foreach ($growth['by_city'] as $row): ?>
                        <tr>
                            <td><?= htmlspecialchars($row['city'], ENT_QUOTES, 'UTF-8') ?></td>
                            <td style="font-weight: 700; color: #fff;"><?= number_format($row['total']) ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Tech Stack & Platforms -->
    <div class="glass-card">
        <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">
            📱 Metrics 18–20: Devices & Platforms
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-mid); margin-bottom: 16px;">
            Hardware models, OS distributions, and active app versions.
        </p>

        <h4 style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 8px;">Operating System (Metric 19)</h4>
        <table class="data-table" style="margin-top: 0; margin-bottom: 20px;">
            <thead>
                <tr>
                    <th>OS</th>
                    <th>Active Users</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($growth['by_os'])): ?>
                    <tr><td colspan="2" style="color: var(--text-low); text-align: center;">No OS data available</td></tr>
                <?php else: ?>
                    <?php foreach ($growth['by_os'] as $row): ?>
                        <tr>
                            <td><?= htmlspecialchars($row['os'] ?: 'Unknown', ENT_QUOTES, 'UTF-8') ?></td>
                            <td style="font-weight: 700; color: #fff;"><?= number_format($row['total']) ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>

        <h4 style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 8px;">App Versions (Metric 20)</h4>
        <table class="data-table" style="margin-top: 0;">
            <thead>
                <tr>
                    <th>App Version</th>
                    <th>Active Users</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($growth['by_version'])): ?>
                    <tr><td colspan="2" style="color: var(--text-low); text-align: center;">Awaiting version telemetry</td></tr>
                <?php else: ?>
                    <?php foreach ($growth['by_version'] as $row): ?>
                        <tr>
                            <td>v<?= htmlspecialchars($row['app_version'] ?: '1.0.0', ENT_QUOTES, 'UTF-8') ?></td>
                            <td style="font-weight: 700; color: #fff;"><?= number_format($row['total']) ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- ── Part 4: Account Roles, Languages & Tiers (Metrics 21–25) ── -->
<div class="glass-card">
    <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.1rem; margin-bottom: 6px;">
        🕉️ Metrics 21–25: Languages, Signup Methods & Devotee Segments
    </h3>
    <p style="font-size: 0.8rem; color: var(--text-mid); margin-bottom: 20px;">
        Devanagari/English scriptural preferences, passwordless authentication method, and new-to-returning devotee ratio.
    </p>

    <div class="stat-grid-4">
        <div class="stat-card">
            <span class="stat-num-badge">Metric 21</span>
            <div class="stat-title">Languages Preferred</div>
            <div style="margin-top: 8px;">
                <?php if (empty($growth['by_language'])): ?>
                    <p style="font-size: 0.85rem; color: var(--text-low);">Default: Sanskrit & Hindi</p>
                <?php else: ?>
                    <?php foreach ($growth['by_language'] as $lang): ?>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span><?= htmlspecialchars(strtoupper($lang['language'] ?: 'HI'), ENT_QUOTES, 'UTF-8') ?></span>
                            <span style="font-weight: 700; color: #fff;"><?= number_format($lang['total']) ?></span>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 22</span>
            <div class="stat-title">Signup Methods</div>
            <div style="margin-top: 8px;">
                <?php if (empty($growth['by_signup_method'])): ?>
                    <p style="font-size: 0.85rem; color: var(--text-low);">Passwordless OTP: 100%</p>
                <?php else: ?>
                    <?php foreach ($growth['by_signup_method'] as $sm): ?>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                            <span><?= htmlspecialchars(ucfirst($sm['signup_method'] ?: 'OTP'), ENT_QUOTES, 'UTF-8') ?></span>
                            <span style="font-weight: 700; color: #fff;"><?= number_format($sm['total']) ?></span>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 23 & 24</span>
            <div class="stat-title">Role & Tier</div>
            <div style="margin-top: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                    <span>Sadhak / Devotee</span>
                    <span style="font-weight: 700; color: #fff;"><?= number_format($growth['total_registered_users']) ?></span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                    <span>Tier (100% Free)</span>
                    <span style="font-weight: 700; color: var(--accent-gold);">Ad-Free Devotee</span>
                </div>
            </div>
        </div>

        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metric 25</span>
            <div class="stat-title">New vs Returning Ratio</div>
            <div class="stat-val"><?= $growth['new_vs_returning_ratio'] ?></div>
            <div class="stat-sub">New monthly seekers vs long-term devotees</div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
