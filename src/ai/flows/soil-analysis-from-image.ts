'use server';
/**
 * @fileOverview An AI agent to analyze soil and provide crop recommendations and fertilizer plans from an image.
 *
 * - analyzeSoilFromImage - A function that handles the soil analysis process and saves the result to Firestore.
 * - SoilAnalysisFromImageInput - The input type for the analyzeSoilFromImage function.
 * - SoilAnalysisFromImageOutput - The return type for the analyzeSoilFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getSdks, initializeFirebase } from '@/firebase';

const SoilAnalysisFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a soil sample, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userId: z.string().describe("The ID of the user requesting the analysis."),
});
export type SoilAnalysisFromImageInput = z.infer<typeof SoilAnalysisFromImageInputSchema>;

export const SoilAnalysisFromImageOutputSchema = z.object({
    soilType: z.string().describe("The identified type of the soil (e.g., Sandy Loam, Clay, Silt)."),
    moisture: z.string().describe("An estimation of the soil's moisture level (e.g., Dry, Moist, Wet)."),
    texture: z.string().describe("The classified texture of the soil (e.g., Fine, Medium, Coarse)."),
    phEstimate: z.number().describe("An estimated pH level of the soil (e.g., 6.2)."),
    nutrientAnalysis: z.object({
        nitrogen: z.enum(['Low', 'Moderate', 'High']).describe("The predicted level of Nitrogen."),
        phosphorus: z.enum(['Low', 'Moderate', 'High']).describe("The predicted level of Phosphorus."),
        potassium: z.enum(['Low', 'Moderate', 'High']).describe("The predicted level of Potassium."),
    }),
    fertilityScore: z.number().min(0).max(100).describe("An overall soil fertility score out of 100."),
    recommendedCrops: z.array(z.string()).describe("A list of crop names suitable for the soil."),
    fertilizerPlan: z.array(z.string()).describe("A list of recommended fertilizers and application advice."),
    generalAdvice: z.string().describe("Simple, actionable advice for the farmer to improve soil health."),
});
export type SoilAnalysisFromImageOutput = z.infer<typeof SoilAnalysisFromImageOutputSchema>;


export async function analyzeSoilFromImage(
  input: SoilAnalysisFromImageInput
): Promise<SoilAnalysisFromImageOutput> {
  return analyzeSoilFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'soilAnalysisFromImagePrompt',
  input: {schema: SoilAnalysisFromImageInputSchema},
  output: {schema: SoilAnalysisFromImageOutputSchema},
  prompt: `You are an expert soil scientist and agronomist AI for the AgriLink platform. Analyze the provided image of a soil sample and return a structured JSON output.

Based on the visual characteristics in the image (color, apparent texture, structure, moisture sheen), provide a detailed analysis.

1.  **Soil Identification**: Identify the likely soil type (e.g., Sandy Loam, Clay, Silt).
2.  **Moisture & Texture**: Estimate moisture and classify texture.
3.  **pH Estimate**: Provide a numerical pH estimate.
4.  **Nutrient Prediction**: Predict the levels for Nitrogen, Phosphorus, and Potassium as 'Low', 'Moderate', or 'High'.
5.  **Fertility Score**: Calculate an overall fertility score from 0 to 100 based on all factors.
6.  **Recommendations**: Recommend at least three suitable crops and a clear, actionable fertilizer plan (e.g., "Urea @ 70kg/acre").
7.  **General Advice**: Provide a simple, summary sentence of advice for the farmer.

Analyze the following image:
Soil Image: {{media url=photoDataUri}}`,
});

const analyzeSoilFromImageFlow = ai.defineFlow(
  {
    name: 'analyzeSoilFromImageFlow',
    inputSchema: SoilAnalysisFromImageInputSchema,
    outputSchema: SoilAnalysisFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI analysis failed to produce a valid output.");
    }
    
    // This is where we save the result to Firestore
    // Note: In a real serverless environment, initializing admin should be handled carefully.
    const { firestore } = getSdks(initializeApp(undefined, `backend-action-soil-analysis-${Date.now()}`));
    const analysisCollectionRef = collection(firestore, `users/${input.userId}/soilAnalyses`);
    
    // The AI output schema matches the Firestore schema
    const analysisData = {
        ...output,
        farmerId: input.userId,
        analysisDate: new Date().toISOString(),
        recommendations: `Crops: ${output.recommendedCrops.join(', ')}. Fertilizers: ${output.fertilizerPlan.join('; ')}. Advice: ${output.generalAdvice}`,
        pH: output.phEstimate,
        nitrogen: output.nutrientAnalysis.nitrogen === 'Low' ? 1 : (output.nutrientAnalysis.nitrogen === 'Moderate' ? 2 : 3), // Example conversion
        phosphorus: output.nutrientAnalysis.phosphorus === 'Low' ? 1 : (output.nutrientAnalysis.phosphorus === 'Moderate' ? 2 : 3),
        potassium: output.nutrientAnalysis.potassium === 'Low' ? 1 : (output.nutrientAnalysis.potassium === 'Moderate' ? 2 : 3),
    };
    
    await addDoc(analysisCollectionRef, analysisData);

    return output;
  }
);
