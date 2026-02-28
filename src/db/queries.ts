import { useSQLiteContext } from 'expo-sqlite';
import { CategoryOrAll, QuoteRow, SETTINGS_KEYS } from './schema';

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getSetting(
  db: ReturnType<typeof useSQLiteContext>,
  key: string
): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM user_settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export async function setSetting(
  db: ReturnType<typeof useSQLiteContext>,
  key: string,
  value: string
): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}

// ─── Quote Selection ──────────────────────────────────────────────────────────

export async function selectDailyQuote(
  db: ReturnType<typeof useSQLiteContext>,
  category: CategoryOrAll
): Promise<QuoteRow | null> {
  // Cutoff date: 365 days ago
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 365);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  let query: string;
  let params: (string | number)[];

  if (category === 'all') {
    query = `
      SELECT q.id, q.text, q.author, q.category FROM quotes q
      WHERE q.id NOT IN (
        SELECT quote_id FROM quote_history WHERE shown_date >= ?
      )
      ORDER BY RANDOM() LIMIT 1
    `;
    params = [cutoffStr];
  } else {
    query = `
      SELECT q.id, q.text, q.author, q.category FROM quotes q
      WHERE q.id NOT IN (
        SELECT quote_id FROM quote_history WHERE shown_date >= ?
      )
      AND q.category = ?
      ORDER BY RANDOM() LIMIT 1
    `;
    params = [cutoffStr, category];
  }

  const row = await db.getFirstAsync<QuoteRow>(query, params);
  return row ?? null;
}

export async function recordQuoteShown(
  db: ReturnType<typeof useSQLiteContext>,
  quoteId: string,
  date: string
): Promise<void> {
  await db.runAsync(
    'INSERT INTO quote_history (quote_id, shown_date) VALUES (?, ?)',
    [quoteId, date]
  );
}

export async function getQuoteById(
  db: ReturnType<typeof useSQLiteContext>,
  quoteId: string
): Promise<QuoteRow | null> {
  const row = await db.getFirstAsync<QuoteRow>(
    'SELECT id, text, author, category FROM quotes WHERE id = ?',
    [quoteId]
  );
  return row ?? null;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

export async function getCachedTodayQuote(
  db: ReturnType<typeof useSQLiteContext>
): Promise<QuoteRow | null> {
  const today = new Date().toISOString().split('T')[0];
  const cachedDate = await getSetting(db, SETTINGS_KEYS.TODAY_QUOTE_DATE);

  if (cachedDate !== today) {
    return null;
  }

  const cachedId = await getSetting(db, SETTINGS_KEYS.TODAY_QUOTE_ID);
  if (!cachedId) {
    return null;
  }

  return getQuoteById(db, cachedId);
}

export async function cacheTodayQuote(
  db: ReturnType<typeof useSQLiteContext>,
  quote: QuoteRow
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await setSetting(db, SETTINGS_KEYS.TODAY_QUOTE_DATE, today);
  await setSetting(db, SETTINGS_KEYS.TODAY_QUOTE_ID, quote.id);
}

export async function clearTodayCache(
  db: ReturnType<typeof useSQLiteContext>
): Promise<void> {
  await db.runAsync('DELETE FROM user_settings WHERE key IN (?, ?)', [
    SETTINGS_KEYS.TODAY_QUOTE_DATE,
    SETTINGS_KEYS.TODAY_QUOTE_ID,
  ]);
}

// ─── History Pruning ──────────────────────────────────────────────────────────

export async function pruneOldHistory(
  db: ReturnType<typeof useSQLiteContext>
): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 400); // keep a bit extra
  const cutoffStr = cutoffDate.toISOString().split('T')[0];
  await db.runAsync('DELETE FROM quote_history WHERE shown_date < ?', [cutoffStr]);
}
