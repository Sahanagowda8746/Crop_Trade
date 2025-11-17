'use server';
/**
 * @fileOverview Converts text to speech using a Genkit flow.
 *
 * - textToSpeech - A function that takes text and returns a data URI for the generated audio.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const TextToSpeechOutputSchema = z.object({
  audioUrl: z.string().describe('The data URI of the generated audio file.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(
  text: string
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(text);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: z.string(),
    outputSchema: TextToSpeechOutputSchema,
  },
  async query => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: query,
    });

    if (!media?.url) {
      throw new Error('No audio was returned from the model.');
    }

    // Convert the raw PCM data from the data URI to a WAV file as a data URI
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    
    return {
      audioUrl: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

/**
 * Converts raw PCM audio data into a WAV file format encoded in Base64.
 * @param pcmData The raw PCM audio buffer.
 * @param channels The number of audio channels.
 * @param rate The sample rate.
 * @param sampleWidth The sample width in bytes.
 * @returns A promise that resolves with the Base64 encoded WAV data.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
