'use server';
/**
 * @fileOverview An AI agent to assess crop insurance risk.
 *
 * - assessInsuranceRisk - A function that handles the risk assessment process.
 * - InsuranceRiskInput - The input type for the assessInsuranceRisk function.
 * - InsuranceRiskOutput - The return type for the assessInsuranceRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InsuranceRiskInputSchema = z.object({
  cropType: z.string().describe('The type of crop being insured (e.g., Rice, Cotton).'),
  region: z.string().describe('The geographical location of the farm (e.g., Coastal Andhra Pradesh, India).'),
  acreage: z.number().positive().describe('The number of acres being farmed.'),
  historicalEvents: z.enum(['None', 'Rare', 'Occasional', 'Frequent']).describe('The frequency of historical extreme weather events (floods, droughts, hail) in the last 5 years.'),
});
export type InsuranceRiskInput = z.infer<typeof InsuranceRiskInputSchema>;

const InsuranceRiskOutputSchema = z.object({
  riskScore: z.number().int().min(0).max(100).describe('A calculated risk score from 0 (low risk) to 100 (high risk).'),
  riskLevel: z.enum(['Low', 'Moderate', 'High', 'Very High']).describe('The overall assessed risk level.'),
  premiumEstimate: z.string().describe('An estimated insurance premium range per acre (e.g., "₹2,000-₹3,500 per acre").'),
  riskFactors: z.array(z.object({
      impact: z.enum(['Positive', 'Negative']),
      reason: z.string(),
  })).describe('A list of key factors influencing the risk score.'),
  mitigationSteps: z.array(z.string()).describe('Actionable recommendations to lower the insurance risk.'),
});
export type InsuranceRiskOutput = z.infer<typeof InsuranceRiskOutputSchema>;


export async function assessInsuranceRisk(
  input: InsuranceRiskInput
): Promise<InsuranceRiskOutput> {
  return insuranceRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'insuranceRiskPrompt',
  input: {schema: InsuranceRiskInputSchema},
  output: {schema: InsuranceRiskOutputSchema},
  prompt: `You are an expert agricultural insurance underwriter AI. Your task is to assess the risk profile for a farmer's crop and provide an estimated insurance premium.

**Input Data:**
- Crop: {{{cropType}}}
- Region: {{{region}}}
- Acreage: {{{acreage}}} acres
- Historical Extreme Weather: {{{historicalEvents}}}

**Your Analysis Must Include:**

1.  **Risk Score**: Calculate a risk score from 0 to 100. High-risk crops (like cotton) or regions prone to extreme weather (like coastal areas for cyclones) should have a higher score. A history of frequent events MUST significantly increase the score.
2.  **Risk Level**: Categorize the score: 'Low' (0-25), 'Moderate' (26-50), 'High' (51-75), 'Very High' (76-100).
3.  **Premium Estimate**: Based on the risk score, provide a realistic estimated premium range per acre in Indian Rupees (₹). Higher risk must lead to a higher premium.
4.  **Risk Factors**: List the key positive and negative factors from the input that influenced your decision. For example, a 'Negative' factor could be "Region is prone to coastal cyclones, increasing risk."
5.  **Mitigation Steps**: Provide at least two actionable recommendations the farmer could take to reduce their risk profile (e.g., "Install hail nets," "Improve field drainage systems").

Generate the response in the required JSON format.`,
});

const insuranceRiskFlow = ai.defineFlow(
  {
    name: 'insuranceRiskFlow',
    inputSchema: InsuranceRiskInputSchema,
    outputSchema: InsuranceRiskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
     if (!output) {
        throw new Error("AI failed to generate an insurance risk assessment.");
    }
    return output;
  }
);
