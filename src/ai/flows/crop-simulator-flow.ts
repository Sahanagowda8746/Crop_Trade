'use server';
/**
 * @fileOverview An AI agent to simulate a multi-season crop cycle (Digital Twin).
 *
 * - simulateCropCycle - A function that handles the simulation process.
 * - CropSimulatorInput - The input type for the function.
 * - CropSimulatorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Safe AI wrapper (handles 429 errors with retries)
async function safeGenerate(params: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.generate(params);
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("429");

      if (isRateLimit && i < retries - 1) {
        const wait = 2000 * (i + 1); // Backoff (2s, 4s, 6s…)
        console.warn(`Rate limited. Retrying in ${wait}ms...`);
        await new Promise((res) => setTimeout(res, wait));
        continue;
      }

      throw err;
    }
  }
  // This part should not be reached if retries are configured, but as a fallback:
  throw new Error("AI generation failed after multiple retries.");
}


const CropSimulatorInputSchema = z.object({
  cropType: z.string().describe("The type of crop being grown."),
  acreage: z.number().describe("The total land area in acres."),
  region: z.string().describe("The geographical region for weather simulation."),
  simulationMonths: z.number().int().describe("The number of months to simulate."),
  fertilizerPlan: z.string().describe("The chosen fertilizer strategy (e.g., 'Standard NPK', 'Organic Compost')."),
  wateringSchedule: z.string().describe("The chosen watering strategy (e.g., 'Automated', 'Rain-fed')."),
  weatherScenario: z.string().describe("The simulated weather pattern (e.g., 'Normal', 'Drought')."),
  pestScenario: z.string().describe("The simulated pest pressure (e.g., 'None', 'Major Outbreak')."),
});
export type CropSimulatorInput = z.infer<typeof CropSimulatorInputSchema>;

const TimelineStageSchema = z.object({
  month: z.number().int().describe("The month number in the simulation (e.g., 1, 2, 3)."),
  description: z.string().describe("A brief (1-2 sentence) description of the farm's visual state during this month."),
  imageUrl: z.string().url().describe("A data URI of a generated image representing the farm's state."),
});

const FullAnalysisSchema = z.object({
    executiveSummary: z.string().describe("A high-level overview of the simulation outcome and key takeaways."),
    riskOpportunityAnalysis: z.string().describe("An analysis of the key risks (e.g., drought, pests) and opportunities (e.g., good weather) that impacted the results."),
    comparativeAnalysis: z.string().describe("A comparison of the chosen strategy against alternatives. Explain why it was or was not optimal."),
    recommendations: z.array(z.string()).describe("A list of clear, actionable recommendations for improving ROI in future cycles."),
});

const CropSimulatorOutputSchema = z.object({
  timeline: z.array(TimelineStageSchema).describe("A list of visual and descriptive stages for the simulation timeline."),
  summary: z.object({
    predictedYield: z.string().describe('The final predicted total yield (e.g., "400-420 tons").'),
    estimatedRevenue: z.string().describe('The estimated net revenue after costs (e.g., "$150,000").'),
    roi: z.number().describe("The predicted Return on Investment percentage."),
  }),
  analysis: FullAnalysisSchema,
});
export type CropSimulatorOutput = z.infer<typeof CropSimulatorOutputSchema>;


export async function simulateCropCycle(
  input: CropSimulatorInput
): Promise<CropSimulatorOutput> {
  return cropSimulatorFlow(input);
}

// This schema defines the structure the AI model must return.
const FinalAnalysisSchema = z.object({
    predictedYield: z.string(),
    estimatedRevenue: z.string(),
    roi: z.number(),
    analysis: FullAnalysisSchema, // The nested analysis object.
});

// This is a simplified, conceptual flow. A real implementation would be much more complex.
const cropSimulatorFlow = ai.defineFlow(
  {
    name: 'cropSimulatorFlow',
    inputSchema: CropSimulatorInputSchema,
    outputSchema: CropSimulatorOutputSchema,
  },
  async (input) => {
    // Determine the number of stages (e.g., one image every 3 months)
    const stages = Math.max(2, Math.ceil(input.simulationMonths / 3));
    const monthsPerStage = input.simulationMonths / stages;

    let timeline: z.infer<typeof TimelineStageSchema>[] = [];
    
    // Use the model specified by the user.
    const consistentModel = 'googleai/gemini-2.0-flash'; // HIGHER QUOTA + FASTER

    // Generate a text prompt for each stage
    for (let i = 0; i < stages; i++) {
        const currentMonth = Math.round((i + 1) * monthsPerStage);
        
        // 1. Generate a description for the stage
        const descriptionResponse = await safeGenerate({
            model: consistentModel,
            prompt: `Based on this farm simulation, write a short, 1-sentence visual description of a ${input.acreage} acre ${input.cropType} farm in ${input.region} at month ${currentMonth} of a ${input.simulationMonths} month cycle.
            - Fertilizer: ${input.fertilizerPlan}
            - Watering: ${input.wateringSchedule}
            - Weather: ${input.weatherScenario}
            - Pests: ${input.pestScenario}
            The description should be simple and visual, e.g., "Young green shoots of wheat emerge from the soil," or "The mature corn stalks are yellowing and heavy with ears, ready for harvest."
            `,
            output: { format: 'text' },
        });
        const description = descriptionResponse.text;

        // 2. Generate a hint for an image search based on the description
        const hintResponse = await safeGenerate({
            model: consistentModel,
            prompt: `From the following farm scene description, extract a concise 1 or 2-word hint that can be used to search for a relevant stock photo. For example, if the description is "Young green shoots of wheat emerge from the soil," a good hint would be "wheat shoots".

            Description: "${description}"

            Hint:`,
            output: { format: 'text' },
        });
        
        const hint = hintResponse.text.trim().replace(/\s+/g, '-').toLowerCase();
        const imageUrl = `https://picsum.photos/seed/${hint || 'farm'}/1280/720`;

        timeline.push({
            month: currentMonth,
            description,
            imageUrl,
        });
    }

    // 3. Generate the final analysis and ROI using the powerful model
    const analysisPrompt = `You are a financial and agricultural analyst. Based on the following farm simulation, calculate the final yield, revenue, and ROI, and provide a detailed strategic analysis report.

    **Simulation Parameters:**
    - Crop: ${input.cropType}
    - Acreage: ${input.acreage}
    - Region: ${input.region}
    - Duration: ${input.simulationMonths} months
    - Fertilizer: ${input.fertilizerPlan}
    - Watering: ${input.wateringSchedule}
    - Weather: ${input.weatherScenario}
    - Pests: ${input.pestScenario}

    **Your Task:**
    You must generate a JSON object with the following structure.
    1.  **predictedYield**: Estimate the total yield in a range (e.g., "400-420 tons").
    2.  **estimatedRevenue**: Estimate the net revenue in INR, considering typical costs and market prices for the region and crop.
    3.  **roi**: Calculate the Return on Investment as a percentage.
    4.  **analysis**: Provide a full analysis object containing the following nested fields:
        - **executiveSummary**: A high-level overview of the simulation outcome and key takeaways.
        - **riskOpportunityAnalysis**: An analysis of the key risks (e.g., drought, pests) and opportunities (e.g., good weather) that impacted the results.
        - **comparativeAnalysis**: A comparison of the chosen strategy against alternatives. Explain why it was or was not optimal.
        - **recommendations**: A list of clear, actionable recommendations for improving ROI in future cycles.
    `;

    const analysisResponse = await safeGenerate({
        model: 'googleai/gemini-2.5-pro',
        prompt: analysisPrompt,
        output: {
            format: 'json',
            schema: FinalAnalysisSchema, // Use the corrected schema
        }
    });
    
    const result = analysisResponse.output;
    if (!result) {
        throw new Error("Failed to generate the final analysis.");
    }
    
    // Construct the final output object exactly as the frontend page expects it.
    return {
        timeline,
        summary: {
            predictedYield: result.predictedYield,
            estimatedRevenue: result.estimatedRevenue,
            roi: result.roi,
        },
        analysis: result.analysis
    };
  }
);
