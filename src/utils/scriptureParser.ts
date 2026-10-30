/**
 * Scripture Text Normalizer & Parser
 * Converts various scripture database schemas (JSON arrays, raw verses, pooja steps, katha chapters)
 * into structured text streams and component-ready models for ScriptureReader.
 */

export interface ParsedPoojaStep {
  step: number;
  name: string;
  description: string;
}

export interface ParsedSamagriItem {
  item: string;
  quantity?: string;
}

export interface ParsedVidhiMeta {
  duration?: string;
  bestTime?: string;
  day?: string;
  benefits?: string;
  precautions?: string;
  significance?: string;
}

export interface ParsedNamavaliItem {
  number: number;
  name: string;
  meaning?: string;
}

export interface ParsedScripture {
  sanskritText: string;
  hindiText?: string;
  englishMeaning?: string;
  transliteration?: string;
  poojaSteps?: ParsedPoojaStep[];
  samagriItems?: ParsedSamagriItem[];
  vidhiMeta?: ParsedVidhiMeta;
  namavaliItems?: ParsedNamavaliItem[];
  isNamavali?: boolean;
}

function safeParseJson(val: any): any {
  if (!val) return null;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        return JSON.parse(trimmed);
      } catch (_) {
        return null;
      }
    }
  }
  return null;
}

export function parseScriptureContent(data: any): ParsedScripture {
  if (!data) {
    return { sanskritText: '' };
  }

  // 1. Pooja Vidhi structured steps and samagri list
  if (data.steps || data.required_items || data.vidhi_name) {
    const rawSteps = safeParseJson(data.steps) || (Array.isArray(data.steps) ? data.steps : null);
    const rawItems = safeParseJson(data.required_items) || 
      (Array.isArray(data.required_items) ? data.required_items : null) ||
      (Array.isArray(data.samagri) ? data.samagri : null);

    const poojaSteps: ParsedPoojaStep[] = Array.isArray(rawSteps)
      ? rawSteps.map((s: any, idx: number) => ({
          step: typeof s.step === 'number' ? s.step : idx + 1,
          name: s.name || s.title || `चरण ${idx + 1}`,
          description: s.description || s.text || s.vidhi || '',
        }))
      : [];

    const samagriItems: ParsedSamagriItem[] = Array.isArray(rawItems)
      ? rawItems.map((i: any) => ({
          item: typeof i === 'string' ? i : (i.item || i.name || String(i)),
          quantity: typeof i === 'object' && i.quantity ? i.quantity : '',
        }))
      : data.samagri_list
      ? String(data.samagri_list)
          .split(/[,;\n]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((item) => ({ item, quantity: '' }))
      : [];

    const vidhiMeta: ParsedVidhiMeta = {
      duration: data.duration || data.vidhi_duration,
      bestTime: data.best_time || data.bestTime,
      day: data.day,
      benefits: data.benefits,
      precautions: data.precautions,
      significance: data.significance,
    };

    // Formatted fallback text strings for standard text-readers, sharing, or copying
    const formattedStepsText = poojaSteps.length > 0
      ? poojaSteps
          .map((s) => `चरण ${s.step}: ${s.name}\n${s.description}`)
          .join('\n\n')
      : typeof data.steps === 'string' && !data.steps.trim().startsWith('[')
      ? data.steps
      : data.description || '';

    const formattedSamagriText = samagriItems.length > 0
      ? samagriItems
          .map((i) => `• ${i.item}${i.quantity ? ` (${i.quantity})` : ''}`)
          .join('\n')
      : data.samagri_list || '';

    const detailsParts: string[] = [];
    if (vidhiMeta.duration) detailsParts.push(`⏱️ अवधि (Duration): ${vidhiMeta.duration}`);
    if (vidhiMeta.bestTime) detailsParts.push(`🌅 शुभ समय (Best Time): ${vidhiMeta.bestTime}`);
    if (vidhiMeta.day) detailsParts.push(`📅 वार (Day): ${vidhiMeta.day}`);
    if (vidhiMeta.significance) detailsParts.push(`\n✨ महत्व (Significance):\n${vidhiMeta.significance}`);
    if (vidhiMeta.benefits) detailsParts.push(`\n🙏 लाभ एवं फल (Benefits):\n${vidhiMeta.benefits}`);
    if (vidhiMeta.precautions) detailsParts.push(`\n⚠️ सावधानियां (Precautions):\n${vidhiMeta.precautions}`);

    return {
      sanskritText: formattedStepsText,
      hindiText: formattedSamagriText || undefined,
      englishMeaning: detailsParts.length > 0 ? detailsParts.join('\n') : data.description || undefined,
      poojaSteps,
      samagriItems,
      vidhiMeta,
    };
  }

  // 2. Vrat Katha Chapters
  if (data.katha_chapters) {
    const rawChapters = safeParseJson(data.katha_chapters) || (Array.isArray(data.katha_chapters) ? data.katha_chapters : null);
    if (Array.isArray(rawChapters) && rawChapters.length > 0) {
      const formattedChapters = rawChapters
        .map((c: any, idx: number) => {
          const title = c.title ? `अध्याय ${c.chapter || idx + 1} — ${c.title}` : `अध्याय ${c.chapter || idx + 1}`;
          return `${title}\n\n${c.story || c.text || ''}`;
        })
        .join('\n\n═══════════════════════\n\n');

      const hindiParts: string[] = [];
      if (data.opening_verse) hindiParts.push(`आरंभिक श्लोक:\n${data.opening_verse}`);
      if (data.vidhi) hindiParts.push(`\nव्रत विधि:\n${data.vidhi}`);
      if (data.rules) hindiParts.push(`\nनियम:\n${data.rules}`);
      if (data.closing_verse) hindiParts.push(`\nसमापन श्लोक:\n${data.closing_verse}`);

      return {
        sanskritText: formattedChapters,
        hindiText: hindiParts.length > 0 ? hindiParts.join('\n\n') : undefined,
        englishMeaning: data.benefits || data.significance || data.description,
      };
    }
  }

  // 3. Direct lyrics or text field
  if (data.lyrics || data.sanskrit || data.sanskrit_text) {
    return {
      sanskritText: data.lyrics || data.sanskrit || data.sanskrit_text || '',
      hindiText: data.meaning_hi || data.translation_hi,
      englishMeaning: data.meaning || data.meaning_en || data.translation || data.description,
      transliteration: data.transliteration,
    };
  }

  // 4. JSON-encoded verses array or object with namavali (chalisas, stotras, sahasranamas)
  if (data.verses) {
    const parsedPayload = safeParseJson(data.verses);
    let rawVerses: any[] = [];
    let namavaliItems: ParsedNamavaliItem[] = [];
    let isNamavali = false;

    if (Array.isArray(parsedPayload)) {
      rawVerses = parsedPayload;
    } else if (parsedPayload && typeof parsedPayload === 'object') {
      rawVerses = Array.isArray(parsedPayload.verses) ? parsedPayload.verses : [];
      if (Array.isArray(parsedPayload.namavali)) {
        namavaliItems = parsedPayload.namavali.map((n: any, idx: number) => ({
          number: typeof n.number === 'number' ? n.number : idx + 1,
          name: typeof n === 'string' ? n : (n.name || ''),
          meaning: n.meaning || undefined,
        }));
      }
      isNamavali = Boolean(parsedPayload.is_namavali || namavaliItems.length > 0);
    } else if (Array.isArray(data.verses)) {
      rawVerses = data.verses;
    }

    if (rawVerses.length > 0 || namavaliItems.length > 0) {
      let sanskritLines = rawVerses
        .map((v: any) => v.text || v.sanskrit || '')
        .filter(Boolean)
        .join('\n\n');

      if (!sanskritLines && namavaliItems.length > 0) {
        sanskritLines = namavaliItems.map((n) => `${n.number}. ${n.name}`).join('\n');
      }

      const hindiLines = rawVerses
        .map((v: any) => v.translation_hindi || '')
        .filter(Boolean)
        .join('\n\n');

      const englishLines = rawVerses
        .map((v: any) => v.translation_english || '')
        .filter(Boolean)
        .join('\n\n');

      const translitLines = rawVerses
        .map((v: any) => v.transliteration || '')
        .filter(Boolean)
        .join('\n\n');

      return {
        sanskritText: sanskritLines,
        hindiText: hindiLines || undefined,
        englishMeaning: englishLines || data.description || undefined,
        transliteration: translitLines || undefined,
        namavaliItems: namavaliItems.length > 0 ? namavaliItems : undefined,
        isNamavali,
      };
    } else if (typeof data.verses === 'string') {
      return {
        sanskritText: data.verses,
        englishMeaning: data.description,
      };
    }
  }

  // 5. Default fallback
  return {
    sanskritText: data.description || 'पावन श्लोक एवं पाठ उपलब्ध है।',
  };
}
