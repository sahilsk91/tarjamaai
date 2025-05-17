"use server";

import { arabicOcrTranslation, type ArabicOcrTranslationInput, type ArabicOcrTranslationOutput } from "@/ai/flows/arabic-ocr-translation";
import { improveTranslation, type ImproveTranslationInput, type ImproveTranslationOutput } from "@/ai/flows/translation-improvement";

export async function processImageForTranslation(
  input: ArabicOcrTranslationInput
): Promise<ArabicOcrTranslationOutput> {
  try {
    const result = await arabicOcrTranslation(input);
    return result;
  } catch (error) {
    console.error("Error in processImageForTranslation:", error);
    throw new Error("Failed to process image for translation.");
  }
}

export async function submitTranslationImprovement(
  input: ImproveTranslationInput
): Promise<ImproveTranslationOutput> {
  try {
    const result = await improveTranslation(input);
    return result;
  } catch (error) {
    console.error("Error in submitTranslationImprovement:", error);
    throw new Error("Failed to submit translation improvement.");
  }
}
