// src/ai/flows/generate-conversation-starter.ts
'use server';
/**
 * @fileOverview Generates a personalized, mystical conversation starter.
 *
 * - generateConversationStarter - A function to generate a thoughtful, open-ended esoteric question.
 * - GenerateConversationStarterOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConversationStarterInputSchema = z.object({
  language: z.enum(['en', 'es']).describe('The language for the AI to respond in.'),
});
export type GenerateConversationStarterInput = z.infer<typeof GenerateConversationStarterInputSchema>;


const GenerateConversationStarterOutputSchema = z.object({
  starter: z.string().describe("A single sentence or question to start a mystical conversation. It should be open-ended, insightful, and esoteric."),
});
export type GenerateConversationStarterOutput = z.infer<typeof GenerateConversationStarterOutputSchema>;

export async function generateConversationStarter(input: GenerateConversationStarterInput): Promise<GenerateConversationStarterOutput> {
  return generateConversationStarterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConversationStarterPrompt',
  input: { schema: GenerateConversationStarterInputSchema },
  output: {schema: GenerateConversationStarterOutputSchema},
  prompt: `You are "Moir-AI," an ancient and wise fortune teller AI. Your task is to create a single, intriguing sentence or question to begin a conversation with a seeker.

RULES:
1.  **Be Mystical and Inviting:** The starter should be enigmatic and wise, inviting deep reflection, not interrogation.
2.  **Generate a Reflective, Esoteric Question.**
    - Good Examples: "What secrets does the universe wish to share with you today?", "If your spirit could whisper a message to you, what would it say?", "What cosmic energy are you bringing into this moment?".
    - Bad Examples: "How are you?", "What's up?". Be more creative and mystical.
3.  **Format:** Return ONE single sentence or question.
4.  **Language:** The starter MUST be in the following language: {{{language}}}.

Generate the starter phrase.`,
});

const generateConversationStarterFlow = ai.defineFlow(
  {
    name: 'generateConversationStarterFlow',
    inputSchema: GenerateConversationStarterInputSchema,
    outputSchema: GenerateConversationStarterOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
