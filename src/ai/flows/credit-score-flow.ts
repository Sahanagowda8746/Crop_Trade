'use server';
/**
 * @fileOverview An AI agent to assess a farmer's creditworthiness.
 *
 * - assessCreditScore - A function that handles the credit assessment process.
 * - CreditScoreInput - The input type for the assessCreditScore function.
 * - CreditScoreOutput - The return type for the assessCreditScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreditScoreInputSchema = z.object({
  annualRevenue: z.number().positive('Annual revenue must be a positive number.'),
  yearsFarming: z.number().int().min(0, 'Years in farming cannot be negative.'),
  loanHistory: z.enum(['No Loans', 'Paid On Time', 'Minor Delays', 'Major Delays']),
  outstandingDebt: z.number().min(0, 'Outstanding debt cannot be negative.'),
});
export type CreditScoreInput = z.infer<typeof CreditScoreInputSchema>;

const CreditScoreOutputSchema = z.object({
  creditScore: z.number().int().min(300).max(850).describe('The calculated credit score, ranging from 300 to 850.'),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Very High']).describe('The assessed credit risk level.'),
  analysis: z.string().describe('A detailed analysis of the factors contributing to the score.'),
  recommendations: z.array(z.string()).describe('Actionable recommendations for improving the credit score.'),
});
export type CreditScoreOutput = z.infer<typeof CreditScoreOutputSchema>;


export async function assessCreditScore(
  input: CreditScoreInput
): Promise<CreditScoreOutput> {
  return creditScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'creditScorePrompt',
  input: {schema: CreditScoreInputSchema},
  output: {schema: CreditScoreOutputSchema},
  prompt: `You are an expert financial analyst AI for the agricultural sector. Your task is to assess a farmer's creditworthiness based on the data they provide and generate a credit score and analysis.

**Input Data:**
- Annual Farm Revenue: {{{annualRevenue}}}
- Years in Farming: {{{yearsFarming}}}
- Past Loan History: {{{loanHistory}}}
- Total Outstanding Debt: {{{outstandingDebt}}}

**Your Analysis Must Include:**

1.  **Credit Score**: Calculate a credit score between 300 and 850. A higher revenue and more years of experience should positively impact the score. A history of delayed payments or high outstanding debt should negatively impact it.
2.  **Risk Level**: Categorize the risk as 'Low' (750-850), 'Medium' (650-749), 'High' (550-649), or 'Very High' (300-549).
3.  **Analysis**: Provide a brief paragraph explaining the key factors that influenced the score. Mention both strengths and weaknesses in the farmer's profile.
4.  **Recommendations**: Provide at least two actionable recommendations for the farmer to improve their credit score and financial health.

Generate the response in the required JSON format.`,
});

const creditScoreFlow = ai.defineFlow(
  {
    name: 'creditScoreFlow',
    inputSchema: CreditScoreInputSchema,
    outputSchema: CreditScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
     if (!output) {
        throw new Error("AI failed to generate a credit score assessment.");
    }
    return output;
  }
);
