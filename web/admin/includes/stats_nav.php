<?php
/**
 * Stats Quick Navigation Bar
 */
$currentStatsPage = basename($_SERVER['PHP_SELF']);
$statsNavItems = [
    ['file' => 'index.php', 'label' => 'Overview & 10 AI Insights', 'icon' => '🌟'],
    ['file' => 'stats_growth.php', 'label' => '1. Growth & Profiles (1–25)', 'icon' => '👥'],
    ['file' => 'stats_engagement.php', 'label' => '2. Engagement (26–45)', 'icon' => '⏱️'],
    ['file' => 'stats_retention.php', 'label' => '3. Retention & Funnels (46–60, 76–90)', 'icon' => '🔄'],
    ['file' => 'stats_features.php', 'label' => '4. Feature Analytics (61–75)', 'icon' => '📜'],
    ['file' => 'stats_revenue.php', 'label' => '5. Non-Commercial Policy (91–105)', 'icon' => '🕊️'],
    ['file' => 'stats_performance.php', 'label' => '6. App & API Health (106–120)', 'icon' => '⚡'],
    ['file' => 'stats_security.php', 'label' => '7. Security & Ops (121–135)', 'icon' => '🛡️'],
    ['file' => 'stats_support.php', 'label' => '8. Devotee Support (136–150)', 'icon' => '💬'],
];
?>
<nav class="stats-tabs">
    <?php foreach ($statsNavItems as $item): ?>
        <a href="<?= $item['file'] ?>" class="stats-tab-item <?= ($currentStatsPage === $item['file']) ? 'active' : '' ?>">
            <span><?= $item['icon'] ?></span>
            <span><?= htmlspecialchars($item['label'], ENT_QUOTES, 'UTF-8') ?></span>
        </a>
    <?php endforeach; ?>
</nav>
