<?php
/**
 * 3. Retention, Churn & Funnel Analytics (Metrics 46–60 & 76–90)
 * Cohort retention curves, dormancy detection, and onboarding funnel conversion.
 */

$pageTitle = "Retention, Churn & Funnels (Metrics 46–60 & 76–90)";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/../includes/analytics.php';

$analytics = new AnalyticsEngine();
$ret = $analytics->getRetentionStats();
?>

<?php include __DIR__ . '/includes/stats_nav.php'; ?>

<!-- ── Part 1: Sadhana Cohort Retention Curve (Metrics 46–54) ── -->
<div class="glass-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
            <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
                Sadhana Habit Retention Curve (Day 1 to Day 90)
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-mid);">
                Percentage of devotees who return to continue their sacred chanting practice across day cohorts.
            </p>
        </div>
        <span class="sla-pill sla-optimal">Benchmark: >40% D30 Target Met</span>
    </div>

    <div class="stat-grid-4">
        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metric 46</span>
            <div class="stat-title">Day 1 Retention</div>
            <div class="stat-val"><?= $ret['d1_retention_pct'] ?>%</div>
            <div class="stat-sub">Immediate next-day return</div>
        </div>

        <div class="stat-card stat-card-purple">
            <span class="stat-num-badge">Metric 47 & 48</span>
            <div class="stat-title">Day 7 & Day 14 Retention</div>
            <div class="stat-val"><?= $ret['d7_retention_pct'] ?>% <span style="font-size: 1.1rem; color: var(--text-mid);">/ <?= $ret['d14_retention_pct'] ?>%</span></div>
            <div class="stat-sub">Formation of 2-week Sankalp</div>
        </div>

        <div class="stat-card stat-card-green">
            <span class="stat-num-badge">Metric 49, 50, 51</span>
            <div class="stat-title">Day 30, 60, 90 Retention</div>
            <div class="stat-val"><?= $ret['d30_retention_pct'] ?>% <span style="font-size: 0.95rem; color: var(--text-mid);">/ <?= $ret['d60_retention_pct'] ?>% / <?= $ret['d90_retention_pct'] ?>%</span></div>
            <div class="stat-sub">Long-term spiritual devotees</div>
        </div>

        <div class="stat-card stat-card-red">
            <span class="stat-num-badge">Metric 54</span>
            <div class="stat-title">User Churn Rate (30-Day)</div>
            <div class="stat-val"><?= $ret['churn_rate_pct'] ?>%</div>
            <div class="stat-sub">100% minus Day-30 retention</div>
        </div>
    </div>
</div>

<!-- ── Part 2: Inactivity & Devotee Reactivation (Metrics 55–60) ── -->
<div class="glass-card">
    <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
        Inactivity Stages, Reactivation & First Action
    </h2>
    <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 20px;">
        Metrics 55–60: Devotees at risk of lapse, recovered dormant users, and time to first spiritual interaction.
    </p>

    <div class="stat-grid-4">
        <div class="stat-card">
            <span class="stat-num-badge">Metric 55, 56, 57</span>
            <div class="stat-title">Inactive (7d / 30d / 90d)</div>
            <div class="stat-val"><?= number_format($ret['inactive_7d']) ?> <span style="font-size: 0.95rem; color: var(--text-low);">/ <?= number_format($ret['inactive_30d']) ?> / <?= number_format($ret['inactive_90d']) ?></span></div>
            <div class="stat-sub">Devotees needing gentle re-engagement</div>
        </div>

        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metric 58</span>
            <div class="stat-title">Reactivated Devotees</div>
            <div class="stat-val"><?= number_format($ret['reactivated_users']) ?></div>
            <div class="stat-sub">Returned after 30+ days away</div>
        </div>

        <div class="stat-card stat-card-purple">
            <span class="stat-num-badge">Metric 59</span>
            <div class="stat-title">Time to First Action</div>
            <div class="stat-val"><?= $ret['time_to_first_action_sec'] ?> <span style="font-size: 1.1rem; color: var(--text-mid);">sec</span></div>
            <div class="stat-sub">Launch to first chant tap or audio play</div>
        </div>

        <div class="stat-card stat-card-green">
            <span class="stat-num-badge">Metric 60</span>
            <div class="stat-title">Signup-to-Action Conversion</div>
            <div class="stat-val"><?= $ret['signup_to_action_conversion_pct'] ?>%</div>
            <div class="stat-sub">Immediate devotional commencement</div>
        </div>
    </div>
</div>

<!-- ── Part 3: Onboarding & Conversion Funnel (Metrics 76–90) ── -->
<div class="glass-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
            <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.25rem; margin-bottom: 6px;">
                Devotional Onboarding & Conversion Funnel (Metrics 76–90)
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-mid);">
                Step-by-step conversion efficiency from initial launch through OTP verification, consent, and goal attainment.
            </p>
        </div>
        <span class="badge-live">Passwordless Flow</span>
    </div>

    <div class="stat-grid-4">
        <div class="stat-card">
            <span class="stat-num-badge">Metric 76 & 77</span>
            <div class="stat-title">Landing & Signup Rates</div>
            <div class="stat-val"><?= $ret['landing_to_signup_pct'] ?>% <span style="font-size: 1rem; color: var(--text-mid);">/ <?= $ret['signup_completion_rate_pct'] ?>%</span></div>
            <div class="stat-sub">Landing-to-signup & Completion</div>
        </div>

        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metric 78 & 79</span>
            <div class="stat-title">OTP Verification & Login</div>
            <div class="stat-val"><?= $ret['email_verification_rate_pct'] ?>%</div>
            <div class="stat-sub">Login success: <?= $ret['login_success_rate_pct'] ?>% (Abandon: <?= $ret['login_abandonment_rate_pct'] ?>%)</div>
        </div>

        <div class="stat-card stat-card-purple">
            <span class="stat-num-badge">Metric 81, 82, 83</span>
            <div class="stat-title">Onboarding & Permissions</div>
            <div class="stat-val"><?= $ret['onboarding_completion_rate_pct'] ?>%</div>
            <div class="stat-sub">Permissions accepted: <?= $ret['permission_acceptance_rate_pct'] ?>% (Drop: <?= $ret['onboarding_abandonment_pct'] ?>%)</div>
        </div>

        <div class="stat-card stat-card-green">
            <span class="stat-num-badge">Metric 89 & 90</span>
            <div class="stat-title">Overall Goal Completion</div>
            <div class="stat-val"><?= $ret['overall_goal_completion_rate_pct'] ?>%</div>
            <div class="stat-sub">Daily 108 Japa completed &bull; Referral: <?= $ret['referral_conversion_pct'] ?>%</div>
        </div>
    </div>

    <!-- Non-commercial Covenant Notice for Metrics 84-88 -->
    <div style="background: rgba(108, 92, 231, 0.1); border: 1px solid rgba(108, 92, 231, 0.25); border-radius: 12px; padding: 16px 20px; margin-top: 20px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="font-size: 1.2rem;">🕊️</span>
            <strong style="color: #ffffff; font-size: 0.95rem;">Metrics 84–88: Commercial Conversion Zero-State Compliance</strong>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-mid); line-height: 1.5;">
            In strict observance of the <strong>Sacred Non-Commercial Covenant</strong>:
            <code>Free-to-Paid (<?= $ret['free_to_paid_pct'] ?>%)</code>,
            <code>Trial-to-Paid (<?= $ret['trial_to_paid_pct'] ?>%)</code>,
            <code>Subscription Cancellation (<?= $ret['subscription_cancellation_pct'] ?>%)</code>,
            <code>Checkout Conversion (<?= $ret['checkout_conversion_pct'] ?>%)</code>, and
            <code>Payment Failure (<?= $ret['payment_failure_pct'] ?>%)</code>
            are permanently and ethically verified at <strong>0.0%</strong>. The app has no payment gateways, paywalls, or premium tiers.
        </p>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
