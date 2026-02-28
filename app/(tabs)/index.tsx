import { Feather } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuoteCard from '../../src/components/QuoteCard';
import { THEMES } from '../../src/constants/themes';
import { useQuote } from '../../src/hooks/useQuote';
import { useSettings } from '../../src/hooks/useSettings';
import { setWallpaper } from '../../src/services/wallpaper';

export default function HomeScreen() {
  const captureRef = useRef<View | null>(null);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null);
  const { category, loaded: settingsLoaded } = useSettings();
  const { quote, loading, error } = useQuote(category, settingsLoaded);

  const theme = quote ? THEMES[quote.category] ?? THEMES.all : THEMES.all;

  async function handleSetWallpaper() {
    if (!quote || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveResult(null);
    try {
      const result = await setWallpaper(captureRef);
      console.log('Wallpaper result:', result);
      
      setSaveResult(result.success ? 'success' : 'error');
      setTimeout(() => setSaveResult(null), 4000);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <View style={styles.root}>
      {/* Off-screen capture view — must be rendered even while loading */}
      {quote && (
        <QuoteCard ref={captureRef} quote={quote} forCapture />
      )}

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.headerTitle}>The Daily Ember</Text>
        </View>

        {/* Quote preview */}
        <View style={styles.cardArea}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f5a623" />
              <Text style={styles.loadingText}>Loading your quote…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={40} color="#9b59b6" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : quote ? (
            <QuoteCard quote={quote} />
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.wallpaperButton,
              { backgroundColor: theme.accentColor },
              pressed && styles.buttonPressed,
              (saving || loading || !quote) && styles.buttonDisabled,
            ]}
            onPress={handleSetWallpaper}
            disabled={saving || loading || !quote}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Feather
                  name={Platform.OS === 'ios' ? 'download' : 'image'}
                  size={18}
                  color="#000"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>
                  {Platform.OS === 'ios' ? 'Save to Photos' : 'Set as Wallpaper'}
                </Text>
              </>
            )}
          </Pressable>

          <View style={styles.belowButton}>
            {Platform.OS === 'ios' && (
              <Text style={styles.iosHint}>
                After saving, open Photos → tap the image → Share → Use as Wallpaper
              </Text>
            )}
            <Text style={[
              styles.saveMessage,
              saveResult === 'success' ? styles.saveSuccess : styles.saveError,
              { opacity: saveResult ? 1 : 0 },
            ]}>
              {saveResult === 'error' ? 'Could not save image. Please try again.' : 'Image saved to your photo library.'}
            </Text>
          </View>
        </View>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  headerDate: {
    color: '#888aaa',
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_400Regular',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 0.5,
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#888aaa',
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
  },
  errorContainer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#c9b8d4',
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  wallpaperButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 0.5,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  belowButton: {
    alignItems: 'center',
    gap: 6,
  },
  iosHint: {
    color: '#666688',
    fontSize: 12,
    fontFamily: 'PlayfairDisplay_400Regular',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 20,
  },
  saveMessage: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_400Regular',
    textAlign: 'center',
  },
  saveSuccess: {
    color: '#4caf82',
  },
  saveError: {
    color: '#e07070',
  },
});
