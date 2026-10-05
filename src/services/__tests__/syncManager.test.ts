import assert from 'assert';

// Intercept native modules before loading syncManager
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id: string) {
  if (id === 'expo-secure-store') {
    return {
      getItemAsync: async () => null,
      setItemAsync: async () => {},
      deleteItemAsync: async () => {},
    };
  }
  if (id === 'react-native') {
    return {
      AppState: {
        addEventListener: () => ({ remove: () => {} }),
      },
    };
  }
  if (id === 'expo-sqlite') {
    return {
      openDatabaseAsync: async () => ({
        runAsync: async () => {},
        execAsync: async () => {},
        getAllAsync: async () => [],
      }),
    };
  }
  return originalRequire.apply(this, arguments);
};

const { mergeJaapLogs, mergeFavorites } = require('../syncManager');

export async function testSyncManager() {
  console.log('[Test] Running Sync Merge Unit Test...');

  // Test 1: Jaap Logs merge (taking max totalChants and completedMalas per date)
  const localJaap = [
    { date: '2026-10-05', formattedDate: '5 Oct 2026', totalChants: 108, completedMalas: 1 },
    { date: '2026-10-04', formattedDate: '4 Oct 2026', totalChants: 216, completedMalas: 2 },
  ];

  const remoteJaap = [
    { date: '2026-10-05', formattedDate: '5 Oct 2026', totalChants: 324, completedMalas: 3 }, // Higher counts
    { date: '2026-10-03', formattedDate: '3 Oct 2026', totalChants: 108, completedMalas: 1 }, // Only in remote
  ];

  const mergedJaap = mergeJaapLogs(localJaap, remoteJaap);
  assert.strictEqual(mergedJaap.length, 3, 'Merged Jaap logs should contain 3 dates');

  const oct5 = mergedJaap.find((d: any) => d.date === '2026-10-05');
  assert.ok(oct5, '2026-10-05 log should exist');
  assert.strictEqual(oct5?.totalChants, 324, '2026-10-05 totalChants should take max (324)');
  assert.strictEqual(oct5?.completedMalas, 3, '2026-10-05 completedMalas should take max (3)');

  const oct4 = mergedJaap.find((d: any) => d.date === '2026-10-04');
  assert.strictEqual(oct4?.totalChants, 216, '2026-10-04 totalChants should retain local value');

  // Test 2: Favorites merge (set-union with tombstones and timestamp precedence)
  const localFavs = [
    { id: '1', name: 'Gayatri Mantra', updated_at: 1000, is_deleted: 0 },
    { id: '2', name: 'Mahamrityunjaya Mantra', updated_at: 2000, is_deleted: 0 },
  ];

  const remoteFavs = [
    { id: '1', name: 'Gayatri Mantra', updated_at: 1500, is_deleted: 1 }, // Deleted newer in remote
    { id: '3', name: 'Shiva Chalisa', updated_at: 1200, is_deleted: 0 },  // Only in remote
  ];

  const mergedFavs = mergeFavorites(localFavs, remoteFavs);
  assert.strictEqual(mergedFavs.length, 3, 'Merged favorites set-union should contain 3 items');

  const item1 = mergedFavs.find((f: any) => String(f.id) === '1');
  assert.strictEqual(item1?.is_deleted, 1, 'Item 1 should be deleted because remote tombstone is newer (1500 > 1000)');

  const item2 = mergedFavs.find((f: any) => String(f.id) === '2');
  assert.strictEqual(item2?.is_deleted, 0, 'Item 2 should remain active (local only)');

  const item3 = mergedFavs.find((f: any) => String(f.id) === '3');
  assert.strictEqual(item3?.is_deleted, 0, 'Item 3 should be added from remote');

  console.log('✓ Sync Merge Unit Test Passed Successfully!');
}

testSyncManager().catch((err) => {
  console.error('✗ Sync Test Failed:', err);
  process.exit(1);
});
