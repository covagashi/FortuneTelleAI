// /src/ai/flows/generate-daily-emotional-summary.ts
'use server';
/**
 * @fileOverview Generates a daily spiritual summary from conversation history.
 *
 * - generateDailySpiritualSummary - A function to analyze a day's conversation and create a summary.
 * - GenerateDailySpiritualSummaryInput - The input type for the function.
 * - GenerateDailySpiritualSummaryOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDailySpiritualSummaryInputSchema = z.object({
  conversationHistory: z.string().describe("The user's conversation history for a specific day."),
  userFacts: z.array(z.string()).optional().describe("Known long-term facts about the user for context."),
  language: z.enum(['en', 'es']).describe('The language for the AI to respond in.'),
});
export type GenerateDailySpiritualSummaryInput = z.infer<typeof GenerateDailySpiritualSummaryInputSchema>;

const GenerateDailySpiritualSummaryOutputSchema = z.object({
  summary: z.string().describe("A single, concise, and insightful sentence that captures the essence of the day's spiritual reading."),
  overallEmotion: z.enum(['Auspicious', 'Neutral', 'Challenging']).describe("The dominant cosmic energy of the day, chosen from 'Auspicious', 'Neutral', or 'Challenging'."),
  conversationTime: z.number().int().describe("An estimate of the total number of minutes the reading lasted."),
});
export type GenerateDailySpiritualSummaryOutput = z.infer<typeof GenerateDailySpiritualSummaryOutputSchema>;

export async function generateDailyEmotionalSummary(
  input: GenerateDailySpiritualSummaryInput
): Promise<GenerateDailySpiritualSummaryOutput> {
  return generateDailySpiritualSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailySpiritualSummaryPrompt',
  input: { schema: GenerateDailySpiritualSummaryInputSchema },
  output: { schema: GenerateDailySpiritualSummaryOutputSchema },
  prompt: `Your task is to act as a wise oracle, analyzing a seeker's conversation history for a specific day. You must distill this reading into a very concise spiritual summary.

**LANGUAGE:** The response MUST be in the following language: {{{language}}}.

ADDITIONAL CONTEXT ABOUT THE SEEKER (THREADS OF FATE):
{{#if userFacts}}
{{#each userFacts}}
- {{{this}}}
{{/each}}
{{else}}
(No additional context on the seeker is available)
{{/if}}
---

THE DAY'S CONVERSATION HISTORY TO ANALYZE:
{{{conversationHistory}}}
---

INSTRUCTIONS:
1.  **Summary Sentence:** Write a single, insightful sentence that captures the essence of the conversation and the seeker's spiritual state. It should be mystical and profound.
2.  **Overall Energy:** Assess the overall cosmic energy of the conversation and classify it strictly as 'Auspicious', 'Neutral', or 'Challenging'. Only one of these three options.
3.  **Reading Time:** Estimate how many minutes the reading lasted based on the length and density of the history. Return only an integer.

Generate the summary based on the provided history. The response should be in the language of the conversation.`,
});

const generateDailySpiritualSummaryFlow = ai.defineFlow(
  {
    name: 'generateDailySpiritualSummaryFlow',
    inputSchema: GenerateDailySpiritualSummaryInputSchema,
    outputSchema: GenerateDailySpiritualSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
