import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Mail,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Fuel,
  Headphones,
  ExternalLink,
  Send,
  Phone,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const SUPPORT_EMAIL = "iamumerfarooq43@gmail.com";

const FAQS = [
  {
    question: "How does Rozi calculate my Net Profit?",
    answer:
      "Rozi computes your Net Profit by taking your Total Gross Earnings from all active platforms (Careem, Bykea, Yango, Foodpanda, InDrive) and subtracting your Total Fuel Expenses logged during that same date range: Net Profit = Gross Earnings - Fuel Cost.",
    category: "Financials",
    icon: TrendingUp,
  },
  {
    question: "How do I log multi-platform earnings?",
    answer:
      "Go to the 'Earnings' page from the sidebar, select your platform (e.g. Careem, Bykea), enter your gross amount, trips count, and working hours, then click Save. You can also view breakdowns per platform under the 'Platforms' page.",
    category: "Earnings",
    icon: MessageSquare,
  },
  {
    question: "How do Fuel Logs & Mileage analytics work?",
    answer:
      "When you refuel your vehicle, record the cost (PKR), liters filled, and current odometer (km) on the 'Fuel Logs' page. Rozi automatically calculates your cost per kilometer (PKR/km) and fuel efficiency (km/L) to help you track vehicle maintenance health.",
    category: "Fuel & Expenses",
    icon: Fuel,
  },
  {
    question: "How do I use the AI Voice Assistant?",
    answer:
      "You can open the 'AI Assistant' page or click the floating bot widget in the bottom-right corner. Tap the Microphone (🎙️) icon to ask queries hands-free (e.g., 'How much did I earn this week?' or 'What is my fuel spend today?'). You can also use the captain emoji bar for quick queries.",
    category: "AI Assistant",
    icon: Sparkles,
  },
  {
    question: "Can I export my financial reports?",
    answer:
      "Yes! On the 'History' and 'Analytics' pages, you can export your filtered records to CSV or PDF for tax filing or personal record-keeping.",
    category: "Reports",
    icon: BookOpen,
  },
  {
    question: "Is my personal and financial data secure?",
    answer:
      "Yes. All your data is protected with JWT token authentication, bcrypt password hashing, and multi-tenant database isolation. The AI assistant uses secure server-side closures, so your data is never accessible to any other captain.",
    category: "Security",
    icon: ShieldCheck,
  },
];

export default function HelpPage() {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(0); // first item open by default
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General Query");
  const [message, setMessage] = useState("");

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopied(true);
    toast.success("Support email copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message before sending.");
      return;
    }

    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      `[Rozi Support - ${category}] ${subject || "Captain Inquiry"}`
    )}&body=${encodeURIComponent(message)}`;

    window.open(mailtoUrl, "_blank");
    toast.success("Opening your email client...");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-[#1e2d40] via-[#27384d] to-[#172333] text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-900/10 border border-white/10 relative overflow-hidden"
      >
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Headphones className="w-3.5 h-3.5" />
            24/7 Captain Support Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How can we help you, Captain?
          </h1>
          <p className="text-sm text-white/70 mt-2 leading-relaxed">
            Have questions about your earnings, fuel calculations, or app features?
            Browse quick guides below or get in touch with our team directly.
          </p>
        </div>

        <div className="relative z-10 flex sm:flex-col items-center gap-3">
          <Button
            onClick={() => {
              const faqSection = document.getElementById("faq-section");
              faqSection?.scrollIntoView({ behavior: "smooth" });
            }}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40 backdrop-blur-xs text-xs font-semibold"
          >
            <HelpCircle className="w-4 h-4 mr-1.5" />
            Browse FAQs
          </Button>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25"
          >
            <Mail className="w-4 h-4 mr-1.5" />
            Email Support
          </a>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* Main Support Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Email Support Card (Primary) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white border border-indigo-200/80 rounded-2xl p-6 shadow-md shadow-indigo-500/5 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-900">Direct Email Help</h3>
                <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Reach out for account inquiries, bug reports, or feature suggestions.
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-medium text-zinc-800 truncate">
                {SUPPORT_EMAIL}
              </span>
              <button
                onClick={handleCopyEmail}
                title="Copy Email"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-white transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Response time: ~24 hrs</span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Compose <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>

        {/* WhatsApp Channel (Upcoming) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-900">WhatsApp Community</h3>
                <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Instant captain peer groups and automated status updates on WhatsApp.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 text-xs text-zinc-400">
            Planned for future release
          </div>
        </motion.div>

        {/* Phone Helpline (Upcoming) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-900">Captain Helpline</h3>
                <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Voice support line for quick road assistance and emergency guidance.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 text-xs text-zinc-400">
            Planned for future release
          </div>
        </motion.div>
      </div>

      {/* Quick Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs"
      >
        <div className="mb-6">
          <h2 className="text-lg font-bold text-zinc-900">Send an Inquiry or Feedback</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Fill in the details below to launch your email client with a pre-filled ticket.
          </p>
        </div>

        <form onSubmit={handleSendEmail} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              >
                <option>General Query</option>
                <option>Earnings & Calculation Issue</option>
                <option>Fuel Log & Mileage Bug</option>
                <option>AI Assistant Question</option>
                <option>Feature Request</option>
                <option>Account & Security</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question about Careem earnings sync"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question or issue in detail..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-zinc-400">
              Directly contacts <span className="font-semibold text-zinc-600">{SUPPORT_EMAIL}</span>
            </p>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm"
            >
              <Send className="w-4 h-4 mr-1.5" />
              Send to Support
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Frequently Asked Questions (Accordion) */}
      <div id="faq-section" className="space-y-4 pt-2">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Quick answers to common questions about Rozi's calculations and features.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            const Icon = faq.icon;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-indigo-300 shadow-md shadow-indigo-500/5"
                    : "border-zinc-200/80 hover:border-zinc-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isOpen
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-zinc-900">
                      {faq.question}
                    </span>
                  </div>
                  <div className="text-zinc-400 flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100"
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
