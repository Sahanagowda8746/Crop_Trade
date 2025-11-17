import { config } from 'dotenv';
config();

import '@/ai/flows/soil-analysis-from-prompt.ts';
import '@/ai/flows/crop-description-generator.ts';
import '@/ai/flows/pest-diagnosis-from-image.ts';