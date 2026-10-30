import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../contexts/LanguageContext';

export interface ResolvedTranslation {
  text: string;
  language: SupportedLanguage;
  isFallback: boolean;
  label: string;
}

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  sa: 'संस्कृतम्',
  hi: 'हिन्दी भावार्थ',
  en: 'English Meaning',
  gu: 'ગુજરાતી ભાવાર્થ',
  mr: 'मराठी भावार्थ',
  bn: 'বাংলা ভাবার্থ',
  te: 'తెలుగు అర్థం',
  ta: 'தமிழ் பொருள்',
  kn: 'ಕನ್ನಡ ಭಾವಾರ್ಥ',
};

/**
 * Resilient Multi-Language Translation Resolver
 * Checks regional language translation fields, cascading down to Hindi, then English.
 */
export function resolveScriptureTranslation(
  scripture: any,
  targetLang: SupportedLanguage
): ResolvedTranslation {
  if (!scripture) {
    return {
      text: '',
      language: targetLang,
      isFallback: false,
      label: LANGUAGE_LABELS[targetLang] || 'Translation',
    };
  }

  // 1. Sanskrit Direct Access
  if (targetLang === 'sa') {
    const sanskrit = scripture.sanskrit || scripture.sanskrit_text || scripture.text || '';
    return {
      text: sanskrit,
      language: 'sa',
      isFallback: false,
      label: LANGUAGE_LABELS.sa,
    };
  }

  // 2. English Direct Access
  if (targetLang === 'en') {
    const english =
      scripture.translation_en ||
      scripture.translation_english ||
      scripture.meaning_en ||
      scripture.meaning ||
      scripture.description ||
      '';
    return {
      text: typeof english === 'string' ? english : JSON.stringify(english),
      language: 'en',
      isFallback: false,
      label: LANGUAGE_LABELS.en,
    };
  }

  // 3. Hindi Direct Access
  if (targetLang === 'hi') {
    const hindi =
      scripture.translation_hi ||
      scripture.translation_hindi ||
      scripture.meaning_hi ||
      '';
    if (hindi) {
      return {
        text: hindi,
        language: 'hi',
        isFallback: false,
        label: LANGUAGE_LABELS.hi,
      };
    }
  }

  // 4. Regional Target (gu, mr, bn, te, ta, kn)
  const regionalKey = `translation_${targetLang}`;
  const regionalMeaningKey = `meaning_${targetLang}`;
  const directRegional = scripture[regionalKey] || scripture[regionalMeaningKey];

  if (directRegional && typeof directRegional === 'string' && directRegional.trim().length > 0) {
    return {
      text: directRegional,
      language: targetLang,
      isFallback: false,
      label: LANGUAGE_LABELS[targetLang] || `${targetLang.toUpperCase()} Translation`,
    };
  }

  // Fallback Phase 1: Try Hindi
  const hindiFallback =
    scripture.translation_hi ||
    scripture.translation_hindi ||
    scripture.meaning_hi;
  if (hindiFallback && typeof hindiFallback === 'string' && hindiFallback.trim().length > 0) {
    const targetInfo = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);
    return {
      text: hindiFallback,
      language: 'hi',
      isFallback: true,
      label: `${targetInfo?.nativeName || targetLang} (हिन्दी भावार्थ)`,
    };
  }

  // Fallback Phase 2: Try English
  const englishFallback =
    scripture.translation_en ||
    scripture.translation_english ||
    scripture.meaning_en ||
    scripture.meaning ||
    scripture.description;
  if (englishFallback && typeof englishFallback === 'string' && englishFallback.trim().length > 0) {
    return {
      text: englishFallback,
      language: 'en',
      isFallback: true,
      label: `${targetLang.toUpperCase()} (English Meaning)`,
    };
  }

  return {
    text: '',
    language: targetLang,
    isFallback: false,
    label: LANGUAGE_LABELS[targetLang] || 'Translation',
  };
}

/**
 * Get Tab Name for ScriptureReader based on the selected language
 */
export function getScriptureReaderTranslationTabName(lang: SupportedLanguage): string {
  switch (lang) {
    case 'gu':
      return 'ગુજરાતી';
    case 'mr':
      return 'मराठी';
    case 'bn':
      return 'বাংলা';
    case 'te':
      return 'తెలుగు';
    case 'ta':
      return 'தமிழ்';
    case 'kn':
      return 'ಕನ್ನಡ';
    case 'en':
      return 'English';
    case 'hi':
    default:
      return 'हिन्दी';
  }
}
