// src/ai/flows/extract-user-facts.ts
'use server';
/**
 * @fileOverview Extracts key, non-trivial, long-term spiritual or personal facts about the user from a conversation.
 *
 * - extractUserFacts - A function to analyze conversation history and pull out important facts.
 * - ExtractUserFactsInput - The input type for the function.
 * - ExtractUserFactsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractUserFactsInputSchema = z.object({
  conversationHistory: z.string().describe('The recent conversation history to analyze.'),
  existingFacts: z.array(z.string()).describe('A list of facts already known about the user to avoid duplication.'),
});
export type ExtractUserFactsInput = z.infer<typeof ExtractUserFactsInputSchema>;

const ExtractUserFactsOutputSchema = z.object({
  facts: z.array(z.string()).describe('A list of new, unique, non-trivial facts extracted from the conversation.'),
});
export type ExtractUserFactsOutput = z.infer<typeof ExtractUserFactsOutputSchema>;

export async function extractUserFacts(input: ExtractUserFactsInput): Promise<ExtractUserFactsOutput> {
  // If there's no conversation, there are no facts to extract.
  if (!input.conversationHistory.trim()) {
    return { facts: [] };
  }
  return extractUserFactsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractUserFactsPrompt',
  input: { schema: ExtractUserFactsInputSchema },
  output: { schema: ExtractUserFactsOutputSchema },
  prompt: `Your task is to analyze a conversation history and extract key, non-trivial, long-term facts about the user's spiritual path, destiny, or core personality.

RULES FOR FACT EXTRACTION:
1.  **User-Centric:** The fact must be about the user (their beliefs, spiritual goals, significant life events, core values, relationships, etc.).
2.  **Long-Term & Non-Trivial:** Do not extract temporary or trivial information.
    *   BAD EXAMPLE: "The user feels tired today," "The user is going to buy bread."
    *   GOOD EXAMPLE: "The user believes in karmic connections," "The user has a spirit animal, a wolf named Luna," "The user is seeking to align their chakras."
3.  **Concise:** Write each fact as a clear, concise statement.
4.  **Avoid Duplicates:** Do not extract facts that are already known. A list of existing facts is provided below. Do not include them in your output.
5.  **Language:** Facts should be in the language of the conversation.

EXISTING FACTS (DO NOT REPEAT):
{{#if existingFacts}}
{{#each existingFacts}}
- {{{this}}}
{{/each}}
{{else}}
(No existing facts are known)
{{/if}}

CONVERSATION HISTORY TO ANALYZE:
---
{{{conversationHistory}}}
---

Extract the new facts based on the conversation history. If you find no new, non-trivial, long-term facts, return an empty list.`,
});

const extractUserFactsFlow = ai.defineFlow(
  {
    name: 'extractUserFactsFlow',
    inputSchema: ExtractUserFactsInputSchema,
    outputSchema: ExtractUserFactsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
