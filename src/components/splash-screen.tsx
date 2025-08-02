// src/components/splash-screen.tsx
"use client";

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { HerLogo } from '@/components/ui/her-logo';
import { useLanguage } from '@/hooks/use-language';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const { dict } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // Show for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
        <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <HerLogo className="h-28 w-28 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
        <h1 className="text-4xl font-headline tracking-tighter text-foreground mt-4 drop-shadow-[0_2px_4px_rgba(var(--primary-rgb),0.3)]">
            {dict.splash.title}
        </h1>
    </div>
  );
}