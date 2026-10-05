export type RootStackParamList = {
  '(tabs)': undefined;
  'mantra/[id]': { id: string; name?: string };
  'search/index': { query?: string };
};

export type TabParamList = {
  index: undefined;
  categories: undefined;
  favorites: undefined;
  profile: undefined;
};

// For Categories Screen toggle
export type ViewMode = 'grid' | 'list';

export interface CanonicalEntity {
  id: string | number;
  name: string;
  deity: string;
  sanskrit: string;
  transliteration: string;
  translation_en: string;
  translation_hi: string;
  meaning: string | string[];
  benefits: Array<{ icon: string; text: string }>;
  audio_url: string | null;
  category_id: number | null;
  category_name: string;
  path: string;
  [key: string]: any; // Backward compatibility for extra fields
}

export interface Mantra extends CanonicalEntity {
  mantra_name?: string;
  title?: string;
  sanskrit_text?: string;
  sanskrit_title?: string;
  translation_hindi?: string;
  translation_english?: string;
  views_count?: number;
  likes_count?: number;
}
