<?php
/**
 * Mantras Read API Endpoint
 * Returns collection of mantras filtered by category_id, deity name, or search query.
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $rawCategoryId = $_GET['category_id'] ?? ($_GET['category'] ?? ($_GET['deity'] ?? null));
    $search = $_GET['search'] ?? null;
    $featured = $_GET['featured'] ?? null;

    $catNumericId = null;
    $deityText = null;

    if ($rawCategoryId !== null && $rawCategoryId !== '') {
        $cleanId = trim((string)$rawCategoryId);
        if (str_starts_with($cleanId, 'deity_')) {
            $cleanId = substr($cleanId, 6);
        }

        if (is_numeric($cleanId)) {
            $catNumericId = (int)$cleanId;
        } else {
            // It is a deity name string, e.g. "shiva", "ganesh", "hanuman"
            $deityText = $cleanId;
        }
    }

    $whereClauses = [];
    $params = [];

    if ($catNumericId !== null && $catNumericId > 0) {
        $whereClauses[] = "m.category_id = :cat_id";
        $params[':cat_id'] = $catNumericId;
    } elseif ($deityText !== null && $deityText !== '') {
        $whereClauses[] = "(c.name LIKE :deity_text OR m.mantra_name LIKE :deity_text2 OR m.sanskrit_text LIKE :deity_text3)";
        $likeVal = "%{$deityText}%";
        $params[':deity_text'] = $likeVal;
        $params[':deity_text2'] = $likeVal;
        $params[':deity_text3'] = $likeVal;
    }

    if (!empty($search)) {
        $whereClauses[] = "(m.mantra_name LIKE :search OR m.sanskrit_text LIKE :search2 OR m.translation_english LIKE :search3 OR m.translation_hindi LIKE :search4)";
        $searchVal = "%{$search}%";
        $params[':search'] = $searchVal;
        $params[':search2'] = $searchVal;
        $params[':search3'] = $searchVal;
        $params[':search4'] = $searchVal;
    }

    $orderBy = "m.id ASC";
    if ($featured !== null) {
        $orderBy = "m.likes_count DESC";
    }

    $sql = "SELECT m.id, 
                   m.mantra_name as title, 
                   m.mantra_name as name,
                   m.sanskrit_text as sanskrit_title, 
                   m.sanskrit_text as sanskrit, 
                   m.sanskrit_text, 
                   m.transliteration, 
                   m.translation_hindi as translation_hi, 
                   m.translation_hindi, 
                   m.translation_english as translation_en, 
                   m.translation_english, 
                   m.audio_url, 
                   m.category_id, 
                   c.name as category_name,
                   c.name as deity,
                   c.name as god,
                   0 as duration,
                   1 as is_featured
            FROM mantras m
            LEFT JOIN categories c ON m.category_id = c.id";

    if (!empty($whereClauses)) {
        $sql .= " WHERE " . implode(" AND ", $whereClauses);
    }

    $sql .= " ORDER BY " . $orderBy;

    $stmt = $db->prepare($sql);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // Canonical structure normalization
    $records = array_map(function($r) {
        return [
            "id" => (int)$r['id'],
            "name" => $r['name'],
            "title" => $r['title'],
            "sanskrit" => $r['sanskrit'],
            "sanskrit_text" => $r['sanskrit_text'],
            "sanskrit_title" => $r['sanskrit_title'],
            "transliteration" => $r['transliteration'] ?? '',
            "translation_hi" => $r['translation_hi'] ?? '',
            "translation_hindi" => $r['translation_hindi'] ?? '',
            "translation_en" => $r['translation_en'] ?? '',
            "translation_english" => $r['translation_english'] ?? '',
            "category_id" => (int)$r['category_id'],
            "category_name" => $r['category_name'] ?? 'Sacred Verses',
            "deity" => $r['deity'] ?? 'Sacred Verses',
            "god" => $r['god'] ?? 'Sacred Verses',
            "duration" => (int)$r['duration'],
            "audio_url" => $r['audio_url'],
            "is_featured" => (bool)$r['is_featured'],
            "path" => "mantra"
        ];
    }, $rows);

    http_response_code(200);
    echo json_encode(["records" => $records], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["records" => [], "error" => $e->getMessage()]);
}
