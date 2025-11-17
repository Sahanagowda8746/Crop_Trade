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
  prompt: `You are an expert agronomist AI specializing in soil science and nutrient management for Indian agriculture.

A farmer has provided the following soil test data and wants a fertilizer plan for their chosen crop. Analyze the data and provide a set of clear, actionable recommendations.

**Soil Data:**
- Soil Type: {{{soilType}}}
- pH: {{{ph}}}
- Nitrogen (N): {{{nitrogen}}} kg/ha
- Phosphorus (P): {{{phosphorus}}} kg/ha
- Potassium (K): {{{potassium}}} kg/ha

**Target Crop:** {{{targetCrop}}}

**Your Task:**

1.  **Analyze Nutrient Levels**: Determine if N, P, and K are low, medium, or high for the specified crop.
2.  **Provide Recommendations**: Based on the nutrient levels and crop requirements, recommend specific fertilizers (e.g., Urea, Diammonium Phosphate (DAP), Muriate of Potash (MOP), Single Super Phosphate (SSP)). For each fertilizer, provide:
    - The recommended application rate in kg/ha.
    - The best timing for application (e.g., basal, top dressing, specific growth stages).
    - A simple reason for the recommendation.
3.  **Address pH**: If the pH is outside the ideal range for the crop, provide a clear warning and suggest soil amendments (e.g., Lime for acidic soil, Gypsum for alkaline soil) with application rates.
4.  **General Advice**: Give a concluding paragraph of general advice for nutrient management for this specific crop in this soil type.

Generate the response in the required JSON format. Ensure the recommendations are practical for a typical Indian farmer.`,
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
        throw new Error("AI failed to generate a fertilizer plan.");
    }
    return output;
  }
);
