import { useCallback, useState, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";
import { VoiceIndicator } from "./VoiceIndicator";
import { Button } from "@/components/ui/button";
import { X, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

interface VoiceConversationProps {
  onClose: () => void;
  onTranscript?: (role: "user" | "assistant", text: string) => void;
}

export function VoiceConversation({ onClose, onTranscript }: VoiceConversationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "connecting" | "connected" | "speaking" | "listening">("idle");
  const [transcript, setTranscript] = useState<string>("");

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
    },
    onMessage: (message) => {
      console.log("Voice message received:", message);
      
      // Handle different message types based on the message structure
      const msg = message as unknown as Record<string, unknown>;
      if (msg.type === "user_transcript") {
        const event = msg.user_transcription_event as Record<string, unknown> | undefined;
        const userText = event?.user_transcript as string | undefined;
        if (userText) {
          setTranscript(userText);
          onTranscript?.("user", userText);
        }
      } else if (msg.type === "agent_response") {
        const event = msg.agent_response_event as Record<string, unknown> | undefined;
        const agentText = event?.agent_response as string | undefined;
        if (agentText) {
          setTranscript(agentText);
          onTranscript?.("assistant", agentText);
        }
      }
    },
    onError: (error) => {
      console.error("Voice conversation error:", error);
      toast.error("Voice connection error. Please try again.");
      setVoiceStatus("idle");
      setIsConnecting(false);
    },
  });

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

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get conversation token from edge function
      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token");

      if (error) {
        console.error("Token fetch error:", error);
        throw new Error("Failed to get conversation token");
      }

      if (!data?.token) {
        console.error("No token in response:", data);
        throw new Error("No token received from server");
      }

      console.log("Starting voice session with token");

      // Start the conversation with WebRTC
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
      });
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

      {/* Voice indicator */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <h2 className="text-2xl font-semibold text-foreground">Voice Mode</h2>
        
        <VoiceIndicator
          status={voiceStatus}
          inputLevel={conversation.getInputVolume?.() || 0}
          outputLevel={conversation.getOutputVolume?.() || 0}
        />

        {/* Live transcript */}
        {transcript && (
          <div className="max-w-md text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {voiceStatus === "speaking" ? "AI says:" : "You said:"}
            </p>
            <p className="text-foreground">{transcript}</p>
          </div>
        )}

        {/* Hint text */}
        {voiceStatus === "listening" && (
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
