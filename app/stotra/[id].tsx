import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';
import { ScriptureReader } from '../../src/components/ScriptureReader';
import { parseScriptureContent } from '../../src/utils/scriptureParser';

export default function StotraDetailScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.getStotraDetails(id as string);
        setData(res);
      } catch (e) {
        console.warn('Failed loading stotra details:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const parsed = parseScriptureContent(data);

  return (
    <ScriptureReader
      id={id as string}
      title={data?.stotra_name || data?.title || 'Stotra Recitation'}
      sanskritText={parsed.sanskritText}
      hindiText={parsed.hindiText}
      englishMeaning={parsed.englishMeaning}
      transliteration={parsed.transliteration}
      deityName={data?.deity_name || data?.god || 'Divine Stotra'}
      audioUrl={data?.audio_url}
      categoryPath="stotra"
      loading={loading}
    />
  );
}
