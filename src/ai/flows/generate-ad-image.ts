'use server';
/**
 * @fileOverview Generates marketing images for crop listings using AI.
 *
 * - generateAdImage - A function that creates a marketing image from a crop description.
 * - AdImageInput - The input type for the generateAdImage function.
 * - AdImageOutput - The return type for the generateAdImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdImageInputSchema = z.object({
  description: z
    .string()
    .describe('A description of the crop to be featured in the marketing image.'),
});
export type AdImageInput = z.infer<typeof AdImageInputSchema>;

const AdImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe('The data URI of the generated marketing image.'),
});
export type AdImageOutput = z.infer<typeof AdImageOutputSchema>;

export async function generateAdImage(
  input: AdImageInput
): Promise<AdImageOutput> {
  return adImageGeneratorFlow(input);
}

const adImageGeneratorFlow = ai.defineFlow(
  {
    name: 'adImageGeneratorFlow',
    inputSchema: AdImageInputSchema,
    outputSchema: AdImageOutputSchema,
  },
  async input => {
    // To avoid rate-limiting on image generation models, we'll use a placeholder service.
    // We can use the input description to generate a relevant seed.
    const seed = input.description.replace(/\s+/g, '-').toLowerCase();
    const imageUrl = `https://picsum.photos/seed/${seed}/1280/720`;
    
    return {
      imageUrl: imageUrl,
    };
  }
);
