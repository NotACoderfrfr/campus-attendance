import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AttendanceAIChatbot({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "assistant", text: "Hi! I'm your AI attendance assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const attendanceSummary = useQuery(
    api.attendance.getAttendanceSummary,
    userId ? { roll_number: userId } : "skip"
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, streamingText]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const totalHeld = attendanceSummary?.reduce((sum, s) => sum + s.periods_held, 0) || 0;
      const totalAttended = attendanceSummary?.reduce((sum, s) => sum + s.periods_attended, 0) || 0;
      const overallPercentage = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;

      const studentName = localStorage.getItem("studentName") || "Student";
      
      const today = new Date();
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const currentDay = dayNames[today.getDay()];
      const currentDate = today.toLocaleDateString("en-US", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDay = dayNames[tomorrow.getDay()];
      const tomorrowDate = tomorrow.toLocaleDateString("en-US", { 
        weekday: "long", 
        month: "long", 
        day: "numeric" 
      });

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Gemini API key not found");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Get roll number and determine batch
const rollNumber = localStorage.getItem("studentRollNumber") || "Unknown";
const rollNumeric = parseInt(rollNumber.match(/\d+/)?.[0] || "0");
const batch = rollNumeric >= 1 && rollNumeric <= 45 ? "Batch 1 (Roll 001-045)" : "Batch 2 (Roll 046+)";

// Build conversation history for context
const conversationHistory = messages.map(m => 
  `${m.role === "user" ? "Student" : "Assistant"}: ${m.text}`
).join("\n");

const prompt = `You are a friendly AI attendance advisor having a natural conversation. Continue this chat smoothly.

CONVERSATION HISTORY:
${conversationHistory}

STUDENT DATA (use only when relevant to their question):
- Name: ${studentName}, Roll: ${rollNumber}, ${batch}
- Attendance: ${overallPercentage}% (${totalAttended}/${totalHeld} classes)
- Today: ${currentDay}, Tomorrow: ${tomorrowDay}
- Subjects: ${attendanceSummary?.map((s: any) => `${s.subject} ${s.percentage}%`).join(', ')}

Schedule: Mon(6): M-IT,DM,BDE,PYT,DS,F&A | Tue(6): F&A,DM,BDE,PYT,Lab | Wed(5): PYT,DS,BDE,F&A,DM | Thu(6): M-IT,F&A,DM,DS,Lab | Fri(4): F&A,M-IT,DS,PYT | Sat(4): BDE,M-IT,Lab | Sun: Off
${batch === "Batch 1 (Roll 001-045)" ? "Labs: Tue-PYT, Thu-DS, Sat-BDE" : "Labs: Tue-DS, Thu-BDE, Sat-PYT"}

LATEST QUESTION: "${userMessage}"

RULES:
1. Continue conversation naturally - don't repeat info they already know
2. Be conversational and brief (2-3 sentences max unless calculation needed)
3. Only mention roll/batch if they specifically ask about it
4. Don't repeat greetings or restate their details every response
5. Answer ONLY what's asked - be helpful, not verbose
6. Use markdown (** for bold) properly

Answer naturally:`;



      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiAnswer = response.text();

      // Simulate streaming effect
      setStreamingText("");
      const words = aiAnswer.split(" ");
      let currentText = "";
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? " " : "") + words[i];
        setStreamingText(currentText);
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      setMessages(prev => [...prev, { role: "assistant", text: aiAnswer }]);
      setStreamingText("");
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        text: `Sorry, I encountered an error. Please try again!` 
      }]);
      setStreamingText("");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!attendanceSummary || attendanceSummary.length === 0) return null;

  return (
    <>
      {/* Floating AI Button */}
      <AnimatePresence>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-[1000] bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-7 h-7 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="sparkles"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[380px] h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-[999] overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Assistant</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.text}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Streaming message */}
              {streamingText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-md">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        }}
                      >
                        {streamingText}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Typing indicator */}
              {loading && !streamingText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-gray-700 rounded-2xl px-5 py-3 shadow-md">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me anything..."
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
