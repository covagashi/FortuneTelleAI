// src/app/offline/page.tsx
'use client';

import { WifiOff } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { HerLogo } from '@/components/ui/her-logo';

export default function OfflinePage() {
  const { dict } = useLanguage();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      
      <HerLogo className="h-24 w-24 text-primary opacity-50 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" />

      <h1 className="mt-8 text-3xl font-headline text-foreground/80">
        {dict.common.offlineErrorTitle}
      </h1>
      <p className="mt-2 max-w-sm text-lg text-muted-foreground font-body">
        {dict.summary.offlineErrorDesc}
      </p>

      <div className="mt-8 flex items-center justify-center rounded-full bg-muted p-4">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
      </div>
    </div>
  );
}
