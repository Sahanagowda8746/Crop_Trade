
'use server';

/**
 * @fileOverview An AI agent that acts as an expert agronomist to answer user questions.
 * This agent is equipped with a tool to check the status of a user's soil kit order from Firestore.
 *
 * - askAgronomist - A function that handles the question-answering process.
 * - AskAgronomistInput - The input type for the askAgronomist function.
 * - AskAgronomistOutput - The return type for the askAgronomist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import {getSdks, initializeFirebase} from '@/firebase';
import {SoilKitOrder} from '@/lib/types';

// Tool to get the status of a soil kit order
const getSoilKitOrderStatus = ai.defineTool(
  {
    name: 'getSoilKitOrderStatus',
    description:
      "Get the status of the most recent soil kit order for a given user. You must use this tool if the user asks about their order, report, or kit status.",
    inputSchema: z.object({
      userId: z.string().describe('The ID of the user to check.'),
    }),
    outputSchema: z.object({
      status: z.string().describe("The status of the order (e.g., 'ordered', 'shipped', 'completed')."),
      orderDate: z.string().describe("The ISO date string of when the order was placed."),
    }).nullable(),
  },
  async ({userId}) => {
    console.log(`Checking soil kit order status for user: ${userId}`);
    try {
      // Use a unique name for the backend app instance to avoid conflicts.
      const appName = `backend-tool-get-order-status-${Date.now()}`;
      const {firestore} = getSdks(initializeFirebase(undefined, appName));
      const ordersRef = collection(firestore, 'soilKitOrders');
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('orderDate', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No orders found for user.');
        return null;
      }

      const latestOrder = querySnapshot.docs[0].data() as SoilKitOrder;
      console.log('Found latest order:', latestOrder);
      return {
        status: latestOrder.status,
        orderDate: latestOrder.orderDate,
      };
    } catch (e) {
      console.error('Error fetching soil kit order status:', e);
      // It's better to return null and let the LLM know the tool failed
      // than to throw an error and crash the flow.
      return null;
    }
  }
);


const AskAgronomistInputSchema = z.object({
  question: z.string().describe("The user's question about agriculture."),
  userId: z.string().describe('The ID of the user asking the question.'),
});
export type AskAgronomistInput = z.infer<typeof AskAgronomistInputSchema>;

const AskAgronomistOutputSchema = z.object({
  answer: z
    .string()
    .describe("A helpful and accurate answer to the user's question."),
});
export type AskAgronomistOutput = z.infer<typeof AskAgronomistOutputSchema>;

export async function askAgronomist(
  input: AskAgronomistInput
): Promise<AskAgronomistOutput> {
  return askAgronomistFlow(input);
}

const agronomistPrompt = `You are an expert agronomist and AI assistant for the CropTrade platform. Your role is to provide clear, concise, and accurate advice to farmers.

- If the user asks about the status of their order, kit, or report, you MUST use the getSoilKitOrderStatus tool to check the database.
- Base your answer on the information provided by the tool. Inform the user if no order is found. If the tool fails, inform the user you could not retrieve the information.
- For all other agricultural questions, provide a helpful and encouraging answer based on your expertise.
- Keep your answers concise and easy to understand for a non-expert audience.
- Today's date is ${new Date().toLocaleDateString()}.`;


const askAgronomistFlow = ai.defineFlow(
  {
    name: 'askAgronomistFlow',
    inputSchema: AskAgronomistInputSchema,
    outputSchema: AskAgronomistOutputSchema,
  },
  async ({question, userId}) => {
    
    const llmResponse = await ai.generate({
      prompt: question,
      model: 'googleai/gemini-1.5-flash',
      system: agronomistPrompt,
      tools: [getSoilKitOrderStatus],
      toolConfig: {
        toolChoice: 'auto',
      }
    });

    const answer = llmResponse.text;

    if (!answer) {
        throw new Error('The AI failed to generate a response. Please try again.');
    }

    return { answer };
  }
);
