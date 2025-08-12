<template>
  <div class="flex flex-col h-full bg-background/80 backdrop-blur-sm rounded-lg border border-primary/20 shadow-lg shadow-primary/10">
    <ScrollArea class="flex-1 p-4">
      <div class="space-y-6">
        <TooltipProvider>
          <!-- Messages will be rendered here -->
          <div v-for="message in messages" :key="message.id" :class="cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')">
            <template v-if="message.role === 'assistant'">
              <Avatar class="border-2 border-primary/50 shadow-md shadow-primary/20">
                <AvatarFallback class="bg-transparent text-primary">
                  <!-- <HerLogo class="h-6 w-6" /> -->
                </AvatarFallback>
              </Avatar>
            </template>
            <div :class="cn('max-w-md rounded-xl px-4 py-3 text-sm shadow-md', message.role === 'user' ? 'bg-primary text-primary-foreground shadow-primary/30' : 'bg-card text-card-foreground border border-border', message.role === 'system' ? 'w-full text-center bg-transparent border-none shadow-none' : '', message.status === 'pending' || message.status === 'failed' ? 'opacity-70' : '')">
              <p class="whitespace-pre-wrap">{{ message.content }}</p>
            </div>
            <template v-if="message.role === 'user'">
              <div class="flex flex-col items-center gap-1">
                <Avatar>
                  <AvatarFallback class="bg-secondary text-secondary-foreground">
                    <User class="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <Tooltip v-if="message.status === 'pending'">
                  <TooltipTrigger><Clock class="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent><p>Pending</p></TooltipContent>
                </Tooltip>
                <Tooltip v-if="message.status === 'failed'">
                  <TooltipTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-6 w-6">
                      <RefreshCw class="h-4 w-4 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Failed to send</p></TooltipContent>
                </Tooltip>
              </div>
            </template>
          </div>
          <!-- Loading indicator -->
          <div v-if="isLoading" class="flex items-start gap-4 justify-start">
            <Avatar class="border-2 border-primary/50 shadow-md shadow-primary/20">
              <AvatarFallback class="bg-transparent text-primary">
                <!-- <HerLogo class="h-6 w-6" /> -->
              </AvatarFallback>
            </Avatar>
            <div class="flex items-center space-x-2 rounded-xl bg-card px-4 py-3 text-sm shadow-md border border-border">
              <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
              <span class="text-muted-foreground">Thinking...</span>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </ScrollArea>

    <div class="border-t border-primary/20 bg-card/80 p-4">
      <!-- Summary button -->
      <div v-if="shouldShowSummaryButton" class="mb-4">
        <Button class="w-full" variant="outline" :disabled="!isOnline || isSummarizing">
          <Loader2 v-if="isSummarizing" class="mr-2 h-4 w-4 animate-spin" />
          <BookCheck v-else class="mr-2 h-4 w-4" />
          <span>Generate Summary</span>
        </Button>
      </div>
      <!-- Limit warning -->
      <Alert v-if="shouldShowLimitNotice" variant="default" class="mb-4">
        <AlertTriangle class="h-4 w-4" />
        <AlertTitle>Message limit warning</AlertTitle>
        <AlertDescription>
          You are approaching your daily message limit.
        </AlertDescription>
      </Alert>
      <!-- Offline notice -->
      <div v-if="!isOnline" class="flex-1 flex items-center justify-center text-sm text-muted-foreground bg-muted p-2 rounded-md mb-4">
        <WifiOff class="h-4 w-4 mr-2" />
        You are offline. Messages will be sent when you reconnect.
      </div>
      <form @submit.prevent="handleSubmit" class="flex items-center gap-2">
        <Input
          v-model="input"
          placeholder="Type your message..."
          class="flex-1"
          autocomplete="off"
        />
        <Button type="button" size="icon" variant="outline">
          <Mic class="h-5 w-5" />
          <span class="sr-only">Start listening</span>
        </Button>
        <Button type="submit" size="icon">
          <Send class="h-5 w-5" />
          <span class="sr-only">Send</span>
        </Button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAppStore, type Message } from '~/stores/app'
import { storeToRefs } from 'pinia'
import { cn } from '@/lib/utils'
import { useOnline } from '@vueuse/core'

// Import lucide-vue-next icons
import { User, Clock, RefreshCw, Loader2, BookCheck, AlertTriangle, WifiOff, Mic, Send } from 'lucide-vue-next'

// Import shadcn-vue components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Mock AI flow
const generateConversationalResponse = async (options: any) => {
  console.log("Generating AI response with options:", options);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ response: "This is a mock response from the oracle." });
    }, 1500);
  });
};


const appStore = useAppStore()
const { messages, userFacts, userName, userGender, oraclePersonality, language } = storeToRefs(appStore)
const { addMessage, updateMessageStatus, getConversationHistory, getTodaysUserMessageCount, getDatesNeedingSummary, hasDoneTarotReadingToday, setLastTarotReadingDate } = appStore

const input = ref('')
const isLoading = ref(false)
const isSummarizing = ref(false)
const isListening = ref(false) // Placeholder for speech recognition
const messagesEndRef = ref<HTMLDivElement | null>(null)

const isOnline = useOnline()

const MESSAGE_LIMIT = 20;
const WARNING_THRESHOLD = 5;

const userMessageCount = computed(() => getTodaysUserMessageCount())
const messagesLeft = computed(() => MESSAGE_LIMIT - userMessageCount.value)
const isLimitReached = computed(() => messagesLeft.value <= 0)
const shouldShowLimitNotice = computed(() => messagesLeft.value <= WARNING_THRESHOLD && !isLimitReached.value)
const datesToSummarize = computed(() => getDatesNeedingSummary())
const shouldShowSummaryButton = computed(() => datesToSummarize.value.length > 0 || isLimitReached.value)

const getPlaceholderText = computed(() => {
  if (isListening.value) return "Listening...";
  if (isLimitReached.value) return "You have reached your daily message limit.";
  if (datesToSummarize.value.length > 0) return "Please generate a summary before continuing.";
  return "Type your message...";
});

const isChatDisabled = computed(() => isLoading.value || isSummarizing.value || (isOnline.value && datesToSummarize.value.length > 0) || isLimitReached.value)

const handleSendMessage = async (messageContent: string, messageId: string) => {
  updateMessageStatus(messageId, 'pending');
  isLoading.value = true;

  try {
    const result = await generateConversationalResponse({
      message: messageContent,
      conversationHistory: getConversationHistory(),
      userFacts: userFacts.value.map(f => f.fact),
      language: language.value,
      tarotReadingDone: hasDoneTarotReadingToday(),
      userName: userName.value,
      userGender: userGender.value,
      personality: oraclePersonality.value,
    });

    const aiMessage: Omit<Message, 'id' | 'timestamp'> = { role: "assistant", content: result.response, status: 'sent' };
    addMessage(aiMessage);
    updateMessageStatus(messageId, 'sent');

    const readingKeywords = ['past:', 'presente:', 'futuro:'];
    const lowerCaseResponse = result.response.toLowerCase();

    if (!hasDoneTarotReadingToday() && readingKeywords.some(kw => lowerCaseResponse.includes(kw))) {
      setLastTarotReadingDate(new Date().toISOString());
    }

  } catch (error) {
    console.error("Error generating response:", error);
    updateMessageStatus(messageId, 'failed');
    // You might want to use a toast notification here
  } finally {
    isLoading.value = false;
  }
}

const handleSubmit = async () => {
  if (!input.value.trim() || isChatDisabled.value) return;

  const messageContent = input.value;
  input.value = "";

  const userMessage: Omit<Message, 'id' | 'timestamp'> = {
      role: "user",
      content: messageContent,
      status: isOnline.value ? 'pending' : 'pending' // Always pending at first
  };
  const messageId = addMessage(userMessage);

  if (isOnline.value) {
    await handleSendMessage(messageContent, messageId);
  } else {
    // Logic for offline queue will be handled by the store's processOfflineQueue method
    // which can be triggered when isOnline becomes true.
    console.log("Message queued for sending when online.");
  }
};

const handleRetryMessage = (message: Message) => {
    if(isOnline.value) {
      handleSendMessage(message.content, message.id);
    } else {
      console.log("Cannot retry message. Still offline.");
    }
}

const scrollToBottom = () => {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: "smooth" });
  });
};

onMounted(() => {
  appStore.initializeMessages("Welcome! How can I help you today?");
  scrollToBottom();
});

watch(messages, () => {
  scrollToBottom();
}, { deep: true });

// Watch for coming back online to process queue
watch(isOnline, (online) => {
  if (online) {
    console.log("Back online, processing queue...");
    // appStore.processOfflineQueue(); // TODO: Implement this in the store
  }
});

</script>
