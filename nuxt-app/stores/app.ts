import { defineStore } from 'pinia'
import { isToday, parseISO, isSameDay } from 'date-fns'
// Note: Adjust the import paths for AI flows as needed.
// These are placeholders and might need to be corrected based on the final project structure.
// import { generateConversationalResponse } from '~/../src/ai/flows/generate-conversational-response'
// import { generateDailyEmotionalSummary } from '~/../src/ai/flows/generate-daily-emotional-summary'
// import { extractUserFacts } from '~/../src/ai/flows/extract-user-facts'

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

interface AppState {
  // Personalization
  userName: string;
  userGender: 'male' | 'female' | 'non-binary';
  oraclePersonality: OraclePersonality;
  // Language state
  language: 'en' | 'es';
  // App state
  messages: Message[];
  userFacts: UserFact[];
  dailySummaries: DailySummary[];
  lastTarotReadingDate: string | null;
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    // Personalization state
    userName: '',
    userGender: 'non-binary',
    oraclePersonality: 'wise',
    // Language state
    language: 'en',
    // App state
    messages: [],
    userFacts: [],
    dailySummaries: [],
    lastTarotReadingDate: null,
  }),

  getters: {
    hasDoneTarotReadingToday: (state) => {
      if (!state.lastTarotReadingDate) return false;
      return isToday(parseISO(state.lastTarotReadingDate));
    },
    getConversationHistory: (state) => (limit = 10) => {
      return state.messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-limit)
        .map((m) => `${m.role === "user" ? "Seeker" : "Oracle"}: ${m.content}`)
        .join("\n");
    },
    getTodaysUserMessageCount: (state) => {
        return state.messages.filter((m) =>
          m.role === 'user' && m.timestamp && isToday(parseISO(m.timestamp))
        ).length;
    },
    getConversationForDate: (state) => (dateStr: string) => {
        const targetDate = parseISO(dateStr);
        const dateMessages = state.messages.filter((m) => m.timestamp && isSameDay(parseISO(m.timestamp), targetDate));
        if (dateMessages.length === 0) return null;
        return dateMessages
          .map((m) => `${m.role === "user" ? "Seeker" : "Oracle"}: ${m.content}`)
          .join("\n");
    },
    getDatesWithConversations: (state) => {
        const dates = new Set<string>();
        state.messages.forEach(m => {
            if (m.timestamp) {
                dates.add(m.timestamp.split('T')[0]);
            }
        });
        return Array.from(dates);
    },
    getDatesNeedingSummary(state): string[] {
        const conversationDates = this.getDatesWithConversations;
        const summarizedDates = new Set(state.dailySummaries.map(s => s.date));
        const todayStr = new Date().toISOString().split('T')[0];

        return conversationDates.filter(
          (date: string) => !summarizedDates.has(date) && date !== todayStr
        );
    },
  },

  actions: {
    setUserName(name: string) {
      this.userName = name;
    },
    setUserGender(gender: 'male' | 'female' | 'non-binary') {
      this.userGender = gender;
    },
    setOraclePersonality(personality: OraclePersonality) {
      this.oraclePersonality = personality;
    },
    setLanguage(language: 'en' | 'es') {
      this.language = language;
    },
    setLastTarotReadingDate(date: string) {
      this.lastTarotReadingDate = date;
    },
    addMessage(message: Omit<Message, 'id' | 'timestamp'>): string {
      const newMessage: Message = {
        ...message,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        status: message.status || 'sent',
      };
      this.messages.push(newMessage);
      return newMessage.id;
    },
    updateMessageStatus(messageId: string, status: MessageStatus) {
      const message = this.messages.find(msg => msg.id === messageId);
      if (message) {
        message.status = status;
      }
    },
    initializeMessages(initialMessage: string) {
      if (this.messages.length === 0) {
        this.messages.push({
          role: "assistant",
          content: initialMessage,
          id: "initial-message",
          timestamp: new Date().toISOString(),
          status: 'sent',
        });
      }
    },
    updateInitialMessage(newInitialMessage: string) {
        if (this.messages.length > 0 && this.messages[0].id === 'initial-message') {
            this.messages[0].content = newInitialMessage;
        }
    },
    addFact(fact: UserFact) {
      this.userFacts.push(fact);
    },
    updateFact(id: string, newFact: string) {
      const fact = this.userFacts.find(f => f.id === id);
      if (fact) {
        fact.fact = newFact;
      }
    },
    deleteFact(id: string) {
      this.userFacts = this.userFacts.filter(f => f.id !== id);
    },
    addSummary(summary: DailySummary) {
        this.dailySummaries = [...this.dailySummaries.filter(s => s.date !== summary.date), summary];
    },
    clearAllData(clearedMessage: string) {
        this.messages = [
            {
              role: "assistant",
              content: clearedMessage,
              id: "initial-message",
              timestamp: new Date().toISOString(),
              status: 'sent',
            },
        ];
        this.userFacts = [];
        this.dailySummaries = [];
        this.lastTarotReadingDate = null;
        this.userName = '';
        this.userGender = 'non-binary';
    },
    clearChatHistory(initialMessage: string) {
        this.messages = [
            {
                role: "assistant",
                content: initialMessage,
                id: "initial-message",
                timestamp: new Date().toISOString(),
                status: 'sent',
            },
        ];
    },
    // TODO: Migrate processOfflineQueue
    async processOfflineQueue() {
        console.warn("processOfflineQueue is not yet implemented in Pinia store.");
        // This will be more complex to migrate as it involves async operations and calling other actions.
        // It will require careful handling of `this` context and possibly injecting dependencies if we extract the AI calls.
    }
  },

  persist: {
    key: 'moir-ai-storage-v2',
    storage: persistedState.localStorage,
  },
});
