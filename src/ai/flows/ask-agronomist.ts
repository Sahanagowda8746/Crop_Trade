'use server';
/**
 * @fileOverview An AI agent that acts as an expert agronomist, answering farmer questions.
 *
 * - askAgronomist - A function that handles the question-answering process.
 * - AgronomistInput - The input type for the askAgronomist function.
 * - AgronomistOutput - The return type for the askAgronomist function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { SoilKitOrder } from '@/lib/types';

// Tool to get the status of a soil kit order
const getSoilKitOrderStatus = ai.defineTool(
    {
        name: 'getSoilKitOrderStatus',
        description: 'Get the current status of a soil test kit order for a given user ID.',
        inputSchema: z.object({
            userId: z.string().describe("The user's unique ID."),
        }),
        outputSchema: z.object({
            status: z.string().describe('The status of the latest order (e.g., "ordered", "shipped", "completed", or "not found").'),
            details: z.string().describe('Additional details like order date or tracking ID.'),
        }),
    },
    async ({ userId }) => {
        const { firestore } = initializeFirebase();
        const ordersRef = collection(firestore, 'soilKitOrders');
        const q = query(
            ordersRef,
            where('userId', '==', userId),
            orderBy('orderDate', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return { status: 'not found', details: 'No soil kit order was found for this user.' };
        }
        const order = snapshot.docs[0].data() as SoilKitOrder;
        return {
            status: order.status,
            details: `The latest order from ${new Date(order.orderDate).toLocaleDateString()} has a status of '${order.status}'. ${order.trackingId ? `Tracking ID: ${order.trackingId}`: ''}`
        };
    }
);


const AgronomistInputSchema = z.object({
    question: z.string().describe('The question from the user.'),
    language: z.string().describe('The language for the answer (e.g., "English", "Hindi").'),
    userId: z.string().describe('The unique ID of the user asking the question.'),
    history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({
            text: z.string()
        }))
    })).optional().describe("The conversation history."),
});
export type AgronomistInput = z.infer<typeof AgronomistInputSchema>;

const AgronomistOutputSchema = z.object({
  answer: z.string().describe('The generated answer to the question.'),
});
export type AgronomistOutput = z.infer<typeof AgronomistOutputSchema>;

export async function askAgronomist(
  input: AgronomistInput
): Promise<AgronomistOutput> {
  return askAgronomistFlow(input);
}


const askAgronomistFlow = ai.defineFlow(
  {
    name: 'askAgronomistFlow',
    inputSchema: AgronomistInputSchema,
    outputSchema: AgronomistOutputSchema,
  },
  async (input) => {
    const { question, language, userId, history } = input;
    
    const llmResponse = await ai.generate({
      prompt: question,
      history: history,
      tools: [getSoilKitOrderStatus],
      system: `You are an expert agronomist AI assistant for the CropTrade platform.
        - Your name is 'Agri'.
        - Answer the user's questions about farming, crops, soil, pests, and our platform features.
        - ALWAYS respond in the user's specified language: ${language}.
        - Be concise, helpful, and friendly.
        - If you need to check a soil kit order status, you MUST use the 'getSoilKitOrderStatus' tool. To do this, you need the user's ID, which is provided to you as: ${userId}. Do not ask the user for their ID.
      `,
    });

    const text = llmResponse.text;
    
    if (!text) {
        // Fallback if the main text extraction fails
        const toolResponsePart = llmResponse.candidates[0]?.content.parts.find(
            (part) => part.toolResponse
        );
        if (toolResponsePart?.toolResponse?.output) {
             const toolOutput = toolResponsePart.toolResponse.output as any;
             // This is a guess. You might need to adjust based on the actual tool output structure
             return { answer: toolOutput.details || JSON.stringify(toolOutput) };
        }
        return { answer: "I'm sorry, I couldn't generate a response. Please try again." };
    }

    return { answer: text };
  }
);
