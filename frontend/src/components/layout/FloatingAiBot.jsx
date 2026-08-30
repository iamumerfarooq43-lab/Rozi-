import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  Send,
  Plus,
  X,
  Copy,
  Check,
  TrendingUp,
  Fuel,
  Wallet,
  PieChart,
  Maximize2,
  ChevronDown,
  Mic,
  MicOff,
  Smile,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import toast from "react-hot-toast";
import { playSound } from "@/utils/sound";

const CAPTAIN_EMOJIS = [
  { emoji: "🚗", label: "Car" },
  { emoji: "🛵", label: "Bike" },
  { emoji: "⛽", label: "Fuel" },
  { emoji: "💰", label: "Earnings" },
  { emoji: "💵", label: "Cash" },
  { emoji: "📈", label: "Profit" },
  { emoji: "📉", label: "Expense" },
  { emoji: "📊", label: "Analytics" },
  { emoji: "⏱️", label: "Hours" },
  { emoji: "📍", label: "Location" },
  { emoji: "🛠️", label: "Repairs" },
  { emoji: "👍", label: "OK" },
  { emoji: "🤖", label: "Bot" },
  { emoji: "❓", label: "Help" },
];

const QUICK_PROMPTS = [
  {
    label: "Weekly Earnings",
    prompt: "How much did I earn this week?",
    icon: TrendingUp,
  },
  {
    label: "Net Profit",
    prompt: "What's my net profit this month?",
    icon: Wallet,
  },
  {
    label: "Platform Compare",
    prompt: "Compare my platforms this month",
    icon: PieChart,
  },
  {
    label: "Fuel Spend",
    prompt: "How much did I spend on fuel this week?",
    icon: Fuel,
  },
];

const DEFAULT_GREETING = {
  role: "assistant",
  content:
    "Hello! I am your **Rozi Financial Assistant**. Ask me anything about your earnings, fuel costs, or net profit.",
};

// Bouncing dots loader
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-indigo-400"
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

// Formatted text renderer for markdown-like formatting
function FormattedContent({ text }) {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-xs leading-relaxed sm:text-sm">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;

        const parts = line.split(/(\*\*.*?\*\*)/g);
        const formattedLine = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={pIdx} className="font-semibold text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
              <p className="flex-1">
                {formattedLine.map((f, i) => (
                  <span key={i}>
                    {typeof f === "string" ? f.replace(/^[-*]\s+/, "") : f}
                  </span>
                ))}
              </p>
            </div>
          );
        }

        return <p key={idx}>{formattedLine}</p>;
      })}
    </div>
  );
}

export default function FloatingAiBot() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([DEFAULT_GREETING]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        playSound("pop");
        toast.success("Listening... Speak now 🎙️", { id: "voice-listen-bot" });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone access was denied.");
        } else if (event.error !== "no-speech") {
          toast.error("Could not capture speech.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Voice recognition start error:", err);
      setIsListening(false);
      toast.error("Could not start voice recognition.");
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInput((prev) => `${prev}${emoji} `);
    setShowEmojiPicker(false);
  };

  // Don't render floating widget if on the dedicated assistant page
  const isAssistantPage = location.pathname === "/assistant";

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
      setHasUnread(false);
    }
  }, [isOpen, messages, loading]);

  // Send message API call
  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    let conversationId = activeId;

    if (!conversationId) {
      try {
        const res = await api.post("/assistant/conversations");
        conversationId = res.data.data.id;
        setActiveId(conversationId);
      } catch (err) {
        setError("Could not start a conversation.");
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
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Assistant is currently unavailable.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const startNewChat = async () => {
    setError("");
    try {
      const res = await api.post("/assistant/conversations");
      setActiveId(res.data.data.id);
      setMessages([DEFAULT_GREETING]);
    } catch (err) {
      setError("Could not start a new conversation.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleOpenFullAssistant = () => {
    setIsOpen(false);
    navigate("/assistant");
  };

  if (isAssistantPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Floating Chat Box Window - Matching Sidebar Theme #1e2d40 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-4 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)]
              bg-[#1e2d40] text-white border border-white/10 rounded-2xl shadow-xl shadow-black/40
              flex flex-col overflow-hidden relative"
          >
            {/* Top Header */}
            <div className="bg-[#172333] px-4 py-3.5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight text-white">
                    Rozi AI Assistant
                  </h3>
                  <p className="text-[11px] text-white/60 font-medium">
                    Online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={startNewChat}
                  title="New Chat"
                  className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={handleOpenFullAssistant}
                  title="Open Full Page"
                  className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Action Prompts */}
            <div className="px-3 py-2 bg-[#172333]/60 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
              {QUICK_PROMPTS.map((q) => {
                const Icon = q.icon;
                return (
                  <button
                    key={q.label}
                    onClick={() => sendMessage(q.prompt)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-colors whitespace-nowrap"
                  >
                    <Icon className="w-3 h-3 text-indigo-400" />
                    {q.label}
                  </button>
                );
              })}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#1e2d40]">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm leading-relaxed group ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-xs"
                        : "bg-[#28394e] text-white/90 border border-white/10 rounded-bl-xs"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <>
                        <FormattedContent text={msg.content} />
                        <button
                          onClick={() => handleCopy(msg.content, i)}
                          className="absolute top-1.5 right-1.5 p-1 text-white/40 hover:text-white bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                          title="Copy text"
                        >
                          {copiedIdx === i ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#28394e] border border-white/10 px-3.5 py-2 rounded-xl rounded-bl-xs">
                    <ThinkingDots />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 text-center">
                  <p className="text-[11px] text-red-400 font-medium">{error}</p>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Footer Input */}
            <div className="relative p-2.5 sm:p-3 bg-[#172333] border-t border-white/10 flex-shrink-0">
              {/* Emoji Quick Picker Popover (Dark Mode Theme) */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-2 left-3 z-30 bg-[#1e2d40] border border-white/15 rounded-xl p-2 shadow-2xl shadow-black/60 w-64"
                  >
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 px-1">
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                        Captain Emojis
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(false)}
                        className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {CAPTAIN_EMOJIS.map((item) => (
                        <button
                          key={item.emoji}
                          type="button"
                          onClick={() => handleEmojiSelect(item.emoji)}
                          title={item.label}
                          className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center text-base transition-transform hover:scale-125 active:scale-95"
                        >
                          {item.emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-1.5"
              >
                {/* Emoji Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Insert Emoji"
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors flex-shrink-0 ${
                    showEmojiPicker
                      ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                      : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Voice Input Button */}
                <motion.button
                  type="button"
                  onClick={toggleVoiceInput}
                  title={isListening ? "Listening... Click to stop" : "Voice Input (Speech-to-Text)"}
                  animate={
                    isListening
                      ? {
                          scale: [1, 1.08, 1],
                          boxShadow: [
                            "0 0 0 0 rgba(239, 68, 68, 0.4)",
                            "0 0 0 6px rgba(239, 68, 68, 0)",
                          ],
                        }
                      : {}
                  }
                  transition={
                    isListening
                      ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                      : {}
                  }
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors flex-shrink-0 relative ${
                    isListening
                      ? "bg-rose-500 border-rose-400 text-white shadow-md shadow-rose-500/40"
                      : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </motion.button>

                {/* Text Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isListening ? "Listening to voice..." : "Ask Rozi AI..."
                  }
                  className={`flex-1 px-3 py-1.5 rounded-lg bg-[#27384d] border text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none transition-colors ${
                    isListening
                      ? "border-rose-400 ring-1 ring-rose-400/30"
                      : "border-white/10 focus:border-indigo-500"
                  }`}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button - Professional Dark Slate (#1e2d40) */}
      <motion.button
        onClick={() => {
          playSound("pop");
          setIsOpen(!isOpen);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center cursor-pointer focus:outline-none"
        aria-label="Open AI Assistant"
      >
        <div className="w-13 h-13 rounded-xl bg-[#1e2d40] hover:bg-[#27384d] text-white shadow-xl border border-white/15 flex items-center justify-center transition-colors">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                <Bot className="w-6 h-6 text-indigo-400" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread dot */}
          {hasUnread && !isOpen && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 border-2 border-[#1e2d40] rounded-full" />
          )}
        </div>
      </motion.button>
    </div>
  );
}
