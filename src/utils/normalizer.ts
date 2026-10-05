import { CanonicalEntity } from '../types/navigation';

export const normalizeEntity = (raw: any, fallbackPath: string = 'mantra'): CanonicalEntity => {
  if (!raw) {
    return {
      id: '',
      name: 'Sacred Chant',
      deity: 'Divine',
      sanskrit: '',
      transliteration: '',
      translation_en: '',
      translation_hi: '',
      meaning: [],
      benefits: [],
      audio_url: null,
      category_id: null,
      category_name: 'Divine',
      path: fallbackPath,
    };
  }

  const name =
    raw.name ||
    raw.title ||
    raw.mantra_name ||
    raw.aarti_name ||
    raw.chalisa_name ||
    raw.vidhi_name ||
    raw.stotra_name ||
    raw.katha_name ||
    'Sacred Chant';

  const deity =
    raw.deity ||
    raw.god ||
    raw.deity_name ||
    raw.category_name ||
    raw.category ||
    raw.festival_category ||
    'Divine';

  const sanskrit =
    raw.sanskrit ||
    raw.sanskrit_text ||
    raw.sanskrit_title ||
    raw.text ||
    raw.katha_text ||
    raw.description ||
    '';

  const transliteration = raw.transliteration || '';
  const translation_en = raw.translation_en || raw.translation_english || '';
  const translation_hi = raw.translation_hi || raw.translation_hindi || '';

  const meaning = raw.meaning || [];
  const benefits = Array.isArray(raw.benefits) ? raw.benefits : [];

  const audio_url = raw.audio_url || null;
  const category_id = raw.category_id !== undefined && raw.category_id !== null ? Number(raw.category_id) : null;
  const category_name = raw.category_name || raw.category || raw.festival_category || deity;

  const path = raw.path || fallbackPath;

  return {
    ...raw,
    id: raw.id !== undefined && raw.id !== null ? raw.id : '',
    name,
    deity,
    sanskrit,
    transliteration,
    translation_en,
    translation_hi,
    meaning,
    benefits,
    audio_url,
    category_id,
    category_name,
    path,
  };
};

export const normalizeMantra = (raw: any): CanonicalEntity => normalizeEntity(raw, 'mantra');
export const normalizeAarti = (raw: any): CanonicalEntity => normalizeEntity(raw, 'aarti');
export const normalizeFestivalAarti = (raw: any): CanonicalEntity => normalizeEntity(raw, 'festival_aarti');
export const normalizeChalisa = (raw: any): CanonicalEntity => normalizeEntity(raw, 'chalisa');
export const normalizePoojaVidhi = (raw: any): CanonicalEntity => normalizeEntity(raw, 'pooja_vidhi');
export const normalizeStotra = (raw: any): CanonicalEntity => normalizeEntity(raw, 'stotra');
export const normalizeVratKatha = (raw: any): CanonicalEntity => normalizeEntity(raw, 'vrat_katha');
export const normalizeUpanishad = (raw: any): CanonicalEntity => normalizeEntity(raw, 'upanishad');
