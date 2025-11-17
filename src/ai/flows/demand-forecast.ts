'use server';
/**
 * @fileOverview An AI agent to forecast crop demand and pricing trends.
 *
 * - forecastDemand - A function that handles the demand forecasting process.
 * - DemandForecastInput - The input type for the forecastDemand function.
 * - DemandForecastOutput - The return type for the forecastDemand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DemandForecastInputSchema = z.object({
  cropType: z.string().describe('The type of crop (e.g., Wheat, Rice, Cotton).'),
  region: z.string().describe('The target market region (e.g., North India, California).'),
  month: z.string().describe('The future month for the forecast (e.g., "July").'),
});
export type DemandForecastInput = z.infer<typeof DemandForecastInputSchema>;

const TrendSchema = z.enum(['Increasing', 'Decreasing', 'Stable']);

const DemandForecastOutputSchema = z.object({
    demand: z.object({
        trend: TrendSchema,
        reason: z.string().describe('A brief explanation for the predicted demand trend.'),
    }),
    price: z.object({
        trend: TrendSchema,
        reason: z.string().describe('A brief explanation for the predicted price trend.'),
        estimatedRange: z.string().describe('An estimated price range per unit (e.g., "₹2,100-₹2,300 per quintal").'),
    }),
    analysis: z.string().describe('A summary of the market conditions, including factors like weather, government policies, and export/import scenarios.'),
    recommendations: z.array(z.string()).describe('Actionable recommendations for the farmer, such as when to sell, whether to store, or what markets to target.'),
});
export type DemandForecastOutput = z.infer<typeof DemandForecastOutputSchema>;


export async function forecastDemand(
  input: DemandForecastInput
): Promise<DemandForecastOutput> {
  return demandForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'demandForecastPrompt',
  input: {schema: DemandForecastInputSchema},
  output: {schema: DemandForecastOutputSchema},
  prompt: `You are an expert agricultural market analyst AI. Your task is to provide a demand and price forecast for a specific crop in a given region and month.

**Input Data:**
- Crop: {{{cropType}}}
- Region: {{{region}}}
- Month: {{{month}}}

**Your Analysis Must Include:**

1.  **Demand Trend**: Predict whether the demand for this crop will be 'Increasing', 'Decreasing', or 'Stable'. Provide a concise reason based on factors like seasonal consumption, festivals, industrial use, etc.
2.  **Price Trend**: Predict whether the market price will be 'Increasing', 'Decreasing', or 'Stable'. Provide a reason, considering demand, supply from harvests, storage levels, and government MSP (Minimum Support Price) if applicable. Also, provide an estimated price range (e.g., per quintal or ton).
3.  **Overall Analysis**: Summarize the key factors that will influence the market during the specified month. Consider weather forecasts, government policies, international market trends, and logistical factors.
4.  **Strategic Recommendations**: Provide at least two clear, actionable recommendations for a farmer. For example: "Sell immediately after harvest to capitalize on high demand," or "Store the crop for 2-3 weeks as prices are expected to rise."

Generate the response in the required JSON format.`,
});

const demandForecastFlow = ai.defineFlow(
  {
    name: 'demandForecastFlow',
    inputSchema: DemandForecastInputSchema,
    outputSchema: DemandForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
     if (!output) {
        throw new Error("AI failed to generate a demand forecast.");
    }
    return output;
  }
);
