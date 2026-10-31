<?php
/**
 * Vrat Kathas Read API Endpoint
 * Returns collection of all sacred narratives and fasting stories.
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $category = $_GET['category'] ?? null;
    $sql = "SELECT id, 
                   COALESCE(NULLIF(title, ''), katha_name) as title, 
                   COALESCE(NULLIF(katha_name, ''), title) as katha_name, 
                   COALESCE(sanskrit, sanskrit_title) as sanskrit, 
                   COALESCE(sanskrit_title, sanskrit) as sanskrit_title, 
                   COALESCE(category, 'vrat_katha') as category, 
                   COALESCE(category_label, 'व्रत कथा') as category_label, 
                   COALESCE(NULLIF(deity, ''), deity_name) as deity, 
                   COALESCE(NULLIF(deity_name, ''), deity) as deity_name, 
                   COALESCE(duration, vrat_duration) as duration, 
                   COALESCE(synopsis, description) as synopsis, 
                   COALESCE(vrat_significance, significance) as vrat_significance, 
                   katha_text,
                   katha_chapters,
                   chapters,
                   translation_hi, 
                   translation_en, 
                   translation_gu, 
                   translation_mr, 
                   audio_url
            FROM vrat_katha";

    if ($category) {
        $sql .= " WHERE category = :cat";
    }
    $sql .= " ORDER BY id ASC";

    $stmt = $db->prepare($sql);
    if ($category) {
        $stmt->bindParam(':cat', $category);
    }
    $stmt->execute();
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // Ensure katha_text and chapters are fully populated
    foreach ($records as &$item) {
        // Decode chapters if string
        if (!empty($item['chapters']) && is_string($item['chapters'])) {
            $item['chapters'] = json_decode($item['chapters'], true);
        }
        if (!empty($item['katha_chapters']) && is_string($item['katha_chapters'])) {
            $item['katha_chapters'] = json_decode($item['katha_chapters'], true);
        }

        // Synthesize full narrative text if katha_text is empty
        if (empty($item['katha_text'])) {
            $chaps = !empty($item['chapters']) ? $item['chapters'] : (!empty($item['katha_chapters']) ? $item['katha_chapters'] : null);
            if (is_array($chaps) && count($chaps) > 0) {
                $parts = [];
                foreach ($chaps as $c) {
                    $t = $c['title'] ?? ('अध्याय ' . ($c['chapter'] ?? ($c['chapterNumber'] ?? '')));
                    $s = $c['story'] ?? ($c['text'] ?? '');
                    $parts[] = $t . "\n\n" . $s;
                }
                $item['katha_text'] = implode("\n\n═══════════════════════\n\n", $parts);
            } elseif (!empty($item['synopsis'])) {
                $item['katha_text'] = $item['synopsis'];
            }
        }
    }
    unset($item);

    http_response_code(200);
    echo json_encode(["records" => $records], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["records" => [], "error" => $e->getMessage()]);
}
