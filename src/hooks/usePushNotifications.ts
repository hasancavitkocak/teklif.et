import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export function usePushNotifications() {
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) return;

    // Push notifications disabled for now
    // Will be enabled when Firebase is configured
    console.log('Push notifications disabled - Firebase not configured');
  }, [isNative]);

  return {
    isNative,
  };
}
