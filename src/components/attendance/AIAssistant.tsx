import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { Bot, Loader2, Send, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIAssistant({ rollNumber }: { rollNumber: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatAction = useAction(api.ai.chatWithAI);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatAction({
        roll_number: rollNumber,
        message: userMessage,
      });

      console.log("AI Response:", response);

      if (response.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: response.message }]);
      } else {
        const errorMsg = response.error ? `Error: ${response.error}` : response.message;
        toast.error(errorMsg);
        setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, I encountered an error: ${errorMsg}` }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(`Failed to send message: ${String(error)}`);
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, I encountered an error: ${String(error)}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Attendance Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about your attendance, get predictions, or advice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">Ask me anything about your attendance!</p>
              <p className="text-xs mt-2">Try: "If I miss 3 days, what will my attendance be?"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Bot className="h-6 w-6 text-primary" />
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Ask about your attendance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}