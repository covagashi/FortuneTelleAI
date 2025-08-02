// /src/app/(main)/chat/page.tsx
"use client";

import { generateConversationalResponse } from "@/ai/flows/generate-conversational-response";
import { generateDailyEmotionalSummary } from "@/ai/flows/generate-daily-emotional-summary";
import { extractUserFacts } from "@/ai/flows/extract-user-facts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppStore, type Message, type DailySummary } from "@/lib/store";
import { Send, User, Loader2, BookCheck, WifiOff, Mic, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { FormEvent, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HerLogo } from "@/components/ui/her-logo";
import { useLanguage } from "@/hooks/use-language";
import { retryWithBackoff } from "@/lib/retry";

// Declare SpeechRecognition types for cross-browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const MESSAGE_LIMIT = 20; // Example: 20 user messages per day
const WARNING_THRESHOLD = 5; // Show warning when 5 messages are left

export default function ChatPage() {
  const { 
    messages, addMessage, initializeMessages, getConversationHistory, 
    userFacts, addFact, getTodaysUserMessageCount, addSummary,
    getDatesNeedingSummary, getConversationForDate, clearChatHistory,
    updateInitialMessage,
    hasDoneTarotReadingToday, setLastTarotReadingDate,
    userName, userGender, oraclePersonality,
    processOfflineQueue, updateMessageStatus
  } = useAppStore();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { dict, language } = useLanguage();
  
  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [isMicAvailable, setIsMicAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);


  const [datesToSummarize, setDatesToSummarize] = useState<string[]>([]);
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userMessageCount = getTodaysUserMessageCount ? getTodaysUserMessageCount() : 0;
  const messagesLeft = MESSAGE_LIMIT - userMessageCount;
  const isLimitReached = messagesLeft <= 0;
  const shouldShowLimitNotice = messagesLeft <= WARNING_THRESHOLD;
  const shouldShowSummaryButton = (datesToSummarize?.length ?? 0) > 0 || isLimitReached;
  
  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsMicAvailable(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Process after each pause
      recognition.interimResults = false; // Only get final results
      recognition.lang = language === 'es' ? 'es-ES' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInput(prevInput => (prevInput ? prevInput + ' ' : '') + transcript.trim());
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            toast({
                variant: 'destructive',
                title: dict.chat.speechErrorTitle,
                description: dict.chat.speechPermissionDenied,
            });
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, [toast, language, dict]);


  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          try {
            recognitionRef.current?.start();
            setIsListening(true);
          } catch(e) {
            console.error("Could not start recognition", e)
            setIsListening(false);
          }
        })
        .catch(err => {
          console.error('Mic permission error:', err);
          toast({
              variant: 'destructive',
              title: dict.chat.speechErrorTitle,
              description: dict.chat.speechPermissionDenied,
          });
        });
    }
  };

  // Effect to process offline queue when connection is restored
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({ title: dict.chat.online.title, description: dict.chat.online.description });
      processOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [processOfflineQueue, toast, dict]);

  useEffect(() => {
    if (getDatesNeedingSummary) {
      const dates = getDatesNeedingSummary();
      setDatesToSummarize(dates);
    }
  }, [messages, getDatesNeedingSummary]);

  useEffect(() => {
    if (initializeMessages) {
        initializeMessages(dict.chat.initialMessage);
    }
  }, [initializeMessages, dict.chat.initialMessage]);

  useEffect(() => {
      if (updateInitialMessage) {
          updateInitialMessage(dict.chat.initialMessage)
      }
  }, [dict.chat.initialMessage, updateInitialMessage]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (messageContent: string, messageId: string) => {
    updateMessageStatus(messageId, 'pending');
    setIsLoading(true);
    
    try {
      const operation = () => generateConversationalResponse({
        message: messageContent,
        conversationHistory: getConversationHistory ? getConversationHistory() : "",
        userFacts: (userFacts || []).map(f => f.fact),
        language: language,
        tarotReadingDone: hasDoneTarotReadingToday ? hasDoneTarotReadingToday() : false,
        userName,
        userGender,
        personality: oraclePersonality
      });

      const result = await retryWithBackoff(operation);
      
      const aiMessage: Message = { role: "assistant", content: result.response, id: crypto.randomUUID(), status: 'sent' };
      addMessage ? addMessage(aiMessage) : '';
      updateMessageStatus(messageId, 'sent');

      // Heuristic to check if a reading was done.
      const readingKeywords = ['past:', 'presente:', 'futuro:'];
      const lowerCaseResponse = result.response.toLowerCase();
      
      if (!hasDoneTarotReadingToday() && readingKeywords.some(kw => lowerCaseResponse.includes(kw))) {
        if (setLastTarotReadingDate) {
          setLastTarotReadingDate(new Date().toISOString());
        }
      }

    } catch (error) {
      console.error("Error generating response after retries:", error);
      updateMessageStatus(messageId, 'failed');
      // Do not add an AI error message to the chat, the user can just retry.
      toast({ variant: "destructive", title: dict.chat.responseErrorTitle, description: dict.chat.responseErrorDesc });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    if (!input.trim() || isLoading || isLimitReached) return;

    const messageContent = input;
    setInput("");
    
    const userMessage: Omit<Message, 'id' | 'timestamp'> = { 
        role: "user", 
        content: messageContent, 
        status: isOnline ? 'pending' : 'pending' // Always pending at first
    };
    const messageId = addMessage(userMessage);

    if (isOnline) {
      await handleSendMessage(messageContent, messageId);
    } else {
      toast({ title: dict.chat.offline.title, description: dict.chat.offline.description });
    }
  };

  const handleRetryMessage = (message: Message) => {
      if(isOnline) {
        handleSendMessage(message.content, message.id);
      } else {
        toast({ variant: "destructive", title: "Still Offline", description: "Cannot retry message. Please check your connection." });
      }
  }
  
  const handleGenerateSummary = async () => {
    if (!isOnline) {
      toast({
        variant: "destructive",
        title: dict.common.offlineErrorTitle,
        description: dict.summary.offlineErrorDesc,
      });
      return;
    }

    const datesToProcess = isLimitReached ? [new Date().toISOString().split('T')[0], ...datesToSummarize] : datesToSummarize;
    const uniqueDates = [...new Set(datesToProcess)];

    if (uniqueDates.length === 0) return;

    setIsSummarizing(true);
    toast({
        title: dict.summary.manualGenerate.title,
        description: dict.summary.manualGenerate.desc
    });

    let newFactsFound = false;

    for (const date of uniqueDates) {
        try {
            const conversation = getConversationForDate ? getConversationForDate(date) : null;
            if (!conversation) continue;

            // 1. Generate Summary
            const summaryResult = await generateDailyEmotionalSummary({
                conversationHistory: conversation,
                userFacts: (userFacts || []).map(f => f.fact),
                language,
            });

            const newSummary: DailySummary = {
                id: crypto.randomUUID(),
                date: date,
                ...summaryResult,
            };
            if(addSummary) addSummary(newSummary);

            // 2. Extract Facts
            const knownFacts = (userFacts || []).map(f => f.fact);
            const factResult = await extractUserFacts({ conversationHistory: conversation, existingFacts: knownFacts });
            
            if (factResult.facts.length > 0) {
              newFactsFound = true;
              factResult.facts.forEach(fact => {
                if (addFact) addFact({ id: crypto.randomUUID(), fact });
              });
            }
        } catch (error) {
            console.error(`Error processing summary/facts for ${date}:`, error);
        }
    }
    
    setDatesToSummarize([]);
    setIsSummarizing(false);

    if (clearChatHistory) {
      clearChatHistory(dict.chat.initialMessage);
    }

    toast({
        title: dict.summary.manualGenerate.successTitle,
        description: dict.summary.manualGenerate.successDesc
    });

    if (newFactsFound) {
      toast({
        title: dict.chat.factExtraction.title,
        description: dict.chat.factExtraction.description,
      });
    }
  };

  const getPlaceholderText = () => {
    if (isListening) return dict.chat.listening;
    if (isLimitReached) return dict.chat.limitReached;
    if (datesToSummarize.length > 0) return dict.summary.manualGenerate.disabledPlaceholder;
    return dict.chat.placeholder;
  };

  const isChatDisabled = isLoading || isSummarizing || (isOnline && (datesToSummarize?.length ?? 0) > 0) || isLimitReached;
  
  return (
    <div className="flex flex-col h-full bg-background/80 backdrop-blur-sm rounded-lg border border-primary/20 shadow-lg shadow-primary/10">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
         <TooltipProvider>
          <AnimatePresence initial={false}>
            {(messages || []).map((message) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                  "flex items-start gap-4",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="border-2 border-primary/50 shadow-md shadow-primary/20">
                    <AvatarFallback className="bg-transparent text-primary">
                       <HerLogo className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-md rounded-xl px-4 py-3 text-sm shadow-md",
                    message.role === "user" ? "bg-primary text-primary-foreground shadow-primary/30" : "bg-card text-card-foreground border border-border",
                    message.role === 'system' ? 'w-full text-center bg-transparent border-none shadow-none' : '',
                    message.status === 'pending' || message.status === 'failed' ? 'opacity-70' : ''
                  )}
                >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="flex flex-col items-center gap-1">
                    <Avatar>
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <User />
                      </AvatarFallback>
                    </Avatar>
                    {message.status === 'pending' && (
                       <Tooltip>
                        <TooltipTrigger><Clock className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent><p>{dict.chat.status.pending}</p></TooltipContent>
                      </Tooltip>
                    )}
                    {message.status === 'failed' && (
                       <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRetryMessage(message)}>
                             <RefreshCw className="h-4 w-4 text-destructive" />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{dict.chat.status.failed}</p></TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          </TooltipProvider>
          {isLoading && isOnline && (
            <div className="flex items-start gap-4 justify-start">
               <Avatar className="border-2 border-primary/50 shadow-md shadow-primary/20">
                <AvatarFallback className="bg-transparent text-primary"><HerLogo className="h-6 w-6" /></AvatarFallback>
              </Avatar>
              <div className="flex items-center space-x-2 rounded-xl bg-card px-4 py-3 text-sm shadow-md border border-border">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">{dict.chat.thinking}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-primary/20 bg-card/80 p-4">
         {shouldShowSummaryButton && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
            >
                <Button onClick={handleGenerateSummary} className="w-full" variant="outline" disabled={!isOnline || isSummarizing}>
                    {isSummarizing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <BookCheck className="mr-2 h-4 w-4" />
                    )}
                    {isSummarizing 
                        ? dict.summary.manualGenerate.inProgress 
                        : (isLimitReached ? dict.summary.manualGenerate.buttonLimit : dict.summary.manualGenerate.buttonDefault)
                    }
                </Button>
            </motion.div>
        )}
        {shouldShowLimitNotice && isOnline && !isLimitReached && (
            <Alert variant="default" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{dict.chat.limitWarningTitle}</AlertTitle>
                <AlertDescription>
                    {`${dict.chat.limitWarningDesc} ${messagesLeft}.`}
                </AlertDescription>
            </Alert>
        )}
        {!isOnline && (
             <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground bg-muted p-2 rounded-md mb-4">
                <WifiOff className="h-4 w-4 mr-2" />
                {dict.chat.offlinePlaceholder}
             </div>
          )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholderText()}
            className="flex-1"
            disabled={isChatDisabled}
            autoComplete="off"
          />

          {isMicAvailable && (
            <Button type="button" size="icon" variant={isListening ? "destructive" : "outline"} onClick={toggleListening} disabled={isChatDisabled}>
                {isListening ? (
                    <div className="relative flex items-center justify-center">
                        <Mic className="h-5 w-5" />
                        <span className="absolute h-2 w-2 bg-white rounded-full animate-ping"></span>
                    </div>
                ) : <Mic className="h-5 w-5" />}
              <span className="sr-only">{isListening ? "Stop listening" : "Start listening"}</span>
            </Button>
          )}

          <Button type="submit" size="icon" disabled={isChatDisabled || !input.trim() || isListening}>
            {isLoading && isOnline ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span className="sr-only">{dict.chat.sendButton}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
