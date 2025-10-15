'use server';

/**
 * @fileOverview An AI-powered document validation flow.
 *
 * - aiDocumentValidation - A function that validates if a given document is consistent, readable, and complete.
 * - AIDocumentValidationInput - The input type for the aiDocumentValidation function.
 * - AIDocumentValidationOutput - The return type for the aiDocumentValidation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIDocumentValidationInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AIDocumentValidationInput = z.infer<typeof AIDocumentValidationInputSchema>;

const AIDocumentValidationOutputSchema = z.object({
  isConsistent: z.boolean().describe('Whether or not the document is consistent.'),
  isReadable: z.boolean().describe('Whether or not the document is readable.'),
  isComplete: z.boolean().describe('Whether or not the document is complete.'),
  validationDetails: z.string().describe('Details about the validation results.'),
});
export type AIDocumentValidationOutput = z.infer<typeof AIDocumentValidationOutputSchema>;

export async function aiDocumentValidation(input: AIDocumentValidationInput): Promise<AIDocumentValidationOutput> {
  return aiDocumentValidationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDocumentValidationPrompt',
  input: {schema: AIDocumentValidationInputSchema},
  output: {schema: AIDocumentValidationOutputSchema},
  prompt: `You are an AI assistant that validates documents. You will determine if the document is consistent, readable, and complete.

  Document: {{media url=documentDataUri}}
  \nDetermine:
- Whether the document is consistent
- Whether the document is readable
- Whether the document is complete

Output in JSON format:
{
  "isConsistent": true or false,
  "isReadable": true or false,
  "isComplete": true or false,
  "validationDetails": "Details about the validation results."
}
`,
});

const aiDocumentValidationFlow = ai.defineFlow(
  {
    name: 'aiDocumentValidationFlow',
    inputSchema: AIDocumentValidationInputSchema,
    outputSchema: AIDocumentValidationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
