import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDB = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('mantra.db');
    await initTables(dbInstance);
  }
  return dbInstance;
};

const initTables = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS jaap_logs (
      date TEXT PRIMARY KEY,
      formatted_date TEXT NOT NULL,
      total_chants INTEGER NOT NULL DEFAULT 0,
      completed_malas INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recently_played (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sanskrit TEXT,
      category TEXT,
      path TEXT NOT NULL,
      played_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recent_searches (
      query TEXT PRIMARY KEY,
      searched_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meta_store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
};
