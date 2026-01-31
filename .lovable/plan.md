
# Complete Voice + Chat Unification Plan

## Current Problems

After analyzing your codebase and database, I've identified these issues:

### Problem 1: Voice Messages Not Appearing in Chat
The `VoiceConversation.tsx` component saves messages to the database, BUT the message events from ElevenLabs may not be firing correctly. The code expects specific event types (`user_transcript` and `agent_response`) but ElevenLabs may send different event structures depending on agent configuration. The app needs to be robust and handle multiple event formats.

### Problem 2: No Past Conversation Context for Voice Mode
When you open voice mode, the ElevenLabs agent starts completely fresh. It has no knowledge of what was discussed in the text chat or previous voice sessions. The agent needs to receive conversation history as context.

### Problem 3: Chat History Navigation Works but Could Be Smoother
The history panel exists but doesn't show message previews or indicate which sessions contain voice messages.

---

## Solution Overview

```text
+------------------+     +-------------------+     +------------------+
|   Text Chat UI   |<--->|   Supabase DB     |<--->|   Voice Mode     |
|   (Chat.tsx)     |     |   (messages)      |     | (VoiceConv.tsx)  |
+------------------+     +-------------------+     +------------------+
        |                        ^                        |
        |  Realtime Sync         |                        |
        +------------------------+------------------------+
                                 |
                          +------+-------+
                          | Edge Function|
                          | + Context    |
                          +------+-------+
                                 |
                          +------+-------+
                          | ElevenLabs   |
                          | Agent        |
                          +--------------+
```

---

## Implementation Plan

### Part 1: Fix Voice Message Capture (Robust Event Handling)

**File: `src/components/voice/VoiceConversation.tsx`**

The current code checks for specific event types, but ElevenLabs may send events differently. Update the `onMessage` handler to:

1. Log all incoming messages for debugging
2. Check multiple possible event structures
3. Handle both finalized transcripts AND partial/tentative transcripts as fallback
4. Only save finalized transcripts to avoid duplicate messages

Changes:
- Add more robust event parsing that checks for:
  - `message.type === "user_transcript"` (current)
  - `message.user_transcription_event` (direct access)
  - `message.text` (alternative format)
  - Fallback: capture from `isSpeaking` state changes
- Add console logging to debug what events are actually received
- Store the last user/assistant text to detect when conversation turns end

### Part 2: Inject Conversation Context to Voice Agent

**File: `supabase/functions/elevenlabs-conversation-token/index.ts`**

Currently, the edge function just fetches a token. Enhance it to:

1. Accept the current `sessionId` in the request body
2. Load recent messages from that session (last 10-20 messages)
3. Generate a brief AI summary of the conversation using Lovable AI
4. Pass this context to ElevenLabs when getting the token

ElevenLabs supports passing custom context via the `conversation_config_override` parameter when starting a session. We can use this to inject:
- A summary of the conversation so far
- The user's last few messages
- Key topics discussed

**File: `src/components/voice/VoiceConversation.tsx`**

Update `startConversation` to:
1. Pass the `sessionId` to the edge function
2. Receive back the token PLUS any context/overrides
3. Use `overrides` parameter when calling `startSession` to inject the conversation context

### Part 3: Create Conversation Summary Helper

**File: `supabase/functions/generate-summary/index.ts` (NEW)**

Create a new edge function that:
1. Takes a session_id
2. Loads the messages
3. Uses Lovable AI to generate a brief summary (2-3 sentences)
4. Returns the summary

This summary can be:
- Stored in the `chat_sessions` table (add a `summary` column)
- Injected into the ElevenLabs agent's first message prompt

### Part 4: Enhance Chat History with Previews

**File: `src/hooks/useChatSessions.ts`**

Update to:
1. Fetch the last message content for each session (as preview)
2. Check if session contains any voice messages (for badge)

**File: `src/components/chat/ChatHistory.tsx`**

Update to:
1. Show message preview snippet under session title
2. Add microphone icon for sessions with voice messages

---

## Database Changes

Add columns to `chat_sessions` table:
```sql
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS has_voice_messages boolean DEFAULT false;
```

---

## Detailed Technical Implementation

### 1. Enhanced Voice Message Handler

```typescript
// VoiceConversation.tsx - onMessage handler
onMessage: async (message) => {
  console.log("Voice message received:", JSON.stringify(message, null, 2));
  
  // Try multiple ways to extract transcript
  let userText: string | undefined;
  let agentText: string | undefined;
  
  const msg = message as Record<string, unknown>;
  
  // Method 1: Standard event structure
  if (msg.type === "user_transcript") {
    const event = msg.user_transcription_event as Record<string, unknown>;
    userText = event?.user_transcript as string;
  } else if (msg.type === "agent_response") {
    const event = msg.agent_response_event as Record<string, unknown>;
    agentText = event?.agent_response as string;
  }
  
  // Method 2: Alternative structures (some agents use these)
  if (!userText && msg.user_transcript) {
    userText = msg.user_transcript as string;
  }
  if (!agentText && msg.agent_response) {
    agentText = msg.agent_response as string;
  }
  
  // Method 3: Check for text field (some WebRTC implementations)
  if (!userText && !agentText && msg.text && msg.role) {
    if (msg.role === "user") userText = msg.text as string;
    if (msg.role === "assistant") agentText = msg.text as string;
  }
  
  // Save if we got something
  if (userText) {
    addToHistory("user", userText);
    onTranscript?.("user", userText);
    await saveMessageToDb("user", userText);
  }
  if (agentText) {
    addToHistory("assistant", agentText);
    onTranscript?.("assistant", agentText);
    await saveMessageToDb("assistant", agentText);
  }
}
```

### 2. Context-Aware Token Endpoint

```typescript
// elevenlabs-conversation-token/index.ts
serve(async (req) => {
  const { sessionId } = await req.json().catch(() => ({}));
  
  let conversationContext = "";
  
  if (sessionId) {
    // Load recent messages
    const { data: messages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(15);
    
    if (messages && messages.length > 0) {
      // Build context string
      const recentMessages = messages.reverse()
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");
      
      conversationContext = `
CONVERSATION HISTORY (continue naturally from here):
${recentMessages}
---
Continue this conversation naturally. Acknowledge what was discussed before.`;
    }
  }
  
  // Get token with overrides
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${ELEVENLABS_AGENT_ID}`,
    {
      headers: { "xi-api-key": ELEVENLABS_API_KEY }
    }
  );
  
  const data = await response.json();
  
  return new Response(JSON.stringify({ 
    token: data.token,
    context: conversationContext 
  }));
});
```

### 3. Start Session with Overrides

```typescript
// VoiceConversation.tsx - startConversation
const { data, error } = await supabase.functions.invoke(
  "elevenlabs-conversation-token",
  { body: { sessionId: sessionIdRef.current } }
);

await conversation.startSession({
  conversationToken: data.token,
  connectionType: "webrtc",
  overrides: data.context ? {
    agent: {
      prompt: {
        prompt: data.context
      }
    }
  } : undefined
});
```

---

## Summary of Changes

| Component | Change | Purpose |
|-----------|--------|---------|
| `VoiceConversation.tsx` | Add robust multi-format event parsing | Capture transcripts reliably |
| `VoiceConversation.tsx` | Pass sessionId when starting voice | Enable context loading |
| `elevenlabs-conversation-token` | Load messages and create context | Give voice agent memory |
| `Chat.tsx` | Ensure realtime sync works | Show voice messages in chat |
| `ChatHistory.tsx` | Add message previews | Better navigation |
| Database | Add summary and has_voice columns | Track session metadata |

---

## Manual Steps Required

After implementation, you should also:

1. **Update your ElevenLabs Agent** in the ElevenLabs dashboard:
   - Go to Agent Settings → Events
   - Enable "User Transcript" and "Agent Response" events
   - This ensures transcripts are sent to the app

2. **Copy the Flourish system prompt** from `supabase/functions/chat/index.ts` to your ElevenLabs agent's system prompt to ensure personality consistency

---

## Expected Outcome

After these changes:
- Voice messages appear in the chat in real-time as you speak
- When you select an old session and start voice mode, the agent remembers the conversation
- Chat history shows previews and indicates voice sessions
- Both text and voice contribute to the same conversation thread
