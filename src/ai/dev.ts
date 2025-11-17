import { config } from 'dotenv';
config();

import '@/ai/flows/soil-analysis-from-image.ts';
import '@/ai/flows/crop-description-generator.ts';
import '@/ai/flows/pest-diagnosis-from-image.ts';
import '@/ai/flows/ask-agronomist.ts';
import '@/ai/flows/generate-ad-image.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/soil-analysis-from-prompt.ts';
import '@/ai/flows/fertilizer-calculator.ts';
import '@/ai/flows/yield-prediction.ts';
import '@/ai/flows/demand-forecast.ts';
