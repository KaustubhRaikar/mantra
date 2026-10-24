<?php
include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$id = isset($_GET['id']) ? $_GET['id'] : die(json_encode(["message" => "ID is required."]));

$query = "SELECT m.id, m.mantra_name as title, m.sanskrit_text as sanskrit_title, 
                 m.transliteration, m.translation_hindi, m.translation_english, 
                 m.audio_url, m.category_id, c.name as category_name
          FROM mantras m
          LEFT JOIN categories c ON m.category_id = c.id
          WHERE m.id = :id
          LIMIT 0,1";

$stmt = $db->prepare($query);
$stmt->bindParam(":id", $id);
$stmt->execute();

$num = $stmt->rowCount();

if($num > 0){
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    extract($row);

    $mantra_item = array(
        // Canonical Fields (Task 6)
        "id" => $id,
        "name" => $title,
        "deity" => $category_name,
        "sanskrit" => $sanskrit_title,
        "transliteration" => $transliteration ?? '',
        "translation_en" => $translation_english ?? '',
        "translation_hi" => $translation_hindi ?? '',
        "meaning" => [],
        "benefits" => [],
        "audio_url" => $audio_url,
        "category_id" => isset($category_id) ? (int)$category_id : null,
        "category_name" => $category_name,
        "path" => "mantra",

        // Legacy Backward Compatibility Fields
        "god" => $category_name,
        "category" => $category_name,
        "translation_english" => $translation_english,
        "translation_hindi" => $translation_hindi,
        "translation_regional" => "अनुवाद उपलब्ध नाही",
        "duration" => 0
    );

    http_response_code(200);
    echo json_encode($mantra_item);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "Mantra not found."));
}
?>
