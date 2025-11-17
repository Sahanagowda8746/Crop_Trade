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
  diagnosis: z.string().describe('The diagnosis of potential pests or diseases.'),
  recommendedActions: z.string().describe('Recommended actions to address the identified threats.'),
});
export type DiagnosePestFromImageOutput = z.infer<typeof DiagnosePestFromImageOutputSchema>;

export async function diagnosePestFromImage(input: DiagnosePestFromImageInput): Promise<DiagnosePestFromImageOutput> {
  return diagnosePestFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePestFromImagePrompt',
  input: {schema: DiagnosePestFromImageInputSchema},
  output: {schema: DiagnosePestFromImageOutputSchema},
  prompt: `You are an expert in plant pathology. Analyze the provided image of a plant and provide a diagnosis of potential pests or diseases, along with recommended actions to address the identified threats.

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
