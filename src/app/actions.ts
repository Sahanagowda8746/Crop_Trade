
'use server';

import { z } from 'zod';
import { diagnosePestFromImage } from '@/ai/flows/pest-diagnosis-from-image';
import { generateAdImage } from '@/ai/flows/generate-ad-image';
import { generateCropDescription } from '@/ai/flows/crop-description-generator';
import { calculateFertilizer } from '@/ai/flows/fertilizer-calculator';
import { predictYield } from '@/ai/flows/yield-prediction';
import { forecastDemand } from '@/ai/flows/demand-forecast';
import { assessCreditScore } from '@/ai/flows/credit-score-flow';
import { getFirestore, doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { SoilAnalysis, CropListing, UserProfile, Order, Auction, TransportRequest, Review, SoilKitOrder, TransportBid } from '@/lib/types';
import { askAgronomist } from '@/ai/flows/ask-agronomist';
import { convertTextToSpeech } from '@/ai/flows/text-to-speech';


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

const fertilizerSchema = z.object({
  nitrogen: z.number().min(0, "Nitrogen cannot be negative."),
  phosphorus: z.number().min(0, "Phosphorus cannot be negative."),
  potassium: z.number().min(0, "Potassium cannot be negative."),
  ph: z.number().min(0, "pH must be between 0 and 14.").max(14),
  soilType: z.string().min(1, "Please select a soil type."),
  targetCrop: z.string().min(2, "Please enter a target crop."),
});

export async function handleFertilizerCalculation(data: z.infer<typeof fertilizerSchema>) {
    const validatedFields = fertilizerSchema.safeParse(data);
    if (!validatedFields.success) {
        return { message: `error: Invalid form data. Please check your inputs.`, data: null };
    }
    try {
      const result = await calculateFertilizer(validatedFields.data);
      return { message: "Calculation complete.", data: result };
    } catch (e: any) {
      console.error("Fertilizer calculation error:", e);
      return { message: `error: ${e.message}`, data: null };
    }
}

const yieldSchema = z.object({
  cropType: z.string().min(2, "Please enter a crop type."),
  acreage: z.number().positive("Acreage must be a positive number."),
  soilType: z.string().min(1, "Please select a soil type."),
  nitrogenLevel: z.number().min(0, "Nitrogen cannot be negative."),
  phosphorusLevel: z.number().min(0, "Phosphorus cannot be negative."),
  potassiumLevel: z.number().min(0, "Potassium cannot be negative."),
  region: z.string().min(2, "Region is required."),
  historicalYield: z.string().optional(),
});
export async function handleYieldPrediction(data: z.infer<typeof yieldSchema>) {
    const validatedFields = yieldSchema.safeParse(data);
    if (!validatedFields.success) {
        return { message: `error: Invalid form data.`, data: null };
    }
    try {
      const result = await predictYield(validatedFields.data);
      return { message: "Prediction complete.", data: result };
    } catch (e: any) {
      return { message: `error: ${e.message}`, data: null };
    }
}

const demandSchema = z.object({
  cropType: z.string().min(2, "Please enter a crop type."),
  region: z.string().min(2, "Please enter a region."),
  month: z.string().min(1, "Please select a month."),
});
export async function handleDemandForecast(data: z.infer<typeof demandSchema>) {
     const validatedFields = demandSchema.safeParse(data);
    if (!validatedFields.success) {
        return { message: `error: Invalid form data.`, data: null };
    }
    try {
        const result = await forecastDemand(validatedFields.data);
        return { message: "Forecast complete.", data: result };
    } catch (e: any) {
        return { message: `error: ${e.message}`, data: null };
    }
}

const creditScoreSchema = z.object({
  annualRevenue: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive("Annual revenue must be a positive number.")),
  yearsFarming: z.preprocess((a) => parseInt(z.string().parse(a)), z.number().int().min(0, "Years in farming cannot be negative.")),
  loanHistory: z.enum(['No Loans', 'Paid On Time', 'Minor Delays', 'Major Delays']),
  outstandingDebt: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0, "Outstanding debt cannot be negative.")),
});
export async function handleCreditScore(data: z.infer<typeof creditScoreSchema>) {
    const validatedFields = creditScoreSchema.safeParse(data);
    if (!validatedFields.success) {
        return { message: `error: Invalid form data.`, data: null };
    }
    try {
        const result = await assessCreditScore(validatedFields.data);
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
  imageUrl: z.coerce.string().optional(),
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


const askAgronomistSchema = z.object({
  question: z.string().min(1, 'Please enter a question.'),
  language: z.string(),
  userId: z.string(),
  history: z.string().optional(),
});
export async function handleAskAgronomist(data: z.infer<typeof askAgronomistSchema>) {
    const validatedFields = askAgronomistSchema.safeParse(data);
    if (!validatedFields.success) {
        return { message: `error: Invalid form data.`, data: null };
    }
    try {
        const history = validatedFields.data.history ? JSON.parse(validatedFields.data.history) : [];
        const result = await askAgronomist({...validatedFields.data, history });
        return { message: "Answer received.", data: result };
    } catch (e: any) {
        return { message: `error: Failed to get answer. ${e.message}`, data: null };
    }
}

const ttsSchema = z.object({
  text: z.string().min(1, 'Please provide text.'),
});
export async function handleTextToSpeech(data: z.infer<typeof ttsSchema>) {
    const validatedFields = ttsSchema.safeParse(data);
    if (!validatedFields.success) {
        return { message: `error: Invalid form data.`, data: null };
    }
    try {
        const result = await convertTextToSpeech(validatedFields.data);
        return { message: "Audio received.", data: result };
    } catch (e: any) {
        return { message: `error: Failed to get audio. ${e.message}`, data: null };
    }
}
