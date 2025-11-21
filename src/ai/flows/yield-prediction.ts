
'use server';
/**
 * @fileOverview An AI agent to predict crop yield based on various agricultural inputs.
 *
 * - predictYield - A function that handles the yield prediction process.
 * - YieldPredictionInput - The input type for the predictYield function.
 * - YieldPredictionOutput - The return type for the predictYield function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getWeatherForecast} from '@/ai/tools/weather-tool';

const YieldPredictionInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown (e.g., Wheat, Corn).'),
  acreage: z.number().positive().describe('The total land area in acres.'),
  soilType: z.string().describe('The type of soil (e.g., Loam, Clay).'),
  nitrogenLevel: z.number().describe('Soil nitrogen level in kg/ha.'),
  phosphorusLevel: z.number().describe('Soil phosphorus level in kg/ha.'),
  potassiumLevel: z.number().describe('Soil potassium level in kg/ha.'),
  region: z.string().describe('The geographical region or state.'),
  historicalYield: z.string().optional().describe('The average yield from previous seasons for this crop, if available (e.g., "4 tons/acre").'),
});
export type YieldPredictionInput = z.infer<typeof YieldPredictionInputSchema>;

const YieldPredictionOutputSchema = z.object({
    predictedYield: z.string().describe('The estimated total yield for the entire acreage (e.g., "400-420 tons").'),
    yieldPerAcre: z.string().describe('The estimated yield per acre (e.g., "4.0-4.2 tons/acre").'),
    confidenceScore: z.number().min(0).max(100).describe('A confidence score (0-100) for the prediction.'),
    influencingFactors: z.array(z.object({
        factor: z.string().describe('The factor influencing the yield (e.g., "Soil Nitrogen Levels", "Rainfall Forecast").'),
        impact: z.enum(['Positive', 'Negative', 'Neutral']).describe('The predicted impact of this factor.'),
        comment: z.string().describe('A brief explanation of the impact.'),
    })).describe('A list of key factors influencing the prediction.'),
    recommendations: z.array(z.string()).describe('Actionable recommendations to improve the predicted yield.'),
});
export type YieldPredictionOutput = z.infer<typeof YieldPredictionOutputSchema>;


export async function predictYield(
  input: YieldPredictionInput
): Promise<YieldPredictionOutput> {
  return yieldPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'yieldPredictionPrompt',
  input: {schema: YieldPredictionInputSchema},
  output: {schema: YieldPredictionOutputSchema},
  tools: [getWeatherForecast],
  system: `You are an agricultural data scientist AI. Your task is to predict crop yield based on provided data.

**CRITICAL Instructions:**
1.  **IMMEDIATELY use the getWeatherForecast tool** for the user's specified region. This is a mandatory first step.
2.  Analyze the user's data AND the weather forecast you fetched.
3.  Generate the response in the required JSON format with the following fields:
    - **predictedYield**: A realistic range for total yield (e.g., "400-420 tons").
    - **yieldPerAcre**: A realistic range for per-acre yield (e.g., "4.0-4.2 tons/acre").
    - **confidenceScore**: A confidence score from 0-100. Higher confidence for stable weather and if historical data is provided.
    - **influencingFactors**: List at least three key factors. The weather forecast MUST be one. State its impact ('Positive', 'Negative', 'Neutral') and add a brief comment.
    - **recommendations**: Provide at least two actionable recommendations to maximize yield.`,
});

const yieldPredictionFlow = ai.defineFlow(
  {
    name: 'yieldPredictionFlow',
    inputSchema: YieldPredictionInputSchema,
    outputSchema: YieldPredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a yield prediction.");
    }
    return output;
  }
);

