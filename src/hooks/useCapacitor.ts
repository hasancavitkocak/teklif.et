import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';

export function useCapacitor() {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);
    setPlatform(Capacitor.getPlatform() as any);

    if (native) {
      initializeApp();
    }
  }, []);

  const initializeApp = async () => {
    try {
      // Hide splash screen after app is ready
      await SplashScreen.hide();

      // Set status bar style
      if (Capacitor.isPluginAvailable('StatusBar')) {
        // Show status bar (don't hide it)
        await StatusBar.show();
        // Dark = BLACK text/icons (for white backgrounds)
        await StatusBar.setStyle({ style: Style.Dark });
        // White background
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      }

      // Handle keyboard
      if (Capacitor.isPluginAvailable('Keyboard')) {
        Keyboard.addListener('keyboardWillShow', () => {
          document.body.classList.add('keyboard-open');
        });

        Keyboard.addListener('keyboardWillHide', () => {
          document.body.classList.remove('keyboard-open');
        });
      }

      // Handle app state changes
      if (Capacitor.isPluginAvailable('App')) {
        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active:', isActive);
        });

        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });
      }
    } catch (error) {
      console.error('Error initializing Capacitor:', error);
    }
  };

  return {
    isNative,
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
  };
}
