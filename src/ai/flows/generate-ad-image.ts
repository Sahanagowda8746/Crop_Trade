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
    // Generate a 1-2 word hint for Unsplash from the description
    const hintResponse = await ai.generate({
      prompt: `From the following crop description, extract a concise 1 or 2-word hint that can be used to search for a relevant stock photo on Unsplash. For example, if the description is "Freshly harvested, bright red Roma tomatoes", a good hint would be "red tomatoes".

Description: "${input.description}"

Hint:`,
      output: {
        format: 'text',
      },
    });

    const hint = hintResponse.text.trim().replace(/\s+/g, ' ');

    // Use the generated hint as a seed for Picsum, which pulls from Unsplash
    const seed = hint.replace(/\s+/g, '-').toLowerCase();
    const imageUrl = `https://picsum.photos/seed/${seed}/1280/720`;
    
    return {
      imageUrl: imageUrl,
    };
  }
);
