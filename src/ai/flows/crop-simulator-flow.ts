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
    comparativeAnalysis: z.string().describe("A comparison of the chosen strategy against alternatives. Explain why it was or wasn't optimal."),
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

const FinalAnalysisSchema = z.object({
    predictedYield: z.string(),
    estimatedRevenue: z.string(),
    roi: z.number(),
    analysis: FullAnalysisSchema,
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
    
    // Generate a text prompt for each stage
    for (let i = 0; i < stages; i++) {
        const currentMonth = Math.round((i + 1) * monthsPerStage);
        
        // 1. Generate a description for the stage
        const descriptionResponse = await ai.generate({
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

        // 2. Generate an image based on the description
        const imageResponse = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: `Generate a realistic, photographic image of a farm matching this description: "${description}"`,
        });

        const imageUrl = imageResponse.media?.url;
        if (!imageUrl) {
            throw new Error(`Failed to generate image for month ${currentMonth}`);
        }

        timeline.push({
            month: currentMonth,
            description,
            imageUrl,
        });
    }

    // 3. Generate the final analysis and ROI
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
    1.  **predictedYield**: Estimate the total yield in a range (e.g., "400-420 tons").
    2.  **estimatedRevenue**: Estimate the net revenue in INR, considering typical costs and market prices for the region and crop.
    3.  **roi**: Calculate the Return on Investment as a percentage.
    4.  **analysis**: Provide a full analysis object containing the following fields:
        - **executiveSummary**: A high-level overview of the simulation outcome and key takeaways.
        - **riskOpportunityAnalysis**: An analysis of the key risks (e.g., drought, pests) and opportunities (e.g., good weather) that impacted the results.
        - **comparativeAnalysis**: A comparison of the chosen strategy against alternatives. Explain why it was or wasn't optimal.
        - **recommendations**: A list of clear, actionable recommendations for improving ROI in future cycles.

    Return this information in a structured JSON format.
    `;

    const analysisResponse = await ai.generate({
        prompt: analysisPrompt,
        output: {
            format: 'json',
            schema: FinalAnalysisSchema,
        }
    });
    
    const result = analysisResponse.output;
    if (!result) {
        throw new Error("Failed to generate the final analysis.");
    }
    
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
