import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSettings } from '../../src/hooks/useSettings';
import { useQuote } from '../../src/hooks/useQuote';
import { THEMES, CATEGORY_COLORS } from '../../src/constants/themes';
import { CategoryOrAll } from '../../src/db/schema';
import { updateNotificationSchedule } from '../../src/services/notifications';

const CATEGORIES: { value: CategoryOrAll; label: string; description: string }[] = [
  {
    value: 'all',
    label: 'All Categories',
    description: 'A mix of motivational, funny, demotivational & fun facts',
  },
  {
    value: 'motivational',
    label: 'Motivational',
    description: 'Inspiring quotes to fuel your ambition',
  },
  {
    value: 'demotivational',
    label: 'Demotivational',
    description: 'Dark, sardonic humor for the realists',
  },
  {
    value: 'funny',
    label: 'Funny',
    description: 'Wit, one-liners & comedic observations',
  },
  {
    value: 'fun_facts',
    label: 'Fun Facts',
    description: 'Surprising facts phrased as daily wisdom',
  },
];

export default function SettingsScreen() {
  const {
    category,
    notificationsEnabled,
    loaded,
    updateCategory,
    updateNotifications,
  } = useSettings();
  const { refreshQuote } = useQuote(category, loaded);

  async function handleCategoryChange(newCategory: CategoryOrAll) {
    if (newCategory === category) return;
    await updateCategory(newCategory);
    await refreshQuote(newCategory);
  }

  async function handleNotificationToggle(value: boolean) {
    await updateNotifications(value);
    await updateNotificationSchedule(value);
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>

          {/* Category section */}
          <Text style={styles.sectionLabel}>Quote Category</Text>
          <View style={styles.section}>
            {CATEGORIES.map((cat, index) => {
              const isSelected = category === cat.value;
              const color = CATEGORY_COLORS[cat.value];
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryRow,
                    index < CATEGORIES.length - 1 && styles.categoryRowBorder,
                    isSelected && { borderLeftColor: color, borderLeftWidth: 3 },
                  ]}
                  onPress={() => handleCategoryChange(cat.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryTextGroup}>
                    <Text style={[styles.categoryLabel, isSelected && { color }]}>
                      {cat.label}
                    </Text>
                    <Text style={styles.categoryDescription}>{cat.description}</Text>
                  </View>
                  {isSelected && (
                    <Feather name="check" size={18} color={color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Notifications section */}
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={styles.section}>
            <View style={styles.notificationRow}>
              <View style={styles.notificationTextGroup}>
                <Text style={styles.notificationLabel}>Daily Reminder</Text>
                <Text style={styles.notificationDescription}>
                  Get notified at 9:00 AM every day
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#333355', true: '#f5a62380' }}
                thumbColor={notificationsEnabled ? '#f5a623' : '#888aaa'}
              />
            </View>
          </View>

          {/* About section */}
          <Text style={styles.sectionLabel}>About</Text>
          <View style={styles.section}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={[styles.aboutRow, styles.categoryRowBorder]}>
              <Text style={styles.aboutLabel}>Quote Library</Text>
              <Text style={styles.aboutValue}>8,000 quotes</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>No ads, no account</Text>
              <Feather name="check-circle" size={16} color="#7ed321" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  sectionLabel: {
    color: '#888aaa',
    fontSize: 11,
    fontFamily: 'PlayfairDisplay_400Regular',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 24,
  },
  section: {
    backgroundColor: '#16162a',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  categoryRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2a2a4a',
  },
  categoryTextGroup: {
    flex: 1,
  },
  categoryLabel: {
    color: '#e8e8e8',
    fontSize: 15,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 2,
  },
  categoryDescription: {
    color: '#666688',
    fontSize: 12,
    fontFamily: 'PlayfairDisplay_400Regular',
    lineHeight: 18,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  notificationTextGroup: {
    flex: 1,
  },
  notificationLabel: {
    color: '#e8e8e8',
    fontSize: 15,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 2,
  },
  notificationDescription: {
    color: '#666688',
    fontSize: 12,
    fontFamily: 'PlayfairDisplay_400Regular',
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2a2a4a',
  },
  aboutLabel: {
    color: '#888aaa',
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular',
  },
  aboutValue: {
    color: '#e8e8e8',
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular',
  },
});
