import { type SQLiteDatabase } from 'expo-sqlite';
import { ALL_DDL, DB_VERSION } from './schema';

const CHUNK_SIZE = 500;

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  // Check if already initialized
  const versionResult = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  if (versionResult && versionResult.user_version >= DB_VERSION) {
    return;
  }

  // Create tables
  for (const ddl of ALL_DDL) {
    await db.execAsync(ddl);
  }

  // Seed quotes
  await seedQuotes(db);

  // Mark as initialized
  await db.execAsync(`PRAGMA user_version = ${DB_VERSION}`);
}

async function seedQuotes(db: SQLiteDatabase): Promise<void> {
  // Check if quotes already seeded
  const count = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM quotes'
  );
  if (count && count.count > 0) {
    return;
  }

  // Load quotes from bundled JSON
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const quotesData = require('../../assets/data/quotes.json') as Array<{
    id: string;
    text: string;
    author: string | null;
    category: string;
  }>;

  // Insert in chunks within a single transaction
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < quotesData.length; i += CHUNK_SIZE) {
      const chunk = quotesData.slice(i, i + CHUNK_SIZE);
      const placeholders = chunk.map(() => '(?, ?, ?, ?)').join(', ');
      const values = chunk.flatMap((q) => [q.id, q.text, q.author ?? null, q.category]);

      await db.runAsync(
        `INSERT OR IGNORE INTO quotes (id, text, author, category) VALUES ${placeholders}`,
        values
      );
    }
  });
}
