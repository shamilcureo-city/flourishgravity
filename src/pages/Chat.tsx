import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useChatSessions } from "@/hooks/useChatSessions";
import { useProfile } from "@/hooks/useProfile";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { loadSessionMessages, updateSessionTitle } = useChatSessions();
  const { profile } = useProfile();

  // Build profile data for AI personalization
  const getProfileData = useCallback(async () => {
    if (!profile) return undefined;
    
    // Get recent mood average
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return undefined;
    
    const { data: recentMoods } = await supabase
      .from("mood_entries")
      .select("mood_score")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(7);
    
    const recentMoodAvg = recentMoods && recentMoods.length > 0
      ? recentMoods.reduce((sum, m) => sum + m.mood_score, 0) / recentMoods.length
      : undefined;

    return {
      display_name: profile.display_name || undefined,
      goals: profile.goals || undefined,
      communication_style: profile.communication_style || undefined,
      recent_mood_avg: recentMoodAvg,
    };
  }, [profile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start with a new session
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
      await getInitialGreeting();
    };

    init();
  }, []);

  const getInitialGreeting = async () => {
    try {
      const profileData = await getProfileData();
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [], isNewSession: true, profile: profileData }),
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

    // Update session title based on first user message
    if (messages.length <= 1) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      await updateSessionTitle(sessionId, title);
    }

    try {
      const profileData = await getProfileData();
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          profile: profileData,
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
      setMessages(newMessages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, sessionId, updateSessionTitle, getProfileData]);

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

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

  const handleSelectSession = async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;

    setIsInitializing(true);
    setSessionId(selectedSessionId);

    try {
      const loadedMessages = await loadSessionMessages(selectedSessionId);
      setMessages(loadedMessages.map((m) => ({ role: m.role, content: m.content })));
    } catch (error) {
      console.error("Error loading session:", error);
      toast.error("Failed to load conversation");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
          <div className="flex items-center gap-3">
            <ChatHistory
              currentSessionId={sessionId}
              onSelectSession={handleSelectSession}
            />
            <div>
              <h1 className="font-semibold text-foreground">Flourish Chat</h1>
              <p className="text-xs text-muted-foreground">Your AI wellness companion</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={startNewConversation}>
            <Plus className="h-4 w-4 mr-1" />
            New
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
          ) : messages.length <= 1 ? (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  isStreaming={isLoading && index === messages.length - 1 && message.role === "assistant"}
                  messageIndex={index}
                />
              ))}
              {!isLoading && (
                <SuggestedPrompts onSelect={handleSuggestedPrompt} disabled={isLoading} />
              )}
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                isStreaming={isLoading && index === messages.length - 1 && message.role === "assistant"}
                messageIndex={index}
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
    </AppLayout>
  );
}
