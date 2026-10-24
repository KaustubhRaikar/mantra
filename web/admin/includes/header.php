<?php
/**
 * Admin Portal Unified Header
 */
require_once __DIR__ . '/auth.php';
$adminUser = requireAdmin();
$currentPage = basename($_SERVER['PHP_SELF']);
$csrfToken = WebSecurity::getCsrfToken();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8') ?>">
    <title><?= $pageTitle ?? 'Admin Portal' ?> — Mantra</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&family=Tiro+Devanagari+Hindi&display=swap" rel="stylesheet">

    <style>
        :root {
            --cosmic-dark: #080711;
            --cosmic-navy: #0e0c1f;
            --cosmic-surface: #141126;
            --cosmic-card: rgba(22, 19, 43, 0.7);
            --accent-gold: #ff9933;
            --radiant-gold: #f5b041;
            --accent-purple: #6c5ce7;
            --danger: #ff3b30;
            --success: #2ecc71;
            --text-high: #ffffff;
            --text-mid: #b8b5d1;
            --text-low: #6c688c;
            --border-glass: rgba(255, 255, 255, 0.08);
            --border-glow: rgba(255, 153, 51, 0.25);
            --font-display: 'Cinzel', serif;
            --font-heading: 'Outfit', sans-serif;
            --font-body: 'Inter', sans-serif;
            --font-sanskrit: 'Tiro Devanagari Hindi', serif;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--cosmic-dark);
            color: var(--text-mid);
            font-family: var(--font-body);
            display: flex;
            min-height: 100vh;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(108, 92, 231, 0.12) 0%, transparent 40%),
                radial-gradient(circle at 90% 10%, rgba(255, 153, 51, 0.1) 0%, transparent 35%);
            background-attachment: fixed;
        }

        /* ── Sidebar ── */
        .sidebar {
            width: 260px;
            background: var(--cosmic-navy);
            border-right: 1px solid var(--border-glass);
            display: flex;
            flex-direction: column;
            padding: 24px 16px;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 100;
        }

        .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 8px 24px 8px;
            border-bottom: 1px solid var(--border-glass);
            margin-bottom: 24px;
            text-decoration: none;
        }

        .sidebar-logo {
            width: 38px;
            height: 38px;
            border-radius: 8px;
            background: linear-gradient(135deg, #ff9933, #6c5ce7);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-family: var(--font-sanskrit);
            font-size: 20px;
        }

        .sidebar-brand-name {
            font-family: var(--font-display);
            font-size: 1.15rem;
            color: #ffffff;
            font-weight: 700;
            letter-spacing: 1px;
        }

        .sidebar-brand-badge {
            font-size: 0.65rem;
            color: var(--accent-gold);
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .sidebar-menu {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
        }

        .menu-header {
            font-size: 0.7rem;
            text-transform: uppercase;
            color: var(--text-low);
            font-weight: 700;
            letter-spacing: 1px;
            padding: 12px 12px 6px 12px;
        }

        .sidebar-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 11px 14px;
            border-radius: 10px;
            color: var(--text-mid);
            text-decoration: none;
            font-size: 0.92rem;
            font-weight: 500;
            transition: all 0.2s;
        }

        .sidebar-link:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
        }

        .sidebar-link.active {
            background: rgba(255, 153, 51, 0.15);
            color: var(--accent-gold);
            font-weight: 600;
            border: 1px solid rgba(255, 153, 51, 0.3);
        }

        .sidebar-link-icon {
            font-size: 18px;
            width: 22px;
            text-align: center;
        }

        .sidebar-footer {
            border-top: 1px solid var(--border-glass);
            padding-top: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .admin-profile {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.03);
        }

        .admin-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--accent-purple);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 13px;
        }

        .admin-info {
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .admin-email {
            font-size: 0.8rem;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .admin-role {
            font-size: 0.7rem;
            color: var(--accent-gold);
        }

        /* ── Main Layout ── */
        .main-wrapper {
            margin-left: 260px;
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        .topbar {
            height: 64px;
            border-bottom: 1px solid var(--border-glass);
            background: rgba(14, 12, 31, 0.8);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 32px;
            position: sticky;
            top: 0;
            z-index: 90;
        }

        .topbar-title {
            font-family: var(--font-heading);
            font-size: 1.25rem;
            color: #ffffff;
            font-weight: 700;
        }

        .topbar-actions {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .badge-live {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 100px;
            background: rgba(46, 204, 113, 0.15);
            border: 1px solid rgba(46, 204, 113, 0.4);
            color: var(--success);
            font-size: 0.75rem;
            font-weight: 600;
        }

        .badge-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--success);
            box-shadow: 0 0 8px var(--success);
        }

        .content-container {
            padding: 32px;
            flex: 1;
        }

        .btn-logout {
            padding: 6px 14px;
            border-radius: 8px;
            background: rgba(255, 59, 48, 0.15);
            border: 1px solid rgba(255, 59, 48, 0.3);
            color: var(--danger);
            font-size: 0.85rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }

        .btn-logout:hover {
            background: var(--danger);
            color: #fff;
        }

        /* ── Common Card Styles ── */
        .glass-card {
            background: var(--cosmic-card);
            border: 1px solid var(--border-glass);
            border-radius: 16px;
            padding: 24px;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            margin-bottom: 24px;
        }

        .btn-action {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.88rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            text-decoration: none;
            transition: all 0.2s;
        }

        .btn-gold {
            background: linear-gradient(135deg, var(--accent-gold), var(--radiant-gold));
            color: #0c0a1a;
        }

        .btn-gold:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 14px rgba(255, 153, 51, 0.4);
        }

        /* ── Table Styles ── */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.92rem;
            margin-top: 16px;
        }

        .data-table th {
            text-align: left;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-glass);
            color: var(--text-low);
            text-transform: uppercase;
            font-size: 0.72rem;
            letter-spacing: 0.8px;
        }

        .data-table td {
            padding: 14px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            color: var(--text-high);
        }

        .data-table tr:hover td {
            background: rgba(255, 255, 255, 0.02);
        }
        /* ── Stats Subnav & Analytics Grid Styles ── */
        .stats-tabs {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding-bottom: 12px;
            margin-bottom: 28px;
            border-bottom: 1px solid var(--border-glass);
            scrollbar-width: thin;
        }

        .stats-tab-item {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 9px 16px;
            border-radius: 10px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-mid);
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-glass);
            text-decoration: none;
            white-space: nowrap;
            transition: all 0.2s ease;
        }

        .stats-tab-item:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.15);
        }

        .stats-tab-item.active {
            background: rgba(255, 153, 51, 0.15);
            color: var(--accent-gold);
            border-color: rgba(255, 153, 51, 0.4);
            box-shadow: 0 4px 12px rgba(255, 153, 51, 0.1);
        }

        .stat-grid-4 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
            gap: 20px;
            margin-bottom: 28px;
        }

        .stat-grid-3 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
            gap: 20px;
            margin-bottom: 28px;
        }

        .stat-grid-2 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(440px, 1fr));
            gap: 24px;
            margin-bottom: 28px;
        }

        .stat-card {
            background: var(--cosmic-card);
            border: 1px solid var(--border-glass);
            border-radius: 16px;
            padding: 22px;
            backdrop-filter: blur(16px);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--accent-gold), var(--accent-purple));
        }

        .stat-card-gold::before { background: linear-gradient(90deg, #ff9933, #f5b041); }
        .stat-card-purple::before { background: linear-gradient(90deg, #6c5ce7, #a29bfe); }
        .stat-card-green::before { background: linear-gradient(90deg, #2ecc71, #27ae60); }
        .stat-card-blue::before { background: linear-gradient(90deg, #0984e3, #74b9ff); }
        .stat-card-red::before { background: linear-gradient(90deg, #e74c3c, #ff7675); }

        .stat-num-badge {
            display: inline-block;
            font-size: 0.68rem;
            font-weight: 700;
            color: var(--accent-gold);
            background: rgba(255, 153, 51, 0.12);
            padding: 2px 7px;
            border-radius: 4px;
            margin-bottom: 8px;
            align-self: flex-start;
        }

        .stat-title {
            font-size: 0.8rem;
            text-transform: uppercase;
            color: var(--text-low);
            font-weight: 700;
            letter-spacing: 0.7px;
            margin-bottom: 8px;
        }

        .stat-val {
            font-family: var(--font-heading);
            font-size: 2rem;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.1;
        }

        .stat-sub {
            font-size: 0.82rem;
            color: var(--text-mid);
            margin-top: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .insight-card {
            background: rgba(22, 19, 43, 0.75);
            border: 1px solid var(--border-glass);
            border-radius: 14px;
            padding: 18px 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            transition: all 0.2s ease;
        }

        .insight-card:hover {
            border-color: rgba(255, 153, 51, 0.3);
            transform: translateY(-2px);
        }

        .insight-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .insight-id {
            font-family: var(--font-heading);
            font-weight: 800;
            font-size: 0.95rem;
            color: var(--accent-gold);
        }

        .insight-title {
            font-size: 1rem;
            font-weight: 700;
            color: #ffffff;
            flex: 1;
        }

        .insight-badge {
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-optimal { background: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); }
        .badge-warning { background: rgba(245, 176, 65, 0.15); color: #f5b041; border: 1px solid rgba(245, 176, 65, 0.3); }
        .badge-opportunity { background: rgba(108, 92, 231, 0.15); color: #a29bfe; border: 1px solid rgba(108, 92, 231, 0.3); }
        .badge-danger { background: rgba(231, 76, 60, 0.15); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3); }

        .insight-summary {
            font-size: 0.88rem;
            color: var(--text-mid);
            line-height: 1.5;
        }

        .insight-action {
            font-size: 0.8rem;
            color: var(--accent-gold);
            background: rgba(255, 153, 51, 0.08);
            border-left: 3px solid var(--accent-gold);
            padding: 6px 10px;
            border-radius: 0 6px 6px 0;
            margin-top: 4px;
        }
    </style>
</head>
<body>

    <!-- ── Sidebar ── -->
    <aside class="sidebar" style="overflow-y: auto;">
        <a href="index.php" class="sidebar-brand">
            <div class="sidebar-logo">ॐ</div>
            <div>
                <div class="sidebar-brand-name">MANTRA</div>
                <div class="sidebar-brand-badge">Admin Governance</div>
            </div>
        </a>

        <ul class="sidebar-menu">
            <li class="menu-header">Live Telemetry & Stats</li>
            <li>
                <a href="index.php" class="sidebar-link <?= $currentPage === 'index.php' ? 'active' : '' ?>">
                    <span class="sidebar-link-icon">📊</span>
                    <span>Executive Overview</span>
                </a>
            </li>
            <li>
                <a href="stats_growth.php" class="sidebar-link <?= $currentPage === 'stats_growth.php' ? 'active' : '' ?>">
                    <span class="sidebar-link-icon">👥</span>
                    <span>1. User Growth (1–25)</span>
                </a>
            </li>
            <li>
                <a href="stats_engagement.php" class="sidebar-link <?= $currentPage === 'stats_engagement.php' ? 'active' : '' ?>">
                    <span class="sidebar-link-icon">⏱️</span>
                    <span>2. Engagement (26–45)</span>
                </a>
            </li>
            <li>
                <a href="stats_retention.php" class="sidebar-link <?= $currentPage === 'stats_retention.php' ? 'active' : '' ?>">
                    <span class="sidebar-link-icon">🔄</span>
                    <span>3. Retention & Funnels</span>
                </a>
            </li>
            <li>
                <a href="stats_features.php" class="sidebar-link <?= $currentPage === 'stats_features.php' ? 'active' : '' ?>">
                    <span class="sidebar-link-icon">📜</span>
                    <span>4. Feature Analytics</span>
                </a>
            </li>
            <li>
                <a href="stats_revenue.php" class="sidebar-link <?= $currentPage === 'stats_revenue.php' ? 'active' : '' ?>">
                    <span class="sidebar-link-icon">🕊️</span>
                    <span>5. Non-Commercial Policy</span>
                </a>
            </li>
            <li>
                <a href="stats_performance.php" class="sidebar-link <?= $currentPage === 'stats_performance.php' ? 'active' : '' ?>">
                    <span class="sidebar-link-icon">⚡</span>
                    <span>6. App & API Health</span>
                </a>
            </li>
            <li>
                <a href="stats_security.php" class="sidebar-link <?= $currentPage === 'stats_security.php' ? 'active' : '' ?>">
                    <span class="sidebar-link-icon">🛡️</span>
                    <span>7. Security & Ops</span>
                </a>
            </li>
            <li>
                <a href="stats_support.php" class="sidebar-link <?= $currentPage === 'stats_support.php' ? 'active' : '' ?>">
                    <span class="sidebar-link-icon">💬</span>
                    <span>8. Devotee Support</span>
                </a>
            </li>

            <li class="menu-header">Scriptural CMS</li>
            <li>
                <a href="scriptures.php" class="sidebar-link <?= $currentPage === 'scriptures.php' ? 'active' : '' ?>">
                    <span class="sidebar-link-icon">🕉️</span>
                    <span>Scripture Catalog</span>
                </a>
            </li>

            <li class="menu-header">Compliance & DPDP</li>
            <li>
                <a href="users.php" class="sidebar-link <?= $currentPage === 'users.php' ? 'active' : '' ?>">
                    <span class="sidebar-link-icon">⚖️</span>
                    <span>Devotees & Erasure</span>
                </a>
            </li>

            <li class="menu-header">Public Portal</li>
            <li>
                <a href="../index.html" class="sidebar-link" target="_blank">
                    <span class="sidebar-link-icon">🌐</span>
                    <span>View Public Website</span>
                </a>
            </li>
        </ul>

        <div class="sidebar-footer">
            <div class="admin-profile">
                <div class="admin-avatar"><?= strtoupper(substr($adminUser['email'] ?? 'A', 0, 1)) ?></div>
                <div class="admin-info">
                    <span class="admin-email"><?= htmlspecialchars($adminUser['email'] ?? 'Admin', ENT_QUOTES, 'UTF-8') ?></span>
                    <span class="admin-role"><?= htmlspecialchars($adminUser['role'] ?? 'SuperAdmin', ENT_QUOTES, 'UTF-8') ?></span>
                </div>
            </div>
            <a href="logout.php" class="btn-logout" style="text-align: center;">Sign Out</a>
        </div>
    </aside>

    <!-- ── Main Content Area ── -->
    <div class="main-wrapper">
        <header class="topbar">
            <h1 class="topbar-title"><?= $pageTitle ?? 'Admin Dashboard' ?></h1>
            <div class="topbar-actions">
                <span class="badge-live">
                    <span class="badge-dot"></span>
                    <span>REST & DB Online</span>
                </span>
                <span style="font-size: 0.85rem; color: var(--accent-gold);">TLS 1.3 Active</span>
            </div>
        </header>

        <main class="content-container">
