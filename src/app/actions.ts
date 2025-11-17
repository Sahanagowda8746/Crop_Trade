'use server';

import { z } from 'zod';
import { analyzeSoilFromPrompt } from '@/ai/flows/soil-analysis-from-prompt';
import { diagnosePestFromImage } from '@/ai/flows/pest-diagnosis-from-image';
import { askAgronomist } from '@/ai/flows/ask-agronomist';
import { generateAdImage } from '@/ai/flows/generate-ad-image';

const soilAnalysisSchema = z.object({
  soilDescription: z.string().min(10, 'Please provide a more detailed soil description.'),
});

export async function handleSoilAnalysis(prevState: any, formData: FormData) {
  const validatedFields = soilAnalysisSchema.safeParse({
    soilDescription: formData.get('soilDescription'),
  });

  if (!validatedFields.success) {
    return {
      message: 'error:Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const result = await analyzeSoilFromPrompt(validatedFields.data);
    return { message: 'Analysis complete.', data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { message: `error:Analysis failed. ${errorMessage}`, errors: {} };
  }
}

const pestDiagnosisSchema = z.object({
    photoDataUri: z.string().startsWith('data:image', 'Please upload a valid image file.'),
});

export async function handlePestDiagnosis(prevState: any, formData: FormData) {
    const validatedFields = pestDiagnosisSchema.safeParse({
        photoDataUri: formData.get('photoDataUri'),
    });

    if (!validatedFields.success) {
        return {
            message: 'error:Invalid form data.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    if (!validatedFields.data.photoDataUri) {
        return {
            message: 'error:Please upload an image.',
            errors: {
                photoDataUri: ['Please upload an image before diagnosing.'],
            },
        }
    }
    
    try {
        const result = await diagnosePestFromImage(validatedFields.data);
        return { message: 'Diagnosis complete.', data: result };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { message: `error:Diagnosis failed. ${errorMessage}`, errors: {} };
    }
}

export async function handleAskAgronomist(question: string) {
    if (!question) {
        return { message: 'Please provide a question.' };
    }

    try {
        const result = await askAgronomist({ question });
        return { message: 'Answer complete.', data: result };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { message: `error:Failed to get answer. ${errorMessage}`, errors: {} };
    }
}

const adImageSchema = z.object({
  description: z.string().min(5, 'Please provide a more detailed description.'),
});

export async function handleAdImageGeneration(prevState: any, formData: FormData) {
  const validatedFields = adImageSchema.safeParse({
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      message: 'error:Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const result = await generateAdImage(validatedFields.data);
    return { message: 'Image generated.', data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { message: `error:Image generation failed. ${errorMessage}`, errors: {} };
  }
}
