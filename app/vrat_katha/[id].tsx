import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';
import { ScriptureReader } from '../../src/components/ScriptureReader';
import { parseScriptureContent } from '../../src/utils/scriptureParser';

export default function VratKathaDetailScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.getKathaDetails(id as string);
        if (isMounted) setData(res);
      } catch (e) {
        console.warn('Failed loading vrat katha details:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const parsed = parseScriptureContent(data);

  return (
    <ScriptureReader
      id={id as string}
      title={data?.title || data?.katha_name || 'Vrat Katha Mahatmya'}
      sanskritText={parsed.sanskritText}
      hindiText={parsed.hindiText}
      englishMeaning={parsed.englishMeaning}
      transliteration={parsed.transliteration}
      deityName={data?.deity || data?.deity_name || 'Vrat Katha'}
      audioUrl={data?.audio_url}
      categoryPath="katha"
      loading={loading}
      translationGu={data?.translation_gu}
      translationMr={data?.translation_mr}
    />
  );
}
