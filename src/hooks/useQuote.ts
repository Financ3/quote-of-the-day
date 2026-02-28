import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { CategoryOrAll, QuoteRow } from '../db/schema';
import {
  getCachedTodayQuote,
  cacheTodayQuote,
  clearTodayCache,
  selectDailyQuote,
  recordQuoteShown,
  pruneOldHistory,
} from '../db/queries';

interface UseQuoteResult {
  quote: QuoteRow | null;
  loading: boolean;
  error: string | null;
  refreshQuote: (category: CategoryOrAll) => Promise<void>;
}

export function useQuote(category: CategoryOrAll, settingsLoaded: boolean): UseQuoteResult {
  const db = useSQLiteContext();
  const [quote, setQuote] = useState<QuoteRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuote = useCallback(
    async (cat: CategoryOrAll) => {
      setLoading(true);
      setError(null);
      try {
        // Try cache first
        const cached = await getCachedTodayQuote(db);
        if (cached) {
          // Validate cached quote matches current category
          if (cat === 'all' || cached.category === cat) {
            setQuote(cached);
            setLoading(false);
            return;
          }
        }

        // Select new quote
        const today = new Date().toISOString().split('T')[0];
        const newQuote = await selectDailyQuote(db, cat);

        if (!newQuote) {
          setError('No quotes available for this category. Try switching categories.');
          setLoading(false);
          return;
        }

        // Record in history and cache
        await recordQuoteShown(db, newQuote.id, today);
        await cacheTodayQuote(db, newQuote);
        setQuote(newQuote);

        // Prune old history entries occasionally
        await pruneOldHistory(db);
      } catch (err) {
        setError('Failed to load quote. Please try again.');
        console.error('useQuote error:', err);
      } finally {
        setLoading(false);
      }
    },
    [db]
  );

  // Load on mount and when settings are ready
  useEffect(() => {
    if (settingsLoaded) {
      loadQuote(category);
    }
  }, [settingsLoaded, category, loadQuote]);

  const refreshQuote = useCallback(
    async (newCategory: CategoryOrAll) => {
      await clearTodayCache(db);
      await loadQuote(newCategory);
    },
    [db, loadQuote]
  );

  return { quote, loading, error, refreshQuote };
}
