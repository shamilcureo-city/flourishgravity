import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Build context prompt from conversation history
function buildContextPrompt(messages: Array<{ role: string; content: string }>, summary?: string): string {
  if (!messages || messages.length === 0) {
    return "";
  }

  let contextPrompt = `
You are continuing an existing conversation. Here is the context:

`;

  // Add summary if available
  if (summary) {
    contextPrompt += `SUMMARY OF CONVERSATION SO FAR:
${summary}

`;
  }

  // Add recent messages
  const recentMessages = messages
    .slice(-15) // Last 15 messages
    .map(m => `${m.role === "user" ? "User" : "You"}: ${m.content}`)
    .join("\n");

  contextPrompt += `RECENT MESSAGES:
${recentMessages}

---
Continue this conversation naturally. Acknowledge what was discussed before when relevant. Do not repeat greetings.`;

  return contextPrompt;
}

// Generate a brief summary using Lovable AI
async function generateSummary(messages: Array<{ role: string; content: string }>): Promise<string | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY || messages.length < 4) {
    return null;
  }

  try {
    const conversationText = messages
      .slice(0, 20) // First 20 messages for summary
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "You are a summarizer. Create a 2-3 sentence summary of this therapeutic conversation focusing on: main topics discussed, user's emotional state, and any goals or insights mentioned. Be concise."
          },
          {
            role: "user",
            content: conversationText
          }
        ],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      console.error("Summary generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Error generating summary:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const ELEVENLABS_AGENT_ID = Deno.env.get("ELEVENLABS_AGENT_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!ELEVENLABS_AGENT_ID) {
      console.error("ELEVENLABS_AGENT_ID is not configured");
      return new Response(
        JSON.stringify({ error: "ElevenLabs Agent ID is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body for sessionId
    let sessionId: string | null = null;
    try {
      const body = await req.json();
      sessionId = body.sessionId || null;
    } catch {
      // No body or invalid JSON, proceed without sessionId
    }

    console.log("Fetching conversation token for agent:", ELEVENLABS_AGENT_ID);
    console.log("Session ID for context:", sessionId || "none");

    // Build conversation context if we have a session
    let conversationContext = "";
    let hasContext = false;

    if (sessionId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Fetch recent messages from this session
        const { data: messages, error: messagesError } = await supabase
          .from("messages")
          .select("role, content")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true })
          .limit(30);

        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
        } else if (messages && messages.length > 0) {
          console.log(`Found ${messages.length} messages for context`);

          // Check if session already has a summary
          const { data: session } = await supabase
            .from("chat_sessions")
            .select("summary")
            .eq("id", sessionId)
            .single();

          let summary = session?.summary;

          // Generate summary if we have enough messages but no summary yet
          if (!summary && messages.length >= 6) {
            console.log("Generating conversation summary...");
            summary = await generateSummary(messages);
            
            // Save summary to session for future use
            if (summary) {
              await supabase
                .from("chat_sessions")
                .update({ summary })
                .eq("id", sessionId);
              console.log("Summary saved to session");
            }
          }

          // Build context prompt
          conversationContext = buildContextPrompt(messages, summary || undefined);
          hasContext = true;
          console.log("Built conversation context for voice agent");
        }
      } catch (contextError) {
        console.error("Error building context:", contextError);
        // Continue without context rather than failing
      }
    }

    // Get both conversation token AND signed URL from ElevenLabs
    // This gives us fallback options if WebRTC fails
    const [tokenResponse, signedUrlResponse] = await Promise.all([
      fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${ELEVENLABS_AGENT_ID}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      ),
      fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${ELEVENLABS_AGENT_ID}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      )
    ]);

    if (!tokenResponse.ok && !signedUrlResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("ElevenLabs API error:", tokenResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to get conversation credentials",
          details: errorText 
        }),
        { status: tokenResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = tokenResponse.ok ? await tokenResponse.json() : null;
    const signedUrlData = signedUrlResponse.ok ? await signedUrlResponse.json() : null;
    
    console.log("Successfully obtained conversation credentials");

    return new Response(
      JSON.stringify({ 
        token: tokenData?.token || null,
        signedUrl: signedUrlData?.signed_url || null,
        context: conversationContext || null,
        hasContext
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in elevenlabs-conversation-token:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
