import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Plus,
  MessageSquare,
  Trash2,
  X,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";

const SUGGESTIONS = [
  "How much did I earn this week?",
  "What's my net profit this month?",
  "Compare my platforms this month",
  "How much did I spend on fuel this week?",
];

const DEFAULT_GREETING = {
  role: "assistant",
  content:
    "Hi! I'm your Rozi Assistant. Ask me about your earnings, fuel spend, or net profit — I can pull up real numbers from your account.",
};

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

// Three bouncing dots — replaces the plain "Thinking..." spinner text
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-400"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function AssistantPage() {
  const [view, setView] = useState("home"); // "home" | "chat"
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const [activeId, setActiveId] = useState(null);
  const [activeTitle, setActiveTitle] = useState("New Conversation");
  const [messages, setMessages] = useState([DEFAULT_GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ─── Load conversation list ───────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get("/assistant/conversations");
      setConversations(res.data.data);
      return res.data.data;
    } catch (err) {
      setError("Could not load your past conversations.");
      return [];
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ─── Open an existing conversation ────────────────────────────
  const openConversation = async (convo) => {
    setError("");
    setActiveId(convo.id);
    setActiveTitle(convo.title);
    setView("chat");
    try {
      const res = await api.get(
        `/assistant/conversations/${convo.id}/messages`,
      );
      const loaded = res.data.data.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      setMessages(loaded.length > 0 ? loaded : [DEFAULT_GREETING]);
    } catch (err) {
      setError("Could not load this conversation.");
    }
  };

  // ─── Start a brand new conversation ──────────────────────────
  const startNewChat = async () => {
    setError("");
    try {
      const res = await api.post("/assistant/conversations");
      const newConvo = res.data.data;
      setConversations((prev) => [newConvo, ...prev]);
      setActiveId(newConvo.id);
      setActiveTitle(newConvo.title);
      setMessages([DEFAULT_GREETING]);
      setView("chat");
    } catch (err) {
      setError("Could not start a new conversation.");
    }
  };

  // ─── Close current chat, return Home ──────────────────────────
  const closeChat = () => {
    setView("home");
    setActiveId(null);
    setMessages([DEFAULT_GREETING]);
    fetchConversations();
  };

  // ─── Delete a conversation ─────────────────────────────────────
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/assistant/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) closeChat();
    } catch (err) {
      setError("Could not delete this conversation.");
    }
  };

  // ─── Send a message ────────────────────────────────────────────
  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    let conversationId = activeId;

    if (!conversationId) {
      try {
        const res = await api.post("/assistant/conversations");
        conversationId = res.data.data.id;
        setConversations((prev) => [res.data.data, ...prev]);
        setActiveId(conversationId);
        setActiveTitle(res.data.data.title);
        setView("chat");
      } catch (err) {
        setError("Could not start a new conversation.");
        return;
      }
    }

    setError("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/assistant/chat", {
        message: trimmed,
        conversationId,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
      fetchConversations();
    } catch (err) {
      setError(
        err.response?.data?.message || "Assistant is unavailable right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ─── HOME VIEW ───────────────────────────────────────────────
  if (view === "home") {
    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ duration: 0.2 }}
            className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Rozi Assistant</h1>
            <p className="text-sm text-zinc-500">
              Ask about your earnings, fuel, or profit — anytime
            </p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.98 }}
          onClick={startNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 mb-6
            rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium
            transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Start New Chat
        </motion.button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <h2 className="text-sm font-semibold text-zinc-500 mb-3">
          Recent conversations
        </h2>

        {loadingConversations ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-10 text-zinc-400 text-sm">
            No conversations yet — start one above to get going.
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => openConversation(c)}
                className="group flex items-center gap-3 bg-white border border-zinc-200
                  rounded-xl px-4 py-3.5 cursor-pointer hover:border-indigo-300
                  hover:shadow-md transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 truncate">
                    {c.title}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {timeAgo(c.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400
                    hover:text-red-500 hover:scale-110 transition-all duration-150 flex-shrink-0 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── CHAT VIEW ───────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-between mb-4 gap-3"
      >
        <button
          onClick={closeChat}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800
            text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="flex-1 text-center text-sm font-semibold text-zinc-700 truncate px-2">
          {activeTitle}
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50
              text-indigo-600 hover:bg-indigo-100 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
          <button
            onClick={closeChat}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-500 text-white rounded-br-sm"
                      : "bg-zinc-100 text-zinc-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-zinc-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                <ThinkingDots />
              </div>
            </motion.div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -1 }}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-zinc-200
                  text-zinc-600 hover:bg-zinc-50 hover:border-indigo-300 hover:text-indigo-600
                  transition-colors"
              >
                {s}
              </motion.button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-zinc-200 p-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your earnings, fuel, or profit..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200
              text-sm text-zinc-800 placeholder:text-zinc-400
              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
              transition-all"
          />
          <motion.button
            type="submit"
            disabled={loading || !input.trim()}
            whileHover={!loading && input.trim() ? { scale: 1.06 } : {}}
            whileTap={!loading && input.trim() ? { scale: 0.94 } : {}}
            className="w-10 h-10 flex items-center justify-center rounded-xl
              bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40
              disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
