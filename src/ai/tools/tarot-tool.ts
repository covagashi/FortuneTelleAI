// src/ai/tools/tarot-tool.ts
'use server';
/**
 * @fileOverview A tool for performing a three-card tarot reading.
 *
 * - getTarotReading - A tool that returns a "past, present, future" reading based on a user's query.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TarotReadingInputSchema = z.object({
  userQuery: z.string().describe("The user's question or the situation they want clarity on. This provides context for the reading."),
});

const TarotReadingOutputSchema = z.object({
  reading: z.string().describe("The full tarot reading, formatted with sections for 'Past', 'Present', and 'Future', including card names and their interpretations in relation to the user's query."),
});

const majorArcana = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", 
    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit", 
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", 
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

// Helper to get three unique random cards
function drawThreeCards() {
    const shuffled = majorArcana.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

const prompt = ai.definePrompt({
    name: 'tarotInterpretationPrompt',
    input: { schema: z.object({
        userQuery: z.string(),
        pastCard: z.string(),
        presentCard: z.string(),
        futureCard: z.string(),
    })},
    output: { schema: TarotReadingOutputSchema },
    prompt: `You are a master tarot reader. A user is asking for a reading about the following situation: "{{userQuery}}".

You have drawn three cards for a "Past, Present, Future" spread:
- Past: {{pastCard}}
- Present: {{presentCard}}
- Future: {{futureCard}}

Your task is to interpret these cards in a cohesive narrative related to the user's query. Provide a meaningful, insightful, and empathetic reading. Structure the output clearly with "Past:", "Present:", and "Future:" sections. For each section, briefly explain what the card represents and how it connects to the user's situation in that specific timeframe. Keep the language clear and focused on reflection, not absolute prediction.

Generate the full reading text.`
});


export const getTarotReading = ai.defineTool(
  {
    name: 'getTarotReading',
    description: "Performs a three-card (past, present, future) tarot reading. Use this when a user explicitly asks for a 'reading', a 'card', a 'tirada', or something similar to get insight into their situation.",
    inputSchema: TarotReadingInputSchema,
    outputSchema: TarotReadingOutputSchema,
  },
  async ({ userQuery }) => {
    const [pastCard, presentCard, futureCard] = drawThreeCards();
    
    const { output } = await prompt({
        userQuery,
        pastCard,
        presentCard,
        futureCard,
    });

    return output!;
  }
);
