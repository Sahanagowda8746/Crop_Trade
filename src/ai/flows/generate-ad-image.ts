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
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a high-quality, professional, and appealing marketing photograph for an agricultural product. The photo should look realistic and be suitable for an online marketplace.

Product Description: "${input.description}"

The image should be well-lit, with a clean background, and make the product look fresh and desirable. Do not include any text or logos in the image.`,
    });
    if (!media.url) {
      throw new Error('Image generation failed to return a URL.');
    }
    return {
      imageUrl: media.url,
    };
  }
);
