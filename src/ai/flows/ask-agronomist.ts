'use server';

/**
 * @fileOverview An AI agent that acts as an expert agronomist to answer user questions.
 *
 * - askAgronomist - A function that handles the question-answering process.
 * - AskAgronomistInput - The input type for the askAgronomist function.
 * - AskAgronomistOutput - The return type for the askAgronomist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskAgronomistInputSchema = z.object({
  question: z.string().describe('The user\'s question about agriculture.'),
});
export type AskAgronomistInput = z.infer<typeof AskAgronomistInputSchema>;

const AskAgronomistOutputSchema = z.object({
  answer: z
    .string()
    .describe('A helpful and accurate answer to the user\'s question.'),
});
export type AskAgronomistOutput = z.infer<typeof AskAgronomistOutputSchema>;

export async function askAgronomist(
  input: AskAgronomistInput
): Promise<AskAgronomistOutput> {
  return askAgronomistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askAgronomistPrompt',
  input: {schema: AskAgronomistInputSchema},
  output: {schema: AskAgronomistOutputSchema},
  prompt: `You are an expert agronomist and AI assistant for the CropTrade platform. Your role is to provide clear, concise, and accurate advice to farmers.

User's Question:
"{{{question}}}"

Provide a helpful answer.`,
});

const askAgronomistFlow = ai.defineFlow(
  {
    name: 'askAgronomistFlow',
    inputSchema: AskAgronomistInputSchema,
    outputSchema: AskAgronomistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
