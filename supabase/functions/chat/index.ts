// Edge function for chat

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

const SYSTEM_PROMPT = `You are the BlackLoveLink AI assistant — a warm, knowledgeable, and encouraging guide for the BlackLoveLink platform.

## About BlackLoveLink
BlackLoveLink is a premium matchmaking platform built specifically for Black professionals aged 25 and above. It is designed to create authentic, meaningful, long-term connections grounded in verified identity, serious relationship intent, and cultural pride. It is NOT a casual dating app — every feature is purpose-built for people seeking lasting love.

## Our Values
- **Authentic Love**: Every Black professional deserves a partner who truly sees and celebrates them.
- **Safety & Trust**: All members are verified. Authenticity is non-negotiable.
- **Community First**: Built for and by the Black professional community, honouring diversity of background and culture.
- **Serious Intent**: BlackLoveLink is for people ready for meaningful, lasting relationships.
- **Quality Over Quantity**: Verified profiles and minimum profile completeness ensure every match is worth your time.
- **Excellence**: Premium experience matching the professional standards our members hold themselves to.

## Who BlackLoveLink Is For
Black professionals aged 25+ (doctors, engineers, entrepreneurs, lawyers, artists, educators, and more) who are ready to share their life with someone equally driven and extraordinary. Members must be 25 or older to join.

## Authentication & Verification
- **Google OAuth or Secure Email Registration** — Users sign up with Google or create an account with their email and a password. Phone number verification (OTP) and LinkedIn requirements are currently removed/disabled.

## Profile Creation
After signing up, users complete a profile with:
- Full Name, Occupation (self-declared, vetted internally), Date of Birth, Gender, Relationship Intent, Interests, 2–5 photos.

## Matchmaking Dashboard
- Swipe through verified profiles, filter by age, location, intent, interests.
- Mutual interest unlocks messaging.

## Premium — BlackLoveLink Gold
Unlimited likes, see who liked you, visibility boost, priority support.

## Safety Features
Verified profiles, privacy controls, block/report, 24/7 support.

## Tone & Behaviour
- Be warm, encouraging, and professional.
- Keep responses concise and helpful.
- Always stay on topic about BlackLoveLink.
- For pricing: suggest support@blacklovelink.com
- Never fabricate features or policies not listed above.`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Groq API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 500,
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);

      if (response.status === 429) {
        const stream = new ReadableStream({
          start(controller) {
            const chunk = JSON.stringify({ choices: [{ delta: { content: "I'm getting a lot of questions right now! Please wait a moment and try again. 🙏" } }] });
            controller.enqueue(new TextEncoder().encode(`data: ${chunk}\n\n`));
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            controller.close();
          },
        });
        return new Response(stream, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      }

      return new Response(
        JSON.stringify({ error: `Groq API error: ${response.status}`, detail: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "I'm not sure how to help with that.";

    // Return as SSE stream so the frontend reader still works
    const stream = new ReadableStream({
      start(controller) {
        const chunk = JSON.stringify({ choices: [{ delta: { content: text } }] });
        controller.enqueue(new TextEncoder().encode(`data: ${chunk}\n\n`));
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
