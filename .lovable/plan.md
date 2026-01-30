

# Real-Time Voice Conversations with ElevenLabs Conversational AI

Integrate true real-time, bidirectional voice conversations into Flourish - just like Gemini Live. Users can speak naturally and interrupt the AI mid-sentence for seamless, natural conversation.

---

## What You'll Get

**True Real-Time Experience:**
- Speak and get responses with minimal latency (~300ms)
- Interrupt the AI anytime - it stops speaking immediately
- No button pressing needed - natural voice activity detection
- Full duplex audio - both sides can communicate simultaneously

---

## How It Works

ElevenLabs Conversational AI uses **WebRTC** for ultra-low latency bidirectional audio streaming. Unlike traditional speech-to-text → AI → text-to-speech pipelines, this is a dedicated voice agent that:

1. Listens to your voice in real-time
2. Processes and responds as audio directly
3. Handles interruptions naturally
4. Maintains conversation context

```text
Your Voice ──WebRTC──> ElevenLabs Agent ──WebRTC──> AI Voice Response
                            ↑
                     Therapeutic System Prompt
                     + User Profile Context
```

---

## Visual Experience

```text
Voice Mode Active
+----------------------------------+
|                                  |
|      ((( 🎙️ )))                  |
|      Listening...                |
|                                  |
|   Live audio waveform ~~~~       |
|                                  |
+----------------------------------+

AI Speaking (interruptible)
+----------------------------------+
|                                  |
|      🤖 Speaking...              |
|      ═══════════════             |
|                                  |
|   [Start talking to interrupt]   |
|                                  |
+----------------------------------+
```

---

## New Components

| Component | Purpose |
|-----------|---------|
| `VoiceChat.tsx` | Full-screen voice conversation UI |
| `VoiceConversation.tsx` | Core component using ElevenLabs React SDK |
| `VoiceIndicator.tsx` | Visual feedback (listening/speaking states) |
| `VoiceModeButton.tsx` | Toggle to switch between text and voice |

| Edge Function | Purpose |
|---------------|---------|
| `elevenlabs-conversation-token` | Generate secure conversation tokens |

---

## Implementation Steps

### Step 1: Connect ElevenLabs
Use the ElevenLabs connector to securely store your API key.

### Step 2: Create ElevenLabs Agent
You'll need to create a "Conversational AI Agent" in the ElevenLabs dashboard with:
- Flourish's therapeutic system prompt
- A warm, empathetic voice (like "Sarah" or "Matilda")
- Custom client tools for integration

### Step 3: Token Generation Edge Function
Create a secure backend function to generate conversation tokens:

```typescript
// Fetches a signed token for WebRTC connection
const response = await fetch(
  `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${AGENT_ID}`,
  { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
);
```

### Step 4: React Voice Component
Using the `@elevenlabs/react` SDK:

```typescript
import { useConversation } from "@elevenlabs/react";

const conversation = useConversation({
  onConnect: () => console.log("Connected"),
  onMessage: (message) => handleTranscript(message),
  onError: (error) => handleError(error),
});

// Start with WebRTC for lowest latency
await conversation.startSession({
  conversationToken: token,
  connectionType: "webrtc",
});
```

### Step 5: UI Integration
Add voice mode button to existing chat interface that opens a dedicated voice conversation screen.

---

## Voice Agent Configuration

Your ElevenLabs agent will be configured with:

**System Prompt** (same as text chat):
- Flourish therapeutic persona
- CBT/DBT/ACT techniques
- User profile personalization (goals, communication style)

**Voice Settings**:
- Voice: Sarah (warm, empathetic) or custom
- Stability: High for consistent therapeutic tone
- Latency optimization: Enabled

**Client Tools** (optional future enhancement):
- Log mood entries via voice
- Start breathing exercises
- Save journal entries

---

## User Flow

1. User taps microphone button in chat
2. Permission prompt for microphone access
3. Voice mode activates with visual indicator
4. User speaks naturally
5. AI responds with voice (can be interrupted)
6. Conversation transcripts saved to chat history
7. User taps X to exit voice mode

---

## Features Included

- **Interruption Handling**: Start speaking anytime to stop the AI
- **Voice Activity Detection**: Auto-detects when you're speaking
- **Visual Feedback**: Pulsing animations for listening/speaking states
- **Volume Control**: Adjust AI voice volume
- **Transcript Display**: See what was said (optional)
- **Error Recovery**: Graceful handling of connection issues

---

## Settings Options

Add to Settings page:
- Enable/disable voice mode
- Preferred voice selection
- Show/hide live transcript
- Voice volume control

---

## Cost Considerations

**ElevenLabs Conversational AI Pricing:**
- Free tier: Limited minutes for testing
- Starter: $5/month includes some conversational minutes
- Usage-based pricing for production

**Optimization:**
- Sessions auto-disconnect after inactivity
- Option to limit session duration
- Text mode remains available as fallback

---

## What You'll Have After Implementation

- Natural, real-time voice conversations with your AI therapist
- Interrupt anytime for true conversational flow
- Ultra-low latency (~300ms) responses
- Beautiful voice mode UI with visual feedback
- Seamless integration with existing chat features
- Transcripts saved to conversation history

---

## Technical Requirements

1. **ElevenLabs Account** with Conversational AI access
2. **Agent ID** from ElevenLabs dashboard
3. **API Key** stored securely via connector
4. **HTTPS** (already enabled in Lovable)
5. **Microphone permissions** (requested at runtime)

---

## Next Steps After This

- Voice-guided breathing exercises
- Voice journal entries
- Mood logging via voice ("I'm feeling a 3 today")
- Ambient background sounds during sessions

