import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AttendanceAIChatbot({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "assistant", text: "Hi! 👋 I'm your AI attendance assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const attendanceSummary = useQuery(
    api.attendance.getAttendanceSummary,
    userId ? { roll_number: userId } : "skip"
  );

  const chatWithAI = useAction(api.ai.chatWithAI);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, streamingText]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const simulateStreaming = async (text: string) => {
    const words = text.split(" ");
    let current = "";
    
    for (let i = 0; i < words.length; i++) {
      current += (i > 0 ? " " : "") + words[i];
      setStreamingText(current);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    setMessages(prev => [...prev, { role: "assistant", text }]);
    setStreamingText("");
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      // Try multiple possible keys for student name
      const studentName = 
        localStorage.getItem("studentName") || 
        localStorage.getItem("student_name") ||
        localStorage.getItem("name") ||
        localStorage.getItem("userName") ||
        localStorage.getItem("user_name") ||
        undefined;
      
      console.log("Sending student name:", studentName); // Debug log
      
      const result = await chatWithAI({
        roll_number: userId,
        message: userMessage,
        student_name: studentName,
      });

      if (result.success) {
        await simulateStreaming(result.message);
      } else {
        await simulateStreaming(result.message || "Sorry, I couldn't process your request.");
      }
    } catch (error: any) {
      await simulateStreaming("Sorry, I encountered an error. Please try again!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!attendanceSummary || attendanceSummary.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center z-[1000] bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 hover:shadow-purple-500/50"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div 
                key="close" 
                initial={{ rotate: -90, scale: 0 }} 
                animate={{ rotate: 0, scale: 1 }} 
                exit={{ rotate: 90, scale: 0 }} 
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </motion.div>
            ) : (
              <motion.div 
                key="sparkles" 
                initial={{ rotate: 90, scale: 0 }} 
                animate={{ rotate: 0, scale: 1 }} 
                exit={{ rotate: -90, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] md:hidden" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 md:bottom-20 md:right-6 md:left-auto md:w-[420px] h-[85vh] md:h-[680px] bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col z-[999] overflow-hidden border-t md:border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-xl"
            >
              <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white p-5 md:p-6 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse" />
                <motion.div 
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center relative z-10"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                </motion.div>
                <div className="flex-1 relative z-10">
                  <h3 className="font-bold text-lg md:text-xl">AI Assistant</h3>
                  <p className="text-xs md:text-sm text-white/90">Powered by Groq AI ⚡</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="md:hidden w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors relative z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 md:space-y-5">
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    transition={{ duration: 0.4, type: "spring" }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 md:px-5 md:py-4 ${
                      msg.role === "user" 
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30" 
                        : "bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 shadow-lg backdrop-blur-sm border border-purple-100 dark:border-purple-800"
                    }`}>
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm md:text-base leading-relaxed">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({ children }) => <strong className="font-bold text-purple-700 dark:text-purple-400">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              ul: ({ children }) => <ul className="list-disc ml-4 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal ml-4 space-y-1">{children}</ol>,
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {streamingText && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 md:px-5 md:py-4 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 shadow-lg backdrop-blur-sm border border-purple-100 dark:border-purple-800">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm md:text-base leading-relaxed">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold text-purple-700 dark:text-purple-400">{children}</strong>,
                          }}
                        >
                          {streamingText}
                        </ReactMarkdown>
                        <motion.span 
                          className="inline-block w-2 h-4 bg-purple-600 ml-1"
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {loading && !streamingText && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex justify-start"
                  >
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl px-5 py-4 shadow-lg backdrop-blur-sm border border-purple-100 dark:border-purple-800">
                      <div className="flex gap-2">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.div 
                            key={i} 
                            animate={{ y: [0, -10, 0] }} 
                            transition={{ duration: 0.6, repeat: Infinity, delay }} 
                            className="w-2.5 h-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full" 
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 md:p-5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-t border-purple-200/50 dark:border-purple-800/50">
                <div className="flex gap-2 md:gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Ask me anything..."
                    disabled={loading}
                    className="flex-1 px-4 py-3 md:px-5 md:py-3.5 text-sm md:text-base border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800/50 dark:text-white disabled:opacity-50 backdrop-blur-sm transition-all"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05, rotate: 5 }} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={handleSend} 
                    disabled={loading || !input.trim()} 
                    className="px-4 py-3 md:px-5 md:py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
