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
    (async () => {
      setLoading(true);
      try {
        const res = await api.getVratKathaDetails(id as string);
        setData(res);
      } catch (e) {
        console.warn('Failed loading vrat katha details:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const parsed = parseScriptureContent(data);

  return (
    <ScriptureReader
      id={id as string}
      title={data?.katha_name || data?.title || 'Vrat Katha Mahatmya'}
      sanskritText={parsed.sanskritText}
      hindiText={parsed.hindiText}
      englishMeaning={parsed.englishMeaning}
      transliteration={parsed.transliteration}
      deityName={data?.deity_name || data?.god || 'Vrat Katha'}
      audioUrl={data?.audio_url}
      categoryPath="vrat_katha"
      loading={loading}
    />
  );
}
