
// 'use server';
/**
 * @fileOverview This file defines a Genkit flow for Arabic OCR and translation.
 *
 * - arabicOcrTranslation - A function that takes an image containing Arabic text and translates it into English.
 * - ArabicOcrTranslationInput - The input type for the arabicOcrTranslation function.
 * - ArabicOcrTranslationOutput - The return type for the arabicOcrTranslation function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArabicOcrTranslationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of Arabic text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type ArabicOcrTranslationInput = z.infer<
  typeof ArabicOcrTranslationInputSchema
>;

const ArabicOcrTranslationOutputSchema = z.object({
  arabicText: z.string().describe('The extracted Arabic text from the image, attempting to preserve original formatting like headings and paragraphs.'),
  englishTranslation: z
    .string()
    .describe(
      "The English translation of the Arabic text. If 'isDua' is true (meaning the text is a Dua or Quranic Ayah), this field will first contain the original Arabic text, followed by two newlines, and then its English translation. If 'isDua' is false, this field will contain a natural, eloquent, and well-structured English version of the Arabic text, adopting a scholarly tone reminiscent of Imam Ghazali, formatted stylistically like a journal or magazine article, potentially using bullet points for lists or key information, and breaking down dense text into clearer paragraphs, avoiding a robotic or overly literal translation."
    ),
  isDua: z.boolean().describe('Whether the Arabic text is a Dua or a Quranic Ayah.'),
});
export type ArabicOcrTranslationOutput = z.infer<
  typeof ArabicOcrTranslationOutputSchema
>;

export async function arabicOcrTranslation(
  input: ArabicOcrTranslationInput
): Promise<ArabicOcrTranslationOutput> {
  return arabicOcrTranslationFlow(input);
}

const arabicOcrPrompt = ai.definePrompt({
  name: 'arabicOcrPrompt',
  input: {schema: ArabicOcrTranslationInputSchema},
  output: {schema: ArabicOcrTranslationOutputSchema},
  prompt: `You are an expert in Arabic Optical Character Recognition (OCR) and translation to English.

Your primary and most crucial task is to meticulously extract **every single piece of Arabic text** visible in the provided image. When doing so, try to preserve the original structure from the image as much as possible for the 'arabicText' output field. This includes attempting to identify and replicate headings, subheadings, newlines, and paragraph breaks. The goal is for the 'arabicText' to be a textual representation of the image's layout and content, not just a single block of text.

Once you have extracted all Arabic text, maintaining its structure:
1.  Determine if any significant portion of this **entire extracted text (or the most prominent part of it, if it's mixed content)** is primarily a Dua (supplication) or a Quranic Ayah. Set the 'isDua' field to true if it is, and false otherwise. This classification should consider the overall context of the extracted text.
2.  Provide an English translation for the 'englishTranslation' output field.
    -   If 'isDua' is true (meaning the text is identified as a Dua or Quranic Ayah):
        The 'englishTranslation' field MUST be formatted as follows:
        First, include the exact 'arabicText' (the complete original Arabic text you extracted, maintaining its structure).
        Then, add two newlines.
        Then, add the English translation of that Arabic text.
        Example of format:
        اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَىٰ وَالتُّقَىٰ وَالْعَفَافَ وَالْغِنَىٰ

        O Allah, I ask You for guidance, piety, chastity, and wealth.

    -   If 'isDua' is false (i.e., the text is NOT primarily a Dua or Quranic Ayah):
        Translate the Arabic text into clear, natural-sounding English. Adopt a thoughtful and eloquent tone, as if you were a wise scholar like Imam Ghazali, ensuring the translation is not only accurate but also profound and insightful where appropriate, while maintaining readability suitable for a general audience. The goal is to avoid a 'robotic' or overly literal translation.
        The 'englishTranslation' field should contain this well-structured and highly readable English version of the 'arabicText'. Transform the direct translation into a polished piece of text, as if it were intended for a journal or magazine article.
        *   Structure the content logically. If the text contains lists, steps, or distinct pieces of information, use bullet points (using '*' or '-') or numbered lists where appropriate.
        *   Break down long, dense paragraphs into shorter, more focused ones to improve scannability and comprehension.
        *   Ensure a smooth narrative flow and refine the language for clarity and readability, while staying true to the original meaning.
        *   This is more than a literal translation; it's a thoughtfully presented rendition of the content, optimized for easy reading.

Your absolute priority is to capture all Arabic text from the image, preserving its structure. The classification, special formatting for Duas/Ayahs, and stylistic formatting for general text (including the scholarly tone, bullet points, and paragraph breaks) are subsequent steps that apply to the already extracted and structured text.

Here is the image containing Arabic text:
{{media url=photoDataUri}}

Ensure the translation is accurate and maintains the context of the original Arabic text, covering everything from Duas, Quranic Ayahs, to general paragraphs, headings, notes, or any other form of Arabic writing present in the image. Apply the requested stylistic formatting for general English text.
`,
});

const arabicOcrTranslationFlow = ai.defineFlow(
  {
    name: 'arabicOcrTranslationFlow',
    inputSchema: ArabicOcrTranslationInputSchema,
    outputSchema: ArabicOcrTranslationOutputSchema,
  },
  async input => {
    const {output} = await arabicOcrPrompt(input);
    return output!;
  }
);

