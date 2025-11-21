'use server';
/**
 * @fileOverview An AI agent to calculate fertilizer recommendations based on soil data and crop type.
 *
 * - calculateFertilizer - A function that handles the calculation process.
 * - FertilizerCalculatorInput - The input type for the calculateFertilizer function.
 * - FertilizerCalculatorOutput - The return type for the calculateFertilizer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FertilizerCalculatorInputSchema = z.object({
  nitrogen: z.number().describe('The nitrogen (N) content of the soil in kg/ha.'),
  phosphorus: z.number().describe('The phosphorus (P) content of the soil in kg/ha.'),
  potassium: z.number().describe('The potassium (K) content of the soil in kg/ha.'),
  ph: z.number().min(0).max(14).describe('The pH level of the soil.'),
  soilType: z.string().describe('The type of soil (e.g., Sandy, Loam, Clay).'),
  targetCrop: z.string().describe('The crop you intend to grow (e.g., Wheat, Corn, Tomatoes).'),
});
export type FertilizerCalculatorInput = z.infer<typeof FertilizerCalculatorInputSchema>;

const FertilizerRecommendationSchema = z.object({
    name: z.string().describe('The name of the fertilizer (e.g., Urea, DAP, MOP).'),
    applicationRate: z.string().describe('The recommended application rate (e.g., "120 kg/ha").'),
    timing: z.string().describe('When to apply the fertilizer (e.g., "Basal dose at sowing").'),
    reason: z.string().describe('A brief reason for this recommendation.'),
});

const FertilizerCalculatorOutputSchema = z.object({
    recommendations: z.array(FertilizerRecommendationSchema).describe('A list of fertilizer recommendations.'),
    warnings: z.array(z.string()).describe('Any warnings or important considerations, such as pH adjustments needed.'),
    generalAdvice: z.string().describe('Overall advice for soil and nutrient management for the target crop.'),
});
export type FertilizerCalculatorOutput = z.infer<typeof FertilizerCalculatorOutputSchema>;

export async function calculateFertilizer(
  input: FertilizerCalculatorInput
): Promise<FertilizerCalculatorOutput> {
  return fertilizerCalculatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fertilizerCalculatorPrompt',
  input: {schema: FertilizerCalculatorInputSchema},
  output: {schema: FertilizerCalculatorOutputSchema},
  prompt: `You are an expert agronomist AI specializing in soil science and nutrient management. Your task is to provide a fertilizer plan based on soil data and a target crop.

Analyze the following data and generate a response in the required JSON format.

**Soil Data:**
- Soil Type: {{{soilType}}}
- pH: {{{ph}}}
- Nitrogen (N): {{{nitrogen}}} kg/ha
- Phosphorus (P): {{{phosphorus}}} kg/ha
- Potassium (K): {{{potassium}}} kg/ha

**Target Crop:** {{{targetCrop}}}

**Instructions:**
1.  **Analyze Nutrient Levels**: Determine if N, P, and K are low, medium, or high for the target crop.
2.  **Provide Recommendations**: Based on the analysis, recommend specific fertilizers (e.g., Urea, DAP, MOP). For each, provide the application rate (kg/ha), timing, and a simple reason.
3.  **Address pH**: If the pH is outside the ideal range, provide a warning and suggest amendments (e.g., Lime for acidic, Gypsum for alkaline).
4.  **General Advice**: Give a concluding paragraph of general advice for nutrient management for this crop in this soil type.`,
});

const fertilizerCalculatorFlow = ai.defineFlow(
  {
    name: 'fertilizerCalculatorFlow',
    inputSchema: FertilizerCalculatorInputSchema,
    outputSchema: FertilizerCalculatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate a fertilizer plan. The model may be overloaded or the input is invalid.");
    }
    return output;
  }
);
