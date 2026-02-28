import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { CategoryOrAll } from '../db/schema';
import { getSetting, setSetting } from '../db/queries';
import { SETTINGS_KEYS } from '../db/schema';

const DEFAULT_CATEGORY: CategoryOrAll = 'all';
const DEFAULT_NOTIFICATIONS = false;

export function useSettings() {
  const db = useSQLiteContext();
  const [category, setCategory] = useState<CategoryOrAll>(DEFAULT_CATEGORY);
  const [notificationsEnabled, setNotificationsEnabled] = useState(DEFAULT_NOTIFICATIONS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const [cat, notif] = await Promise.all([
        getSetting(db, SETTINGS_KEYS.CATEGORY),
        getSetting(db, SETTINGS_KEYS.NOTIFICATIONS_ENABLED),
      ]);
      if (cat) setCategory(cat as CategoryOrAll);
      if (notif !== null) setNotificationsEnabled(notif === 'true');
      setLoaded(true);
    }
    load();
  }, [db]);

  const updateCategory = useCallback(
    async (newCategory: CategoryOrAll) => {
      await setSetting(db, SETTINGS_KEYS.CATEGORY, newCategory);
      setCategory(newCategory);
    },
    [db]
  );

  const updateNotifications = useCallback(
    async (enabled: boolean) => {
      await setSetting(db, SETTINGS_KEYS.NOTIFICATIONS_ENABLED, String(enabled));
      setNotificationsEnabled(enabled);
    },
    [db]
  );

  return {
    category,
    notificationsEnabled,
    loaded,
    updateCategory,
    updateNotifications,
  };
}
