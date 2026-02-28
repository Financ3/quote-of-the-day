import React, { forwardRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QuoteRow } from '../db/schema';
import { THEMES, WALLPAPER_WIDTH, WALLPAPER_HEIGHT } from '../constants/themes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PREVIEW_HEIGHT = SCREEN_HEIGHT * 0.72;
const PREVIEW_WIDTH = SCREEN_WIDTH * 0.92;

interface QuoteCardProps {
  quote: QuoteRow;
  forCapture?: boolean;
}

const QuoteCard = forwardRef<View, QuoteCardProps>(({ quote, forCapture = false }, ref) => {
  const theme = THEMES[quote.category] ?? THEMES.all;

  if (forCapture) {
    return (
      <View
        ref={ref}
        collapsable={false}
        style={[
          styles.captureContainer,
          { top: -(WALLPAPER_HEIGHT * 2), position: 'absolute' },
        ]}
      >
        <LinearGradient
          colors={theme.gradient}
          style={styles.captureGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.captureInner}>
            <View style={styles.captureAccentLine} />
            <Text style={[styles.captureQuoteText, { color: theme.textColor }]}>
              "{quote.text}"
            </Text>
            {quote.author && (
              <Text style={[styles.captureAuthorText, { color: theme.accentColor }]}>
                — {quote.author}
              </Text>
            )}
            <Text style={[styles.captureCategoryText, { color: theme.accentColor }]}>
              The Daily Ember
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View ref={ref} collapsable={false} style={styles.previewWrapper}>
      <LinearGradient
        colors={theme.gradient}
        style={styles.previewGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.previewInner}>
          <View style={[styles.previewAccentLine, { backgroundColor: theme.accentColor }]} />
          <Text style={[styles.previewQuoteText, { color: theme.textColor }]}>
            "{quote.text}"
          </Text>
          {quote.author && (
            <Text style={[styles.previewAuthorText, { color: theme.accentColor }]}>
              — {quote.author}
            </Text>
          )}
          <Text style={[styles.previewCategoryText, { color: theme.accentColor + '99' }]}>
            The Daily Ember
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
});

QuoteCard.displayName = 'QuoteCard';

export default QuoteCard;

const styles = StyleSheet.create({
  // ── Off-screen capture styles (1080×1920) ──────────────────────────────────
  captureContainer: {
    width: WALLPAPER_WIDTH,
    height: WALLPAPER_HEIGHT,
    left: 0,
  },
  captureGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    paddingHorizontal: 100,
    paddingVertical: 80,
    alignItems: 'center',
  },
  captureAccentLine: {
    width: 120,
    height: 4,
    backgroundColor: '#ffffff55',
    marginBottom: 80,
    borderRadius: 2,
  },
  captureQuoteText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 64,
    lineHeight: 88,
    textAlign: 'center',
    marginBottom: 60,
    letterSpacing: 1,
  },
  captureAuthorText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 42,
    textAlign: 'center',
    marginBottom: 40,
  },
  captureCategoryText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 32,
    textAlign: 'center',
    opacity: 0.6,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },

  // ── Preview styles (screen-sized) ─────────────────────────────────────────
  previewWrapper: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  previewGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInner: {
    paddingHorizontal: 28,
    paddingVertical: 32,
    alignItems: 'center',
  },
  previewAccentLine: {
    width: 48,
    height: 3,
    marginBottom: 28,
    borderRadius: 2,
    opacity: 0.7,
  },
  previewQuoteText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    lineHeight: 34,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  previewAuthorText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  previewCategoryText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
