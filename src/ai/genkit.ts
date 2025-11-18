import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({apiEndpoint: 'generativelanguage.googleapis.com'})],
  model: 'googleai/gemini-pro',
});
