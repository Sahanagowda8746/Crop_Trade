
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

// Internal schema that includes the weather forecast
const CombinedInputSchema = YieldPredictionInputSchema.extend({
    weatherForecast: z.string().describe("The 7-day weather forecast for the region.")
});

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
  input: {schema: CombinedInputSchema},
  output: {schema: YieldPredictionOutputSchema},
  prompt: `You are an agricultural data scientist AI. Your task is to predict crop yield based on provided data. Analyze the user's data AND the provided weather forecast.

**Input Data:**
- Crop: {{{cropType}}}
- Acreage: {{{acreage}}}
- Soil Type: {{{soilType}}}
- Nitrogen: {{{nitrogenLevel}}} kg/ha
- Phosphorus: {{{phosphorusLevel}}} kg/ha
- Potassium: {{{potassiumLevel}}} kg/ha
- Region: {{{region}}}
- Historical Yield: {{{historicalYield}}}
- Weather Forecast: {{{weatherForecast}}}

**Your Analysis Must Include:**
1.  **predictedYield**: A realistic range for total yield (e.g., "400-420 tons").
2.  **yieldPerAcre**: A realistic range for per-acre yield (e.g., "4.0-4.2 tons/acre").
3.  **confidenceScore**: A confidence score from 0-100. Higher confidence for stable weather and if historical data is provided.
4.  **influencingFactors**: List at least three key factors. The weather forecast MUST be one. State its impact ('Positive', 'Negative', 'Neutral') and add a brief comment.
5.  **recommendations**: Provide at least two actionable recommendations to maximize yield.

Generate the response in the required JSON format.`,
});

const yieldPredictionFlow = ai.defineFlow(
  {
    name: 'yieldPredictionFlow',
    inputSchema: YieldPredictionInputSchema,
    outputSchema: YieldPredictionOutputSchema,
  },
  async input => {
    // 1. Explicitly call the weather tool
    const weather = await getWeatherForecast({ region: input.region });

    // 2. Combine the user input with the weather data
    const combinedData = {
      ...input,
      weatherForecast: weather.forecast,
    };
    
    // 3. Call the prompt with the complete data
    const {output} = await prompt(combinedData);

    if (!output) {
      throw new Error("AI failed to generate a yield prediction.");
    }
    return output;
  }
);
