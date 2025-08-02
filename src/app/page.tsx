// src/app/page.tsx
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { HerLogo } from '@/components/ui/her-logo';
import { useLanguage } from '@/hooks/use-language';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function ReflectionsCard() {
  const { dict } = useLanguage();
  return (
    <motion.div variants={itemVariants} className="w-full">
      <Link href="/home" className="block h-full group">
        <Card className="h-full transform transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-primary/20 bg-card/50 border-primary/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline">
              <div className="rounded-full bg-primary/10 p-2">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="text-foreground">{dict.mainMenu.reflections.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-muted-foreground font-body">{dict.mainMenu.reflections.desc}</p>
            <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    
    const handleLanguageChange = (checked: boolean) => {
        setLanguage(checked ? 'en' : 'es');
    };

    return (
        <motion.div variants={itemVariants} className="w-full max-w-xs">
            <div className="flex items-center justify-center space-x-2">
                <Label htmlFor="language-switch" className={language === 'es' ? 'text-primary' : 'text-muted-foreground'}>Español</Label>
                <Switch
                    id="language-switch"
                    checked={language === 'en'}
                    onCheckedChange={handleLanguageChange}
                    aria-label="Language Switch"
                />
                <Label htmlFor="language-switch" className={language === 'en' ? 'text-primary' : 'text-muted-foreground'}>English</Label>
            </div>
        </motion.div>
    )
}

export default function MainMenuPage() {
  const { dict } = useLanguage();
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 overflow-hidden">
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <motion.div
        className="flex w-full max-w-lg flex-col items-center gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center">
          <HerLogo className="mx-auto h-24 w-24 text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
          <h1 className="mt-6 text-4xl font-headline tracking-tight text-foreground drop-shadow-[0_2px_4px_rgba(var(--primary-rgb),0.3)]">
            {dict.onboarding.title}
          </h1>
          <p className="mt-2 text-lg font-body text-muted-foreground">
            {dict.onboarding.subtitle}
          </p>
        </motion.div>
        
        <ReflectionsCard />

        <LanguageSelector />

      </motion.div>
    </main>
  );
}
