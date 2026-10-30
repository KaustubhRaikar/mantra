import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';
import { ScriptureReader } from '../../src/components/ScriptureReader';
import { parseScriptureContent } from '../../src/utils/scriptureParser';

export default function MantraDetailScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        let res;
        if (id.toString().startsWith('u_')) {
          res = await api.getUpanishad(id as string);
        } else {
          res = await api.getMantra(id as string);
        }
        setData(res);
      } catch (e) {
        console.warn('Failed loading mantra details:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const parsed = parseScriptureContent(data);
  const rawTitle = data?.title || data?.name || data?.mantra_name;
  const deity = data?.god || data?.category_name || data?.deity || 'Vedic Devotion';

  return (
    <ScriptureReader
      id={id as string}
      title={rawTitle || deity || 'ॐ नमः शिवाय'}
      sanskritText={parsed.sanskritText || data?.sanskrit || data?.sanskrit_text || data?.sanskrit_title}
      hindiText={parsed.hindiText || data?.translation_hindi || data?.meaning_hi || data?.translation_hi}
      englishMeaning={parsed.englishMeaning || data?.translation_english || data?.meaning || data?.meaning_en || data?.translation}
      transliteration={parsed.transliteration || data?.transliteration}
      deityName={deity}
      audioUrl={data?.audio_url}
      categoryPath="mantra"
      loading={loading}
    />
  );
}
