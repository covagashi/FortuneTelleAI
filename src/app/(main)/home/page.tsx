// src/app/(main)/home/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MessageSquareQuote, Loader2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { generateConversationStarter } from "@/ai/flows/generate-conversation-starter";
import { useLanguage } from "@/hooks/use-language";

function HighlightCard() {
    const [starter, setStarter] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { dict, language } = useLanguage();

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
    };
    
    useEffect(() => {
        const fetchStarter = async () => {
            setIsLoading(true);
            try {
                const result = await generateConversationStarter({ language });
                setStarter(result.starter);
            } catch (error) {
                console.error("Error generating conversation starter:", error);
                setStarter(dict.home.starterFallback);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStarter();
    }, [dict.home.starterFallback, language]);

    if (isLoading) {
        return (
             <motion.div variants={cardVariants}>
                <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-black/20 border-dashed border-primary/20 min-h-[180px]">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                    <h4 className="text-lg font-semibold text-foreground">{dict.home.starterLoading}</h4>
                </Card>
            </motion.div>
        );
    }

    if (starter) {
        return (
            <motion.div variants={cardVariants}>
                <Card className="h-full bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-lg shadow-primary/10 min-h-[180px]">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="bg-primary/20 p-2 rounded-full">
                                <MessageSquareQuote className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-foreground font-headline">{dict.home.starterTitle}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-body text-foreground/90">"{starter}"</p>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }
    
    return (
        <motion.div variants={cardVariants}>
            <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-black/20 border-dashed border-primary/20 min-h-[180px]">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-foreground">{dict.home.noFocus}</h4>
                <p className="text-muted-foreground mt-1">{dict.home.noFocusDesc}</p>
            </Card>
        </motion.div>
    );
}

export default function HomePage() {
    const { dict } = useLanguage();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };
    
    return (
        <motion.div 
            className="flex flex-col gap-10 h-full w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="text-center">
                <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-foreground drop-shadow-[0_2px_4px_rgba(var(--primary-rgb),0.3)]">
                   {dict.home.welcome}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-2 font-body">
                    {dict.home.subtitle}
                </p>
                <Button asChild size="lg" className="mt-6 font-bold shadow-lg shadow-primary/20 animate-shimmer bg-[linear-gradient(110deg,hsl(var(--primary)),45%,hsl(var(--accent)),55%,hsl(var(--primary)))] bg-[length:200%_100%] transition-colors">
                    <Link href="/chat">
                        {dict.home.startChat}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex-1 min-h-0">
                <h2 className="text-2xl font-headline tracking-tight mb-4 text-center md:text-left">{dict.home.todaysFocus}</h2>
                <HighlightCard />
            </motion.div>
        </motion.div>
    );
}
