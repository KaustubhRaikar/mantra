# 📐 MANTRA APP — CANONICAL DATA SCHEMA (v1)

> **Document Purpose:** Canonical schema specification for backend APIs, mobile client normalizers, and the AI data ingestion pipeline.  
> **Last Updated:** October 2026

---

## 🏛️ Standard Canonical Entity Schema (`CanonicalEntity`)

All content entities (Mantras, Aartis, Festival Aartis, Chalisas, Pooja Vidhis, Stotras, Vrat Kathas, Upanishads) conform to the canonical JSON structure outlined below.

### 1. Schema Properties

| Canonical Field | Type | Description | Legacy Fallback Aliases |
|---|---|---|---|
| `id` | `string \| number` | Unique primary identifier | `id` |
| `name` | `string` | Human-readable title of the chant/text | `mantra_name`, `title`, `aarti_name`, `chalisa_name`, `vidhi_name`, `stotra_name`, `katha_name` |
| `deity` | `string` | Associated Hindu deity or god | `god`, `deity_name`, `category_name` |
| `sanskrit` | `string` | Devanagari script text | `sanskrit_text`, `sanskrit_title`, `text`, `katha_text` |
| `transliteration` | `string` | Latin script phonetic transliteration | `transliteration` |
| `translation_en` | `string` | English translation | `translation_english` |
| `translation_hi` | `string` | Hindi translation | `translation_hindi` |
| `meaning` | `string \| string[]` | Word-by-word or stanza meaning | `meaning` |
| `benefits` | `Array<{ icon: string, text: string }>` | Spiritual/health benefits | `benefits` |
| `audio_url` | `string \| null` | Server-hosted MP3 audio file URL | `audio_url` |
| `category_id` | `number \| null` | Category ID reference | `category_id` |
| `category_name` | `string` | Category display name | `category_name`, `festival_category`, `category` |
| `path` | `string` | Route path identifier | `'mantra'`, `'aarti'`, `'chalisa'`, `'pooja_vidhi'`, `'stotra'`, `'vrat_katha'`, `'upanishad'` |

---

## 📦 2. Example Canonical JSON Payload

```json
{
  "id": "1",
  "name": "Gayatri Mantra",
  "deity": "Surya",
  "sanskrit": "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
  "transliteration": "Om Bhur Bhuvah Swaha Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat",
  "translation_en": "We meditate on the glory of the Creator Who has created the Universe...",
  "translation_hi": "हम ईश्वर की उस महिमा का ध्यान करते हैं जिसने ब्रह्मांड की रचना की...",
  "meaning": [
    "Om: The primordial sound",
    "Bhur: The physical plane",
    "Bhuvah: The astral plane",
    "Swaha: The celestial plane"
  ],
  "benefits": [
    { "icon": "sparkles", "text": "Enhances mental clarity & focus" },
    { "icon": "shield", "text": "Protects against negative energies" }
  ],
  "audio_url": "https://mantra.aarambhtech.in/assets/audio/mantras_1.mp3",
  "category_id": 6,
  "category_name": "Vedic",
  "path": "mantra"
}
```

---
*Maintained by Engineering Team & AI Data Pipeline Architect.*
