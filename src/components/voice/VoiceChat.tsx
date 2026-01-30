import { useState } from "react";
import { VoiceConversation } from "./VoiceConversation";
import { VoiceModeButton } from "./VoiceModeButton";

interface VoiceChatProps {
  onTranscript?: (role: "user" | "assistant", text: string) => void;
  disabled?: boolean;
  sessionId?: string | null;
}

export function VoiceChat({ onTranscript, disabled, sessionId }: VoiceChatProps) {
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);

  const handleOpenVoiceMode = () => {
    setIsVoiceModeActive(true);
  };

  const handleCloseVoiceMode = () => {
    setIsVoiceModeActive(false);
  };

  return (
    <>
      <VoiceModeButton onClick={handleOpenVoiceMode} disabled={disabled} />
      
      {isVoiceModeActive && (
        <VoiceConversation
          onClose={handleCloseVoiceMode}
          onTranscript={onTranscript}
          sessionId={sessionId}
        />
      )}
    </>
  );
}
