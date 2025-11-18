'use server';
/**
 * @fileOverview A tool for Genkit AI flows to fetch weather forecast data.
 *
 * - getWeatherForecast - An AI tool that takes a region and returns a simulated weather forecast.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WeatherForecastOutputSchema = z.object({
  forecast: z.string().describe("A summary of the weather forecast for the next 7 days, including temperature range, precipitation chances, and wind conditions."),
});

export const getWeatherForecast = ai.defineTool(
  {
    name: 'getWeatherForecast',
    description: 'Provides a 7-day weather forecast for a specified geographical region.',
    inputSchema: z.object({
      region: z.string().describe('The geographical region for the forecast (e.g., "Punjab, India").'),
    }),
    outputSchema: WeatherForecastOutputSchema,
  },
  async ({region}) => {
    // In a real-world application, this would call a weather API.
    // For this demo, we'll return a simulated forecast based on the region.
    console.log(`Faking weather forecast fetch for: ${region}`);
    
    let forecast = `Sunny with temperatures between 25-32°C. Low chance of rain (10-20%). Winds light to moderate.`;
    
    if (region.toLowerCase().includes('coastal')) {
        forecast = `Partly cloudy with a high chance of afternoon showers (60-70%). Temperatures between 28-34°C. Higher humidity.`;
    } else if (region.toLowerCase().includes('punjab')) {
        forecast = `Hot and dry conditions expected. Temperatures ranging from 35-42°C. Almost no chance of rain (<5%).`;
    } else if (region.toLowerCase().includes('california')) {
        forecast = `Clear and sunny skies. Temperatures stable around 22-28°C. No precipitation expected.`;
    }

    return {
        forecast
    };
  }
);
