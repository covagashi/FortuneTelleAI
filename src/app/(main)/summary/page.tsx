// /src/app/(main)/summary/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore, type DailySummary } from "@/lib/store";
import { format, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Info, CalendarDays, Sun, Cloud, Moon, MessageSquare, Quote, LineChart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";


const chartConfig = {
  energy: {
    label: "Energy",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


function SummaryChart({ summaries }: { summaries: DailySummary[] }) {
    const { dict, language } = useLanguage();

    const chartData = useMemo(() => {
        const emotionToValue = (emotion: string) => {
            if (emotion === 'Auspicious') return 3;
            if (emotion === 'Neutral') return 2;
            if (emotion === 'Challenging') return 1;
            return 0;
        };

        return summaries
            .slice() // Create a copy to avoid mutating the original
            .sort((a, b) => a.date.localeCompare(b.date)) // Sort by date ascending
            .map(s => ({
                date: format(parseISO(s.date), "d MMM", { locale: language === 'es' ? es : enUS }),
                energy: emotionToValue(s.overallEmotion),
            }));
    }, [summaries, language]);

    return (
         <Card className="bg-card/80 border-primary/20 backdrop-blur-sm">
            <CardHeader>
                 <CardTitle className="flex items-center gap-2 font-headline">
                    <LineChart className="h-6 w-6 text-primary" />
                    {dict.summary.chart.title}
                </CardTitle>
                <CardDescription className="font-body">
                    {dict.summary.chart.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12, top: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 6)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    formatter={(value) => {
                                        const emotionMap = ["", "Challenging", "Neutral", "Auspicious"];
                                        return emotionMap[value as number] || "Unknown";
                                    }}
                                />
                            }
                        />
                        <Area
                            dataKey="energy"
                            type="natural"
                            fill="var(--color-energy)"
                            fillOpacity={0.4}
                            stroke="var(--color-energy)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
         </Card>
    )
}

function SummaryCard({ summary }: { summary: DailySummary }) {
    const { language } = useLanguage();
    
    const getEmotionIcon = () => {
        switch (summary.overallEmotion) {
            case 'Auspicious': return <Sun className="h-5 w-5 text-amber-400" />;
            case 'Neutral': return <Cloud className="h-5 w-5 text-slate-400" />;
            case 'Challenging': return <Moon className="h-5 w-5 text-indigo-400" />;
            default: return <Cloud className="h-5 w-5 text-muted-foreground" />;
        }
    };
    
    const locale = language === 'es' ? es : enUS;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
            <Card className="shadow-md shadow-primary/10 transition-shadow hover:shadow-lg hover:shadow-primary/20 bg-card/80 border border-primary/20 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg capitalize font-headline">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        {format(parseISO(summary.date), "eeee, d MMMM", { locale: locale })}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm font-body">
                        <div className="flex items-center gap-2">
                           {getEmotionIcon()}
                           <span className="font-medium">{summary.overallEmotion}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MessageSquare className="h-5 w-5" />
                            <span>{summary.conversationTime} min</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-foreground/80 font-body italic border-l-2 border-primary/50 pl-3">
                        <Quote className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>"{summary.summary}"</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}


export default function SummaryPage() {
  const { dailySummaries } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const { dict } = useLanguage();

  useEffect(() => {
    // Simulate loading to allow for animations
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const sortedSummaries = [...(dailySummaries || [])].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-6">
        {isLoading ? (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : sortedSummaries.length > 5 && (
            <SummaryChart summaries={sortedSummaries} />
        )}

      <Card className="bg-card/80 border-primary/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline">{dict.summary.title}</CardTitle>
          <CardDescription className="font-body">
            {dict.summary.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sortedSummaries.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{dict.summary.noSummaries.title}</AlertTitle>
              <AlertDescription>{dict.summary.noSummaries.desc}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
                <AnimatePresence>
                  {sortedSummaries.map((summary) => (
                    <SummaryCard key={summary.id} summary={summary} />
                  ))}
                </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
