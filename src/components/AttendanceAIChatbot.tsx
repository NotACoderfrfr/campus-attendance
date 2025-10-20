import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
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
      const studentName = 
        localStorage.getItem("studentName") || 
        localStorage.getItem("student_name") ||
        localStorage.getItem("name") ||
        localStorage.getItem("userName") ||
        localStorage.getItem("user_name") ||
        undefined;
      
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
      {/* Floating Button - Positioned perfectly on both mobile & desktop */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center z-[1000] bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop Only */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] md:hidden" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Chat Container - Full screen on mobile, floating on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed 
                inset-x-0 bottom-0 h-[92vh]
                md:inset-x-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[650px] md:max-h-[85vh]
                bg-white dark:bg-gray-900 
                rounded-t-3xl md:rounded-2xl 
                shadow-2xl flex flex-col z-[999] overflow-hidden 
                border-t md:border border-gray-200 dark:border-gray-800"
            >
              {/* Header - Same height on both mobile & desktop */}
              <div className="bg-blue-600 text-white px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">AI Assistant</h3>
                    <p className="text-xs text-blue-100">Always here to help</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area - Flexible scrollable area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-950">
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white" 
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                    }`}>
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({ children }) => <strong className="font-semibold text-blue-600 dark:text-blue-400">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              ul: ({ children }) => <ul className="list-disc ml-4 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal ml-4 space-y-1">{children}</ol>,
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Streaming Message */}
                {streamingText && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-blue-600 dark:text-blue-400">{children}</strong>,
                          }}
                        >
                          {streamingText}
                        </ReactMarkdown>
                        <motion.span 
                          className="inline-block w-1.5 h-4 bg-blue-600 ml-1 rounded-sm"
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Loading Indicator */}
                {loading && !streamingText && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex justify-start"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex gap-1.5">
                        {[0, 0.15, 0.3].map((delay, i) => (
                          <motion.div 
                            key={i} 
                            animate={{ y: [0, -8, 0] }} 
                            transition={{ duration: 0.6, repeat: Infinity, delay }} 
                            className="w-2 h-2 bg-blue-600 rounded-full" 
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Fixed at bottom with proper padding */}
              <div className="p-3 sm:p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Type your message..."
                    disabled={loading}
                    className="flex-1 px-3 py-2.5 sm:px-4 text-sm border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50 transition-all"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={handleSend} 
                    disabled={loading || !input.trim()} 
                    className="px-3 py-2.5 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors flex-shrink-0"
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
