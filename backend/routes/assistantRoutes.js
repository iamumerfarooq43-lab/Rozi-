import express from 'express';
import {
    chatWithAssistant,
    startConversation,
    getConversations,
    getMessages,
    removeConversation,
} from '../controllers/assistantController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', authMiddleware, chatWithAssistant);
router.post('/conversations', authMiddleware, startConversation);
router.get('/conversations', authMiddleware, getConversations);
router.get('/conversations/:id/messages', authMiddleware, getMessages);
router.delete('/conversations/:id', authMiddleware, removeConversation);

export default router;

