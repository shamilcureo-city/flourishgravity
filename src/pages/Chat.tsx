import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check auth and start session
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Create a new chat session
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({ user_id: session.user.id, title: "New Conversation" })
        .select()
        .single();

      if (error) {
        console.error("Error creating session:", error);
        toast.error("Failed to start chat session");
        return;
      }

      setSessionId(data.id);
      
      // Get initial greeting from AI
      await getInitialGreeting();
    };

    init();
  }, [navigate]);

  const getInitialGreeting = async () => {
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [], isNewSession: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to get greeting");
      }

      let assistantContent = "";
      setMessages([{ role: "assistant", content: "" }]);

      await streamResponse(response, (chunk) => {
        assistantContent += chunk;
        setMessages([{ role: "assistant", content: assistantContent }]);
      });

      // Save the greeting to database
      if (sessionId) {
        await supabase.from("messages").insert({
          session_id: sessionId,
          role: "assistant",
          content: assistantContent,
        });
      }
    } catch (error) {
      console.error("Error getting greeting:", error);
      setMessages([{
        role: "assistant",
        content: "Hello! I'm Flourish, your AI wellness companion. How are you feeling today?",
      }]);
    } finally {
      setIsInitializing(false);
    }
  };

  const streamResponse = async (
    response: Response,
    onDelta: (chunk: string) => void
  ) => {
    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") return;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId) return;

    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Save user message to database
    await supabase.from("messages").insert({
      session_id: sessionId,
      role: "user",
      content,
    });

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }

      let assistantContent = "";
      setMessages([...newMessages, { role: "assistant", content: "" }]);

      await streamResponse(response, (chunk) => {
        assistantContent += chunk;
        setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
      });

      // Save assistant message to database
      await supabase.from("messages").insert({
        session_id: sessionId,
        role: "assistant",
        content: assistantContent,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
      setMessages(newMessages); // Remove the empty assistant message
    } finally {
      setIsLoading(false);
    }
  }, [messages, sessionId]);

  const startNewConversation = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setIsInitializing(true);
    setMessages([]);

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: session.user.id, title: "New Conversation" })
      .select()
      .single();

    if (error) {
      toast.error("Failed to start new conversation");
      return;
    }

    setSessionId(data.id);
    await getInitialGreeting();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-foreground">Flourish Chat</h1>
            <p className="text-xs text-muted-foreground">Your AI wellness companion</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={startNewConversation}>
          <Plus className="h-4 w-4 mr-1" />
          New Chat
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Starting your session...</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              isStreaming={isLoading && index === messages.length - 1 && message.role === "assistant"}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading || isInitializing}
        isLoading={isLoading}
      />
    </div>
  );
}
