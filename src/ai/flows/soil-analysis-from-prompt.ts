'use server';
/**
 * @fileOverview An AI agent to analyze soil and provide crop recommendations and fertilizer plans from a description.
 *
 * - analyzeSoilFromPrompt - A function that handles the soil analysis process.
 * - SoilAnalysisFromPromptInput - The input type for the analyzeSoilFromPrompt function.
 * - SoilAnalysisFromPromptOutput - The return type for the analyzeSoilFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SoilAnalysisFromPromptInputSchema = z.object({
  soilDescription: z
    .string()
    .describe('A description of the soil, including texture, color, and location.'),
});
export type SoilAnalysisFromPromptInput = z.infer<typeof SoilAnalysisFromPromptInputSchema>;

const SoilAnalysisFromPromptOutputSchema = z.object({
  cropRecommendations: z
    .string()
    .describe('Recommended crops based on the soil description.'),
  fertilizerPlan: z
    .string()
    .describe('A potential fertilizer plan based on the soil description.'),
});
export type SoilAnalysisFromPromptOutput = z.infer<typeof SoilAnalysisFromPromptOutputSchema>;

export async function analyzeSoilFromPrompt(
  input: SoilAnalysisFromPromptInput
): Promise<SoilAnalysisFromPromptOutput> {
  return analyzeSoilFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'soilAnalysisFromPrompt',
  input: {schema: SoilAnalysisFromPromptInputSchema},
  output: {schema: SoilAnalysisFromPromptOutputSchema},
  prompt: `You are an expert soil scientist. A farmer has provided the following description of their soil:

{{soilDescription}}

Based on this description, provide crop recommendations and a potential fertilizer plan.

Crop Recommendations:

Fertilizer Plan: `,
});

const analyzeSoilFromPromptFlow = ai.defineFlow(
  {
    name: 'analyzeSoilFromPromptFlow',
    inputSchema: SoilAnalysisFromPromptInputSchema,
    outputSchema: SoilAnalysisFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
