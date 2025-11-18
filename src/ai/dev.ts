import { config } from 'dotenv';
config();

import '@/ai/flows/crop-description-generator.ts';
import '@/ai/flows/pest-diagnosis-from-image.ts';
import '@/ai/flows/ask-agronomist.ts';
import '@/ai/flows/generate-ad-image.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/soil-analysis-from-prompt.ts';
import '@/ai/flows/fertilizer-calculator.ts';
import '@/ai/flows/yield-prediction.ts';
import '@/ai/flows/demand-forecast.ts';
import '@/ai/flows/credit-score-flow.ts';
import '@/ai/flows/insurance-risk-flow.ts';
import '@/ai/tools/weather-tool.ts';
