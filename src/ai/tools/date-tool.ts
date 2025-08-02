// src/ai/tools/date-tool.ts
'use server';
/**
 * @fileOverview A tool for getting the current date and time.
 *
 * - getCurrentDateTime - A tool that returns the current date and time as a formatted string.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const getCurrentDateTime = ai.defineTool(
  {
    name: 'getCurrentDateTime',
    description: "Obtiene la fecha y hora actual. Úsalo si el usuario pregunta explícitamente por el día o la hora.",
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
  async () => {
    return new Date().toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
  }
);
