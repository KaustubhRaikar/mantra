import assert from 'assert';
import { normalizeMantra, normalizeEntity } from '../normalizer';

export async function testNormalizers() {
  console.log('[Test] Running Entity Normalizers Unit Test...');

  // Test 1: Legacy Mantra payload
  const legacyMantra = {
    id: 1,
    mantra_name: 'Om Namah Shivaya',
    god: 'Lord Shiva',
    sanskrit_text: 'ॐ नमः शिवाय',
    translation_english: 'Salutations to Shiva',
    translation_hindi: 'शिव को प्रणाम',
    audio_url: 'https://mantra.aarambhtech.in/assets/audio/mantras_1.mp3',
  };

  const normalized = normalizeMantra(legacyMantra);
  assert.strictEqual(normalized.id, 1);
  assert.strictEqual(normalized.name, 'Om Namah Shivaya');
  assert.strictEqual(normalized.deity, 'Lord Shiva');
  assert.strictEqual(normalized.sanskrit, 'ॐ नमः शिवाय');
  assert.strictEqual(normalized.translation_en, 'Salutations to Shiva');
  assert.strictEqual(normalized.translation_hi, 'शिव को प्रणाम');
  assert.strictEqual(normalized.audio_url, 'https://mantra.aarambhtech.in/assets/audio/mantras_1.mp3');
  assert.strictEqual(normalized.path, 'mantra');

  // Test 2: Null/Empty object fallback
  const emptyEntity = normalizeEntity(null, 'aarti');
  assert.strictEqual(emptyEntity.name, 'Sacred Chant');
  assert.strictEqual(emptyEntity.deity, 'Divine');
  assert.strictEqual(emptyEntity.path, 'aarti');

  console.log('✓ Entity Normalizers Unit Test Passed Successfully!');
}

testNormalizers().catch((err) => {
  console.error('✗ Normalizer Test Failed:', err);
  process.exit(1);
});
