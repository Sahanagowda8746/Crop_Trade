'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating crop descriptions.
 *
 * It includes the `generateCropDescription` function, which takes crop details as input and returns an engaging description.
 * It also defines the input and output schemas for the flow.
 *
 * @exports generateCropDescription - The main function to generate crop descriptions.
 * @exports CropDescriptionInput - The input type for the generateCropDescription function.
 * @exports CropDescriptionOutput - The output type for the generateCropDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropDescriptionInputSchema = z.object({
  cropName: z.string().describe('The name of the crop.'),
  variety: z.string().describe('The specific variety of the crop.'),
  growingConditions: z
    .string()
    .describe('Description of the growing conditions for the crop.'),
  yield: z.string().describe('The yield of the crop.'),
  uniqueQualities: z
    .string()
    .describe('Unique qualities or characteristics of the crop.'),
});
export type CropDescriptionInput = z.infer<typeof CropDescriptionInputSchema>;

const CropDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('An engaging and informative description of the crop.'),
});
export type CropDescriptionOutput = z.infer<typeof CropDescriptionOutputSchema>;

export async function generateCropDescription(
  input: CropDescriptionInput
): Promise<CropDescriptionOutput> {
  return cropDescriptionGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropDescriptionPrompt',
  input: {schema: CropDescriptionInputSchema},
  output: {schema: CropDescriptionOutputSchema},
  prompt: `You are an agricultural marketing expert. Generate an appealing description for the following crop listing to attract more buyers.

Crop Name: {{{cropName}}}
Variety: {{{variety}}}
Growing Conditions: {{{growingConditions}}}
Yield: {{{yield}}}
Unique Qualities: {{{uniqueQualities}}}

Write a compelling description that highlights the best features of this crop.`,
});

const cropDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'cropDescriptionGeneratorFlow',
    inputSchema: CropDescriptionInputSchema,
    outputSchema: CropDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
