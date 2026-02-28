import { Alert, Platform, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as IntentLauncher from 'expo-intent-launcher';
import { RefObject } from 'react';

export type WallpaperResult =
  | { success: true }
  | { success: false; error: string };

export async function setWallpaper(
  captureViewRef: RefObject<View | null>
): Promise<WallpaperResult> {
  // 1. Request media library permission (writeOnly=true avoids requesting
  //    READ_MEDIA_AUDIO, which is not needed for saving images)
  const { status } = await MediaLibrary.requestPermissionsAsync(true);
  if (status !== 'granted') {
    return {
      success: false,
      error: 'Photos permission is required to save the wallpaper.',
    };
  }

  // 2. Capture the off-screen view
  let uri: string;
  try {
    uri = await captureRef(captureViewRef, {
      format: 'jpg',
      quality: 0.95,
      result: 'tmpfile',
    });
  } catch (err) {
    console.error('captureRef error:', err);
    return { success: false, error: 'Failed to generate wallpaper image.' };
  }

  // 3. Save to media library (createAssetAsync returns the Asset object)
  // On iOS, createAssetAsync sometimes throws even though the photo is saved —
  // known expo-media-library bug. Android needs the asset object for the
  // content URI, so only treat the error as fatal there.
  let asset: MediaLibrary.Asset | null = null;
  try {
    asset = await MediaLibrary.createAssetAsync(uri);
  } catch (err) {
    if (Platform.OS !== 'ios') {
      console.error('saveToLibrary error:', err);
      return { success: false, error: 'Failed to save image to Photos.' };
    }
  }

  if (Platform.OS === 'ios') {
    // iOS: cannot set wallpaper programmatically — show instructions
    Alert.alert(
      'Saved to Photos!',
      'To set as wallpaper:\n\n1. Open the Photos app\n2. Find the saved image\n3. Tap the Share button\n4. Select "Use as Wallpaper"',
      [{ text: 'Got it', style: 'default' }]
    );
    return { success: true };
  }

  // Android: launch system wallpaper chooser with content:// URI
  if (!asset) {
    return { success: false, error: 'Failed to save image to Photos.' };
  }
  try {
    const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
    const contentUri = assetInfo.localUri ?? assetInfo.uri;

    // Must use content:// URI — file:// is rejected by the system wallpaper service
    if (!contentUri.startsWith('content://')) {
      // Fallback: just notify user
      Alert.alert(
        'Saved to Gallery!',
        'Open your Gallery app and set the image as wallpaper from there.',
        [{ text: 'OK' }]
      );
      return { success: true };
    }

    await IntentLauncher.startActivityAsync('android.intent.action.ATTACH_DATA', {
      data: contentUri,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      type: 'image/jpeg',
    });
    return { success: true };
  } catch (err) {
    console.error('Intent error:', err);
    Alert.alert(
      'Saved to Gallery!',
      'Open your Gallery app and set the image as wallpaper from there.',
      [{ text: 'OK' }]
    );
    return { success: true };
  }
}
