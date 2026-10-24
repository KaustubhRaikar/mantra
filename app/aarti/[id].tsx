import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';
import { ScriptureReader } from '../../src/components/ScriptureReader';

export default function AartiDetailScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.getAartiDetails(id as string);
        setData(res);
      } catch (e) {
        console.warn('Failed loading aarti details:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <ScriptureReader
      id={id as string}
      title={data?.aarti_name || data?.title || 'Aarti Sangrah'}
      sanskritText={data?.lyrics || data?.sanskrit || data?.sanskrit_text}
      hindiText={data?.meaning_hi || data?.translation_hi}
      englishMeaning={data?.meaning || data?.translation || data?.description}
      transliteration={data?.transliteration}
      deityName={data?.deity_name || data?.god || 'Aarti Devotion'}
      audioUrl={data?.audio_url}
      categoryPath="aarti"
      loading={loading}
    />
  );
}
