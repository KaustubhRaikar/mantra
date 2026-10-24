import { getDB } from './db';

export interface Anushthan {
  id: string;
  title: string;
  deity: string;
  mantraText: string;
  targetMalas: number;
  targetDays: number;
  completedMalas: number;
  completedBeads: number;
  completedDays: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  lastPracticedDate?: string;
  streak: number;
  createdAt: number;
}

export interface AnushthanPreset {
  id: string;
  title: string;
  deity: string;
  mantraText: string;
  targetDays: number;
  dailyMalas: number;
  totalMalas: number;
  description: string;
}

export const ANUSHTHAN_PRESETS: AnushthanPreset[] = [
  {
    id: 'gayatri_21',
    title: '21-दिवसीय गायत्री महामंत्र अनुष्ठान',
    deity: 'गायत्री माता / सूर्य',
    mantraText: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    targetDays: 21,
    dailyMalas: 11,
    totalMalas: 231,
    description: 'बुद्धि, विवेक एवं आत्मिक तेज की शुद्धि हेतु 21 दिवसीय साधना।',
  },
  {
    id: 'hanuman_40',
    title: '40-दिवसीय संकटमोचन हनुमान चालीसा संकल्प',
    deity: 'श्री हनुमान',
    mantraText: 'ॐ हं हनुमते रुद्रात्मकाय हुं फट्॥ / श्री हनुमान चालीसा',
    targetDays: 40,
    dailyMalas: 11,
    totalMalas: 440,
    description: 'भय, संकट निवारण एवं असीम साहस की प्राप्ति हेतु सिद्ध चालीसा संकल्प।',
  },
  {
    id: 'shiva_16_somvar',
    title: '16-सोमवार शिव पंचाक्षर संकल्प',
    deity: 'भगवान शिव',
    mantraText: 'ॐ नमः शिवाय॥',
    targetDays: 16,
    dailyMalas: 5,
    totalMalas: 80,
    description: 'मनोकामना पूर्ति एवं मानसिक शांति हेतु 16 सोमवार का पवित्र व्रत अनुष्ठान।',
  },
  {
    id: 'navarna_9',
    title: '9-दिवसीय नवरात्रि नवार्ण शक्ति अनुष्ठान',
    deity: 'माँ भगवती दुर्गा',
    mantraText: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे॥',
    targetDays: 9,
    dailyMalas: 9,
    totalMalas: 81,
    description: 'नवरात्रि में नवदुर्गा की कृपा एवं समस्त विघ्न बाधाओं के शमन का पावन संकल्प।',
  },
];

const getTodayDateString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const sankalpaStorage = {
  getActiveAnushthan: async (): Promise<Anushthan | null> => {
    try {
      const db = await getDB();
      const row = await db.getFirstAsync<any>(
        `SELECT * FROM user_anushthans WHERE status = 'active' ORDER BY created_at DESC LIMIT 1`
      );
      if (!row) return null;
      return {
        id: row.id,
        title: row.title,
        deity: row.deity,
        mantraText: row.mantra_text,
        targetMalas: row.target_malas,
        targetDays: row.target_days,
        completedMalas: row.completed_malas,
        completedBeads: row.completed_beads,
        completedDays: row.completed_days,
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status,
        lastPracticedDate: row.last_practiced_date,
        streak: row.streak,
        createdAt: row.created_at,
      };
    } catch (e) {
      console.warn('Failed to get active anushthan:', e);
      return null;
    }
  },

  getAllAnushthans: async (): Promise<Anushthan[]> => {
    try {
      const db = await getDB();
      const rows = await db.getAllAsync<any>(
        `SELECT * FROM user_anushthans ORDER BY created_at DESC`
      );
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        deity: row.deity,
        mantraText: row.mantra_text,
        targetMalas: row.target_malas,
        targetDays: row.target_days,
        completedMalas: row.completed_malas,
        completedBeads: row.completed_beads,
        completedDays: row.completed_days,
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status,
        lastPracticedDate: row.last_practiced_date,
        streak: row.streak,
        createdAt: row.created_at,
      }));
    } catch (e) {
      console.warn('Failed to get all anushthans:', e);
      return [];
    }
  },

  createAnushthan: async (data: {
    title: string;
    deity: string;
    mantraText: string;
    targetDays: number;
    dailyMalas: number;
  }): Promise<Anushthan> => {
    const db = await getDB();
    const id = `sankalpa_${Date.now()}`;
    const today = getTodayDateString();

    const endDateObj = new Date();
    endDateObj.setDate(endDateObj.getDate() + data.targetDays);
    const endY = endDateObj.getFullYear();
    const endM = String(endDateObj.getMonth() + 1).padStart(2, '0');
    const endD = String(endDateObj.getDate()).padStart(2, '0');
    const endDate = `${endY}-${endM}-${endD}`;

    const totalTargetMalas = data.targetDays * data.dailyMalas;

    // Pause any currently active anushthan
    await db.runAsync(
      `UPDATE user_anushthans SET status = 'paused' WHERE status = 'active'`
    );

    await db.runAsync(
      `INSERT INTO user_anushthans (
        id, title, deity, mantra_text, target_malas, target_days,
        completed_malas, completed_beads, completed_days, start_date, end_date,
        status, last_practiced_date, streak, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, 'active', NULL, 0, ?)`,
      [
        id,
        data.title,
        data.deity,
        data.mantraText,
        totalTargetMalas,
        data.targetDays,
        today,
        endDate,
        Date.now(),
      ]
    );

    return {
      id,
      title: data.title,
      deity: data.deity,
      mantraText: data.mantraText,
      targetMalas: totalTargetMalas,
      targetDays: data.targetDays,
      completedMalas: 0,
      completedBeads: 0,
      completedDays: 0,
      startDate: today,
      endDate,
      status: 'active',
      streak: 0,
      createdAt: Date.now(),
    };
  },

  recordAnushthanProgress: async (beadsIncrement: number = 1): Promise<void> => {
    try {
      const active = await sankalpaStorage.getActiveAnushthan();
      if (!active) return;

      const db = await getDB();
      const today = getTodayDateString();

      const newBeads = active.completedBeads + beadsIncrement;
      const newMalas = Math.floor(newBeads / 108);

      let newStreak = active.streak;
      let newDays = active.completedDays;

      if (active.lastPracticedDate !== today) {
        newDays += 1;
        newStreak += 1;
      }

      const isFinished = newMalas >= active.targetMalas || newDays >= active.targetDays;
      const newStatus = isFinished ? 'completed' : 'active';

      await db.runAsync(
        `UPDATE user_anushthans SET
          completed_beads = ?,
          completed_malas = ?,
          completed_days = ?,
          last_practiced_date = ?,
          streak = ?,
          status = ?
        WHERE id = ?`,
        [newBeads, newMalas, newDays, today, newStreak, newStatus, active.id]
      );
    } catch (e) {
      console.warn('Failed to record anushthan progress:', e);
    }
  },

  completeAnushthan: async (id: string): Promise<void> => {
    try {
      const db = await getDB();
      await db.runAsync(
        `UPDATE user_anushthans SET status = 'completed' WHERE id = ?`,
        [id]
      );
    } catch (e) {
      console.warn('Failed to complete anushthan:', e);
    }
  },
};
