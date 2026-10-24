import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';
import { ScriptureReader } from '../../src/components/ScriptureReader';

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

  return (
    <ScriptureReader
      id={id as string}
      title={data?.title || data?.name || 'Mantra Details'}
      sanskritText={data?.sanskrit || data?.sanskrit_text || data?.sanskrit_title}
      hindiText={data?.meaning_hi || data?.translation_hi}
      englishMeaning={data?.meaning || data?.meaning_en || data?.translation}
      transliteration={data?.transliteration}
      deityName={data?.god || data?.category_name || 'Vedic Devotion'}
      audioUrl={data?.audio_url}
      categoryPath="mantra"
      loading={loading}
    />
  );
}
