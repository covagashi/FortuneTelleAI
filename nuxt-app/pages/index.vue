<template>
  <div class="flex flex-col gap-10 h-full w-full">
    <div class="text-center">
      <h1 class="text-4xl md:text-5xl font-headline tracking-tight text-foreground drop-shadow-[0_2px_4px_rgba(var(--primary-rgb),0.3)]">
        {{ dict.home.welcome }}
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto mt-2 font-body">
        {{ dict.home.subtitle }}
      </p>
      <a href="/chat" class="mt-6 inline-block font-bold shadow-lg shadow-primary/20 animate-shimmer bg-[linear-gradient(110deg,hsl(var(--primary)),45%,hsl(var(--accent)),55%,hsl(var(--primary)))] bg-[length:200%_100%] transition-colors px-4 py-2 rounded-md">
        {{ dict.home.startChat }}
        <ArrowRight class="ml-2 h-5 w-5 inline" />
      </a>
    </div>

    <div class="flex-1 min-h-0">
      <h2 class="text-2xl font-headline tracking-tight mb-4 text-center md:text-left">{{ dict.home.todaysFocus }}</h2>

      <!-- HighlightCard component logic -->
      <div v-if="isLoading" class="card h-full flex flex-col items-center justify-center text-center p-8 bg-black/20 border-dashed border-primary/20 min-h-[180px]">
        <Loader2 class="h-8 w-8 text-primary animate-spin mb-4" />
        <h4 class="text-lg font-semibold text-foreground">{{ dict.home.starterLoading }}</h4>
      </div>

      <div v-else-if="starter" class="card h-full bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-lg shadow-primary/10 min-h-[180px]">
        <div class="p-6">
          <div class="flex items-center gap-3 text-xl">
            <div class="bg-primary/20 p-2 rounded-full">
              <MessageSquareQuote class="h-5 w-5 text-primary" />
            </div>
            <span class="text-foreground font-headline">{{ dict.home.starterTitle }}</span>
          </div>
          <div class="p-6">
            <p class="text-xl font-body text-foreground/90">"{{ starter }}"</p>
          </div>
        </div>
      </div>

      <div v-else class="card h-full flex flex-col items-center justify-center text-center p-8 bg-black/20 border-dashed border-primary/20 min-h-[180px]">
        <div class="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
          <Sparkles class="h-8 w-8 text-primary" />
        </div>
        <h4 class="text-lg font-semibold text-foreground">{{ dict.home.noFocus }}</h4>
        <p class="text-muted-foreground mt-1">{{ dict.home.noFocusDesc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ArrowRight, Loader2, MessageSquareQuote, Sparkles } from 'lucide-vue-next';

// Mock language dictionary
const dict = {
  home: {
    welcome: "Welcome to Your Reflections",
    subtitle: "A safe space to explore your thoughts and feelings.",
    startChat: "Start a Conversation",
    todaysFocus: "Today's Focus",
    starterLoading: "Finding a good starter...",
    starterTitle: "A thought to begin with...",
    starterFallback: "What is on your mind today?",
    noFocus: "No focus for today.",
    noFocusDesc: "Start a chat to set your focus."
  }
};

// Mock AI flow
const generateConversationStarter = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ starter: "What is one thing you are grateful for today?" });
    }, 1500);
  });
};

const { data: starter, pending: isLoading, error } = await useAsyncData(
  'conversation-starter',
  async () => {
    try {
      const result = await generateConversationStarter();
      return result.starter;
    } catch (e) {
      console.error("Error generating conversation starter:", e);
      return dict.home.starterFallback;
    }
  }
);

if (error.value) {
  starter.value = dict.home.starterFallback;
}
</script>

<style scoped>
/* Scoped styles for the home page can be added here */
</style>
