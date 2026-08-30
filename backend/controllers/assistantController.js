import { HumanMessage } from '@langchain/core/messages';
import { buildRoziAgent } from '../services/roziAgent.js';
import {
    createConversation,
    listConversations,
    getConversationOwner,
    getConversationMessages,
    saveMessage,
    setConversationTitleIfDefault,
    deleteConversation,
} from '../models/conversationModel.js';

// ─── CREATE A NEW CONVERSATION ("New Chat") ───────────────────
export const startConversation = async (req, res) => {
    const userId = req.user.id;

    try {
        const conversationId = await createConversation(userId);
        return res.status(201).json({
            success: true,
            data: { id: conversationId, title: 'New Conversation' },
        });
    } catch (error) {
        console.error('Start conversation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not start a new conversation',
            error: error.message,
        });
    }
};

// ─── LIST USER'S CONVERSATIONS ─────────────────────────────────
export const getConversations = async (req, res) => {
    const userId = req.user.id;

    try {
        const conversations = await listConversations(userId);
        return res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        console.error('List conversations error:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not fetch conversations',
            error: error.message,
        });
    }
};

// ─── FETCH MESSAGES FOR ONE CONVERSATION ───────────────────────
export const getMessages = async (req, res) => {
    const userId = req.user.id;
    const conversationId = req.params.id;

    try {
        const ownerId = await getConversationOwner(conversationId);

        if (!ownerId) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found',
            });
        }

        if (ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this conversation',
            });
        }

        const messages = await getConversationMessages(conversationId);
        return res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('Get messages error:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not fetch messages',
            error: error.message,
        });
    }
};

// ─── DELETE A CONVERSATION ──────────────────────────────────────
export const removeConversation = async (req, res) => {
    const userId = req.user.id;
    const conversationId = req.params.id;

    try {
        const ownerId = await getConversationOwner(conversationId);

        if (!ownerId) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found',
            });
        }

        if (ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this conversation',
            });
        }

        await deleteConversation(conversationId);
        return res.status(200).json({ success: true, message: 'Conversation deleted' });
    } catch (error) {
        console.error('Delete conversation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not delete conversation',
            error: error.message,
        });
    }
};

// ─── CHAT WITH ROZI ASSISTANT (now conversation-aware) ─────────
export const chatWithAssistant = async (req, res) => {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
            success: false,
            message: 'A message is required',
        });
    }

    if (!conversationId) {
        return res.status(400).json({
            success: false,
            message: 'A conversationId is required',
        });
    }

    try {
        // Ownership check — a user can only chat within their own conversation
        const ownerId = await getConversationOwner(conversationId);

        if (!ownerId) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found',
            });
        }

        if (ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this conversation',
            });
        }

        // Check if GROQ API key is present
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'GROQ_API_KEY is missing in backend environment configuration.',
            });
        }

        // Save the user's message first
        await saveMessage(conversationId, 'user', message.trim());

        // Auto-title the conversation from its first message (no-op if already titled)
        await setConversationTitleIfDefault(conversationId, message.trim());

        // Each conversation gets its own agent memory thread
        const agent = buildRoziAgent(userId);
        const config = {
            configurable: { thread_id: `conversation-${conversationId}` },
        };

        const result = await agent.invoke(
            { messages: [new HumanMessage(message.trim())] },
            config
        );

        const lastMessage = result.messages[result.messages.length - 1];
        let reply = '';
        if (typeof lastMessage.content === 'string') {
            reply = lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
            reply = lastMessage.content.map((c) => c.text || c.content || '').join('');
        } else {
            reply = String(lastMessage?.content || '');
        }

        // Save the assistant's reply
        await saveMessage(conversationId, 'assistant', reply);

        return res.status(200).json({
            success: true,
            reply,
        });
    } catch (error) {
        console.error('Assistant chat error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Assistant is unavailable right now. Please try again.',
            error: error.message,
        });
    }
};

