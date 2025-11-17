'use server';

import { z } from 'zod';
import { analyzeSoilFromPrompt } from '@/ai/flows/soil-analysis-from-prompt';
import { diagnosePestFromImage } from '@/ai/flows/pest-diagnosis-from-image';

const soilAnalysisSchema = z.object({
  soilDescription: z.string().min(10, 'Please provide a more detailed soil description.'),
});

export async function handleSoilAnalysis(prevState: any, formData: FormData) {
  const validatedFields = soilAnalysisSchema.safeParse({
    soilDescription: formData.get('soilDescription'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await analyzeSoilFromPrompt(validatedFields.data);
    return { message: 'Analysis complete.', data: result };
  } catch (error) {
    return { message: 'Analysis failed. Please try again.', errors: {} };
  }
}

const pestDiagnosisSchema = z.object({
    photoDataUri: z.string().startsWith('data:image', 'Invalid image format.'),
});

export async function handlePestDiagnosis(prevState: any, formData: FormData) {
    const validatedFields = pestDiagnosisSchema.safeParse({
        photoDataUri: formData.get('photoDataUri'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Invalid form data.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        const result = await diagnosePestFromImage(validatedFields.data);
        return { message: 'Diagnosis complete.', data: result };
    } catch (error) {
        console.error(error);
        return { message: 'Diagnosis failed. Please try again.', errors: {} };
    }
}
