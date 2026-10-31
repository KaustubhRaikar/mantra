<?php
/**
 * Katha Treasury Migration & Canonical Database Seeder
 * Creates and updates `vrat_katha` / `vrat_kathas` tables with complete multi-language fields
 * and seeds 10 canonical sacred narratives (7-Day Vrat Kathas & Pauranik Leelas) plus enriches legacy kathas.
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);
header("Content-Type: application/json; charset=UTF-8");

$key = $_GET['key'] ?? '';
if ($key !== 'sacred_canonical_sync_2026') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit();
}

// Database Connection Resolution
$possibleDbPaths = [
    dirname(__DIR__, 2) . '/config/database.php',
    dirname(__DIR__, 1) . '/config/database.php',
    __DIR__ . '/../config/database.php',
    '/home/u885706413/domains/mantra.aarambhtech.in/public_html/config/database.php',
];

$dbIncluded = false;
foreach ($possibleDbPaths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $dbIncluded = true;
        break;
    }
}

if (!$dbIncluded) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database configuration file not found."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$results = [
    "tables_created"    => [],
    "columns_modified"  => [],
    "columns_added"     => [],
    "legacy_enriched"   => 0,
    "seeded_kathas"     => []
];

$driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
$isSqlite = ($driver === 'sqlite');

// Helper to add column safely
function addColumnIfNotExists(PDO $db, string $table, string $column, string $typeDef): string {
    try {
        $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'sqlite') {
            $stmt = $db->query("PRAGMA table_info({$table})");
            $cols = $stmt->fetchAll(PDO::FETCH_COLUMN, 1);
            if (!in_array($column, $cols, true)) {
                $db->exec("ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$typeDef}");
                return "ADDED_SQLITE";
            }
            return "ALREADY_EXISTS";
        } else {
            $stmt = $db->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS 
                                  WHERE TABLE_SCHEMA = DATABASE() 
                                  AND TABLE_NAME = :table 
                                  AND COLUMN_NAME = :col");
            $stmt->execute([':table' => $table, ':col' => $column]);
            $exists = (int)$stmt->fetchColumn() > 0;
            if (!$exists) {
                $db->exec("ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$typeDef}");
                return "ADDED_MYSQL";
            }
            return "ALREADY_EXISTS";
        }
    } catch (Exception $e) {
        return "ERROR: " . $e->getMessage();
    }
}

// 1. Create or ensure table `vrat_katha`
$createTableSql = "CREATE TABLE IF NOT EXISTS `vrat_katha` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `katha_name` VARCHAR(255) DEFAULT NULL,
    `sanskrit` VARCHAR(255) DEFAULT NULL,
    `sanskrit_title` VARCHAR(255) DEFAULT NULL,
    `category` VARCHAR(64) DEFAULT 'vrat_katha',
    `category_label` VARCHAR(100) DEFAULT 'व्रत कथा',
    `deity` VARCHAR(100) DEFAULT NULL,
    `deity_name` VARCHAR(100) DEFAULT NULL,
    `duration` VARCHAR(50) DEFAULT NULL,
    `vrat_duration` VARCHAR(50) DEFAULT NULL,
    `synopsis` TEXT DEFAULT NULL,
    `vrat_significance` TEXT DEFAULT NULL,
    `significance` TEXT DEFAULT NULL,
    `katha_text` LONGTEXT DEFAULT NULL,
    `katha_chapters` " . ($isSqlite ? "TEXT" : "LONGTEXT") . " DEFAULT NULL,
    `chapters` " . ($isSqlite ? "TEXT" : "LONGTEXT") . " DEFAULT NULL,
    `translation_hi` LONGTEXT DEFAULT NULL,
    `translation_en` LONGTEXT DEFAULT NULL,
    `translation_gu` LONGTEXT DEFAULT NULL,
    `translation_mr` LONGTEXT DEFAULT NULL,
    `translation_bn` LONGTEXT DEFAULT NULL,
    `translation_te` LONGTEXT DEFAULT NULL,
    `translation_ta` LONGTEXT DEFAULT NULL,
    `translation_kn` LONGTEXT DEFAULT NULL,
    `audio_url` VARCHAR(500) DEFAULT NULL,
    `views_count` INT UNSIGNED DEFAULT 0,
    `likes_count` INT UNSIGNED DEFAULT 0,
    `is_featured` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)" . ($isSqlite ? ";" : " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

$db->exec($createTableSql);
$results["tables_created"][] = "vrat_katha";

// Modify ID column to VARCHAR(64) on MySQL if table already existed as INT
if (!$isSqlite) {
    try {
        $idColStmt = $db->query("SELECT DATA_TYPE, EXTRA FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vrat_katha' AND COLUMN_NAME = 'id'");
        $idColInfo = $idColStmt ? $idColStmt->fetch(PDO::FETCH_ASSOC) : null;
        if ($idColInfo && strtolower($idColInfo['DATA_TYPE']) !== 'varchar') {
            if (stripos($idColInfo['EXTRA'] ?? '', 'auto_increment') !== false) {
                $db->exec("ALTER TABLE `vrat_katha` MODIFY `id` INT NOT NULL");
            }
            $db->exec("ALTER TABLE `vrat_katha` MODIFY `id` VARCHAR(64) NOT NULL");
            $results["columns_modified"]["id"] = "id altered to VARCHAR(64)";
        }
    } catch (Exception $e) {
        $results["columns_modified"]["id_error"] = $e->getMessage();
    }
}

// 2. Ensure all columns exist
$allRequiredCols = [
    'title'             => 'VARCHAR(255) DEFAULT NULL',
    'katha_name'        => 'VARCHAR(255) DEFAULT NULL',
    'sanskrit'          => 'VARCHAR(255) DEFAULT NULL',
    'sanskrit_title'    => 'VARCHAR(255) DEFAULT NULL',
    'category'          => "VARCHAR(64) DEFAULT 'vrat_katha'",
    'category_label'    => "VARCHAR(100) DEFAULT 'व्रत कथा'",
    'deity'             => 'VARCHAR(100) DEFAULT NULL',
    'deity_name'        => 'VARCHAR(100) DEFAULT NULL',
    'duration'          => 'VARCHAR(50) DEFAULT NULL',
    'vrat_duration'     => 'VARCHAR(50) DEFAULT NULL',
    'synopsis'          => 'TEXT DEFAULT NULL',
    'vrat_significance' => 'TEXT DEFAULT NULL',
    'significance'      => 'TEXT DEFAULT NULL',
    'katha_text'        => 'LONGTEXT DEFAULT NULL',
    'katha_chapters'    => ($isSqlite ? 'TEXT' : 'LONGTEXT') . ' DEFAULT NULL',
    'chapters'          => ($isSqlite ? 'TEXT' : 'LONGTEXT') . ' DEFAULT NULL',
    'translation_hi'    => 'LONGTEXT DEFAULT NULL',
    'translation_en'    => 'LONGTEXT DEFAULT NULL',
    'translation_gu'    => 'LONGTEXT DEFAULT NULL',
    'translation_mr'    => 'LONGTEXT DEFAULT NULL',
    'translation_bn'    => 'LONGTEXT DEFAULT NULL',
    'translation_te'    => 'LONGTEXT DEFAULT NULL',
    'translation_ta'    => 'LONGTEXT DEFAULT NULL',
    'translation_kn'    => 'LONGTEXT DEFAULT NULL',
    'audio_url'         => 'VARCHAR(500) DEFAULT NULL',
    'is_featured'       => 'TINYINT(1) DEFAULT 1',
];

foreach ($allRequiredCols as $col => $typeDef) {
    $res = addColumnIfNotExists($db, 'vrat_katha', $col, $typeDef);
    $results["columns_added"]["vrat_katha.{$col}"] = $res;
}

// Ensure `vrat_kathas` view or table exists for compatibility
try {
    if ($isSqlite) {
        $db->exec("CREATE VIEW IF NOT EXISTS `vrat_kathas` AS SELECT * FROM `vrat_katha`");
    } else {
        $db->exec("CREATE OR REPLACE VIEW `vrat_kathas` AS SELECT * FROM `vrat_katha`");
    }
    $results["tables_created"][] = "vrat_kathas (view)";
} catch (Exception $e) {
    try {
        $db->exec(str_replace("`vrat_katha`", "`vrat_kathas`", $createTableSql));
        $results["tables_created"][] = "vrat_kathas (table)";
    } catch (Exception $e2) {}
}

// 3. Update existing legacy rows with missing title/deity/katha_text
try {
    $db->exec("UPDATE `vrat_katha` SET `title` = `katha_name` WHERE (`title` IS NULL OR `title` = '') AND `katha_name` IS NOT NULL");
    $db->exec("UPDATE `vrat_katha` SET `katha_name` = `title` WHERE (`katha_name` IS NULL OR `katha_name` = '') AND `title` IS NOT NULL");
    $db->exec("UPDATE `vrat_katha` SET `deity` = `deity_name` WHERE (`deity` IS NULL OR `deity` = '') AND `deity_name` IS NOT NULL");
    $db->exec("UPDATE `vrat_katha` SET `deity_name` = `deity` WHERE (`deity_name` IS NULL OR `deity_name` = '') AND `deity` IS NOT NULL");
    $db->exec("UPDATE `vrat_katha` SET `category` = 'vrat_katha' WHERE `category` IS NULL OR `category` = ''");
    $db->exec("UPDATE `vrat_katha` SET `category_label` = 'व्रत कथा' WHERE `category_label` IS NULL OR `category_label` = ''");
    $db->exec("UPDATE `vrat_katha` SET `duration` = `vrat_duration` WHERE (`duration` IS NULL OR `duration` = '') AND `vrat_duration` IS NOT NULL");
    $db->exec("UPDATE `vrat_katha` SET `synopsis` = `description` WHERE (`synopsis` IS NULL OR `synopsis` = '') AND `description` IS NOT NULL");
    $db->exec("UPDATE `vrat_katha` SET `vrat_significance` = `significance` WHERE (`vrat_significance` IS NULL OR `vrat_significance` = '') AND `significance` IS NOT NULL");
    $db->exec("UPDATE `vrat_katha` SET `katha_text` = `description` WHERE (`katha_text` IS NULL OR `katha_text` = '') AND `description` IS NOT NULL");
} catch (Exception $e) {}

// 4. Enrich legacy rows with rich, complete narrative texts
$legacyEnrichments = [
    8 => [ // Vat Savitri
        'title' => 'वट सावित्री व्रत कथा (सती सावित्री एवं सत्यवान)',
        'katha_name' => 'वट सावित्री व्रत कथा (सती सावित्री एवं सत्यवान)',
        'sanskrit_title' => 'वटसावित्रीव्रतमहात्म्यम्',
        'katha_text' => "भद्र देश के धर्मात्मा राजा अश्वपति की कोई संतान नहीं थी। राजा ने अठारह वर्षों तक माता सावित्री की कठोर तपस्या की, जिससे प्रसन्न होकर देवी ने उन्हें एक सर्वगुण सम्पन्न कन्या का वरदान दिया। देवी के अनुग्रह से जन्मी इस कन्या का नाम 'सावित्री' रखा गया। जब सावित्री विवाह योग्य हुईं, तो राजा ने उन्हें स्वयं सुयोग्य वर खोजने का आदेश दिया। सावित्री ने तपोवन में जाकर शाल्व देश के द्युमत्सेन के पुत्र सत्यवान को अपने पति रूप में वरण किया। राजा द्युमत्सेन अंधे हो चुके थे और उनका राज्य शत्रुओं ने छीन लिया था, जिससे वे वन में सादा जीवन व्यतीत कर रहे थे।\n\nजब देवर्षि नारद ने सावित्री के इस वरण के बारे में सुना, तो वे राजा अश्वपति के पास पहुंचे और बोले—'राजन्! सत्यवान शूरवीर, सत्यवादी और रूपवान हैं, किन्तु इनके भाग्य में एक भारी दोष है। आज से ठीक एक वर्ष पश्चात् इनकी मृत्यु निश्चित है।' राजा अश्वपति चिंतित हो गए और उन्होंने सावित्री को किसी अन्य वर को चुनने को कहा। किन्तु सावित्री ने दृढ़ता से कहा—'पिताजी! आर्य कन्या अपने जीवन में एक ही बार पति का वरण करती है। मैंने सत्यवान को चुन लिया है, चाहे वे अल्पायु हों या दीर्घायु, मेरे पति केवल वही होंगे।'\n\nसावित्री का विवाह सत्यवान से हुआ। सावित्री ने राजसी वैभव त्याग कर वन में सास-ससुर और पति की अनन्य सेवा प्रारंभ की। नारद जी द्वारा बताई गई मृत्यु की तिथि जब निकट आई, तो सावित्री ने तीन दिन पूर्व से ही 'त्रिरात्र व्रत' (कठोर निर्जला उपवास) प्रारंभ कर दिया। नियत दिन सत्यवान कुल्हाड़ी लेकर लकड़ी काटने वन में जाने लगे। सावित्री ने भी सास-ससुर की अनुमति लेकर उनके साथ जाने की प्रार्थना की। वन में वट वृक्ष के नीचे लकड़ी काटते समय सत्यवान के सिर में तीव्र पीड़ा होने लगी। वे सावित्री की गोद में सिर रखकर सो गए।\n\nउसी समय दक्षिण दिशा से साक्षात् मृत्यु के देवता यमराज भैंसे पर सवार होकर आए। उनके हाथ में कालपाश था। यमराज ने सत्यवान के शरीर से अंगूठे के बराबर जीवात्मा को पाश में बांध लिया और दक्षिण दिशा की ओर चल पड़े। सावित्री भी पति के जीवात्मा के पीछे-पीछे चलने लगीं। यमराज ने कहा—'हे पतिव्रते! तुम वापस लौट जाओ और सत्यवान का श्राद्ध-तर्पण करो। जीवित प्राणी मेरे पीछे नहीं आ सकते।' सावित्री ने उत्तर दिया—'प्रभो! जहां मेरे पति जा रहे हैं, पत्नी होने के नाते मेरा कर्तव्य है कि मैं भी वहीं जाऊं। पातिव्रत्य धर्म के प्रभाव से मुझे कोई मार्ग दुर्गम नहीं लगता।'\n\nसावित्री के धर्मयुक्त वचनों से प्रसन्न होकर यमराज ने कहा—'हे कल्याणी! सत्यवान के जीवन को छोड़कर तुम कोई भी तीन वर मांग लो।' सावित्री ने प्रथम वर में अपने अंधे सास-ससुर के नेत्रों की ज्योति मांगी। द्वितीय वर में उनका छिना हुआ राज्य वापस मांगा। तृतीय वर में अपने पिता के लिए सौ पुत्रों का वरदान मांगा। यमराज ने तथास्तु कहकर आगे बढ़ना चाहा, किन्तु सावित्री फिर भी पीछे चलती रहीं। उन्होंने धर्म, दया और सत्संग की महिमा पर ऐसे गूढ़ विचार व्यक्त किए कि यमराज अत्यंत विस्मित और मुदित हो गए। उन्होंने कहा—'सावित्री! मैं तुम्हारी पवित्रता से अभिभूत हूं। एक और अंतिम वर मांगो, पर सत्यवान का प्राण मत मांगना।'\n\nसावित्री ने हाथ जोड़कर कहा—'हे धर्मराज! यदि आप मुझ पर वास्तव में प्रसन्न हैं, तो मुझे सत्यवान के वीर्य से सौ पराक्रमी और धर्मिष्ठ पुत्रों की माता बनने का वरदान दीजिए।' यमराज ने बिना सोचे 'तथास्तु' कह दिया। सावित्री मुस्कुराईं और बोलीं—'हे प्रभु! आप सत्यवादी हैं। एक पतिव्रता नारी अपने पति के बिना पुत्र कैसे उत्पन्न कर सकती है? अतः आपको सत्यवान को जीवनदान देना ही होगा।'\n\nयमराज अपनी प्रतिज्ञा में बंध गए। वे सावित्री के अदम्य पातिव्रत्य, तेज और वाकपटुता के आगे नतमस्तक हो गए। उन्होंने सत्यवान के सूक्ष्म शरीर को पाश से मुक्त करते हुए कहा—'हे सती शिरोमणि! तुम्हारी जैसी पतिव्रता नारी तीनों लोकों में दुर्लभ है। मैंने तुम्हारे पति को चार सौ वर्षों की नवीन दीर्घायु प्रदान की। तुम्हारा यह वट सावित्री व्रत कल्प-कल्पान्तर तक स्त्रियों को अखण्ड सौभाग्य प्रदान करेगा।'\n\nसावित्री उसी वट वृक्ष के नीचे लौटीं, जहां सत्यवान का शव पड़ा था। सत्यवान ऐसे उठ बैठे जैसे गहरी नींद से जागे हों। उधर उनके सास-ससुर की आंखों की ज्योति लौट आई और उनका राज्य भी वापस मिल गया।",
        'translation_hi' => 'वट सावित्री व्रत सती सावित्री के अदम्य पातिव्रत्य, बुद्धि और निष्ठा का पावन प्रतीक है। इस व्रत से सौभाग्य, पति की दीर्घायु और समस्त पारिवारिक सुखों की प्राप्ति होती है।'
    ],
    7 => [ // Ahoi Ashtami
        'title' => 'अहोई अष्टमी व्रत कथा (संतान रक्षा एवं दीर्घायु)',
        'katha_name' => 'अहोई अष्टमी व्रत कथा (संतान रक्षा एवं दीर्घायु)',
        'sanskrit_title' => 'अहोईअष्टमीव्रतकथा',
        'katha_text' => "प्राचीन काल में एक नगर में एक धर्मात्मा साहूकार रहता था। उसके सात पुत्र और सात बहुएं थीं। दीपावली से पूर्व कार्तिक मास की कृष्ण पक्ष की अष्टमी तिथि को घर की लिपाई-पुताई के लिए साहूकार की सातों बहुएं जंगल में खदान से पीली मिट्टी खोदने गईं। साहूकार की छोटी बहू जब खुरपी से मिट्टी खोद रही थी, तो उसकी खुरपी खदान के भीतर बने एक सेह (स्याही/साही) की मांद में जा लगी, जिससे सेह का एक नन्हा बच्चा कटकर मर गया।\n\nछोटी बहू को इस अनजाने में हुए पाप से अत्यधिक पश्चाताप हुआ। सेह की माता ने क्रोधित होकर शाप दिया—'जिस प्रकार तुमने मेरे बच्चे को मारा है, उसी प्रकार मैं तुम्हारी कोख को बांधूंगी और तुम्हारी सन्तान जीवित नहीं रहेगी।' शाप के प्रभाव से छोटी बहू के जन्म लेते ही एक के बाद एक सातों पुत्र अल्पायु में ही काल के गाल में समा गए। साहूकार की बहू विलाप करने लगी।\n\nएक दिन उसने एक वृद्ध तपस्वी मुनि से अपने कष्ट का कारण और निवारण पूछा। मुनि ने बताया—'बेटी! अनजाने में तुमसे सेह के बच्चे की हत्या हुई थी, उसी के शाप से तुम्हारी सन्तान नहीं बचती। तुम कार्तिक कृष्ण अष्टमी को अहोई माता (भगवती पार्वती का स्वरूप) का निर्जला व्रत रखो, सेह और उसके बच्चों का चित्र दीवार पर बनाकर उनका पूजन करो और गौमाता की सेवा कर क्षमा याचना करो।'\n\nसाहूकार की बहू ने पूर्ण श्रद्धा और निष्ठा के साथ कार्तिक कृष्ण अष्टमी को अहोई अष्टमी का व्रत रखा। सायंकाल आकाश में तारे दिखने पर उसने अर्घ्य दिया, अहोई माता की कथा सुनी और सेह माता से हाथ जोड़कर क्षमा मांगी। उसकी सच्ची भक्ति और प्रायश्चित से अहोई माता प्रसन्न हुईं और उसके सभी मृत पुत्रों को पुनर्जीवन प्रदान किया। तब से यह व्रत सन्तान की दीर्घायु और रक्षा के लिए विख्यात हुआ।",
        'translation_hi' => 'अहोई अष्टमी का व्रत माताओं द्वारा अपनी संतान की दीर्घायु, स्वास्थ्य और उज्ज्वल भविष्य के लिए किया जाता है। सच्ची प्रार्थना से हर अनिष्ट टल जाता है।'
    ]
];

foreach ($legacyEnrichments as $legId => $fields) {
    try {
        $upStmt = $db->prepare("UPDATE `vrat_katha` SET 
            `title` = :t, `katha_name` = :kn, `sanskrit_title` = :st, 
            `katha_text` = :kt, `translation_hi` = :th 
            WHERE `id` = :id");
        $upStmt->execute([
            ':t'  => $fields['title'],
            ':kn' => $fields['katha_name'],
            ':st' => $fields['sanskrit_title'],
            ':kt' => $fields['katha_text'],
            ':th' => $fields['translation_hi'],
            ':id' => $legId
        ]);
        $results["legacy_enriched"]++;
    } catch (Exception $e) {}
}

// 5. Seed Canonical Kathas (10 Complete Sacred Stories)
$kathas = [
    [
        'id' => 'katha_satyanarayan',
        'title' => 'श्री सत्यनारायण व्रत कथा (सम्पूर्ण ५ अध्याय)',
        'katha_name' => 'श्री सत्यनारायण व्रत कथा (सम्पूर्ण ५ अध्याय)',
        'sanskrit' => 'श्रीमत्सत्यनारायणव्रतकथा',
        'category' => 'vrat_katha',
        'category_label' => 'महापर्व व्रत कथा',
        'deity' => 'भगवान श्री सत्यनारायण (विष्णु)',
        'duration' => '35-45 मिनट',
        'synopsis' => 'स्कन्द पुराण के रेवाखण्ड से उद्धृत, भगवान सत्यनारायण की सर्वमनोरथ सिद्धि, दारिद्र्य नाश एवं सत्य धर्म प्रतिष्ठापना की पावन कथा।',
        'vrat_significance' => 'पूर्णिमा, संक्रान्ति अथवा किसी भी शुभ अवसर पर श्री सत्यनारायण व्रत करने से समस्त कष्टों का नाश और परमानन्द की प्राप्ति होती है।',
        'katha_text' => "एक समय नैमिषारण्य तीर्थ में शौनकादि ऋषियों ने महर्षि सूत जी से पूछा कि कलियुग में मनुष्य किस सरल उपाय से मनोवांछित फल प्राप्त कर सकता है? सूत जी बोले—एक बार देवर्षि नारद जी ने भगवान विष्णु से यही प्रश्न किया था। तब भगवान ने कहा: वत्स! कलियुग में सत्यनारायण का व्रत सर्वफलप्रदाता है।\n\nकाशीपुरी में शतानन्द नाम का एक दरिद्र ब्राह्मण भिक्षाटन से जीवन यापन करता था। भगवान ने वृद्ध ब्राह्मण का रूप धारण कर उसे सत्यनारायण व्रत की विधि बताई। ब्राह्मण ने सपरिवार व्रत किया और अपार ऐश्वर्य प्राप्त किया। उसी ब्राह्मण को देखकर एक निर्धन काष्ठ विक्रेता (लकड़हारे) ने भी व्रत का संकल्प लिया और भगवान की कृपा से धनवान बना।\n\nतृतीय अध्याय में साधु वैश्य की कथा है, जिसने सन्तान प्राप्ति के लिए व्रत का संकल्प लिया था। कन्या कलावती के जन्म के बाद भी उसने लोभवश व्रत नहीं किया, जिससे उसे राजा चन्द्रकेतु के कारागार में बन्दी होना पड़ा। पश्चाताप कर जब उसकी पत्नी लीलावती ने व्रत किया, तब वे कारागार से मुक्त हुए।\n\nचतुर्थ अध्याय में साधु वैश्य के रत्न-नौका पर भगवान की परीक्षा और दण्डवत क्षमा याचना की कथा है।\n\nपंचम अध्याय में राजा तुंगध्वज की कथा है, जिन्होंने वन में गोपों द्वारा दिए गए सत्यनारायण प्रसाद का अनादर किया, जिससे उनका राजपाट नष्ट हो गया। पश्चात् उन्होंने गोपों सहित क्षमा मांगकर प्रसाद ग्रहण किया और पुनः अपना राज्य प्राप्त किया।",
        'translation_hi' => 'सत्य ही नारायण हैं और नारायण ही सत्य हैं। जो मनुष्य सत्य का आचरण करते हुए भगवान का पूजन करता है, वह इस लोक में सुख भोगकर मोक्ष प्राप्त करता है।',
        'translation_en' => 'Truth alone is Narayana and Narayana is the Supreme Truth. Whosoever reveres the Lord through truthful conduct and steadfast devotion attains worldly joy and ultimate spiritual liberation.',
        'translation_gu' => 'સત્ય જ નારાયણ છે અને નારાયણ જ પરમ સત્ય છે. જે માનવ સત્ય આચરીને પ્રભુની પૂજા કરે છે, તે પરમ સુખ અને મુક્તિ પામે છે.',
        'translation_mr' => 'सत्य हेच नारायण आणि नारायण हेच परम सत्य आहेत. जो मानव सत्याचे आचरण करून ईश्वराची पूजा करतो, त्याला सर्व सुख आणि मोक्ष प्राप्त होतो.'
    ],
    [
        'id' => 'katha_somvar',
        'title' => 'सोमवार व्रत कथा (भगवान शिव कृपा)',
        'katha_name' => 'सोमवार व्रत कथा (भगवान शिव कृपा)',
        'sanskrit' => 'सोमवारव्रतकथा शिवप्रीतिकरी',
        'category' => 'vrat_katha',
        'category_label' => 'साप्ताहिक व्रत कथा',
        'deity' => 'देवाधिदेव महादेव शिव',
        'duration' => '15-20 मिनट',
        'synopsis' => 'एक निःसंतान धर्मात्मा साहूकार की शिव भक्ति, पुत्र प्राप्ति, अल्पायु संकट एवं महादेव-पार्वती जी के अनुग्रह से दीर्घायु जीवन की अमर गाथा।',
        'vrat_significance' => 'सोमवार का व्रत रखने से मानसिक शान्ति, रोग-शोक से मुक्ति, सुयोग्य जीवनसाथी और भगवान आशुतोष का अक्षय आशीर्वाद प्राप्त होता है।',
        'katha_text' => "किसी नगर में एक गुणवान साहूकार रहता था। उसके घर में धन-धान्य की कोई कमी न थी, किन्तु कोई संतान न होने से वह अत्यधिक दुःखी रहता था। वह प्रतिदिन शिव मन्दिर जाकर शिवलिंग पर जल और बेलपत्र अर्पित करता था। माता पार्वती ने साहूकार की निष्काम भक्ति देखकर महादेव से उस पर कृपा करने की प्रार्थना की। महादेव ने कहा—देवी! इसके भाग्य में पुत्र योग नहीं है, यदि दिया भी जाए तो वह मात्र बारह वर्ष की आयु तक ही जीवित रहेगा। साहूकार ने यह सब सुन लिया, फिर भी वह विचलित न हुआ।\n\nसाहूकार के घर एक सुन्दर पुत्र ने जन्म लिया। जब वह ग्यारह वर्ष का हुआ, तो साहूकार ने उसे उसके मामा के साथ काशी विद्याध्ययन के लिए भेजा और मार्ग में यज्ञ-हवन करते हुए ब्राह्मणों को भोजन कराने का निर्देश दिया। मार्ग में एक राजकुमारी के विवाह में धोखे से इस बालक का विवाह संपन्न हुआ।\n\nकाशी में जब बालक बारहवें वर्ष में प्रविष्ट हुआ, तो काल के प्रभाव से उसके प्राण पखेरू उड़ गए। उसके मामा विलाप करने लगे। उसी समय भगवान शिव और माता पार्वती वहां से निकले। माता पार्वती के करुण अनुग्रह पर औघड़दानी महादेव ने बालक को जीवनदान प्रदान किया। बालक अपनी वधू के साथ सकुशल घर लौटा।",
        'translation_hi' => 'भगवान भोलेनाथ भाव के भूखे हैं। सच्चे हृदय से किया गया सोमवार का व्रत अल्पायु संकट को भी टालकर जीवन में नवप्रभात ला देता है।',
        'translation_en' => 'Lord Shiva is easily pleased by pure devotion. Steadfast Monday fasting dispels all distress, prolongs longevity, and grants inner peace.',
        'translation_gu' => 'ભોળાનાથ માત્ર શ્રદ્ધા અને સમર્પણના ભૂખ્યા છે. સોમવારનું વ્રત જીવનના સઘળા સંકટો દૂર કરી સુખ અને દીર્ઘાયુ આપે છે.',
        'translation_mr' => 'भोळेनाथ केवळ निष्काम भक्तीने प्रसन्न होतात. सोमवारचे व्रत सर्व संकटांचे निवारण करून दीर्घायुष्य आणि शांती प्रदान करते.'
    ],
    [
        'id' => 'katha_mangalvar',
        'title' => 'मंगलवार व्रत कथा (श्री हनुमान कृपा)',
        'katha_name' => 'मंगलवार व्रत कथा (श्री हनुमान कृपा)',
        'sanskrit' => 'मङ्गलवारव्रतकथा हनुमत्कृपा',
        'category' => 'vrat_katha',
        'category_label' => 'साप्ताहिक व्रत कथा',
        'deity' => 'महावीर हनुमान जी',
        'duration' => '12-15 मिनट',
        'synopsis' => 'ब्राह्मण दम्पति केशव और अंजलि की निष्ठा, पवनपुत्र हनुमान जी की परीक्षा और मंगल दोष निवारण कर तेजस्वी पुत्र प्राप्ति की कथा।',
        'vrat_significance' => 'मंगलवार का व्रत रखने से मंगल ग्रह के क्रूर दोष शांत होते हैं, भय, भूत-पिशाच और शत्रुओं का नाश होता है तथा शक्ति और साहस की वृद्धि होती है।',
        'katha_text' => "प्राचीन काल में एक ब्राह्मण दम्पति रहते थे। ब्राह्मण का नाम केशव और ब्राह्मणी का नाम अंजलि था। उनके कोई सन्तान नहीं थी। ब्राह्मणी मंगलवार को नियमपूर्वक हनुमान जी का व्रत रखती थी और भोग लगाए बिना अन्न ग्रहण नहीं करती थी। एक बार किसी कारणवश ब्राह्मणी मंगलवार को भोग न बना सकी। उसने संकल्प लिया कि अगले मंगलवार को ही भोग लगाकर भोजन करेगी। छह दिन तक वह भूखी-प्यासी रही।\n\nसातवें दिन मंगलवार को वह मूर्छित हो गई। हनुमान जी उसकी अनन्य भक्ति देखकर अत्यंत प्रसन्न हुए और साक्षात् प्रकट होकर उसे एक अति सुन्दर बालक का वरदान दिया। उस बालक का नाम मंगल रखा गया। जब ब्राह्मण घर लौटा तो बालक को देखकर सन्देह करने लगा। एक दिन उसने कुएं में बालक को गिरा दिया। जब वह घर पहुंचा तो बालक को पूर्ववत आंगन में खेलते देखा। उसी रात्रि हनुमान जी ने स्वप्न में ब्राह्मण को दर्शन देकर ब्राह्मणी की सत्यनिष्ठा बताई। ब्राह्मण ने लज्जित होकर क्षमा मांगी।",
        'translation_hi' => 'हनुमान जी संकटमोचन हैं। मंगलवार का व्रत करने वाले साधक के जीवन से समस्त अमंगल दूर होकर सदा मंगल ही मंगल होता है।',
        'translation_en' => 'Lord Hanuman is the dispeller of all adversities. Tuesday observance cleanses astrological afflictions, instills immense valour, and bestows auspiciousness.',
        'translation_gu' => 'હનુમાનજી સંકટમોચન છે. મંગળવારનું વ્રત કરવાથી જીવનના તમામ અમંગળ દૂર થાય છે અને શક્તિ તથા સાહસ મળે છે.',
        'translation_mr' => 'हनुमान जी सर्व संकटांचे निवारण करणारे आहेत. मंगळवारच्या व्रताने भय, रोग आणि संकटे नष्ट होतात.'
    ],
    [
        'id' => 'katha_brihaspativar',
        'title' => 'गुरुवार (बृहस्पतिवार) व्रत कथा',
        'katha_name' => 'गुरुवार (बृहस्पतिवार) व्रत कथा',
        'sanskrit' => 'बृहस्पतिवारव्रतकथा गुरुप्रीतिकरी',
        'category' => 'vrat_katha',
        'category_label' => 'साप्ताहिक व्रत कथा',
        'deity' => 'देवगुरु बृहस्पति एवं श्री हरि विष्णु',
        'duration' => '15-20 मिनट',
        'synopsis' => 'अहंकारी रानी की दरिद्रता, देवगुरु बृहस्पति के व्रत-नियमों से पुनः ऐश्वर्य प्राप्ति और चने की दाल व गुड़ से पूजन का विधान।',
        'vrat_significance' => 'गुरुवार के व्रत से ज्ञान, विद्या, धन, सुखी वैवाहिक जीवन और देवगुरु बृहस्पति की कृपा से अटके हुए कार्य शीघ्र सिद्ध होते हैं।',
        'katha_text' => "एक प्रतापी राजा के राज्य में अपार सम्पदा थी, किन्तु उसकी रानी अत्यंत कृपण थी। जब भी कोई याचक महल के द्वार पर आता, वह उसे दुत्कार कर भगा देती। एक दिन देवगुरु बृहस्पति संन्यासी के वेश में पधारे और भिक्षा मांगी। रानी ने कहा—महाराज! मैं दान-पुण्य से तंग आ चुकी हूं, कोई ऐसा उपाय बताएं जिससे यह सारा धन समाप्त हो जाए और मुझे किसी को कुछ न देना पड़े। साधु ने कहा—यदि तुम्हारी यही इच्छा है, तो बृहस्पतिवार के दिन घर लीपकर पीली मिट्टी से पुतवाना, बाल धोना और पुरुषों से हजामत बनवाना।\n\nरानी ने वैसा ही किया। कुछ ही सप्ताह में राजा का सारा राजपाट और धन नष्ट हो गया। वे दाने-दाने को मोहताज हो गए। रानी पश्चाताप में रोने लगी। तब देवगुरु ने पुनः दर्शन देकर गुरुवार व्रत, चने की दाल, गुड़, हल्दी और केले के वृक्ष की पूजा का विधान बताया। रानी ने भक्तिपूर्वक व्रत किया और उसका वैभव पूर्ववत लौट आया।",
        'translation_hi' => 'विद्या और सद्बुद्धि ही सच्चा धन है। गुरुवार के व्रत से बुद्धि निर्मल होती है और अहंकार का नाश होकर जीवन में श्री-सम्पत्ति का वास होता है।',
        'translation_en' => 'Wisdom and benevolence are true riches. Devotion on Thursdays cleanses ego, revives lost fortune, and bestows intellect and grace.',
        'translation_gu' => 'વિદ્યા અને સદ્બુદ્ધિ જ સાચી સંપત્તિ છે. ગુરુવારના વ્રતથી જ્ઞાન, સંપત્તિ અને સુખી દાંપત્યજીવન પ્રાપ્ત થાય છે.',
        'translation_mr' => 'विद्या आणि विवेक हीच खरी संपत्ती आहे. गुरुवारच्या व्रताने विवेक जागृत होऊन ऐश्वर्य आणि शांती प्राप्त होते.'
    ],
    [
        'id' => 'katha_vaibhav_lakshmi',
        'title' => 'शुक्रवार वैभव लक्ष्मी व्रत कथा',
        'katha_name' => 'शुक्रवार वैभव लक्ष्मी व्रत कथा',
        'sanskrit' => 'वैभवलक्ष्मीव्रतकथा श्रीप्रदा',
        'category' => 'vrat_katha',
        'category_label' => 'साप्ताहिक व्रत कथा',
        'deity' => 'माता वैभव लक्ष्मी',
        'duration' => '15-20 मिनट',
        'synopsis' => 'शीला नामक साध्वी स्त्री की अटूट भक्ति, जुए और कुसंगत में फंसे पति का उद्धार और माता लक्ष्मी के अष्ट स्वरूपों की आराधना।',
        'vrat_significance' => 'शुक्रवार को वैभव लक्ष्मी का व्रत करने से घर में दारिद्र्य का नाश होता है, सुख-समृद्धि, व्यापार में उन्नति और गृह-क्लेश से मुक्ति मिलती है।',
        'katha_text' => "एक बड़े शहर में शीला नाम की एक धर्मपरायण स्त्री अपने पति के साथ रहती थी। उसका पति अत्यंत परिश्रमी और सुशील था। दोनों सुखी जीवन व्यतीत कर रहे थे। कालान्तर में उसका पति कुसंगति में पड़ गया और मद्यपान तथा जुए का आदी हो गया। सारा संचित धन समाप्त हो गया और घर में भुखमरी की नौबत आ गई।\n\nएक शुक्रवार को शीला के द्वार पर एक वृद्ध तेजस्विनी मां आई। शीला ने सत्कार कर अपने आंसुओं से उनका स्वागत किया। मां ने कहा—बेटी! मैं लक्ष्मी का स्वरूप हूं। तू निराश न हो। मां ने उसे शुक्रवार वैभव लक्ष्मी व्रत की सरल विधि बताई: श्रीयंत्र का पूजन, खीर का भोग और शुक्रवार की शाम को दीप प्रज्वलन। शीला ने पूर्ण निष्ठा से व्रत किया। उसके पति की बुद्धि शुद्ध हो गई, उसने कुसंगति त्याग दी और पुनः परिश्रम कर धन अर्जित करने लगा। घर में पुनः सुख-शान्ति और वैभव छा गया।",
        'translation_hi' => 'माता लक्ष्मी का वास वहीं होता है जहां सद्भाव, स्वच्छता और प्रेम है। वैभव लक्ष्मी व्रत से हर प्रकार का दारिद्र्य मिट जाता है।',
        'translation_en' => 'Goddess Lakshmi abides where truth, cleanliness, and harmony reign. Friday observance dispels poverty and fills homes with peace and prosperity.',
        'translation_gu' => 'જ્યાં પ્રેમ, સદ્ભાવ અને પવિત્રતા હોય છે ત્યાં લક્ષ્મીજી વાસ કરે છે. વૈભવ લક્ષ્મી વ્રતથી સર્વ કષ્ટો નાશ પામે છે.',
        'translation_mr' => 'जिथे स्वच्छता आणि सद्भाव असतो तिथेच लक्ष्मीचा वास असतो. वैभव लक्ष्मी व्रताने सर्व दारिद्र्य दूर होते.'
    ],
    [
        'id' => 'katha_shanivar',
        'title' => 'शनिवार व्रत कथा (शनि देव एवं नवग्रह)',
        'katha_name' => 'शनिवार व्रत कथा (शनि देव एवं नवग्रह)',
        'sanskrit' => 'शनिवारव्रतकथा सौरिकृपा',
        'category' => 'vrat_katha',
        'category_label' => 'साप्ताहिक व्रत कथा',
        'deity' => 'कर्मफलदाता शनि देव',
        'duration' => '18-22 मिनट',
        'synopsis' => 'नवग्रहों में ज्येष्ठता का विवाद, राजा विक्रमादित्य का न्याय, शनि देव का प्रकोप एवं अन्ततः क्षमा याचना कर सुख-शांति की पुनः प्राप्ति।',
        'vrat_significance' => 'शनिवार का व्रत रखने और पीपल पर दीप जलाने से साढ़ेसाती, ढैय्या, शनि पीड़ा और आकस्मिक संकटों का शमन होता है।',
        'katha_text' => "एक बार स्वर्गलोक में सूर्य, चन्द्र, मंगल, बुध, बृहस्पति, शुक्र, शनि, राहु और केतु—इन नवग्रहों में विवाद हुआ कि हममें सबसे श्रेष्ठ कौन है? निर्णय के लिए वे देवराज इन्द्र के पास गए। इन्द्र ने असमर्थता जताते हुए उन्हें पृथ्वी पर न्यायप्रिय राजा विक्रमादित्य के पास भेज दिया।\n\nराजा विक्रमादित्य ने नौ धातुओं—स्वर्ण, रजत, कांस्य, ताम्र, सीसा, रांगा, जस्ता, अभ्रक और लोहे के नौ आसन बनवाए। लोहे का आसन सबसे अंत में रखा गया। शनि देव लोहे के आसन पर बैठे और इसे अपना अपमान समझा। शनि देव ने विक्रमादित्य से कहा—राजा! तुम मुझे नहीं जानते। मेरी दृष्टि से कोई नहीं बच सकता। इसके बाद राजा पर शनि की साढ़ेसाती प्रारंभ हुई। राजा को देश निकाला मिला, हाथ-पैर कटवा दिए गए और वे एक तेली के घर कोल्हू चलाने लगे। जब विक्रमादित्य ने अपनी भूल स्वीकार कर शनिवार को दीप जलाकर शनि स्तुति की, तब शनि देव प्रसन्न हुए और उनके अंग पूर्ववत कर पुनः उज्जैन का राजा बना दिया।",
        'translation_hi' => 'शनि देव शत्रु नहीं, निष्पक्ष कर्मफलदाता हैं। जो सत्य के मार्ग पर चलता है और दीन-दुखियों की सेवा करता है, शनि देव उस पर असीम कृपा बरसाते हैं।',
        'translation_en' => 'Lord Shani is the righteous dispenser of karma. Genuine humility, service to the needy, and Saturday prayers avert distress and bless one with stability.',
        'translation_gu' => 'શનિદેવ ન્યાયના દેવ છે. સત્ય માર્ગે ચાલનાર અને ગરીબોની સેવા કરનાર પર શનિદેવ સદાય કૃપાળુ રહે છે.',
        'translation_mr' => 'शनिदेव कर्माचे फळ देणारे निष्पक्ष न्यायमूर्ती आहेत. सत्याचे आचरण करणाऱ्यांवर शनिदेवाची कृपा सदैव राहते.'
    ],
    [
        'id' => 'katha_samudra_manthan',
        'title' => 'समुद्र मंथन एवं अमृत प्राकट्य',
        'katha_name' => 'समुद्र मंथन एवं अमृत प्राकट्य',
        'sanskrit' => 'समुद्रमन्थनलीलाकथा',
        'category' => 'pauranik_katha',
        'category_label' => 'पौराणिक लीला कथा',
        'deity' => 'भगवान विष्णु, कुर्म अवतार एवं महादेव',
        'duration' => '20-25 मिनट',
        'synopsis' => 'दुर्वासा ऋषि का शाप, देवताओं का तेजहीन होना, मन्दराचल पर्वत और वासुकि नाग द्वारा क्षीरसागर मंथन, हलाहल विष और चौदह रत्नों का प्राकट्य।',
        'vrat_significance' => 'इस पावन कथा के श्रवण से मनुष्य का चित्त मंथन होता है, दुर्गुणों रूपी विष का शमन होकर सद्गुणों रूपी अमृत की प्राप्ति होती है।',
        'katha_text' => "श्रीमद्भागवत एवं विष्णु पुराण के अनुसार, एक बार महर्षि दुर्वासा ने देवराज इन्द्र को एक दिव्य पुष्पमाला भेंट की। ऐश्वर्य के मद में चूर इन्द्र ने वह माला अपने ऐरावत हाथी के मस्तक पर रख दी। हाथी ने माला को पैरों तले कुचल दिया। इस अपमान से कुपित होकर दुर्वासा ऋषि ने शाप दिया कि तुम्हारा तीनों लोकों का ऐश्वर्य और श्री नष्ट हो जाए। शाप के प्रभाव से देवता निर्बल हो गए और दैत्यराज बलि ने स्वर्ग पर अधिकार कर लिया।\n\nहताश देवता भगवान विष्णु की शरण में गए। श्रीहरि ने युक्ति दी कि दैत्यों से संधि कर क्षीरसागर का मंथन करो, जिससे अमृत निकलेगा। मन्दराचल पर्वत को मथानी और नागराज वासुकि को नेती बनाया गया। जब मन्दराचल समुद्र में डूबने लगा, तब भगवान विष्णु ने कच्छप (कूर्म) अवतार धारण कर पर्वत को अपनी पीठ पर संभाला। मंथन से सर्वप्रथम कालकूट हलाहल विष निकला, जिससे तीनों लोक जलने लगे। देवताओं की करुण पुकार पर भगवान शिव ने उस विष को पीकर अपने कण्ठ में धारण कर लिया, जिससे वे नीलकण्ठ कहलाए। तत्पश्चात् कामधेनु, उच्चैःश्रवा अश्व, ऐरावत, कौस्तुभ मणि, कल्पवृक्ष, रम्भा, महालक्ष्मी, वारुणी, धन्वन्तरि और अमृत कलश प्रकट हुए। मोहिनी रूप धरकर भगवान विष्णु ने देवताओं को अमृतपान कराया।",
        'translation_hi' => 'जीवन भी एक क्षीरसागर है। साधना रूपी मंथन में पहले विष (कष्ट और वासनाएं) बाहर आते हैं, जिन्हें धैर्य से सहना पड़ता है, तभी अंत में शांति रूपी अमृत प्राप्त होता है।',
        'translation_en' => 'Life is a cosmic ocean. Spiritual churning initially surfaces latent poisons which require poise, ultimately yielding divine nectar and inner illumination.',
        'translation_gu' => 'જીવન પણ એક સમુદ્ર મંથન સમાન છે. સાધનામાં પહેલા કષ્ટો આવે છે, જેને ધૈર્યથી સહન કરવાથી અંતે પરમાનંદનું અમૃત મળે છે.',
        'translation_mr' => 'जीवन देखील एका समुद्र मंथनासारखे आहे. आधी संकटरूपी विष पचवावे लागते, तेव्हाच आत्मिक शांतीचे अमृत लाभते.'
    ],
    [
        'id' => 'katha_shiva_vivah',
        'title' => 'शिव-पार्वती पावन विवाह कथा',
        'katha_name' => 'शिव-पार्वती पावन विवाह कथा',
        'sanskrit' => 'शिवपार्वतीकल्याणमहोत्सव',
        'category' => 'pauranik_katha',
        'category_label' => 'पौराणिक लीला कथा',
        'deity' => 'महादेव शिव एवं माता पार्वती',
        'duration' => '25-30 मिनट',
        'synopsis' => 'सती का देहत्याग, गिरिराज हिमवान के घर पार्वती के रूप में पुनर्जन्म, कठोर तपस्या, कामदेव दहन और महाशिवरात्रि के पावन परिणय की अनुपम गाथा।',
        'vrat_significance' => 'शिव-पार्वती विवाह कथा का पाठ करने से दांपत्य जीवन में मधुरता आती है, सुयोग्य जीवनसाथी मिलता है और घर में मंगलकारी ऊर्जा का संचार होता है।',
        'katha_text' => "दक्ष प्रजापति के यज्ञ में अपने पति महादेव का अपमान सहन न कर पाने के कारण माता सती ने योगाग्नि में अपने प्राणों की आहुति दे दी। इसके पश्चात् उन्होंने पर्वतराज हिमवान और मैनावती के घर उमा (पार्वती) के रूप में जन्म लिया। नारद जी ने माता-पिता को बताया कि इनका विवाह केवल दिगम्बर महादेव से ही सम्भव है। पार्वती जी ने वन में जाकर हजारों वर्षों तक निराहार रहकर कठोर तपस्या की।\n\nउनकी तपस्या की परीक्षा लेने स्वयं सप्तर्षि आए, किन्तु पार्वती जी अपने संकल्प पर अडिग रहीं—\"वरउँ संभु न त रहउँ कुआरी।\" दूसरी ओर तारकासुर के अत्याचार से त्रस्त देवताओं ने शिव जी की समाधि भंग करने कामदेव को भेजा। महादेव ने तीसरा नेत्र खोलकर कामदेव को भस्म कर दिया। अन्ततः पार्वती जी की अनन्य निष्ठा से प्रसन्न होकर भगवान शिव प्रकट हुए और विवाह का प्रस्ताव स्वीकार किया। महाशिवरात्रि के शुभ दिन नंदी, भृंगी, भूत, प्रेत और समस्त देवताओं की अद्भुत बारात लेकर महादेव हिमवान के नगर पहुंचे। ब्रह्मा जी ने विवाह के वैदिक मन्त्र पढ़े और माता पार्वती तथा महादेव का पावन परिणय सम्पन्न हुआ।",
        'translation_hi' => 'माता पार्वती का तप और भगवान शिव का संयम यह सिखाता है कि आत्मिक प्रेम और निष्ठा से ईश्वर को भी वशीभूत किया जा सकता है।',
        'translation_en' => 'Mother Parvati’s unwavering penance and Shiva’s cosmic stillness illustrate that sincere love and dedication surmount all worldly impediments.',
        'translation_gu' => 'માતા પાર્વતીની તપસ્યા અને મહાદેવની કૃપા દર્શાવે છે કે સાચી ભક્તિ અને નિષ્ઠાથી ઈશ્વરને પણ પામી શકાય છે.',
        'translation_mr' => 'माता पार्वतींचे खडतर तप आणि शंकरांचे औदार्य हेच सिद्ध करते की शुद्ध प्रेमाने ईश्वरही वश होतो.'
    ],
    [
        'id' => 'katha_gajendra_moksha',
        'title' => 'गजेन्द्र मोक्ष पावन उद्धार कथा',
        'katha_name' => 'गजेन्द्र मोक्ष पावन उद्धार कथा',
        'sanskrit' => 'गजेन्द्रमोक्षश्रीमद्भागवतमहात्म्य',
        'category' => 'pauranik_katha',
        'category_label' => 'पौराणिक लीला कथा',
        'deity' => 'भगवान श्री हरि विष्णु',
        'duration' => '15-18 मिनट',
        'synopsis' => 'ऋतुमान पर्वत पर हाथियों के राजा गजेन्द्र का सरोवर में प्रवेश, ग्राह (मगरमच्छ) द्वारा पैर पकड़ना, हजार वर्षों का संघर्ष और एक कमल पुष्प अर्पित कर प्रभु की शरणागति।',
        'vrat_significance' => 'गजेन्द्र मोक्ष का पाठ करने से असाध्य रोगों, मृत्यु भय, ऋण और जीवन के घोर संकटों से तत्काल मुक्ति मिलती है।',
        'katha_text' => "श्रीमद्भागवत महापुराण के अष्टम स्कन्ध में गजेन्द्र मोक्ष की परम पावन कथा है। त्रिकूट पर्वत पर गजेन्द्र नामक एक बलशाली गजराज रहता था। एक दिन वह अपनी हथिनियों और शावकों सहित एक रमणीक सरोवर में जलक्रीड़ा करने उतरा। उसी सरोवर में एक शक्तिशाली ग्राह (मगरमच्छ) रहता था। ग्राह ने गजेन्द्र के पैर को अपने जबड़ों में जकड़ लिया। गजेन्द्र ने छूटने का अथक प्रयास किया। उसके परिवार और साथी हाथियों ने भी खींचने की चेष्टा की, किन्तु जब ग्राह का बल बढ़ने लगा तो सभी साथी उसे असहाय छोड़कर चले गए।\n\nजल में ग्राह का बल हजार गुना था। यह द्वन्द्व युद्ध एक सहस्र (हजार) वर्षों तक चला। जब गजेन्द्र का शरीर अशक्त हो गया और अहंकार टूट गया, तब उसे पूर्वजन्म के संस्कारों से भगवान विष्णु का स्मरण हुआ। उसने सरोवर से अपनी सूंड में एक नीलकमल उठाया और आकाश की ओर उठाकर आर्तनाद किया: \"हे नाथ! हे नारायण! शरणागत की रक्षा करो।\" भक्त की करुण पुकार सुनते ही भगवान विष्णु गरुड़ पर सवार होकर तत्काल प्रकट हुए और अपने सुदर्शन चक्र से ग्राह का मुख विदीर्ण कर गजेन्द्र को जीवनदान और मोक्ष प्रदान किया।",
        'translation_hi' => 'जब मनुष्य अपने बल और सांसारिक सम्बन्धों का अहंकार त्यागकर प्रभु के चरणों में पूर्ण शरणागति लेता है, तब परमात्मा क्षणभर में संकट से उबार लेते हैं।',
        'translation_en' => 'When one completely surrenders pride and worldly reliances to the Supreme Divine, salvation and grace descend instantaneously.',
        'translation_gu' => 'જ્યારે માનવ અહંકાર છોડીને પ્રભુના શરણે જાય છે, ત્યારે ભગવાન પલભરમાં સહાય માટે દોડી આવે છે.',
        'translation_mr' => 'जेव्हा मनुष्य सर्व अहंकार सोडून ईश्वराला शरण जातो, तेव्हा परमात्मा एका क्षणात संकटमुक्त करतो.'
    ],
    [
        'id' => 'katha_ganga_avataran',
        'title' => 'गंगा अवतरण एवं भागीरथ तपस्या',
        'katha_name' => 'गंगा अवतरण एवं भागीरथ तपस्या',
        'sanskrit' => 'गङ्गावतरणभागीरथतपःकथा',
        'category' => 'pauranik_katha',
        'category_label' => 'पौराणिक लीला कथा',
        'deity' => 'माता गंगा, भगवान शिव एवं श्री हरि',
        'duration' => '18-22 मिनट',
        'synopsis' => 'राजा सगर के साठ हजार पुत्रों का कपिल मुनि के कोप से भस्म होना, राजा भागीरथ की कठोर तपस्या, शिव जी की जटाओं में गंगा का वेग समाना और पाताल लोक का उद्धार।',
        'vrat_significance' => 'गंगा अवतरण कथा के श्रवण से पितृ दोष शान्त होते हैं, अंतःकरण पवित्र होता है और पूर्वजों को सद्गति प्राप्त होती है।',
        'katha_text' => "सूर्यवंशी राजा सगर ने अश्वमेध यज्ञ किया। देवराज इन्द्र ने ईर्ष्यावश यज्ञ का घोड़ा चुराकर पाताल लोक में महर्षि कपिल के आश्रम में बांध दिया। घोड़े को खोजते हुए राजा सगर के साठ हजार पुत्र पाताल पहुंचे और कपिल मुनि को चोर समझकर उन पर प्रहार करने दौड़े। मुनि ने जैसे ही नेत्र खोले, उनके तपोबल की क्रोधाग्नि से साठों हजार राजकुमार भस्म हो गए। उनकी आत्माएं बिना तर्पण के भटकने लगीं।\n\nअनेक पीढ़ियों के पश्चात् राजा भागीरथ ने अपने पूर्वजों के उद्धार का दृढ़ संकल्प लिया। उन्होंने हिमालय पर जाकर ब्रह्मा जी की घोर तपस्या की। ब्रह्मा जी ने कहा—मैं गंगा को पृथ्वी पर भेजने को तैयार हूं, किन्तु उनके वेग को केवल भगवान शिव ही धारण कर सकते हैं। भागीरथ ने फिर एक पैर पर खड़े होकर महादेव की तपस्या की। भगवान शिव प्रसन्न हुए और उन्होंने गंगा के प्रचंड वेग को अपनी जटाओं में समेट लिया। इसके बाद गंगा की एक निर्मल धारा जटाओं से निकली और भागीरथ के पीछे-पीछे पाताल लोक पहुंची, जहां साठ हजार पूर्वजों की भस्म का स्पर्श कर उन्हें वैकुण्ठ लोक पहुंचा दिया।",
        'translation_hi' => 'असंभव को भी संभव कर दिखाने वाले संकल्प को ही \"भागीरथ प्रयास\" कहते हैं। दृढ़ निष्ठा और शिव कृपा से कोई भी लक्ष्य अप्राप्य नहीं है।',
        'translation_en' => 'Unrelenting perseverance aligned with divine grace can achieve the seemingly impossible, cleansing generations of hardship.',
        'translation_gu' => 'દ્રઢ સંકલ્પ અને શિવજીની કૃપાથી અસંભવ કાર્ય પણ સંભવ બને છે. ગંગા અવતરણ પવિત્રતા અને પુરુષાર્થનું પ્રતીક છે.',
        'translation_mr' => 'दृढ निश्चय आणि ईश्वराची कृपा असेल तर अशक्यही शक्य होते. भागीरथाचे प्रयत्न हेच मानवजातीचे आदर्श आहेत.'
    ]
];

if ($isSqlite) {
    $upsertSql = "INSERT OR REPLACE INTO `vrat_katha` (
        `id`, `title`, `katha_name`, `sanskrit`, `sanskrit_title`, `category`, `category_label`,
        `deity`, `deity_name`, `duration`, `synopsis`, `vrat_significance`, `katha_text`,
        `translation_hi`, `translation_en`, `translation_gu`, `translation_mr`, `is_featured`
    ) VALUES (
        :id, :title, :katha_name, :sanskrit, :sanskrit_title, :category, :category_label,
        :deity, :deity_name, :duration, :synopsis, :vrat_significance, :katha_text,
        :translation_hi, :translation_en, :translation_gu, :translation_mr, 1
    )";
} else {
    $upsertSql = "INSERT INTO `vrat_katha` (
        `id`, `title`, `katha_name`, `sanskrit`, `sanskrit_title`, `category`, `category_label`,
        `deity`, `deity_name`, `duration`, `synopsis`, `vrat_significance`, `katha_text`,
        `translation_hi`, `translation_en`, `translation_gu`, `translation_mr`, `is_featured`
    ) VALUES (
        :id, :title, :katha_name, :sanskrit, :sanskrit_title, :category, :category_label,
        :deity, :deity_name, :duration, :synopsis, :vrat_significance, :katha_text,
        :translation_hi, :translation_en, :translation_gu, :translation_mr, 1
    ) ON DUPLICATE KEY UPDATE 
        `title` = VALUES(`title`),
        `katha_name` = VALUES(`katha_name`),
        `sanskrit` = VALUES(`sanskrit`),
        `sanskrit_title` = VALUES(`sanskrit_title`),
        `category` = VALUES(`category`),
        `category_label` = VALUES(`category_label`),
        `deity` = VALUES(`deity`),
        `deity_name` = VALUES(`deity_name`),
        `duration` = VALUES(`duration`),
        `synopsis` = VALUES(`synopsis`),
        `vrat_significance` = VALUES(`vrat_significance`),
        `katha_text` = VALUES(`katha_text`),
        `translation_hi` = VALUES(`translation_hi`),
        `translation_en` = VALUES(`translation_en`),
        `translation_gu` = VALUES(`translation_gu`),
        `translation_mr` = VALUES(`translation_mr`),
        `is_featured` = 1";
}

$stmt = $db->prepare($upsertSql);

foreach ($kathas as $k) {
    $stmt->execute([
        ':id' => $k['id'],
        ':title' => $k['title'],
        ':katha_name' => $k['katha_name'],
        ':sanskrit' => $k['sanskrit'],
        ':sanskrit_title' => $k['sanskrit'],
        ':category' => $k['category'],
        ':category_label' => $k['category_label'],
        ':deity' => $k['deity'],
        ':deity_name' => $k['deity'],
        ':duration' => $k['duration'],
        ':synopsis' => $k['synopsis'],
        ':vrat_significance' => $k['vrat_significance'],
        ':katha_text' => $k['katha_text'],
        ':translation_hi' => $k['translation_hi'],
        ':translation_en' => $k['translation_en'],
        ':translation_gu' => $k['translation_gu'],
        ':translation_mr' => $k['translation_mr'],
    ]);
    $results["seeded_kathas"][] = $k['id'] . ' - ' . $k['title'];
}

echo json_encode([
    "status" => "success",
    "timestamp" => date('c'),
    "total_seeded" => count($results["seeded_kathas"]),
    "results" => $results
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
