'use server';

import { z } from 'zod';
import { analyzeSoilFromImage } from '@/ai/flows/soil-analysis-from-image';
import { diagnosePestFromImage } from '@/ai/flows/pest-diagnosis-from-image';
import { askAgronomist } from '@/ai/flows/ask-agronomist';
import { generateAdImage } from '@/ai/flows/generate-ad-image';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { generateCropDescription } from '@/ai/flows/crop-description-generator';
import { calculateFertilizer } from '@/ai/flows/fertilizer-calculator';

// This is a simplified way to get the currently logged-in user's ID on the server.
// In a real app, you'd get this from the session.
async function getUserId(): Promise<string> {
    // This is a placeholder. In a real Next.js app with server-side auth,
    // you would get the user from the session, e.g., using NextAuth.js or similar.
    // For this demo, we'll assume a mock user ID.
    // To properly implement this, you would need an auth library.
    // const session = await auth(); if using NextAuth
    // return session?.user?.id || 'mock-user-id-for-demo';
    
    // As we can't get the real user on the server action easily without a full auth setup,
    // and we must return a value, we will return a hardcoded one.
    // This is a known limitation of this environment.
    return 'farmer-1';
}


const soilAnalysisSchema = z.object({
  photoDataUri: z.string().startsWith('data:image', 'Please upload a valid image file.'),
});

export async function handleSoilAnalysis(prevState: any, formData: FormData) {
  const validatedFields = soilAnalysisSchema.safeParse({
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
              photoDataUri: ['Please upload an image before analyzing.'],
          },
      }
  }
  
  try {
    const userId = await getUserId();
    const result = await analyzeSoilFromImage({ ...validatedFields.data, userId });

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
    
    // Using a pending message to give user feedback that the action has started
    const flowPromise = diagnosePestFromImage(validatedFields.data);
    
    try {
        const result = await flowPromise;
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
        const userId = await getUserId();
        const result = await askAgronomist({ question, userId });
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

export async function handleTextToSpeech(text: string) {
    if (!text) {
        return { message: 'Please provide text.' };
    }

    try {
        const result = await textToSpeech(text);
        return { message: 'Audio generated.', data: result };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { message: `error:Failed to generate audio. ${errorMessage}`, errors: {} };
    }
}

const cropDescriptionSchema = z.object({
  cropName: z.string().min(2, 'Please provide a crop name.'),
  variety: z.string().min(2, 'Please provide a variety.'),
  growingConditions: z.string().min(10, 'Please describe the growing conditions.'),
  yield: z.string().min(1, 'Please provide the yield.'),
  uniqueQualities: z.string().min(10, 'Please describe the unique qualities.'),
});

export async function handleCropDescription(prevState: any, formData: FormData) {
    const validatedFields = cropDescriptionSchema.safeParse({
        cropName: formData.get('cropName'),
        variety: formData.get('variety'),
        growingConditions: formData.get('growingConditions'),
        yield: formData.get('yield'),
        uniqueQualities: formData.get('uniqueQualities'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Invalid form data.',
            errors: validatedFields.error.flatten().fieldErrors,
            data: null,
        };
    }

    try {
        const result = await generateCropDescription(validatedFields.data);
        return { message: 'Description generated.', data: result, errors: null };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { message: `error: Failed to generate description. ${errorMessage}`, errors: {}, data: null };
    }
}
