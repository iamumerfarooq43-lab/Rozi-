import { ChatGroq } from '@langchain/groq';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import {
    StateGraph,
    MessagesAnnotation,
    START,
    END,
    MemorySaver,
} from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { SystemMessage } from '@langchain/core/messages';

import {
    getEarningsSummary,
    getFuelSummary,
    getNetProfit,
    resolveDateRange,
} from './agentTools.js';

// ─── TOOL DEFINITIONS ────────────────────────────────────────
// Each tool wraps a plain function from agentTools.js.
// userId is captured via closure (buildAgent(userId)) — the LLM
// never sees or chooses it, so it can only ever access its own data.

const buildTools = (userId) => {
    const periodEnum = z
        .enum([
            'today',
            'yesterday',
            'this_week',
            'last_week',
            'this_month',
            'last_month',
        ])
        .describe('The time period the user is asking about');

    const earningsSummaryTool = tool(
        async ({ period }) => {
            const { startDate, endDate } = resolveDateRange(period);
            const result = await getEarningsSummary(userId, startDate, endDate);
            return JSON.stringify(result);
        },
        {
            name: 'get_earnings_summary',
            description:
                'Fetches total earnings and per-platform breakdown (Careem, Bykea, ' +
                'Yango, Foodpanda, Indrive) for a given time period.',
            schema: z.object({ period: periodEnum }),
        }
    );

    const fuelSummaryTool = tool(
        async ({ period }) => {
            const { startDate, endDate } = resolveDateRange(period);
            const result = await getFuelSummary(userId, startDate, endDate);
            return JSON.stringify(result);
        },
        {
            name: 'get_fuel_summary',
            description:
                'Fetches total fuel spend and number of fuel logs for a given time period.',
            schema: z.object({ period: periodEnum }),
        }
    );

    const netProfitTool = tool(
        async ({ period }) => {
            const { startDate, endDate } = resolveDateRange(period);
            const result = await getNetProfit(userId, startDate, endDate);
            return JSON.stringify(result);
        },
        {
            name: 'get_net_profit',
            description:
                'Fetches total earnings, total fuel spend, and net profit ' +
                '(earnings minus fuel) for a given time period.',
            schema: z.object({ period: periodEnum }),
        }
    );

    return [earningsSummaryTool, fuelSummaryTool, netProfitTool];
};

const SYSTEM_PROMPT = `You are Rozi Assistant, a friendly and knowledgeable AI assistant for ride-hailing
and delivery captains in Pakistan (Careem, Bykea, Yango, Foodpanda, Indrive) who use
the Rozi app to track their earnings and fuel costs.

You have two modes of operation:

1. APP DATA QUESTIONS (earnings, fuel, profit):
   - Always use your tools to fetch real data. Never invent or estimate numbers.
   - Each data tool takes a "period" keyword (today, yesterday, this_week, last_week,
     this_month, last_month) — pick the one matching what the user asked.
   - Always mention amounts in PKR (Rs.) unless the user's data says otherwise.

2. GENERAL QUESTIONS (anything not related to the user's app data):
   - Answer freely and helpfully using your own knowledge.
   - This includes questions about driving tips, traffic, Pakistani roads, fuel prices
     in general, vehicle maintenance, how to use the app, general advice, greetings,
     math, or any other topic the user asks about.
   - Be conversational, friendly, and helpful.

General rules:
- Keep answers concise and practical — captains are often checking this on the go.
- Be warm and supportive. Captains work hard!
- If unsure about app-specific data, use your tools rather than guessing numbers.`;

// ─── MEMORY (per-conversation, in-memory for now) ─────────────
const checkpointer = new MemorySaver();

// ─── BUILD + COMPILE THE GRAPH ────────────────────────────────
// Returns a compiled, ready-to-invoke graph scoped to a specific userId.
export const buildRoziAgent = (userId) => {
    const tools = buildTools(userId);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not configured in environment variables.');
    }

const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'openai/gpt-oss-120b',
    temperature: 0.2,
}).bindTools(tools);

    const toolNode = new ToolNode(tools);

    // Agent node: calls the LLM with the current message history
    const callModel = async (state) => {
        const messages = [new SystemMessage(SYSTEM_PROMPT), ...state.messages];
        const response = await llm.invoke(messages);
        return { messages: [response] };
    };

    // Conditional edge: if the LLM asked for a tool call, go to "tools",
    // otherwise the conversation is done for this turn
    const shouldContinue = (state) => {
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage.tool_calls?.length > 0) {
            return 'tools';
        }
        return END;
    };

    const graph = new StateGraph(MessagesAnnotation)
        .addNode('agent', callModel)
        .addNode('tools', toolNode)
        .addEdge(START, 'agent')
        .addConditionalEdges('agent', shouldContinue, ['tools', END])
        .addEdge('tools', 'agent');

    return graph.compile({ checkpointer });
};