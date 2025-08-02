// /src/lib/store.ts
import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { isToday, parseISO, isSameDay } from 'date-fns';
import type { GenerateConversationalResponseInput } from "@/ai/flows/generate-conversational-response";
import { generateConversationalResponse } from "@/ai/flows/generate-conversational-response";


export type MessageStatus = 'sent' | 'pending' | 'failed';

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  id: string;
  timestamp?: string; // ISO 8601 format
  status?: MessageStatus;
};

export type UserFact = {
  id: string;
  fact: string;
};

export type DailySummary = {
    id: string;
    date: string; // YYYY-MM-DD
    summary: string;
    overallEmotion: 'Auspicious' | 'Neutral' | 'Challenging';
    conversationTime: number;
};

export type OraclePersonality = 'wise' | 'direct' | 'poetic';

type AppState = {
  // Personalization
  userName: string;
  userGender: 'male' | 'female' | 'non-binary';
  oraclePersonality: OraclePersonality;
  setUserName: (name: string) => void;
  setUserGender: (gender: 'male' | 'female' | 'non-binary') => void;
  setOraclePersonality: (personality: OraclePersonality) => void;

  // Language state
  language: 'en' | 'es';
  setLanguage: (language: 'en' | 'es') => void;

  // App state
  messages: Message[];
  userFacts: UserFact[];
  dailySummaries: DailySummary[];
  lastTarotReadingDate: string | null;
  setLastTarotReadingDate: (date: string) => void;
  hasDoneTarotReadingToday: () => boolean;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessageStatus: (messageId: string, status: MessageStatus) => void;
  initializeMessages: (initialMessage: string) => void;
  updateInitialMessage: (newInitialMessage: string) => void;
  getConversationHistory: (limit?: number) => string;
  getTodaysUserMessageCount: () => number;
  getConversationForDate: (dateStr: string) => string | null;
  getDatesWithConversations: () => string[];
  getDatesNeedingSummary: () => string[];
  processOfflineQueue: () => Promise<void>;
  addFact: (fact: UserFact) => void;
  updateFact: (id: string, newFact: string) => void;
  deleteFact: (id: string) => void;
  addSummary: (summary: DailySummary) => void;
  clearAllData: (clearedMessage: string) => void;
  clearChatHistory: (initialMessage: string) => void;
};

// This is a dummy storage for SSR/SSG environments where localStorage is not available.
const dummyStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

const getDatesFromMessages = (messages: Message[]): string[] => {
  const dates = new Set<string>();
  (messages || []).forEach(m => {
    if (m.timestamp) {
      dates.add(m.timestamp.split('T')[0]);
    }
  });
  return Array.from(dates);
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Personalization state
      userName: '',
      userGender: 'non-binary',
      oraclePersonality: 'wise', // Default personality
      setUserName: (name) => set({ userName: name }),
      setUserGender: (gender) => set({ userGender: gender }),
      setOraclePersonality: (personality) => set({ oraclePersonality: personality }),

      // Language state
      language: 'en', // Default language, will be overridden by detection logic on client
      setLanguage: (language) => set({ language }),

      // App state
      messages: [],
      userFacts: [],
      dailySummaries: [],
      lastTarotReadingDate: null,

      setLastTarotReadingDate: (date) => set({ lastTarotReadingDate: date }),
      
      hasDoneTarotReadingToday: () => {
        const { lastTarotReadingDate } = get();
        if (!lastTarotReadingDate) return false;
        return isToday(parseISO(lastTarotReadingDate));
      },

      addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage: Message = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          status: message.status || 'sent',
        };
        set((state: AppState) => ({
            messages: [...(state.messages || []), newMessage],
        }));
        return newMessage.id;
      },
       updateMessageStatus: (messageId: string, status: MessageStatus) => {
        set(state => ({
          messages: state.messages.map(msg =>
            msg.id === messageId ? { ...msg, status } : msg
          ),
        }));
      },
      initializeMessages: (initialMessage: string) => {
        const { messages } = get();
        if ((messages || []).length === 0) {
          set({
            messages: [
              {
                role: "assistant",
                content: initialMessage,
                id: "initial-message",
                timestamp: new Date().toISOString(),
                status: 'sent',
              },
            ],
          });
        }
      },
       updateInitialMessage: (newInitialMessage: string) => {
        set((state: AppState) => {
            const currentMessages = state.messages || [];
            if (currentMessages.length > 0 && currentMessages[0].id === 'initial-message') {
                const updatedMessages = [...currentMessages];
                updatedMessages[0] = { ...updatedMessages[0], content: newInitialMessage };
                return { messages: updatedMessages };
            }
            return {};
        });
      },
      getConversationHistory: (limit = 10) => {
        const { messages } = get();
        return (messages || [])
          .filter((m: Message) => m.role === 'user' || m.role === 'assistant')
          .slice(-limit)
          .map((m: Message) => `${m.role === "user" ? "Seeker" : "Oracle"}: ${m.content}`)
          .join("\n");
      },
      getTodaysUserMessageCount: () => {
        const { messages } = get();
        return (messages || []).filter((m: Message) => 
          m.role === 'user' && m.timestamp && isToday(parseISO(m.timestamp))
        ).length;
      },
      getConversationForDate: (dateStr: string) => {
        const { messages } = get();
        const targetDate = parseISO(dateStr);
        const dateMessages = (messages || []).filter((m: Message) => m.timestamp && isSameDay(parseISO(m.timestamp), targetDate));
        if (dateMessages.length === 0) return null;
        return dateMessages
          .map((m: Message) => `${m.role === "user" ? "Seeker" : "Oracle"}: ${m.content}`)
          .join("\n");
      },
      getDatesWithConversations: () => {
          return getDatesFromMessages(get().messages || []);
      },
      getDatesNeedingSummary: () => {
        const { messages, dailySummaries } = get();
        const conversationDates = getDatesFromMessages(messages || []);
        const summarizedDates = new Set((dailySummaries || []).map((s: DailySummary) => s.date));
        const todayStr = new Date().toISOString().split('T')[0];
        
        return conversationDates.filter(
          date => !summarizedDates.has(date) && date !== todayStr
        );
      },
       processOfflineQueue: async () => {
        const {
          messages,
          updateMessageStatus,
          addMessage,
          getConversationHistory,
          userFacts,
          language,
          hasDoneTarotReadingToday,
          setLastTarotReadingDate,
          userName,
          userGender,
          oraclePersonality,
        } = get();
        
        const pendingMessages = messages.filter(m => m.status === 'pending');
        if (pendingMessages.length === 0) return;

        console.log(`Processing ${pendingMessages.length} pending messages...`);

        for (const msg of pendingMessages) {
            updateMessageStatus(msg.id, 'sent'); // Optimistically mark as sent
            try {
                const aiInput: GenerateConversationalResponseInput = {
                    message: msg.content,
                    conversationHistory: getConversationHistory(),
                    userFacts: (userFacts || []).map(f => f.fact),
                    language: language,
                    tarotReadingDone: hasDoneTarotReadingToday(),
                    userName,
                    userGender,
                    personality: oraclePersonality
                };

                const result = await generateConversationalResponse(aiInput);
                
                const aiMessage: Omit<Message, 'id' | 'timestamp'> = { role: "assistant", content: result.response, status: 'sent' };
                addMessage(aiMessage);

                const readingKeywords = ['past:', 'presente:', 'futuro:'];
                const lowerCaseResponse = result.response.toLowerCase();
                
                if (!hasDoneTarotReadingToday() && readingKeywords.some(kw => lowerCaseResponse.includes(kw))) {
                    setLastTarotReadingDate(new Date().toISOString());
                }

            } catch (error) {
                console.error("Failed to send queued message:", msg.id, error);
                updateMessageStatus(msg.id, 'failed');
            }
        }
      },
      addFact: (fact: UserFact) => {
        set((state: AppState) => ({ userFacts: [...(state.userFacts || []), fact] }));
      },
      updateFact: (id: string, newFact: string) => {
        set((state: AppState) => ({
          userFacts: (state.userFacts || []).map((fact) =>
            fact.id === id ? { ...fact, fact: newFact } : fact
          ),
        }));
      },
      deleteFact: (id: string) => {
        set((state: AppState) => ({
          userFacts: (state.userFacts || []).filter((fact) => fact.id !== id),
        }));
      },
      addSummary: (summary: DailySummary) => {
        set((state: AppState) => ({
            dailySummaries: [...(state.dailySummaries || []).filter(s => s.date !== summary.date), summary],
        }));
      },
      clearAllData: (clearedMessage: string) => {
        set({
            messages: [
                {
                  role: "assistant",
                  content: clearedMessage,
                  id: "initial-message",
                  timestamp: new Date().toISOString(),
                  status: 'sent',
                },
            ],
            userFacts: [],
            dailySummaries: [],
            lastTarotReadingDate: null,
            userName: '',
            userGender: 'non-binary',
        });
      },
      clearChatHistory: (initialMessage: string) => {
        set({
            messages: [
                {
                    role: "assistant",
                    content: initialMessage,
                    id: "initial-message",
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                },
            ],
        });
      },
    }),
    {
      name: 'moir-ai-storage-v2', // Changed storage key to avoid conflicts with old data
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: (state) => {
        console.log("Moir-AI store has been rehydrated");
        return (state, error) => {
          if (error) console.error("An error happened during Moir-AI store rehydration", error);
        };
      },
    }
  )
);
