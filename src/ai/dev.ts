// src/ai/dev.ts

import { config } from 'dotenv';
config();

import '@/ai/flows/generate-conversational-response.ts';
import '@/ai/flows/generate-conversation-starter.ts';
import '@/ai/tools/date-tool.ts';
import '@/ai/tools/wellness-tool.ts';
import '@/ai/tools/tarot-tool.ts';
import '@/ai/flows/extract-user-facts.ts';
import '@/ai/flows/generate-daily-emotional-summary.ts';
import '@/ai/flows/send-contact-email.ts';
