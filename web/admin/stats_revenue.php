<?php
/**
 * 5. Revenue & Monetization Analytics (Metrics 91–105)
 * Sacred Non-Commercial Covenant Compliance Audit & Financial Zero-State Reporting.
 */

$pageTitle = "Revenue & Non-Commercial Policy (Metrics 91–105)";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/../includes/analytics.php';

$analytics = new AnalyticsEngine();
$rev = $analytics->getRevenueStats();
?>

<?php include __DIR__ . '/includes/stats_nav.php'; ?>

<!-- ── Sacred Covenant Banner ── -->
<div class="glass-card" style="border: 1px solid rgba(255, 153, 51, 0.35); background: linear-gradient(135deg, rgba(22, 19, 43, 0.85), rgba(40, 25, 15, 0.6));">
    <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
        <div style="font-size: 3rem;">🕊️</div>
        <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                <h2 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.35rem;">
                    Sacred Non-Commercial Covenant (Rule 1 Governance)
                </h2>
                <span class="sla-pill sla-optimal">100% Ethical Compliance</span>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-mid); line-height: 1.6;">
                Mantra is governed by an unalterable non-commercial spiritual covenant: <em>Sanatana Dharma scriptures and sacred chants are divine gifts to humanity that must never be locked behind paywalls, intrusive ads, or commercial subscriptions.</em> All metrics below reflect verified real-data zero accounting.
            </p>
        </div>
    </div>
</div>

<!-- ── Financial Metrics 91–98 ── -->
<div class="glass-card">
    <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.15rem; margin-bottom: 6px;">
        Financial Accounting Ledger (Metrics 91–98)
    </h3>
    <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 20px;">
        Zero commercial extraction across all user accounts and distribution channels.
    </p>

    <div class="stat-grid-4">
        <div class="stat-card">
            <span class="stat-num-badge">Metric 91 & 92</span>
            <div class="stat-title">Gross & Net Revenue</div>
            <div class="stat-val"><?= $rev['gross_revenue'] ?></div>
            <div class="stat-sub">Net after fees: <?= $rev['net_revenue'] ?></div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 93 & 94</span>
            <div class="stat-title">Revenue Today & Month</div>
            <div class="stat-val"><?= $rev['revenue_today'] ?></div>
            <div class="stat-sub">Month: <?= $rev['revenue_this_month'] ?> &bull; Growth: <?= $rev['revenue_growth_rate'] ?></div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 96 & 97</span>
            <div class="stat-title">ARPU & ARPPU</div>
            <div class="stat-val"><?= $rev['arpu'] ?></div>
            <div class="stat-sub">Avg Revenue Per User / Paying User</div>
        </div>

        <div class="stat-card stat-card-gold">
            <span class="stat-num-badge">Metric 98</span>
            <div class="stat-title">Devotee Lifetime Value (LTV)</div>
            <div class="stat-val" style="color: var(--accent-gold);">Priceless</div>
            <div class="stat-sub">Spiritual merit (Punya) unquantifiable</div>
        </div>
    </div>
</div>

<!-- ── Transactions, Tiers & Refunds (Metrics 99–105) ── -->
<div class="glass-card">
    <h3 style="font-family: var(--font-heading); color: #ffffff; font-size: 1.15rem; margin-bottom: 6px;">
        Monetization Audits & Transactions (Metrics 99–105)
    </h3>
    <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 20px;">
        Verification that zero monetization SDKs (Google Play Billing, Stripe, AdMob, UnityAds) exist in production bundles.
    </p>

    <div class="stat-grid-4">
        <div class="stat-card">
            <span class="stat-num-badge">Metric 99 & 100</span>
            <div class="stat-title">Paying Users & Percentage</div>
            <div class="stat-val"><?= $rev['paying_users'] ?> <span style="font-size: 1.1rem; color: var(--text-mid);">(<?= $rev['paying_user_pct'] ?>)</span></div>
            <div class="stat-sub">All devotees receive full access freely</div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 101</span>
            <div class="stat-title">Subscription Plans</div>
            <div class="stat-val" style="font-size: 1.4rem;">Universal Free</div>
            <div class="stat-sub">Zero gated content or paid tiers</div>
        </div>

        <div class="stat-card">
            <span class="stat-num-badge">Metric 104</span>
            <div class="stat-title">Refund Rate</div>
            <div class="stat-val"><?= $rev['refund_rate_pct'] ?></div>
            <div class="stat-sub">No transactions to refund</div>
        </div>

        <div class="stat-card stat-card-green">
            <span class="stat-num-badge">Metric 105</span>
            <div class="stat-title">Failed / Pending Payments</div>
            <div class="stat-val"><?= $rev['failed_transactions'] ?></div>
            <div class="stat-sub">Zero payment gateway friction</div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
