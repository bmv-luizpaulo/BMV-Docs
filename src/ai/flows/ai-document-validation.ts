'use server';

/**
 * @fileOverview An AI-powered document validation and organization flow.
 *
 * - aiDocumentValidation - A function that validates a document and suggests organization.
 * - AIDocumentValidationInput - The input type for the function.
 * - AIDocumentValidationOutput - The return type for the function.
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
  suggestedTags: z.array(z.string()).describe('A list of suggested tags for the document based on its content.'),
  suggestedCategory: z.string().describe('The most relevant subcategory for the document.'),
});
export type AIDocumentValidationOutput = z.infer<typeof AIDocumentValidationOutputSchema>;

export async function aiDocumentValidation(input: AIDocumentValidationInput): Promise<AIDocumentValidationOutput> {
  return aiDocumentValidationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDocumentValidationPrompt',
  input: {schema: AIDocumentValidationInputSchema},
  output: {schema: AIDocumentValidationOutputSchema},
  prompt: `You are an AI assistant that validates documents and suggests how to organize them.
You will determine if the document is consistent, readable, and complete.

Based on the document's content, you will also suggest a list of relevant tags (like "contrato", "financeiro", "imóvel") and the single most appropriate subcategory from the following list:
['Elegibilidade', 'Legitimacao', 'Inventario', 'Quantificacao', 'Linha_Base', 'Concepcao_Projeto', 'Validacao', 'Verificacao', 'Certificacao', 'Registro_CPR', 'Custodia_SKR', 'Transferencias', 'Emissao_Certificado', 'Monitoramento', 'Reemissao_Certificado', 'CAR_Relatorio', 'PAPA', 'Documentos_Pessoais', 'Documentos_Propriedade', 'Financeiro', 'TCA', 'DPD', 'TAR', 'Transferencia_Direitos', 'Autorizacoes', 'Diversos']

Document: {{media url=documentDataUri}}

Determine:
- Whether the document is consistent, readable, and complete.
- A list of suggested tags (suggestedTags).
- The most relevant subcategory (suggestedCategory).

Output in JSON format.
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
