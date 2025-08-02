// src/ai/tools/wellness-tool.ts
'use server';
/**
 * @fileOverview A tool for suggesting mystical rituals or grounding exercises.
 *
 * - getWellnessActivity - A tool that returns a mystical or mindfulness-based activity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WellnessActivityInputSchema = z.object({
  emotion: z.string().describe("The seeker's dominant negative energy, such as 'anxiety', 'stress', 'sadness', or 'anger'."),
});

const WellnessActivityOutputSchema = z.object({
  name: z.string().describe("The name of the suggested ritual or practice."),
  description: z.string().describe("A brief explanation of the ritual and its spiritual purpose."),
  steps: z.array(z.string()).describe("A list of simple, actionable steps to perform the ritual."),
});

const activities = {
  anxiety: {
    name: "5-4-3-2-1 Grounding Ritual",
    description: "A grounding technique to anchor your spirit to the present plane when anxious energies cloud your vision. It helps you return from the astral noise to your physical self.",
    steps: [
      "Acknowledge 5 things you can SEE. Observe their form and presence in this moment.",
      "Acknowledge 4 things you can FEEL (the earth beneath your feet, the air on your skin, the texture of your robes).",
      "Acknowledge 3 things you can HEAR (the hum of the universe, your own breath, a distant echo).",
      "Acknowledge 2 things you can SMELL. If the air is still, imagine two of your most sacred scents (e.g., sandalwood, rain).",
      "Acknowledge 1 thing you can TASTE. It can be a sip of water, or simply the essence of the air you breathe.",
    ],
  },
  stress: {
    name: "Four-Fold Breath",
    description: "A controlled breathing technique to calm your spiritual energy when you feel overwhelmed. It regulates your life force and provides a point of focus.",
    steps: [
      "Breathe in slowly through your nose, counting to four, drawing in universal energy.",
      "Hold this breath for a count of four, letting the energy settle within you.",
      "Exhale slowly through your mouth for a count of four, releasing all that no longer serves you.",
      "Pause, empty, for a count of four, finding stillness in the void.",
      "Repeat this cycle four times, or until you feel your spirit calm.",
    ],
  },
  sadness: {
    name: "The Ritual of Small Action",
    description: "When sorrow drains your spirit, stagnation can amplify it. This ritual uses a small, deliberate act to break the stillness and invite movement back into your life.",
    steps: [
      "Choose a very simple, manageable task. One you can complete in five minutes.",
      "Ideas: Light a candle and watch its flame, water a single plant, tidy one corner of your sacred space, or stretch your body for 5 minutes.",
      "Set a timer for 5 minutes and devote yourself only to this act.",
      "When finished, acknowledge that you have shifted the energy. You don't need to feel joyous, just recognize the act itself.",
      "Sometimes, the smallest ripple is all that's needed to change the tides.",
    ],
  },
  anger: {
    name: "The Sacred Pause",
    description: "This practice creates a space between the fire of anger and a reactive outburst, allowing you to respond with wisdom, not just heat.",
    steps: [
        "Pause. Do not act or speak immediately. If you can, physically take a step back.",
        "Take three deep, deliberate breaths, feeling the cool air enter and warm air leave.",
        "Name the energy within. Say to your inner self: 'Anger is present. It is a powerful fire'.",
        "Ask your spirit: 'What do I truly need in this moment?'. The answer might be space, calm, or to define a boundary later with intention.",
        "Decide your next move from a place of cool wisdom, not from the heart of the flame.",
    ]
  },
  default: {
    name: "Mindful Moment",
    description: "A simple mindfulness ritual to return to the present moment and grant your spirit a moment of peace.",
    steps: [
        "Pause for a moment and close your eyes if it feels right.",
        "Take three deep, slow breaths.",
        "Focus only on the sensation of air as it flows in and out of your body.",
        "Do not try to change anything, simply observe.",
        "When you are ready, open your eyes."
    ]
  }
};

export const getWellnessActivity = ai.defineTool(
  {
    name: 'getWellnessActivity',
    description: "Suggests a grounding ritual or spiritual practice if the seeker expresses a strong negative emotion (anxiety, stress, sadness, or anger) and seems ensnared by it. Use this to offer practical, actionable spiritual aid.",
    inputSchema: WellnessActivityInputSchema,
    outputSchema: WellnessActivityOutputSchema,
  },
  async ({ emotion }) => {
    const emotionKey = emotion.toLowerCase() as keyof typeof activities;
    return activities[emotionKey] || activities.default;
  }
);
