export type Category = 'motivational' | 'demotivational' | 'funny' | 'fun_facts';
export type CategoryOrAll = Category | 'all';

export const DB_VERSION = 1;

export const CREATE_QUOTES_TABLE = `
  CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    author TEXT,
    category TEXT NOT NULL
  );
`;

export const CREATE_QUOTE_HISTORY_TABLE = `
  CREATE TABLE IF NOT EXISTS quote_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id TEXT NOT NULL,
    shown_date TEXT NOT NULL,
    FOREIGN KEY (quote_id) REFERENCES quotes(id)
  );
`;

export const CREATE_USER_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

export const CREATE_HISTORY_QUOTE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_history_quote_id ON quote_history(quote_id);
`;

export const CREATE_HISTORY_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_history_date ON quote_history(shown_date);
`;

export const ALL_DDL = [
  CREATE_QUOTES_TABLE,
  CREATE_QUOTE_HISTORY_TABLE,
  CREATE_USER_SETTINGS_TABLE,
  CREATE_HISTORY_QUOTE_INDEX,
  CREATE_HISTORY_DATE_INDEX,
];

export interface QuoteRow {
  id: string;
  text: string;
  author: string | null;
  category: Category;
}

export interface SettingsRow {
  key: string;
  value: string;
}

export const SETTINGS_KEYS = {
  CATEGORY: 'category',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  TODAY_QUOTE_DATE: 'today_quote_date',
  TODAY_QUOTE_ID: 'today_quote_id',
} as const;
