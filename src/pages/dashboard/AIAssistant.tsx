import DashboardLayout from "@/components/DashboardLayout";
import { userNavItems } from "@/config/navItems";
import { Bot, Send, User, Loader2, Sparkles, TrendingUp, Package, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/config/api";
import { toast } from "sonner";

interface Message {
  role: "user" | "model";
  parts: [{ text: string }];
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const text = overrideText || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", parts: [{ text }] };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          history: messages
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get AI response");
      }

      const data = await res.json();
      const aiMessage: Message = { role: "model", parts: [{ text: data.reply }] };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      toast.error("AI Error", { description: err.message });
      // Remove the last user message if it failed to get a response
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { text: "Analyze my sales performance", icon: <TrendingUp className="w-3 h-3" /> },
    { text: "Which products are low on stock?", icon: <Package className="w-3 h-3" /> },
    { text: "Suggest ways to increase revenue", icon: <Sparkles className="w-3 h-3" /> },
    { text: "Overview of recent payments", icon: <AlertCircle className="w-3 h-3" /> },
  ];

  return (
    <DashboardLayout navItems={userNavItems} title="AI Assistant" userRole="User">
      <div className="flex flex-col h-[calc(100vh-180px)] max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl p-6 text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Business Intelligence AI</h2>
              <p className="text-xs text-blue-100 opacity-80">Powered by Gemini • Real-time Business Context</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Analytics
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-card border-x border-border overflow-hidden flex flex-col relative">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto animate-in fade-in zoom-in duration-700">
                <div className="bg-primary/5 p-6 rounded-full">
                  <Bot className="w-16 h-16 text-primary/40" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-card-foreground">Hello! I'm your Business Assistant.</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    I have access to your sales, products, and customers. Ask me anything about your business analytics or for advice.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  {suggestions.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => handleSendMessage(undefined, s.text)}
                      className="text-left p-3 rounded-xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/50 transition-all text-xs flex items-center gap-2 group"
                    >
                      <div className="p-1.5 rounded-lg bg-background border border-border group-hover:bg-primary/10 transition-colors">
                        {s.icon}
                      </div>
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                  {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted/50 text-card-foreground border border-border rounded-tl-none"
                  }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.parts[0].text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-muted text-muted-foreground">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-card border border-border rounded-b-2xl p-4 shadow-xl">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Ask about your business statistics..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-muted/30 border-none shadow-inner focus-visible:ring-primary h-12"
              disabled={loading}
            />
            <Button size="icon" className="h-12 w-12 shrink-0 rounded-xl" disabled={!input.trim() || loading}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-widest font-bold opacity-60">
            Powered by Bill Hisab Business Intelligence Engine
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;
