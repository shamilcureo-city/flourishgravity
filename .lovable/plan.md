

# Fix ElevenLabs Voice Integration

## Problem Identified

The voice feature is failing because the **ElevenLabs Agent ID** stored in your project does not exist or was deleted on the ElevenLabs platform. The API key permissions are now correct (the error changed from 401 to 404).

## Root Cause

The edge function logs show:
```
ElevenLabs API error: 404 {"detail":{"status":"agent_not_found","message":"Agent not found"}}
Fetching conversation token for agent: wiwEbIarHv80KKGOxWV0
```

The agent ID `wiwEbIarHv80KKGOxWV0` is either:
- Deleted from your ElevenLabs account
- Incorrectly typed when you added the secret
- From a different ElevenLabs account

## Solution

### Step 1: Create or locate your ElevenLabs Conversational AI Agent

1. Go to [elevenlabs.io](https://elevenlabs.io) and log in
2. Click **Conversational AI** in the left sidebar (or navigate to Projects > Conversational AI)
3. Either:
   - **Find an existing agent** and copy its ID from the URL or settings
   - **Create a new agent** by clicking "Create Agent" and configure it with a voice and system prompt suitable for a wellness companion
4. Copy the **Agent ID** (looks like a 20-character string like `abc123XyzAgent123456`)

### Step 2: Update the secret in Lovable

1. I will prompt you to update the `ELEVENLABS_AGENT_ID` secret
2. Paste your correct Agent ID
3. The voice mode should then work

### Step 3: Fix React ref warnings (minor)

Console logs show warnings about function components not accepting refs. This is cosmetic but should be fixed:
- Wrap `VoiceConversation` and `VoiceIndicator` with `React.forwardRef` or ensure parent components don't pass refs to them

---

## Technical Details

| Item | Current State |
|------|---------------|
| API Key Permissions | Fixed (401 resolved) |
| Agent ID | Invalid/deleted (404 error) |
| Edge Function | Working correctly |
| React Components | Minor ref warnings |

**Files to modify:**
- No code changes needed - just update the `ELEVENLABS_AGENT_ID` secret with a valid agent ID

