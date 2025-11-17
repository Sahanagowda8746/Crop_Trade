'use server';
/**
 * @fileOverview Diagnoses plant pests and diseases from an image.
 *
 * - diagnosePestFromImage - A function that handles the pest diagnosis process.
 * - DiagnosePestFromImageInput - The input type for the diagnosePestFromImage function.
 * - DiagnosePestFromImageOutput - The return type for the diagnosePestFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosePestFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiagnosePestFromImageInput = z.infer<typeof DiagnosePestFromImageInputSchema>;

const DiagnosePestFromImageOutputSchema = z.object({
  diagnosis: z.string().describe('A detailed diagnosis of potential pests or diseases, including the common and scientific names of any identified issues.'),
  recommendedActions: z.string().describe('A step-by-step list of recommended actions to address the identified threats. Include both organic and chemical treatment options if applicable.'),
});
export type DiagnosePestFromImageOutput = z.infer<typeof DiagnosePestFromImageOutputSchema>;

export async function diagnosePestFromImage(input: DiagnosePestFromImageInput): Promise<DiagnosePestFromImageOutput> {
  return diagnosePestFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePestFromImagePrompt',
  input: {schema: DiagnosePestFromImageInputSchema},
  output: {schema: DiagnosePestFromImageOutputSchema},
  prompt: `You are an expert plant pathologist and agronomist. Analyze the provided image of a plant to identify any pests, diseases, or nutrient deficiencies.

Your diagnosis should be thorough and your recommendations practical for a farmer.

1.  **Diagnosis**: Identify the specific issue (e.g., 'Powdery Mildew,' 'Aphid Infestation,' 'Nitrogen Deficiency'). Provide both the common and scientific names if possible. Describe the signs and symptoms visible in the image that lead you to this conclusion.
2.  **Recommended Actions**: Provide a clear, step-by-step plan for the farmer to manage the issue. Include both immediate actions and long-term preventative measures. Where applicable, suggest both organic and chemical treatment options, including any safety precautions.

Analyze the following image:
Photo: {{media url=photoDataUri}}`,
});

const diagnosePestFromImageFlow = ai.defineFlow(
  {
    name: 'diagnosePestFromImageFlow',
    inputSchema: DiagnosePestFromImageInputSchema,
    outputSchema: DiagnosePestFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
