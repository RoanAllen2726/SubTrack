'use server';

/**
 * @fileOverview An AI agent for analyzing subscription notes.
 *
 * - analyzeSubscriptionNotes - A function that analyzes subscription notes to highlight key information.
 * - AnalyzeSubscriptionNotesInput - The input type for the analyzeSubscriptionNotes function.
 * - AnalyzeSubscriptionNotesOutput - The return type for the analyzeSubscriptionNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSubscriptionNotesInputSchema = z.object({
  notes: z.string().describe('The subscription notes to analyze.'),
});
export type AnalyzeSubscriptionNotesInput = z.infer<typeof AnalyzeSubscriptionNotesInputSchema>;

const AnalyzeSubscriptionNotesOutputSchema = z.object({
  summary: z.string().describe('A summary of the key information found in the notes.'),
});
export type AnalyzeSubscriptionNotesOutput = z.infer<typeof AnalyzeSubscriptionNotesOutputSchema>;

export async function analyzeSubscriptionNotes(input: AnalyzeSubscriptionNotesInput): Promise<AnalyzeSubscriptionNotesOutput> {
  return analyzeSubscriptionNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSubscriptionNotesPrompt',
  input: {schema: AnalyzeSubscriptionNotesInputSchema},
  output: {schema: AnalyzeSubscriptionNotesOutputSchema},
  prompt: `You are an AI assistant that analyzes subscription notes and highlights key information such as cancellation terms, support contacts, or specific renewal conditions.

  Analyze the following subscription notes and provide a concise summary of the important details:

  Notes: {{{notes}}}
  `,
});

const analyzeSubscriptionNotesFlow = ai.defineFlow(
  {
    name: 'analyzeSubscriptionNotesFlow',
    inputSchema: AnalyzeSubscriptionNotesInputSchema,
    outputSchema: AnalyzeSubscriptionNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
