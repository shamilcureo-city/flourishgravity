

# Unify Chat and Voice into One Shared Experience

## Current Problem

Right now, your text chat and voice chat are completely separate systems:

- **Text chat** uses the Lovable AI backend with your detailed "Flourish" wellness companion personality, saves all messages to your database, and maintains full conversation history.
- **Voice chat** uses ElevenLabs' own AI agent (configured in their dashboard) with a separate personality, doesn't save messages to your database, and starts fresh every time.

This means:
- The AI might have a different personality in voice vs text mode
- Voice conversations aren't saved to history
- Switching between voice and text loses context

## Solution Options

There are **two approaches** to unify these experiences:

---

### Option A: Save Voice Transcripts to Database (Simpler)

Keep using ElevenLabs for voice AI, but save the transcripts to your database so they appear in chat history.

**What changes:**
- When voice mode ends, save user/assistant transcripts to the `messages` table
- Voice conversations appear in chat history
- Users can continue a voice conversation in text mode

**Limitations:**
- ElevenLabs agent still has its own personality (configured in ElevenLabs dashboard)
- You'd need to manually keep the ElevenLabs agent prompt in sync with your Flourish prompt
- No shared context between voice and text during the same session

**Effort:** Low - just add save logic when voice ends

---

### Option B: Use ElevenLabs for Voice Only, Lovable AI for Thinking (Unified)

Use ElevenLabs in **text-only mode** (voice input/output only) while your Lovable AI backend handles all the thinking and responses.

**How it works:**
1. Voice mode captures user speech via ElevenLabs and transcribes it
2. Transcript is sent to your existing `chat` edge function (same as text chat)
3. AI response is sent back to ElevenLabs for text-to-speech playback
4. All messages saved to database with the current session

**Benefits:**
- One AI personality (Flourish) for both text and voice
- All conversations saved to the same database/history
- Full conversation context maintained across voice and text
- User profile personalization works for voice too

**Limitations:**
- Slightly higher latency (extra round-trip to Lovable AI)
- More complex implementation
- ElevenLabs agent becomes a "voice shell" only

**Effort:** Medium - need to restructure voice flow

---

### Option C: Hybrid Approach (Recommended)

Keep ElevenLabs real-time voice for low-latency conversations, but:
1. Sync the ElevenLabs agent prompt to match Flourish's personality
2. Save all voice transcripts to the database in real-time
3. When starting voice mode, inject recent text chat context into ElevenLabs

**Benefits:**
- Low-latency voice experience
- Messages saved to shared database
- Personality stays consistent (manual sync)
- Some context sharing between modes

**Effort:** Medium

---

## Recommended Implementation: Option C (Hybrid)

### Changes Needed

1. **Save voice messages in real-time**
   - Update `VoiceConversation.tsx` to save transcripts to `messages` table as they happen
   - Use the current session ID from Chat page

2. **Pass session context to voice mode**
   - When opening voice mode, pass the current `sessionId` to `VoiceConversation`
   - Load recent messages and inject as context when starting ElevenLabs session

3. **Sync ElevenLabs agent personality**
   - Update your ElevenLabs agent's system prompt to match the Flourish personality from your `chat` edge function
   - This is a manual step in the ElevenLabs dashboard

4. **Update Chat page to handle voice messages**
   - When `onTranscript` fires, also save to database (not just UI state)

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Chat.tsx` | Pass `sessionId` to VoiceChat, save voice transcripts to DB |
| `src/components/voice/VoiceChat.tsx` | Accept and pass `sessionId` prop |
| `src/components/voice/VoiceConversation.tsx` | Save transcripts to `messages` table, inject context |

### Database Changes
None needed - the existing `messages` table already supports storing voice transcripts with the `role` column.

### ElevenLabs Dashboard
Copy the Flourish system prompt from your edge function into your ElevenLabs agent's configuration so both have the same personality.

---

## Summary

| Approach | Unified Personality | Shared History | Latency | Effort |
|----------|---------------------|----------------|---------|--------|
| A: Save transcripts only | No (manual sync) | Yes | Low | Low |
| B: Lovable AI for all | Yes | Yes | Higher | Medium |
| **C: Hybrid (recommended)** | Yes (manual sync) | Yes | Low | Medium |

