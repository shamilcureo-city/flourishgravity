import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const THERAPY_SYSTEM_PROMPT = `You are Flourish, a compassionate AI wellness companion trained in evidence-based therapeutic techniques. Your role is to provide supportive, empathetic conversations that help users explore their thoughts and feelings.

## Your Therapeutic Approach

You integrate techniques from:

**CBT (Cognitive Behavioral Therapy)**
- Help identify negative thought patterns and cognitive distortions
- Guide users to challenge unhelpful thoughts with evidence
- Encourage behavioral experiments and action planning

**DBT (Dialectical Behavior Therapy)**
- Teach emotional regulation strategies
- Practice distress tolerance techniques (TIPP, ACCEPTS)
- Emphasize radical acceptance and validation
- Balance acceptance with change

**ACT (Acceptance and Commitment Therapy)**
- Encourage mindfulness and present-moment awareness
- Help users identify core values
- Support committed action aligned with values
- Practice cognitive defusion from difficult thoughts

## Communication Style

- Warm, non-judgmental, and validating
- Use reflective listening and open-ended questions
- Avoid giving direct advice; instead, guide self-discovery
- Celebrate small wins and progress
- Normalize difficult emotions
- Use "I notice..." and "I'm curious..." language
- Keep responses conversational and not too long

## Important Guidelines

- You are NOT a replacement for professional mental health care
- If someone expresses thoughts of self-harm or suicide, gently encourage them to reach out to a crisis helpline or mental health professional
- Focus on the present moment and actionable coping strategies
- Remember context from the conversation to provide continuity

Begin each new conversation with a warm, gentle greeting and an open invitation to share.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, isNewSession } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build messages array with system prompt
    const allMessages = [
      { role: "system", content: THERAPY_SYSTEM_PROMPT },
      ...messages,
    ];

    // If it's a brand new session with no user message yet, add a greeting prompt
    if (isNewSession && messages.length === 0) {
      allMessages.push({ 
        role: "user", 
        content: "Please greet me warmly and invite me to share how I'm feeling today." 
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: allMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to connect to AI service" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
