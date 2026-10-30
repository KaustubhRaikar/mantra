<?php
header("Content-Type: application/json");
$key = $_GET['key'] ?? '';
if ($key !== 'sacred_canonical_sync_2026') {
    exit(json_encode(["error" => "unauthorized"]));
}

$candidates = [
    '/home/u885706413/domains/mantra.aarambhtech.in/public_html/config/database.php',
    dirname(__DIR__, 2) . '/config/database.php',
    dirname(__DIR__, 3) . '/config/database.php',
    dirname(__DIR__, 1) . '/config/database.php'
];

$found = [];
foreach ($candidates as $c) {
    if (file_exists($c)) {
        $content = file_get_contents($c);
        // Mask passwords before outputting
        $safeContent = preg_replace('/([\'"]?(?:pass|password)[\'"]?\s*=>\s*[\'"])(.+?)([\'"])/i', '$1****$3', $content);
        $found[$c] = [
            "size" => strlen($content),
            "snippet" => $safeContent
        ];
    } else {
        $found[$c] = false;
    }
}

echo json_encode(["configs" => $found], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
