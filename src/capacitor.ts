import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Device, DeviceInfo } from '@capacitor/device';

export interface CapacitorPlatformInfo {
  isNative: boolean;
  platform: 'android' | 'ios' | 'web';
  isAndroid: boolean;
  isIOS: boolean;
  isWeb: boolean;
  deviceInfo?: DeviceInfo;
}

export const isCapacitorNative = Capacitor.isNativePlatform();
export const capacitorPlatform = Capacitor.getPlatform() as 'android' | 'ios' | 'web';

/**
 * Get detailed platform and device info
 */
export async function getCapacitorInfo(): Promise<CapacitorPlatformInfo> {
  let deviceInfo: DeviceInfo | undefined = undefined;
  try {
    deviceInfo = await Device.getInfo();
  } catch (e) {
    console.log('Capacitor Device info not available:', e);
  }

  return {
    isNative: isCapacitorNative,
    platform: capacitorPlatform,
    isAndroid: capacitorPlatform === 'android',
    isIOS: capacitorPlatform === 'ios',
    isWeb: capacitorPlatform === 'web',
    deviceInfo,
  };
}

/**
 * Trigger haptic vibration feedback on user action.
 * Falls back to Web Vibration API if on web.
 */
export async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    if (isCapacitorNative) {
      const impactStyle =
        style === 'heavy'
          ? ImpactStyle.Heavy
          : style === 'medium'
          ? ImpactStyle.Medium
          : ImpactStyle.Light;
      await Haptics.impact({ style: impactStyle });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const ms = style === 'heavy' ? 40 : style === 'medium' ? 20 : 10;
      navigator.vibrate(ms);
    }
  } catch (e) {
    // Ignore haptic errors gracefully
  }
}

/**
 * Initialize Capacitor Native plugins on startup:
 * - Hide Splash Screen after brief delay
 * - Configure Status Bar
 * - Register App Hardware Back Button listener (for Android)
 */
export async function initCapacitor() {
  if (!isCapacitorNative) {
    console.log('⚡ Capacitor initialized in Web mode');
    return;
  }

  console.log(`⚡ Capacitor initialized on Native platform: ${capacitorPlatform}`);

  try {
    // 1. Configure Status Bar
    if (Capacitor.isPluginAvailable('StatusBar')) {
      await StatusBar.setStyle({ style: Style.Dark });
      if (capacitorPlatform === 'android') {
        await StatusBar.setBackgroundColor({ color: '#0f172a' }); // dark slate overlay
      }
    }
  } catch (err) {
    console.warn('Capacitor StatusBar init warning:', err);
  }

  try {
    // 2. Hide Splash Screen cleanly
    if (Capacitor.isPluginAvailable('SplashScreen')) {
      await SplashScreen.hide({ fadeOutDuration: 400 });
    }
  } catch (err) {
    console.warn('Capacitor SplashScreen init warning:', err);
  }

  try {
    // 3. Android Back Button handler
    if (capacitorPlatform === 'android') {
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.minimizeApp();
        } else {
          window.history.back();
        }
      });
    }
  } catch (err) {
    console.warn('Capacitor App back button warning:', err);
  }
}
