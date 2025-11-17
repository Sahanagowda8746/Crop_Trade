'use server';
/**
 * @fileOverview An AI agent to analyze soil and provide crop recommendations and fertilizer plans from an image.
 *
 * - analyzeSoilFromImage - A function that handles the soil analysis process.
 * - SoilAnalysisFromImageInput - The input type for the analyzeSoilFromImage function.
 * - SoilAnalysisFromImageOutput - The return type for the analyzeSoilFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SoilAnalysisFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a soil sample, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SoilAnalysisFromImageInput = z.infer<typeof SoilAnalysisFromImageInputSchema>;

const SoilAnalysisFromImageOutputSchema = z.object({
  cropRecommendations: z
    .string()
    .describe('A detailed list of crops suitable for the identified soil type. Include reasoning for each recommendation.'),
  fertilizerPlan: z
    .string()
    .describe('A comprehensive fertilizer plan, including types of nutrients needed, application timing, and methods.'),
});
export type SoilAnalysisFromImageOutput = z.infer<typeof SoilAnalysisFromImageOutputSchema>;

export async function analyzeSoilFromImage(
  input: SoilAnalysisFromImageInput
): Promise<SoilAnalysisFromImageOutput> {
  return analyzeSoilFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'soilAnalysisFromImagePrompt',
  input: {schema: SoilAnalysisFromImageInputSchema},
  output: {schema: SoilAnalysisFromImageOutputSchema},
  prompt: `You are an expert soil scientist and agronomist. Analyze the provided image of a soil sample.

1.  **Soil Identification**: Based on the visual characteristics in the image (color, apparent texture, structure), identify the likely soil type (e.g., sandy loam, clay, silt). Describe the visual cues that led to your conclusion.
2.  **Crop Recommendations**: Based on the identified soil type, recommend at least three suitable crops. For each crop, explain why it is a good match for this soil.
3.  **Fertilizer Plan**: Provide a general fertilizer plan for the recommended crops. Suggest the key nutrients (N-P-K ratios) that are likely needed and recommend a schedule for application (e.g., pre-planting, top-dressing).

Analyze the following image:
Soil Image: {{media url=photoDataUri}}`,
});

const analyzeSoilFromImageFlow = ai.defineFlow(
  {
    name: 'analyzeSoilFromImageFlow',
    inputSchema: SoilAnalysisFromImageInputSchema,
    outputSchema: SoilAnalysisFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
