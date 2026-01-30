import { useState } from "react";
import { VoiceConversation } from "./VoiceConversation";
import { VoiceModeButton } from "./VoiceModeButton";

interface VoiceChatProps {
  onTranscript?: (role: "user" | "assistant", text: string) => void;
  disabled?: boolean;
}

export function VoiceChat({ onTranscript, disabled }: VoiceChatProps) {
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
        />
      )}
    </>
  );
}
