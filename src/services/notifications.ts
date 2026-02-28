import { Platform } from 'react-native';

const NOTIFICATION_CHANNEL_ID = 'daily-quote';
const NOTIFICATION_IDENTIFIER = 'daily-quote-reminder';
const NOTIFICATION_HOUR = 9;

// Lazy-load expo-notifications to avoid crashing in Expo Go (SDK 53+ dropped
// push notification support from Expo Go — importing the module at the top
// level would crash route loading).
async function getNotifications() {
  return import('expo-notifications');
}

export function initNotificationHandler(): void {
  getNotifications().then((Notifications) => {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch {
      // Not available in this environment (Expo Go)
    }
  }).catch(() => {});
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const Notifications = await getNotifications();
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleDailyNotification(): Promise<void> {
  try {
    const Notifications = await getNotifications();
    await cancelDailyNotification();

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'Daily Quote Reminder',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDENTIFIER,
      content: {
        title: 'Your Daily Ember quote is Ready',
        body: "Tap to see today's quote and set it as your wallpaper.",
        sound: false,
        ...(Platform.OS === 'android' && { channelId: NOTIFICATION_CHANNEL_ID }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: NOTIFICATION_HOUR,
        minute: 0,
      },
    });
  } catch {
    // Not available in this environment
  }
}

export async function cancelDailyNotification(): Promise<void> {
  try {
    const Notifications = await getNotifications();
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDENTIFIER);
  } catch {
    // Not available in this environment
  }
}

export async function updateNotificationSchedule(enabled: boolean): Promise<void> {
  if (enabled) {
    const granted = await requestNotificationPermission();
    if (granted) {
      await scheduleDailyNotification();
    }
  } else {
    await cancelDailyNotification();
  }
}
