"use server";

import { aiDocumentValidation, type AIDocumentValidationInput } from "@/ai/flows/ai-document-validation";

export async function validateDocument(
  input: AIDocumentValidationInput
) {
  // Add a small delay to simulate network latency and show loading state
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    const result = await aiDocumentValidation(input);
    return result;
  } catch (error) {
    console.error("AI validation failed:", error);
    // In a real app, you might want to throw a more specific error
    // or return a structured error object.
    throw new Error("Failed to validate document with AI.");
  }
}
