// src/ai/flows/translation-improvement.ts
'use server';

/**
 * @fileOverview A translation improvement AI agent.
 *
 * - improveTranslation - A function that handles the translation improvement process.
 * - ImproveTranslationInput - The input type for the improveTranslation function.
 * - ImproveTranslationOutput - The return type for the improveTranslation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveTranslationInputSchema = z.object({
  arabicText: z.string().describe('The original Arabic text.'),
  initialTranslation: z.string().describe('The initial English translation.'),
  correctedTranslation: z.string().describe('The user-corrected English translation.'),
});
export type ImproveTranslationInput = z.infer<typeof ImproveTranslationInputSchema>;

const ImproveTranslationOutputSchema = z.object({
  feedback: z.string().describe('Feedback on how the translation model can be improved.'),
});
export type ImproveTranslationOutput = z.infer<typeof ImproveTranslationOutputSchema>;

export async function improveTranslation(input: ImproveTranslationInput): Promise<ImproveTranslationOutput> {
  return improveTranslationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveTranslationPrompt',
  input: {schema: ImproveTranslationInputSchema},
  output: {schema: ImproveTranslationOutputSchema},
  prompt: `You are an AI translation improvement tool. You are provided with an original Arabic text, an initial English translation, and a user-corrected English translation. Your task is to analyze the differences between the initial and corrected translations and provide feedback on how the translation model can be improved to produce more accurate and contextually relevant translations in the future.

Original Arabic Text: {{{arabicText}}}
Initial English Translation: {{{initialTranslation}}}
Corrected English Translation: {{{correctedTranslation}}}

Provide specific feedback on areas where the initial translation could be improved, taking into account the nuances of the Arabic language and the context of the text. Focus on how the model can learn from this correction to improve future translations.
`,
});

const improveTranslationFlow = ai.defineFlow(
  {
    name: 'improveTranslationFlow',
    inputSchema: ImproveTranslationInputSchema,
    outputSchema: ImproveTranslationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
