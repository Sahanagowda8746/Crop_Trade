
'use server';

import { z } from 'zod';
import { diagnosePestFromImage } from '@/ai/flows/pest-diagnosis-from-image';
import { askAgronomist } from '@/ai/flows/ask-agronomist';
import { generateAdImage } from '@/ai/flows/generate-ad-image';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { generateCropDescription } from '@/ai/flows/crop-description-generator';
import { calculateFertilizer, FertilizerCalculatorInput } from '@/ai/flows/fertilizer-calculator';
import { predictYield, YieldPredictionInput } from '@/ai/flows/yield-prediction';
import { forecastDemand, DemandForecastInput } from '@/ai/flows/demand-forecast';
import { assessCreditScore, CreditScoreInput } from '@/ai/flows/credit-score-flow';
import { assessInsuranceRisk, InsuranceRiskInput } from '@/ai/flows/insurance-risk-flow';
import { getFirestore, doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { SoilAnalysis } from '@/lib/types';


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

const pestDiagnosisSchema = z.object({
    photoDataUri: z.string().startsWith('data:image', 'Please upload a valid image file before diagnosing.'),
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
        const response = await askAgronomist({ question, userId });
        return { message: 'Answer complete.', data: response };
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

export async function handleFertilizerCalculation(data: FertilizerCalculatorInput) {
    try {
      const result = await calculateFertilizer(data);
      return { message: "Calculation complete.", data: result };
    } catch (e: any) {
      return { message: `error: ${e.message}`, data: null };
    }
}


export async function handleYieldPrediction(data: YieldPredictionInput) {
    try {
      const result = await predictYield(data);
      return { message: "Prediction complete.", data: result };
    } catch (e: any) {
      return { message: `error: ${e.message}`, data: null };
    }
}

export async function handleDemandForecast(data: DemandForecastInput) {
    try {
        const result = await forecastDemand(data);
        return { message: "Forecast complete.", data: result };
    } catch (e: any) {
        return { message: `error: ${e.message}`, data: null };
    }
}

export async function handleCreditScore(data: CreditScoreInput) {
    try {
        const result = await assessCreditScore(data);
        return { message: "Assessment complete.", data: result };
    } catch (e: any) {
        return { message: `error: ${e.message}`, data: null };
    }
}

export async function handleInsuranceRisk(data: InsuranceRiskInput) {
    try {
        const result = await assessInsuranceRisk(data);
        return { message: "Assessment complete.", data: result };
    } catch (e: any) {
        return { message: `error: ${e.message}`, data: null };
    }
}

const listingSchema = z.object({
  listingId: z.string().min(1),
  cropType: z.string().min(2, "Crop type is required."),
  variety: z.string().min(2, "Variety is required."),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  unit: z.string().min(1, "Unit is required."),
  pricePerUnit: z.coerce.number().positive("Price must be a positive number."),
  location: z.string().min(3, "Location is required."),
  harvestDate: z.string().min(1, "Harvest date is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.string().url().optional().or(z.literal('')),
});


export async function handleUpdateListing(prevState: any, formData: FormData) {
    const formValues = {
        listingId: formData.get('listingId'),
        cropType: formData.get('cropType'),
        variety: formData.get('variety'),
        quantity: formData.get('quantity'),
        unit: formData.get('unit'),
        pricePerUnit: formData.get('pricePerUnit'),
        location: formData.get('location'),
        harvestDate: formData.get('harvestDate'),
        description: formData.get('description'),
        imageUrl: formData.get('imageUrl'),
    };

    const validatedFields = listingSchema.safeParse(formValues);

    if (!validatedFields.success) {
        console.error("Zod validation failed:", validatedFields.error.flatten());
        return {
            message: 'error:Invalid form data. Check console for details.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { listingId, ...listingData } = validatedFields.data;

    try {
        const { firestore } = initializeFirebase();
        const listingRef = doc(firestore, 'cropListings', listingId);
        
        await setDoc(listingRef, listingData, { merge: true });

        return { message: 'Listing updated successfully.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { message: `error:Update failed. ${errorMessage}` };
    }
}
