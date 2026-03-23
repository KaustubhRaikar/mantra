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

export interface Mantra {
  id: string;
  mantra_name?: string;
  name?: string;
  title?: string;
  
  sanskrit_text?: string;
  sanskrit?: string;
  sanskrit_title?: string;
  
  transliteration?: string;
  translation_hindi?: string;
  translation_english?: string;
  category_id?: number;
  category_name?: string;
  audio_url?: string;
  views_count?: number;
  likes_count?: number;
}
