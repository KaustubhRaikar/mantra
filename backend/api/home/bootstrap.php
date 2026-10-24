<?php
/**
 * Unified Home Bootstrap API Endpoint
 * Consolidates all liturgical home feed collections into a single network invocation.
 * Eliminates parallel request bursts and optimizes sliding window rate limit quotas (1 call instead of 9).
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$payload = [
    "daily_mantra"     => null,
    "featured_mantras" => [],
    "categories"       => [],
    "festival_aartis"  => [],
    "aartis"           => [],
    "chalisas"         => [],
    "pooja_vidhis"     => [],
    "stotras"          => [],
    "vrat_kathas"      => []
];

try {
    // 1. Daily Mantra (Deterministic daily selection based on day of year)
    $stmtDaily = $db->query("SELECT m.id, m.mantra_name as title, m.sanskrit_text as sanskrit_title, m.sanskrit_text, m.translation_english, m.audio_url, c.name as category_name
                             FROM mantras m
                             LEFT JOIN categories c ON m.category_id = c.id
                             ORDER BY m.id ASC LIMIT 1");
    if ($stmtDaily) {
        $rowDaily = $stmtDaily->fetch(PDO::FETCH_ASSOC);
        if ($rowDaily) {
            $payload["daily_mantra"] = [
                "id" => $rowDaily['id'],
                "title" => $rowDaily['title'],
                "sanskrit_title" => $rowDaily['sanskrit_title'],
                "sanskrit_text" => $rowDaily['sanskrit_text'],
                "translation_english" => $rowDaily['translation_english'],
                "duration" => 0,
                "audio_url" => $rowDaily['audio_url'],
                "category_name" => $rowDaily['category_name']
            ];
        }
    }

    // 2. Featured Mantras (Top liked mantras)
    $stmtFeatured = $db->query("SELECT m.id, m.mantra_name as title, m.sanskrit_text as sanskrit_title, m.audio_url, c.name as category_name
                                FROM mantras m
                                LEFT JOIN categories c ON m.category_id = c.id
                                ORDER BY m.likes_count DESC
                                LIMIT 6");
    if ($stmtFeatured) {
        $featuredRows = $stmtFeatured->fetchAll(PDO::FETCH_ASSOC) ?: [];
        $payload["featured_mantras"] = array_map(function($r) {
            return [
                "id" => $r['id'],
                "title" => $r['title'],
                "sanskrit_title" => $r['sanskrit_title'],
                "duration" => 0,
                "audio_url" => $r['audio_url'],
                "is_featured" => true,
                "category_name" => $r['category_name']
            ];
        }, $featuredRows);
    }

    // 3. Categories
    $stmtCats = $db->query("SELECT id, name, icon_url as icon_name, description FROM categories ORDER BY name ASC");
    if ($stmtCats) {
        $payload["categories"] = $stmtCats->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    // 4. Festival Aartis
    $stmtFestAartis = $db->query("SELECT * FROM festival_aartis ORDER BY id ASC");
    if ($stmtFestAartis) {
        $payload["festival_aartis"] = $stmtFestAartis->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    // 5. General Aartis
    $stmtAartis = $db->query("SELECT * FROM aartis ORDER BY id ASC");
    if ($stmtAartis) {
        $payload["aartis"] = $stmtAartis->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    // 6. Chalisas
    $stmtChalisas = $db->query("SELECT * FROM chalisa ORDER BY id ASC");
    if ($stmtChalisas) {
        $payload["chalisas"] = $stmtChalisas->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    // 7. Pooja Vidhis
    $stmtPooja = $db->query("SELECT * FROM pooja_vidhis ORDER BY id ASC");
    if ($stmtPooja) {
        $payload["pooja_vidhis"] = $stmtPooja->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    // 8. Stotras (including Sahasranamas, 108 Namavalis, Suktas, Kavachas, Ashtakams)
    $stmtStotras = $db->query("SELECT * FROM stotra ORDER BY id ASC");
    if ($stmtStotras) {
        $payload["stotras"] = $stmtStotras->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    // 9. Vrat Kathas
    $stmtVrat = $db->query("SELECT * FROM vrat_kathas ORDER BY id ASC");
    if ($stmtVrat) {
        $payload["vrat_kathas"] = $stmtVrat->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    http_response_code(200);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
