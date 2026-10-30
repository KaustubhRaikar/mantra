import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDB } from '../services/db';

export type SupportedLanguage = 
  | 'sa' // Sanskrit
  | 'hi' // Hindi
  | 'en' // English
  | 'gu' // Gujarati
  | 'mr' // Marathi
  | 'bn' // Bengali
  | 'te' // Telugu
  | 'ta' // Tamil
  | 'kn'; // Kannada

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  script: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari' },
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
];

const SQLITE_CACHE_KEY = 'CACHE_user_preferred_language';

interface LanguageContextType {
  language: SupportedLanguage;
  languageInfo: LanguageInfo;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, defaultVal?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'hi',
  languageInfo: SUPPORTED_LANGUAGES[0],
  setLanguage: async () => {},
  t: (_key, defaultVal) => defaultVal || '',
});

// Resilient on-device SQLite cache loaders
async function loadCachedLanguage(): Promise<SupportedLanguage> {
  try {
    const db = await getDB();
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM meta_store WHERE key = ?',
      [SQLITE_CACHE_KEY]
    );
    if (row?.value && SUPPORTED_LANGUAGES.some((l) => l.code === row.value)) {
      return row.value as SupportedLanguage;
    }
  } catch {
    // Default fallback
  }

  return 'hi';
}

async function persistCachedLanguage(lang: SupportedLanguage) {
  try {
    const db = await getDB();
    await db.runAsync(
      'INSERT OR REPLACE INTO meta_store (key, value) VALUES (?, ?)',
      [SQLITE_CACHE_KEY, lang]
    );
  } catch {}
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('hi');

  useEffect(() => {
    loadCachedLanguage().then((cachedLang) => {
      setLanguageState(cachedLang);
    });
  }, []);

  const setLanguage = async (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    await persistCachedLanguage(newLang);
  };

  const languageInfo = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Lightweight UI translation dictionary
  const t = (key: string, defaultVal?: string): string => {
    const dict = UI_STRINGS[key];
    if (dict && dict[language]) {
      return dict[language];
    }
    if (dict && dict['hi']) {
      return dict['hi'];
    }
    return defaultVal || key;
  };

  return (
    <LanguageContext.Provider value={{ language, languageInfo, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

export const UI_STRINGS: Record<string, Partial<Record<SupportedLanguage, string>>> = {
  home_tab: {
    sa: 'गृहम्',
    hi: 'होम',
    en: 'Home',
    gu: 'હોમ',
    mr: 'होम',
    bn: 'হোম',
    te: 'హోమ్',
    ta: 'முகப்பு',
    kn: 'ಮುಖಪುಟ',
  },
  categories_tab: {
    sa: 'स्तोत्रकोशः',
    hi: 'संग्रह',
    en: 'Treasury',
    gu: 'સંગ્રહ',
    mr: 'संग्रह',
    bn: 'সংগ্রহ',
    te: 'సేకరణ',
    ta: 'தொகுப்பு',
    kn: 'ಸಂಗ್ರಹ',
  },
  japa_tab: {
    sa: 'जपमाला',
    hi: 'जप साधना',
    en: 'Japa Counter',
    gu: 'જપ સાધના',
    mr: 'जप साधना',
    bn: 'জপ সাধনা',
    te: 'జప సాధన',
    ta: 'ஜெப சாதனை',
    kn: 'ಜಪ ಸಾಧನೆ',
  },
  profile_tab: {
    sa: 'आत्मविवरणम्',
    hi: 'प्रोफाइल',
    en: 'Profile',
    gu: 'પ્રોફાઇલ',
    mr: 'प्रोफाइल',
    bn: 'প্রোফাইল',
    te: 'ప్రొఫైల్',
    ta: 'சுயவிவரம்',
    kn: 'ಪ್ರೊಫೈಲ್',
  },
  todays_worship: {
    sa: 'अद्यतन-वारपूजा',
    hi: 'आज की दैनिक वार पूजा व मंत्र',
    en: "Today's Sacred Worship & Mantras",
    gu: 'આજની દૈનિક વાર પૂજા અને મંત્ર',
    mr: 'आजची दैनिक वार पूजा व मंत्र',
    bn: 'আজকের দৈনিক বার পূজা ও মন্ত্র',
    te: 'నేటి దైనిక వార పూజ మరియు మంత్రాలు',
    ta: 'இன்றைய தினசரி வார பூஜை மற்றும் மந்திரங்கள்',
    kn: 'ಇಂದಿನ ದೈನಂದಿನ ವಾರದ ಪೂಜೆ ಮತ್ತು ಮಂತ್ರಗಳು',
  },
  presiding_deity: {
    sa: 'अधिष्ठाता देवः',
    hi: 'अधिष्ठाता देव',
    en: 'Presiding Deity',
    gu: 'અધિષ્ઠાતા દેવ',
    mr: 'अधिष्ठाता देव',
    bn: 'অধিষ্ঠাতা দেব',
    te: 'అధిష్టాన దైవం',
    ta: 'தலைமை தெய்வம்',
    kn: 'ಅಧಿಷ್ಟಾನ ದೇವತೆ',
  },
  daily_mantra: {
    sa: 'दैनिकमन्त्रः',
    hi: 'दैनिक मंत्र',
    en: 'Daily Mantra',
    gu: 'દૈનિક મંત્ર',
    mr: 'दैनिक मंत्र',
    bn: 'দৈনিক মন্ত্র',
    te: 'దైనిక మంత్రం',
    ta: 'தினசரி மந்திரம்',
    kn: 'ದೈನಂದಿನ ಮಂತ್ರ',
  },
  daily_pooja_vidhi: {
    sa: 'दैनिकपूजाविधिः',
    hi: 'दैनिक पूजा विधि',
    en: 'Daily Pooja Vidhi',
    gu: 'દૈનિક પૂજા વિધિ',
    mr: 'दैनिक पूजा विधी',
    bn: 'দৈনিক পূজা পদ্ধতি',
    te: 'దైనిక పూజా విధానం',
    ta: 'தினசரி பூஜை முறை',
    kn: 'ದೈನಂದಿನ ಪೂಜಾ ವಿಧಾನ',
  },
  daily_aarti: {
    sa: 'दैनिकारती',
    hi: 'दैनिक आरती',
    en: 'Daily Aarti',
    gu: 'દૈનિક આરતી',
    mr: 'दैनिक आरती',
    bn: 'দৈনিক আরতি',
    te: 'దైనిక హారతి',
    ta: 'தினசரி ஆரத்தி',
    kn: 'ದೈನಂದಿನ ಆರತಿ',
  },
  begin_worship: {
    sa: 'पूजां प्रारभताम्',
    hi: 'पूजा प्रारम्भ करें',
    en: 'Begin Worship',
    gu: 'પૂજા પ્રારંભ કરો',
    mr: 'पूजा सुरू करा',
    bn: 'পূজা শুরু করুন',
    te: 'పూజ ప్రారంభించండి',
    ta: 'பூஜையைத் தொடங்குங்கள்',
    kn: 'ಪೂಜೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ',
  },
  chant_now: {
    sa: 'जपं कुरुत',
    hi: 'जप करें',
    en: 'Chant Mantra',
    gu: 'જપ કરો',
    mr: 'जप करा',
    bn: 'জপ করুন',
    te: 'జపించండి',
    ta: 'மந்திரம் ஜபிக்கவும்',
    kn: 'ಜಪಿಸಿ',
  },
  sacred_offerings: {
    sa: 'समर्पणीयद्रव्याणि',
    hi: 'पूजन सामग्री व नैवेद्य',
    en: 'Sacred Offerings & Naivedya',
    gu: 'પૂજન સામગ્રી અને નૈવેદ્ય',
    mr: 'पूजन साहित्य व नैवेद्य',
    bn: 'পূজনীয় সামগ্রী ও নৈবেদ্য',
    te: 'పూజా సామగ్రి మరియు నైవేద్యం',
    ta: 'பூஜைப் பொருட்கள் மற்றும் நெய்வேத்தியம்',
    kn: 'ಪೂಜಾ ಸಾಮಗ್ರಿ ಮತ್ತು ನೈವೇದ್ಯ',
  },
};
