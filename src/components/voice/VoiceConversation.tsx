import { useCallback, useState, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";
import { VoiceIndicator } from "./VoiceIndicator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

interface VoiceConversationProps {
  onClose: () => void;
  onTranscript?: (role: "user" | "assistant", text: string) => void;
  sessionId?: string | null;
}

interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function VoiceConversation({ onClose, onTranscript, sessionId }: VoiceConversationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "connecting" | "connected" | "speaking" | "listening">("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const savedMessagesRef = useRef<Set<string>>(new Set());
  const sessionIdRef = useRef(sessionId);
  const historyEndRef = useRef<HTMLDivElement>(null);
  
  // Track partial agent responses for buffering
  const agentResponseBufferRef = useRef<string>("");
  const lastSpeakingStateRef = useRef<boolean>(false);

  // Keep sessionId ref in sync
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Auto-scroll conversation history
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory]);

  // Save message to database
  const saveMessageToDb = useCallback(async (role: "user" | "assistant", content: string) => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId || !content.trim()) return;
    
    // Create a unique key to prevent duplicate saves
    const messageKey = `${role}:${content.slice(0, 100)}`;
    if (savedMessagesRef.current.has(messageKey)) return;
    savedMessagesRef.current.add(messageKey);

    try {
      const { error } = await supabase.from("messages").insert({
        session_id: currentSessionId,
        role,
        content,
      });
      if (error) {
        console.error("Failed to save voice message:", error);
        savedMessagesRef.current.delete(messageKey); // Allow retry
      } else {
        console.log(`Voice message saved: ${role} - ${content.slice(0, 50)}...`);
        
        // Update session to mark as having voice messages
        await supabase
          .from("chat_sessions")
          .update({ 
            has_voice_messages: true,
            last_message_preview: content.slice(0, 100),
            updated_at: new Date().toISOString()
          })
          .eq("id", currentSessionId);
      }
    } catch (err) {
      console.error("Error saving voice message:", err);
      savedMessagesRef.current.delete(messageKey);
    }
  }, []);

  // Add message to conversation history
  const addToHistory = useCallback((role: "user" | "assistant", content: string) => {
    if (!content.trim()) return;
    const id = `${Date.now()}-${role}-${Math.random()}`;
    setConversationHistory(prev => [...prev, { id, role, content }]);
  }, []);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Voice conversation connected");
      setVoiceStatus("connected");
      setIsConnecting(false);
      toast.success("Voice mode activated");
    },
    onDisconnect: () => {
      console.log("Voice conversation disconnected");
      setVoiceStatus("idle");
      
      // Flush any remaining buffered agent response
      if (agentResponseBufferRef.current.trim()) {
        const finalText = agentResponseBufferRef.current.trim();
        addToHistory("assistant", finalText);
        onTranscript?.("assistant", finalText);
        saveMessageToDb("assistant", finalText);
        agentResponseBufferRef.current = "";
      }
    },
    onMessage: async (message) => {
      // Log all messages for debugging
      console.log("Voice message received:", JSON.stringify(message, null, 2));
      
      // Cast to access dynamic properties
      const msg = message as unknown as Record<string, unknown>;
      
      let userText: string | undefined;
      let agentText: string | undefined;
      
      // ===== Method 1: Standard ElevenLabs event types =====
      if (msg.type === "user_transcript") {
        const event = msg.user_transcription_event as Record<string, unknown> | undefined;
        userText = (event?.user_transcript || event?.transcript) as string | undefined;
        console.log("Parsed user_transcript event:", userText);
      } else if (msg.type === "agent_response") {
        const event = msg.agent_response_event as Record<string, unknown> | undefined;
        agentText = (event?.agent_response || event?.response) as string | undefined;
        console.log("Parsed agent_response event:", agentText);
      }
      
      // ===== Method 2: Direct property access (alternative format) =====
      if (!userText && msg.user_transcript) {
        userText = msg.user_transcript as string;
        console.log("Found direct user_transcript:", userText);
      }
      if (!agentText && msg.agent_response) {
        agentText = msg.agent_response as string;
        console.log("Found direct agent_response:", agentText);
      }
      
      // ===== Method 3: Generic text + role format =====
      if (!userText && !agentText && msg.text && msg.role) {
        if (msg.role === "user") {
          userText = msg.text as string;
          console.log("Found text+role user:", userText);
        }
        if (msg.role === "assistant" || msg.role === "agent") {
          agentText = msg.text as string;
          console.log("Found text+role agent:", agentText);
        }
      }
      
      // ===== Method 4: Transcript field (some WebRTC implementations) =====
      if (!userText && msg.transcript && msg.is_final) {
        userText = msg.transcript as string;
        console.log("Found transcript field:", userText);
      }
      
      // ===== Method 5: Handle streaming chunks (agent_chat_response_part) =====
      if (msg.type === "agent_chat_response_part" || msg.type === "text_delta") {
        const chunk = (msg.text || msg.delta || msg.content) as string | undefined;
        if (chunk) {
          agentResponseBufferRef.current += chunk;
          setTranscript(agentResponseBufferRef.current);
        }
        return; // Don't save partial chunks
      }
      
      // ===== Method 6: Handle final agent response after streaming =====
      if (msg.type === "agent_chat_response" || msg.type === "text_done") {
        const fullText = (msg.text || msg.content || agentResponseBufferRef.current) as string;
        if (fullText?.trim()) {
          agentText = fullText.trim();
          agentResponseBufferRef.current = "";
        }
      }
      
      // ===== Save finalized messages =====
      if (userText?.trim()) {
        setTranscript(userText);
        addToHistory("user", userText);
        onTranscript?.("user", userText);
        await saveMessageToDb("user", userText);
      }
      
      if (agentText?.trim()) {
        setTranscript(agentText);
        addToHistory("assistant", agentText);
        onTranscript?.("assistant", agentText);
        await saveMessageToDb("assistant", agentText);
      }
    },
    onError: (error) => {
      console.error("Voice conversation error:", error);
      toast.error("Voice connection error. Please try again.");
      setVoiceStatus("idle");
      setIsConnecting(false);
    },
  });

  // Track speaking state changes to detect turn completion
  useEffect(() => {
    const wasSpeaking = lastSpeakingStateRef.current;
    const isSpeaking = conversation.isSpeaking;
    
    // Agent just finished speaking - flush buffer if we have one
    if (wasSpeaking && !isSpeaking && agentResponseBufferRef.current.trim()) {
      const finalText = agentResponseBufferRef.current.trim();
      console.log("Agent finished speaking, flushing buffer:", finalText.slice(0, 50));
      addToHistory("assistant", finalText);
      onTranscript?.("assistant", finalText);
      saveMessageToDb("assistant", finalText);
      agentResponseBufferRef.current = "";
    }
    
    lastSpeakingStateRef.current = isSpeaking;
  }, [conversation.isSpeaking, addToHistory, onTranscript, saveMessageToDb]);

  // Update voice status based on conversation state
  useEffect(() => {
    if (conversation.status === "connected") {
      if (conversation.isSpeaking) {
        setVoiceStatus("speaking");
      } else {
        setVoiceStatus("listening");
      }
    }
  }, [conversation.status, conversation.isSpeaking]);

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    setVoiceStatus("connecting");
    agentResponseBufferRef.current = "";

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get conversation token from edge function WITH session context
      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token", {
        body: { sessionId: sessionIdRef.current }
      });

      if (error) {
        console.error("Token fetch error:", error);
        throw new Error("Failed to get conversation token");
      }

      if (!data?.token) {
        console.error("No token in response:", data);
        throw new Error("No token received from server");
      }

      console.log("Starting voice session with token", data.hasContext ? "(with context)" : "(no context)");

      // Build session config with optional context injection
      const sessionConfig: Parameters<typeof conversation.startSession>[0] = {
        conversationToken: data.token,
        connectionType: "webrtc",
      };

      // If we have conversation context, inject it via overrides
      if (data.context) {
        sessionConfig.overrides = {
          agent: {
            prompt: {
              prompt: data.context
            }
          }
        };
        console.log("Injecting conversation context for continuity");
      }

      await conversation.startSession(sessionConfig);
    } catch (error) {
      console.error("Failed to start voice conversation:", error);
      
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast.error("Microphone access denied. Please enable microphone permissions.");
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to start voice mode");
      }
      
      setVoiceStatus("idle");
      setIsConnecting(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      setVoiceStatus("idle");
      setTranscript("");
    } catch (error) {
      console.error("Error ending conversation:", error);
    }
  }, [conversation]);

  const toggleMute = useCallback(async () => {
    try {
      await conversation.setVolume({ volume: isMuted ? 1 : 0 });
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  }, [conversation, isMuted]);

  const handleClose = useCallback(() => {
    if (conversation.status === "connected") {
      stopConversation();
    }
    onClose();
  }, [conversation.status, stopConversation, onClose]);

  // Auto-start conversation when component mounts
  useEffect(() => {
    if (voiceStatus === "idle" && !isConnecting) {
      startConversation();
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="absolute top-4 right-4"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Voice indicator and transcript area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-foreground">Voice Mode</h2>
        
        <VoiceIndicator
          status={voiceStatus}
          inputLevel={conversation.getInputVolume?.() || 0}
          outputLevel={conversation.getOutputVolume?.() || 0}
        />

        {/* Conversation history */}
        {conversationHistory.length > 0 && (
          <ScrollArea className="w-full max-h-48 border rounded-lg p-3 bg-muted/30">
            <div className="space-y-3">
              {conversationHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <span className="text-xs text-muted-foreground mb-0.5">
                    {msg.role === "user" ? "You" : "Flourish"}
                  </span>
                  <p className={`text-sm px-3 py-2 rounded-lg max-w-[85%] ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-secondary-foreground"
                  }`}>
                    {msg.content}
                  </p>
                </div>
              ))}
              <div ref={historyEndRef} />
            </div>
          </ScrollArea>
        )}

        {/* Live transcript indicator */}
        {transcript && voiceStatus !== "idle" && (
          <div className="text-center animate-pulse">
            <p className="text-xs text-muted-foreground mb-1">
              {voiceStatus === "speaking" ? "AI is speaking..." : "Listening..."}
            </p>
          </div>
        )}

        {/* Hint text */}
        {voiceStatus === "listening" && conversationHistory.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Speak naturally — I'll respond when you pause
          </p>
        )}

        {voiceStatus === "speaking" && (
          <p className="text-sm text-muted-foreground">
            Start speaking to interrupt
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 pb-8">
        {conversation.status === "connected" && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            className="h-12 w-12 rounded-full"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        )}

        <Button
          variant={conversation.status === "connected" ? "destructive" : "default"}
          size="lg"
          onClick={conversation.status === "connected" ? stopConversation : startConversation}
          disabled={isConnecting}
          className="h-14 px-8 rounded-full"
        >
          {isConnecting
            ? "Connecting..."
            : conversation.status === "connected"
            ? "End Voice Chat"
            : "Start Voice Chat"}
        </Button>
      </div>
    </div>
  );
}
