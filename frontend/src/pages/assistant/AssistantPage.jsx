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
  Copy,
  Check,
  TrendingUp,
  Fuel,
  Wallet,
  PieChart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { playSound } from "@/utils/sound";

const QUICK_CARDS = [
  {
    title: "Weekly Earnings",
    prompt: "How much did I earn this week?",
    desc: "Get a breakdown of your earnings over the past 7 days",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50/80 text-emerald-600",
    cardBg:
      "bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/30 border-emerald-200/80 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/10",
  },
  {
    title: "Net Profit Calc",
    prompt: "What's my net profit this month?",
    desc: "Calculate total earnings minus fuel & platform costs",
    icon: Wallet,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50/80 text-indigo-600",
    cardBg:
      "bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/30 border-indigo-200/80 hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-500/10",
  },
  {
    title: "Platform Compare",
    prompt: "Compare my platforms this month",
    desc: "See which app (Uber, Careem, Indrive) earned you most",
    icon: PieChart,
    color: "text-purple-600",
    bgColor: "bg-purple-50/80 text-purple-600",
    cardBg:
      "bg-gradient-to-br from-purple-50/90 via-white to-fuchsia-50/30 border-purple-200/80 hover:border-purple-400 hover:shadow-md hover:shadow-purple-500/10",
  },
  {
    title: "Fuel Spend",
    prompt: "How much did I spend on fuel this week?",
    desc: "Review your recent fuel fill-ups and costs",
    icon: Fuel,
    color: "text-amber-600",
    bgColor: "bg-amber-50/80 text-amber-600",
    cardBg:
      "bg-gradient-to-br from-amber-50/90 via-white to-orange-50/30 border-amber-200/80 hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10",
  },
];

const DEFAULT_GREETING = {
  role: "assistant",
  content:
    "Hi! I'm your **Rozi Financial Assistant** 🤖. Ask me anything about your daily earnings, fuel expenses, or net profit — I'll pull real data from your account!",
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

// Bouncing dots loader
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-indigo-500"
          animate={{ y: [0, -5, 0] }}
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

// Simple Markdown / Formatted Text Renderer
function FormattedContent({ text }) {
  if (!text) return null;

  // Split by line breaks
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;

        // Process bold text (**text**)
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const formattedLine = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={pIdx} className="font-bold text-zinc-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        // Check if line is bullet point
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
              <p className="flex-1 leading-relaxed">
                {formattedLine.map((f, i) => (
                  <span key={i}>{typeof f === "string" ? f.replace(/^[-*]\s+/, "") : f}</span>
                ))}
              </p>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {formattedLine}
          </p>
        );
      })}
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
  const [copiedIdx, setCopiedIdx] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load conversation list
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

  // Open an existing conversation
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

  // Start a brand new conversation
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

  // Close current chat
  const closeChat = () => {
    setView("home");
    setActiveId(null);
    setMessages([DEFAULT_GREETING]);
    fetchConversations();
  };

  // Delete a conversation
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    try {
      await api.delete(`/assistant/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      toast.success("Conversation deleted");
      if (activeId === id) closeChat();
    } catch (err) {
      toast.error("Could not delete conversation");
    }
  };

  // Send a message
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
    playSound("message_sent");
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
      playSound("message_received");
      fetchConversations();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Assistant is unavailable right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copied response to clipboard!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ─── HOME VIEW ───────────────────────────────────────────────
  if (view === "home") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 4 }}
              transition={{ duration: 0.2 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                AI Financial Assistant
              </h1>
              <p className="text-sm text-zinc-500">
                Ask about your ride earnings, fuel spend, or net profit
              </p>
            </div>
          </div>

          <Button
            onClick={startNewChat}
            className="shadow-sm hover:shadow transition-shadow"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Chat
          </Button>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Quick Starter Cards */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Quick Analysis Prompts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {QUICK_CARDS.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.06 }}
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  onClick={() => sendMessage(card.prompt)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${card.cardBg}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs">
                        <Icon className={`w-4 h-4 ${card.color}`} />
                      </div>
                      <span className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                        {card.title}
                      </span>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    "{card.prompt}"
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Recent Conversations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Recent Conversations
            </h2>
            {conversations.length > 0 && (
              <span className="text-xs text-zinc-400 font-medium">
                {conversations.length} saved
              </span>
            )}
          </div>

          {loadingConversations ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 text-center text-zinc-400 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
              <p className="font-medium text-zinc-700">No past conversations</p>
              <p className="text-xs text-zinc-400 mt-1">Start a chat or select a quick prompt above</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {conversations.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                  onClick={() => openConversation(c)}
                  className="group flex items-center gap-3.5 bg-white border border-zinc-200/90
                    rounded-2xl px-4 py-3.5 cursor-pointer hover:border-indigo-300
                    hover:shadow-md transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 truncate group-hover:text-indigo-600 transition-colors">
                      {c.title}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                      {timeAgo(c.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400
                      hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-150 flex-shrink-0"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── CHAT VIEW ───────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] min-h-[520px] max-w-4xl mx-auto">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-between mb-3 gap-3"
      >
        <button
          onClick={closeChat}
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900
            text-sm font-semibold transition-colors bg-white px-3 py-1.5 rounded-xl border border-zinc-200/80 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="flex-1 text-center text-sm font-bold text-zinc-800 truncate px-2">
          {activeTitle}
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50
              text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition-colors border border-indigo-200/50"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
          <button
            onClick={closeChat}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-zinc-200/80
              text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-sm relative">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex-shrink-0" />
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
                  className={`relative max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed group ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-xs shadow-md shadow-indigo-500/15"
                      : "bg-gradient-to-br from-zinc-50 via-white to-indigo-50/20 border border-zinc-200/80 text-zinc-800 rounded-bl-xs shadow-xs"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <>
                      <FormattedContent text={msg.content} />
                      <button
                        onClick={() => handleCopy(msg.content, i)}
                        className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-zinc-700 bg-white/80 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-xs"
                        title="Copy message"
                      >
                        {copiedIdx === i ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </>
                  ) : (
                    msg.content
                  )}
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
              <div className="bg-zinc-100/90 border border-zinc-200/60 px-4 py-3 rounded-2xl rounded-bl-xs">
                <ThinkingDots />
              </div>
            </motion.div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Form Footer */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-zinc-200/80 p-3 bg-zinc-50/50"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your earnings, fuel, or net profit..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-zinc-200
              text-sm text-zinc-800 placeholder:text-zinc-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
              transition-all shadow-xs"
          />
          <motion.button
            type="submit"
            disabled={loading || !input.trim()}
            whileHover={!loading && input.trim() ? { scale: 1.05 } : {}}
            whileTap={!loading && input.trim() ? { scale: 0.95 } : {}}
            className="w-10 h-10 flex items-center justify-center rounded-xl
              bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40
              disabled:cursor-not-allowed text-white transition-colors flex-shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
