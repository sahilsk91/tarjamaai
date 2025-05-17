import type { ArabicOcrTranslationOutput } from "@/ai/flows/arabic-ocr-translation";

export interface TranslationResult extends ArabicOcrTranslationOutput {
  id: string; // Unique ID for the result, e.g., based on filename or a generated hash
  filename?: string; // Original filename
  imageDataUri?: string; // The URI of the uploaded image, for display
}

export interface ImprovementFeedback {
  feedback: string;
}
