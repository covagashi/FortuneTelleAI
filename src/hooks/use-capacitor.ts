// src/hooks/use-capacitor.ts
"use client";

import { useEffect, useState } from 'react';
import { App, type AppInfo } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useRouter } from 'next/navigation';

export function useCapacitor() {
  const router = useRouter();
  const [isNative, setIsNative] = useState(false);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    const checkCapacitor = async () => {
      const isNativePlatform = Capacitor.isNativePlatform();
      setIsNative(isNativePlatform);

      if (isNativePlatform) {
        const info = await App.getInfo();
        setAppInfo(info);

        // Handle Android back button
        App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            // This relies on browser history, which Next.js router manages
            window.history.back();
          } else {
            // If there's no history, exit the app
            App.exitApp();
          }
        });
      }
    };

    checkCapacitor();

    return () => {
      // Clean up listener when component unmounts
      if (Capacitor.isNativePlatform()) {
        App.removeAllListeners();
      }
    };
  }, [router]);

  return { isNative, appInfo };
}
