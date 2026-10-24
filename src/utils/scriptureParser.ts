/**
 * Scripture Text Normalizer & Parser
 * Converts various scripture database schemas (JSON arrays, raw verses, lyrics)
 * into structured text streams for ScriptureReader.
 */

export interface ParsedScripture {
  sanskritText: string;
  hindiText?: string;
  englishMeaning?: string;
  transliteration?: string;
}

export function parseScriptureContent(data: any): ParsedScripture {
  if (!data) {
    return { sanskritText: '' };
  }

  // 1. Direct lyrics or text field
  if (data.lyrics || data.sanskrit || data.sanskrit_text) {
    return {
      sanskritText: data.lyrics || data.sanskrit || data.sanskrit_text || '',
      hindiText: data.meaning_hi || data.translation_hi,
      englishMeaning: data.meaning || data.meaning_en || data.translation || data.description,
      transliteration: data.transliteration,
    };
  }

  // 2. JSON-encoded verses array (chalisas, stotras, pooja vidhis)
  if (data.verses) {
    try {
      const verses = typeof data.verses === 'string' ? JSON.parse(data.verses) : data.verses;
      if (Array.isArray(verses) && verses.length > 0) {
        const sanskritLines = verses
          .map((v: any) => v.text || v.sanskrit || '')
          .filter(Boolean)
          .join('\n\n');

        const hindiLines = verses
          .map((v: any) => v.translation_hindi || '')
          .filter(Boolean)
          .join('\n\n');

        const englishLines = verses
          .map((v: any) => v.translation_english || '')
          .filter(Boolean)
          .join('\n\n');

        const translitLines = verses
          .map((v: any) => v.transliteration || '')
          .filter(Boolean)
          .join('\n\n');

        return {
          sanskritText: sanskritLines,
          hindiText: hindiLines || undefined,
          englishMeaning: englishLines || data.description || undefined,
          transliteration: translitLines || undefined,
        };
      }
    } catch (e) {
      // Fallback to string
      return {
        sanskritText: String(data.verses),
        englishMeaning: data.description,
      };
    }
  }

  // 3. Pooja Vidhi steps or Katha chapters
  if (data.steps || data.katha_text || data.vidhi_text) {
    const mainText = data.steps || data.katha_text || data.vidhi_text || data.description || '';
    return {
      sanskritText: mainText,
      englishMeaning: data.significance || data.benefits || data.description,
    };
  }

  return {
    sanskritText: data.description || 'Scripture text is being prepared.',
  };
}
