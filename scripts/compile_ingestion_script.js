// scripts/compile_ingestion_script.js
const fs = require('fs');
const path = require('path');

const sahasranamas = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp_sahasranamas.json'), 'utf8'));
const namavalis = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp_namavalis.json'), 'utf8'));
const suktas = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp_suktas.json'), 'utf8'));
const kavachas = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp_kavachas.json'), 'utf8'));
const ashtakams = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp_ashtakams.json'), 'utf8'));
const chalisas = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp_chalisas.json'), 'utf8'));
const nitya = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp_nitya.json'), 'utf8'));

// Combine all stotra-type records (Sahasranamas, Namavalis, Suktas, Kavachas, Ashtakams)
const all_stotras = [
  ...sahasranamas,
  ...namavalis,
  ...suktas,
  ...kavachas,
  ...ashtakams
];

console.log(`Total Stotras to Ingest: ${all_stotras.length}`);
console.log(`Total Chalisas to Ingest: ${chalisas.length}`);
console.log(`Total Nitya Mantras to Ingest: ${nitya.length}`);

// We embed the payload as JSON in the PHP script so it handles all unicode Devanagari cleanly
const payloadJson = JSON.stringify({
  stotras: all_stotras,
  chalisas: chalisas,
  mantras: nitya
});

const phpScript = `<?php
/**
 * Canonical Treasury Ingestion Runner (Hostinger Cloud MySQL)
 * Secure one-time ingestion script for Pancha-Devata Sahasranamas, 108 Namavalis,
 * Vedic Suktas, Protective Kavachas, Ashtakams, Chalisas, and Nitya Karma Mantras.
 */

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_canonical_sync_2026') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Unauthorized access."]);
    exit();
}

try {
    // Resolve path to root config/database.php
    $possibleDbPaths = [
        dirname(__DIR__, 2) . '/config/database.php',
        dirname(__DIR__, 3) . '/config/database.php',
        dirname(__DIR__, 1) . '/config/database.php',
        __DIR__ . '/config/database.php',
        '/home/u885706413/domains/mantra.aarambhtech.in/public_html/config/database.php'
    ];

    $dbConfigPath = null;
    foreach ($possibleDbPaths as $p) {
        if (file_exists($p)) {
            $dbConfigPath = $p;
            break;
        }
    }

    if (!$dbConfigPath) {
        throw new Exception("Unable to locate config/database.php");
    }

    require_once $dbConfigPath;
    $database = new Database();
    $db = $database->getConnection();

    // Ensure utf8mb4 connection
    $db->exec("SET NAMES 'utf8mb4'");

    $rawPayload = <<<'JSON_PAYLOAD'
${payloadJson}
JSON_PAYLOAD;

    $data = json_decode($rawPayload, true);
    if (!$data) {
        throw new Exception("Failed to parse JSON payload: " . json_last_error_msg());
    }

    $log = [
        "timestamp" => date('c'),
        "stotras_processed" => 0,
        "chalisas_processed" => 0,
        "mantras_processed" => 0,
        "errors" => []
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // 1. INGEST STOTRAS (Sahasranamas, 108 Namavalis, Suktas, Kavachas, Ashtakams)
    // ─────────────────────────────────────────────────────────────────────────
    $checkStotra = $db->prepare("SELECT id FROM stotra WHERE stotra_name = :name LIMIT 1");
    $insertStotra = $db->prepare("INSERT INTO stotra (
        stotra_name, deity_name, language, total_verses, author, description,
        significance, benefits, best_time, recommended_day, verses, is_premium,
        created_at, updated_at
    ) VALUES (
        :name, :deity, :lang, :verses_cnt, :author, :description,
        :significance, :benefits, :best_time, :rec_day, :verses_json, 0,
        NOW(), NOW()
    )");

    $updateStotra = $db->prepare("UPDATE stotra SET
        deity_name = :deity, language = :lang, total_verses = :verses_cnt,
        author = :author, description = :description, significance = :significance,
        benefits = :benefits, best_time = :best_time, recommended_day = :rec_day,
        verses = :verses_json, updated_at = NOW()
        WHERE id = :id");

    foreach ($data['stotras'] as $st) {
        // Build verses JSON (if namavali is present, we store as structured verses or with namavali field)
        $versesPayload = [
            "verses" => $st['verses'] ?? []
        ];
        if (!empty($st['namavali'])) {
            $versesPayload['namavali'] = $st['namavali'];
            $versesPayload['is_namavali'] = true;
        }
        $versesJson = json_encode($versesPayload, JSON_UNESCAPED_UNICODE);

        $checkStotra->execute([':name' => $st['stotra_name']]);
        $existingId = $checkStotra->fetchColumn();

        if ($existingId) {
            $updateStotra->execute([
                ':deity' => $st['deity_name'],
                ':lang' => $st['language'] ?? 'Sanskrit',
                ':verses_cnt' => $st['total_verses'] ?? count($st['verses'] ?? []),
                ':author' => $st['author'] ?? 'Traditional',
                ':description' => $st['description'] ?? '',
                ':significance' => $st['significance'] ?? '',
                ':benefits' => $st['benefits'] ?? '',
                ':best_time' => $st['best_time'] ?? '',
                ':rec_day' => $st['recommended_day'] ?? '',
                ':verses_json' => $versesJson,
                ':id' => $existingId
            ]);
        } else {
            $insertStotra->execute([
                ':name' => $st['stotra_name'],
                ':deity' => $st['deity_name'],
                ':lang' => $st['language'] ?? 'Sanskrit',
                ':verses_cnt' => $st['total_verses'] ?? count($st['verses'] ?? []),
                ':author' => $st['author'] ?? 'Traditional',
                ':description' => $st['description'] ?? '',
                ':significance' => $st['significance'] ?? '',
                ':benefits' => $st['benefits'] ?? '',
                ':best_time' => $st['best_time'] ?? '',
                ':rec_day' => $st['recommended_day'] ?? '',
                ':verses_json' => $versesJson
            ]);
        }
        $log['stotras_processed']++;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. INGEST CHALISAS (5 New Chalisas)
    // ─────────────────────────────────────────────────────────────────────────
    $checkChalisa = $db->prepare("SELECT id FROM chalisa WHERE chalisa_name = :name LIMIT 1");
    $insertChalisa = $db->prepare("INSERT INTO chalisa (
        chalisa_name, deity_name, language, total_verses, author, description,
        significance, benefits, best_time, recommended_day, verses, is_premium,
        created_at, updated_at
    ) VALUES (
        :name, :deity, :lang, :verses_cnt, :author, :description,
        :significance, :benefits, :best_time, :rec_day, :verses_json, 0,
        NOW(), NOW()
    )");

    $updateChalisa = $db->prepare("UPDATE chalisa SET
        deity_name = :deity, language = :lang, total_verses = :verses_cnt,
        author = :author, description = :description, significance = :significance,
        benefits = :benefits, best_time = :best_time, recommended_day = :rec_day,
        verses = :verses_json, updated_at = NOW()
        WHERE id = :id");

    foreach ($data['chalisas'] as $ch) {
        $versesJson = json_encode($ch['verses'] ?? [], JSON_UNESCAPED_UNICODE);

        $checkChalisa->execute([':name' => $ch['chalisa_name']]);
        $existingId = $checkChalisa->fetchColumn();

        if ($existingId) {
            $updateChalisa->execute([
                ':deity' => $ch['deity_name'],
                ':lang' => $ch['language'] ?? 'Hindi',
                ':verses_cnt' => $ch['total_verses'] ?? 40,
                ':author' => $ch['author'] ?? 'Traditional',
                ':description' => $ch['description'] ?? '',
                ':significance' => $ch['significance'] ?? '',
                ':benefits' => $ch['benefits'] ?? '',
                ':best_time' => $ch['best_time'] ?? '',
                ':rec_day' => $ch['recommended_day'] ?? '',
                ':verses_json' => $versesJson,
                ':id' => $existingId
            ]);
        } else {
            $insertChalisa->execute([
                ':name' => $ch['chalisa_name'],
                ':deity' => $ch['deity_name'],
                ':lang' => $ch['language'] ?? 'Hindi',
                ':verses_cnt' => $ch['total_verses'] ?? 40,
                ':author' => $ch['author'] ?? 'Traditional',
                ':description' => $ch['description'] ?? '',
                ':significance' => $ch['significance'] ?? '',
                ':benefits' => $ch['benefits'] ?? '',
                ':best_time' => $ch['best_time'] ?? '',
                ':rec_day' => $ch['recommended_day'] ?? '',
                ':verses_json' => $versesJson
            ]);
        }
        $log['chalisas_processed']++;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. INGEST NITYA KARMA MANTRAS (7 Daily Mantras into mantras table)
    // ─────────────────────────────────────────────────────────────────────────
    $checkMantra = $db->prepare("SELECT id FROM mantras WHERE mantra_name = :name LIMIT 1");
    $insertMantra = $db->prepare("INSERT INTO mantras (
        mantra_name, sanskrit_text, transliteration, translation_hindi,
        translation_english, category_id, created_at, updated_at
    ) VALUES (
        :name, :sanskrit, :transliteration, :hi,
        :en, :cat_id, NOW(), NOW()
    )");

    $updateMantra = $db->prepare("UPDATE mantras SET
        sanskrit_text = :sanskrit, transliteration = :transliteration,
        translation_hindi = :hi, translation_english = :en, category_id = :cat_id,
        updated_at = NOW()
        WHERE id = :id");

    foreach ($data['mantras'] as $m) {
        $checkMantra->execute([':name' => $m['name']]);
        $existingId = $checkMantra->fetchColumn();

        if ($existingId) {
            $updateMantra->execute([
                ':sanskrit' => $m['sanskrit_text'],
                ':transliteration' => $m['transliteration'],
                ':hi' => $m['translation_hindi'],
                ':en' => $m['translation_english'],
                ':cat_id' => $m['category_id'] ?? 6,
                ':id' => $existingId
            ]);
        } else {
            $insertMantra->execute([
                ':name' => $m['name'],
                ':sanskrit' => $m['sanskrit_text'],
                ':transliteration' => $m['transliteration'],
                ':hi' => $m['translation_hindi'],
                ':en' => $m['translation_english'],
                ':cat_id' => $m['category_id'] ?? 6
            ]);
        }
        $log['mantras_processed']++;
    }

    // Row counts verification
    $totalStotras = (int)$db->query("SELECT COUNT(*) FROM stotra")->fetchColumn();
    $totalChalisas = (int)$db->query("SELECT COUNT(*) FROM chalisa")->fetchColumn();
    $totalMantras = (int)$db->query("SELECT COUNT(*) FROM mantras")->fetchColumn();

    $log['totals'] = [
        "stotras" => $totalStotras,
        "chalisas" => $totalChalisas,
        "mantras" => $totalMantras
    ];

    echo json_encode(["success" => true, "log" => $log], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ], JSON_PRETTY_PRINT);
}
?>`;

const targetBackendScript = path.join(__dirname, '..', 'backend', 'scripts', 'ingest_canonical_treasury.php');
const targetWebScript = path.join(__dirname, '..', 'web', 'ingest_canonical_treasury.php');

fs.writeFileSync(targetBackendScript, phpScript, 'utf8');
fs.writeFileSync(targetWebScript, phpScript, 'utf8');

console.log(`Successfully compiled ingestion script to:`);
console.log(`  - ${targetBackendScript} (${fs.statSync(targetBackendScript).size} bytes)`);
console.log(`  - ${targetWebScript} (${fs.statSync(targetWebScript).size} bytes)`);
