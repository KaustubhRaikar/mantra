import assert from 'assert';

const store: Record<string, string> = {
  jaapLog: JSON.stringify([
    { date: '2026-10-01', formattedDate: '1 Oct 2026', totalChants: 108, completedMalas: 1 },
    { date: '2026-10-02', formattedDate: '2 Oct 2026', totalChants: 216, completedMalas: 2 },
  ]),
  recentlyPlayed: JSON.stringify([
    { id: '1', name: 'Gayatri Mantra', path: 'mantra' }
  ]),
  recentSearches: JSON.stringify(['Shiva', 'Gayatri']),
};

const deletedKeys: string[] = [];

// Intercept module require for native modules before loading storageMigration
const Module = require('module');
const originalRequire = Module.prototype.require;

const mockDB = {
  execAsync: async () => {},
  runAsync: async () => {},
  getFirstAsync: async (query: string) => {
    if (query.includes('meta_store')) return null;
    if (query.includes('recent_searches')) return { cnt: 2 };
    if (query.includes('recently_played')) return { cnt: 1 };
    if (query.includes('jaap_logs')) return { cnt: 2 };
    return null;
  },
};

Module.prototype.require = function (id: string) {
  if (id === 'expo-secure-store') {
    return {
      getItemAsync: async (key: string) => store[key] || null,
      setItemAsync: async (key: string, val: string) => { store[key] = val; },
      deleteItemAsync: async (key: string) => {
        delete store[key];
        deletedKeys.push(key);
      },
    };
  }
  if (id === 'expo-sqlite') {
    return {
      openDatabaseAsync: async () => mockDB,
    };
  }
  return originalRequire.apply(this, arguments);
};

const { runStorageMigration } = require('../storageMigration');

export async function testStorageMigration() {
  console.log('[Test] Running Storage Migration Unit Test...');
  const res = await runStorageMigration();

  assert.strictEqual(res.migrated, true, 'Migration should complete successfully');
  assert.strictEqual(res.jaapLogCount, 2, 'Should migrate 2 jaap log entries');
  assert.strictEqual(res.searchesCount, 2, 'Should migrate 2 search queries');
  assert.strictEqual(res.playedCount, 1, 'Should migrate 1 played item');
  assert.strictEqual(res.errors.length, 0, 'Should have 0 errors');

  assert.ok(deletedKeys.includes('jaapLog'), 'jaapLog key should be deleted from SecureStore');
  assert.ok(deletedKeys.includes('recentlyPlayed'), 'recentlyPlayed key should be deleted from SecureStore');
  assert.ok(deletedKeys.includes('recentSearches'), 'recentSearches key should be deleted from SecureStore');

  console.log('✓ Storage Migration Unit Test Passed Successfully!');
}

testStorageMigration().catch((err) => {
  console.error('✗ Migration Test Failed:', err);
  process.exit(1);
});
