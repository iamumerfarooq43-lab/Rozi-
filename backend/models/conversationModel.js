import pool from '../config/db.js';

// ─── CREATE A NEW CONVERSATION ────────────────────────────────
export const createConversation = async (userId, title = 'New Conversation') => {
    const [result] = await pool.query(
        'INSERT INTO conversations (user_id, title) VALUES (?, ?)',
        [userId, title]
    );
    return result.insertId;
};

// ─── LIST A USER'S CONVERSATIONS (most recently active first) ─
export const listConversations = async (userId) => {
    const [rows] = await pool.query(
        `SELECT id, title, created_at, updated_at
     FROM conversations
     WHERE user_id = ?
     ORDER BY updated_at DESC`,
        [userId]
    );
    return rows;
};

// ─── CHECK A CONVERSATION BELONGS TO THIS USER ─────────────────
// Prevents one captain from reading/writing another captain's conversation
export const getConversationOwner = async (conversationId) => {
    const [[row]] = await pool.query(
        'SELECT user_id FROM conversations WHERE id = ?',
        [conversationId]
    );
    return row ? row.user_id : null;
};

// ─── FETCH ALL MESSAGES FOR A CONVERSATION ─────────────────────
export const getConversationMessages = async (conversationId) => {
    const [rows] = await pool.query(
        `SELECT id, role, content, created_at
     FROM conversation_messages
     WHERE conversation_id = ?
     ORDER BY created_at ASC`,
        [conversationId]
    );
    return rows;
};

// ─── SAVE A MESSAGE ─────────────────────────────────────────────
export const saveMessage = async (conversationId, role, content) => {
    await pool.query(
        'INSERT INTO conversation_messages (conversation_id, role, content) VALUES (?, ?, ?)',
        [conversationId, role, content]
    );

    // bump updated_at so the conversation list sorts by most recent activity
    await pool.query(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [conversationId]
    );
};

// ─── AUTO-TITLE A CONVERSATION FROM ITS FIRST MESSAGE ──────────
export const setConversationTitleIfDefault = async (conversationId, firstMessage) => {
    const title =
        firstMessage.length > 50 ? firstMessage.slice(0, 50) + '...' : firstMessage;

    await pool.query(
        `UPDATE conversations 
     SET title = ? 
     WHERE id = ? AND title = 'New Conversation'`,
        [title, conversationId]
    );
};

// ─── DELETE A CONVERSATION ──────────────────────────────────────
export const deleteConversation = async (conversationId) => {
    await pool.query('DELETE FROM conversations WHERE id = ?', [conversationId]);
    // conversation_messages rows are removed automatically via ON DELETE CASCADE
};

