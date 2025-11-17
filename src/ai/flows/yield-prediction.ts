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
  prompt: `You are a world-class agricultural data scientist AI. Your task is to predict crop yield based on the provided data. Provide a realistic and data-driven forecast.

**Input Data:**
- Crop: {{{cropType}}}
- Acreage: {{{acreage}}} acres
- Soil Type: {{{soilType}}}
- Region: {{{region}}}
- Soil Nutrients (kg/ha): N={{{nitrogenLevel}}}, P={{{phosphorusLevel}}}, K={{{potassiumLevel}}}
- Historical Yield (if provided): {{{historicalYield}}}

**Your Analysis Must Include:**

1.  **Predicted Yield**: Provide a realistic range for the total yield (e.g., "400-420 tons") and per-acre yield (e.g., "4.0-4.2 tons/acre").
2.  **Confidence Score**: Give a confidence score from 0-100. Base this on the quality of input data. If historical data is provided, the confidence should be higher.
3.  **Influencing Factors**: Identify at least three key factors that will influence this prediction. For each factor, state its impact ('Positive', 'Negative', 'Neutral') and provide a brief comment. Consider typical weather patterns for the region but state that actual weather will be a major variable.
4.  **Recommendations**: Provide at least two actionable recommendations for the farmer to maximize their yield based on the data.

Assume standard farming practices for the region unless otherwise specified. Generate the response in the required JSON format.`,
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
