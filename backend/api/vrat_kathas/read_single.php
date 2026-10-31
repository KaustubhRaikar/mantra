<?php
/**
 * Vrat Kathas Read Single API Endpoint
 * Returns single sacred narrative by ID or title slug.
 */

include_once __DIR__ . '/../../config/headers.php';
include_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID is required."]);
    exit();
}

try {
    $stmt = $db->prepare("SELECT * FROM vrat_katha WHERE id = :id OR katha_name LIKE :id_like OR title LIKE :id_like2 LIMIT 1");
    $idLike = "%$id%";
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':id_like', $idLike);
    $stmt->bindParam(':id_like2', $idLike);
    $stmt->execute();

    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($item) {
        $item['title'] = !empty($item['title']) ? $item['title'] : ($item['katha_name'] ?? '');
        $item['katha_name'] = !empty($item['katha_name']) ? $item['katha_name'] : ($item['title'] ?? '');
        $item['deity'] = !empty($item['deity']) ? $item['deity'] : ($item['deity_name'] ?? '');
        $item['deity_name'] = !empty($item['deity_name']) ? $item['deity_name'] : ($item['deity'] ?? '');
        $item['synopsis'] = !empty($item['synopsis']) ? $item['synopsis'] : ($item['description'] ?? '');
        $item['vrat_significance'] = !empty($item['vrat_significance']) ? $item['vrat_significance'] : ($item['significance'] ?? '');

        // Decode JSON fields if stored as string
        if (!empty($item['chapters']) && is_string($item['chapters'])) {
            $item['chapters'] = json_decode($item['chapters'], true);
        }
        if (!empty($item['katha_chapters']) && is_string($item['katha_chapters'])) {
            $item['katha_chapters'] = json_decode($item['katha_chapters'], true);
        }

        // Synthesize full katha_text if empty
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

        http_response_code(200);
        echo json_encode($item, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Katha not found."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
