'use server';

/**
 * @fileOverview An AI agent for extracting subscription information from a PDF.
 * 
 * - extractSubscriptionsFromPdf - A function that handles the subscription extraction process from a PDF.
 * - ExtractSubscriptionsInput - The input type for the extractSubscriptionsFromPdf function.
 * - ExtractSubscriptionsOutput - The return type for the extractSubscriptionsFromPdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ExtractedSubscriptionSchema } from '@/lib/types';

const ExtractSubscriptionsInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'"
    ),
});
export type ExtractSubscriptionsInput = z.infer<typeof ExtractSubscriptionsInputSchema>;

const ExtractSubscriptionsOutputSchema = z.object({
  subscriptions: z.array(ExtractedSubscriptionSchema),
});
export type ExtractSubscriptionsOutput = z.infer<typeof ExtractSubscriptionsOutputSchema>;

export async function extractSubscriptionsFromPdf(input: ExtractSubscriptionsInput): Promise<ExtractSubscriptionsOutput> {
  return extractSubscriptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractSubscriptionsPrompt',
  input: { schema: ExtractSubscriptionsInputSchema },
  output: { schema: ExtractSubscriptionsOutputSchema },
  prompt: `You are an expert at analyzing financial documents like invoices and bank statements to find subscription services.

  Analyze the following document and extract all unique subscriptions you can find.
  Go through every page and identify recurring payments.
  Common subscription services include Netflix, Spotify, Adobe, GitHub, etc. Pay close attention to these.
  If you see the same subscription mentioned multiple times (e.g., on different monthly statements), only extract it once.
  
  For each unique subscription, provide the name, category, price, currency, billing cycle, and next charge date.
  If a detail is not present, you can make a reasonable assumption (e.g., status is 'active').
  For bank statements, the billing cycle will likely be monthly.
  Today's date is ${new Date().toLocaleDateString()}.

  Document Content:
  {{media url=pdfDataUri}}
  `,
});

const extractSubscriptionsFlow = ai.defineFlow(
  {
    name: 'extractSubscriptionsFlow',
    inputSchema: ExtractSubscriptionsInputSchema,
    outputSchema: ExtractSubscriptionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
