<?php
/**
 * Scripture CMS & Curation Management
 */

$pageTitle = "Scriptural Content Management (CMS)";
require_once __DIR__ . '/includes/header.php';

// Canonical Scripture sample data (Simulating database/API records conforming to SCHEMA.md)
$scriptures = [
    [
        'id' => 1,
        'name' => 'Gayatri Mantra',
        'deity' => 'Surya / Savitur',
        'category' => 'Mantra',
        'sanskrit' => 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
        'transliteration' => 'Om Bhur Bhuvah Swah Tat Savitur Varenyam...',
        'audio_status' => 'ACTIVE',
        'views' => 24890
    ],
    [
        'id' => 2,
        'name' => 'Maha Mrityunjaya Mantra',
        'deity' => 'Lord Shiva',
        'category' => 'Mantra',
        'sanskrit' => 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात्॥',
        'transliteration' => 'Om Tryambakam Yajamahe Sugandhim...',
        'audio_status' => 'ACTIVE',
        'views' => 31400
    ],
    [
        'id' => 3,
        'name' => 'Shri Hanuman Chalisa',
        'deity' => 'Lord Hanuman',
        'category' => 'Chalisa',
        'sanskrit' => 'श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि। बरनउँ रघुबर बिमल जसु जो दायकु फल चारि॥',
        'transliteration' => 'Shri Guru Charana Saroja Raja...',
        'audio_status' => 'ACTIVE',
        'views' => 45200
    ],
    [
        'id' => 4,
        'name' => 'Shri Shiv Aarti (Om Jai Shiv Omkara)',
        'deity' => 'Lord Shiva',
        'category' => 'Aarti',
        'sanskrit' => 'ॐ जय शिव ओंकारा, स्वामी जय शिव ओंकारा। ब्रह्मा, विष्णु, सदाशिव, अर्द्धांगी धारा॥',
        'transliteration' => 'Om Jai Shiva Omkara, Swami Jai...',
        'audio_status' => 'ACTIVE',
        'views' => 18900
    ],
    [
        'id' => 5,
        'name' => 'Shiva Tandava Stotram',
        'deity' => 'Lord Shiva',
        'category' => 'Stotra',
        'sanskrit' => 'जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्॥',
        'transliteration' => 'Jatatavigalajjala Pravahapavitasthale...',
        'audio_status' => 'ACTIVE',
        'views' => 28100
    ],
    [
        'id' => 6,
        'name' => 'Isha Upanishad (Verse 1)',
        'deity' => 'Brahman',
        'category' => 'Upanishad',
        'sanskrit' => 'ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत्। तेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्॥',
        'transliteration' => 'Isha Vasyam Idam Sarvam...',
        'audio_status' => 'PENDING',
        'views' => 9400
    ],
    [
        'id' => 7,
        'name' => 'Ganesh Chaturthi Pooja Vidhi',
        'deity' => 'Lord Ganesha',
        'category' => 'Pooja Vidhi',
        'sanskrit' => 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
        'transliteration' => 'Vakratunda Mahakaya Suryakoti...',
        'audio_status' => 'ACTIVE',
        'views' => 14200
    ]
];

$message = null;

// Handle Add Scripture Action
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_scripture') {
    if (!WebSecurity::verifyCsrfToken($_POST['csrf_token'] ?? null)) {
        $message = ['type' => 'danger', 'text' => 'Security token invalid. Please try again.'];
    } else {
        $name = WebSecurity::sanitizeString($_POST['name'] ?? '', 150);
        $deity = WebSecurity::sanitizeString($_POST['deity'] ?? '', 100);
        $category = WebSecurity::sanitizeString($_POST['category'] ?? '', 50);
        $sanskrit = WebSecurity::normalizeDevanagari($_POST['sanskrit'] ?? '');

        if (!empty($name) && !empty($sanskrit)) {
            $message = ['type' => 'success', 'text' => "Scripture '{$name}' normalized and scheduled for scholarship review & vector ingestion."];
        } else {
            $message = ['type' => 'danger', 'text' => 'Title and Devanagari text are mandatory.'];
        }
    }
}
?>

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
    <div>
        <h2 style="font-size: 1.3rem; color: #fff; font-family: var(--font-heading); margin-bottom: 4px;">Sacred Texts Catalog (v1 &amp; v2 Data)</h2>
        <p style="font-size: 0.85rem; color: var(--text-mid);">Manage Mantras, Aartis, Chalisas, Stotras, and Ritual Guides</p>
    </div>
    <button class="btn-action btn-gold" onclick="document.getElementById('addModal').style.display = 'flex'">
        <span>+ Add Sacred Scripture</span>
    </button>
</div>

<?php if ($message): ?>
    <div style="padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; background: <?= $message['type'] === 'success' ? 'rgba(46,204,113,0.15)' : 'rgba(255,59,48,0.15)' ?>; color: <?= $message['type'] === 'success' ? '#2ecc71' : '#ff7675' ?>; border: 1px solid <?= $message['type'] === 'success' ? '#2ecc71' : '#ff3b30' ?>;">
        <?= htmlspecialchars($message['text'], ENT_QUOTES, 'UTF-8') ?>
    </div>
<?php endif; ?>

<!-- Scripture Table -->
<div class="glass-card" style="padding: 0; overflow: hidden;">
    <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-glass); display: flex; gap: 12px; align-items: center;">
        <input type="text" id="searchInput" placeholder="Search scriptures by name, deity, or Sanskrit..." onkeyup="filterTable()" style="flex: 1; padding: 10px 14px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-glass); border-radius: 8px; color: #fff; font-size: 0.9rem;">
        <select id="categoryFilter" onchange="filterTable()" style="padding: 10px 14px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-glass); border-radius: 8px; color: #fff; font-size: 0.9rem;">
            <option value="">All Categories</option>
            <option value="Mantra">Mantras</option>
            <option value="Aarti">Aartis</option>
            <option value="Chalisa">Chalisas</option>
            <option value="Stotra">Stotras</option>
            <option value="Upanishad">Upanishads</option>
            <option value="Pooja Vidhi">Pooja Vidhis</option>
        </select>
    </div>

    <table class="data-table" id="scripturesTable">
        <thead>
            <tr>
                <th style="width: 50px;">ID</th>
                <th>Sacred Name</th>
                <th>Associated Deity</th>
                <th>Category</th>
                <th style="min-width: 280px;">Devanagari Sanskrit Text</th>
                <th>Audio State</th>
                <th>Views</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($scriptures as $item): ?>
                <tr>
                    <td style="color: var(--text-low); font-weight: 600;">#<?= $item['id'] ?></td>
                    <td>
                        <strong style="color: #ffffff;"><?= htmlspecialchars($item['name'], ENT_QUOTES, 'UTF-8') ?></strong>
                    </td>
                    <td>
                        <span style="color: var(--accent-gold); font-weight: 500;"><?= htmlspecialchars($item['deity'], ENT_QUOTES, 'UTF-8') ?></span>
                    </td>
                    <td>
                        <span style="padding: 3px 8px; border-radius: 4px; background: rgba(108, 92, 231, 0.2); color: #a29bfe; font-size: 0.78rem; font-weight: 600;">
                            <?= htmlspecialchars($item['category'], ENT_QUOTES, 'UTF-8') ?>
                        </span>
                    </td>
                    <td style="font-family: var(--font-sanskrit); font-size: 1.05rem; color: #fff; line-height: 1.5;">
                        <?= htmlspecialchars($item['sanskrit'], ENT_QUOTES, 'UTF-8') ?>
                    </td>
                    <td>
                        <?php if ($item['audio_status'] === 'ACTIVE'): ?>
                            <span style="color: #2ecc71; font-size: 0.8rem; font-weight: 600;">● MP3 Hosted</span>
                        <?php else: ?>
                            <span style="color: #f39c12; font-size: 0.8rem; font-weight: 600;">○ In Queue</span>
                        <?php endif; ?>
                    </td>
                    <td style="color: var(--text-mid);"><?= number_format($item['views']) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<!-- Modal: Add New Scripture -->
<div id="addModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
    <div style="background: var(--cosmic-surface); border: 1px solid var(--border-glow); border-radius: 16px; padding: 32px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="color: #fff; font-size: 1.2rem; font-family: var(--font-heading);">Add Canonical Scripture</h3>
            <button onclick="document.getElementById('addModal').style.display = 'none'" style="background: none; border: none; color: #fff; font-size: 24px; cursor: pointer;">&times;</button>
        </div>

        <form method="POST" action="scriptures.php">
            <input type="hidden" name="action" value="add_scripture">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8') ?>">

            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--text-high);">Title / Sacred Name *</label>
                <input type="text" name="name" required placeholder="e.g. Shiva Tandava Stotram" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); border-radius: 8px; color: #fff;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <label style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--text-high);">Deity *</label>
                    <input type="text" name="deity" required placeholder="e.g. Lord Shiva" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); border-radius: 8px; color: #fff;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--text-high);">Category *</label>
                    <select name="category" style="width: 100%; padding: 10px; background: var(--cosmic-dark); border: 1px solid var(--border-glass); border-radius: 8px; color: #fff;">
                        <option value="Mantra">Mantra</option>
                        <option value="Aarti">Aarti</option>
                        <option value="Chalisa">Chalisa</option>
                        <option value="Stotra">Stotra</option>
                        <option value="Upanishad">Upanishad</option>
                        <option value="Pooja Vidhi">Pooja Vidhi</option>
                    </select>
                </div>
            </div>

            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--text-high);">Devanagari Sanskrit Text *</label>
                <textarea name="sanskrit" rows="3" required placeholder="ॐ नमः शिवाय..." style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); border-radius: 8px; color: #fff; font-family: var(--font-sanskrit); font-size: 1.1rem;"></textarea>
            </div>

            <div style="margin-bottom: 24px;">
                <label style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--text-high);">English Transliteration</label>
                <input type="text" name="transliteration" placeholder="Om Namah Shivaya..." style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); border-radius: 8px; color: #fff;">
            </div>

            <button type="submit" class="btn-action btn-gold" style="width: 100%; justify-content: center; padding: 12px;">Submit for Verification</button>
        </form>
    </div>
</div>

<script>
    function filterTable() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value.toLowerCase();
        const rows = document.querySelectorAll('#scripturesTable tbody tr');

        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            const matchesQuery = !query || text.includes(query);
            const matchesCat = !category || text.includes(category);
            row.style.display = (matchesQuery && matchesCat) ? '' : 'none';
        });
    }
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
