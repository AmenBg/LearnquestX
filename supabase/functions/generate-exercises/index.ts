import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    // Input validation
    const subject = typeof body.subject === "string" ? body.subject.slice(0, 100) : "";
    const country = typeof body.country === "string" ? body.country.slice(0, 50) : "";
    const educationLevel = typeof body.educationLevel === "string" ? body.educationLevel.slice(0, 50) : "";
    const grade = typeof body.grade === "string" ? body.grade.slice(0, 10) : "";
    const term = typeof body.term === "string" ? body.term.slice(0, 20) : "";
    const language = typeof body.language === "string" ? body.language.slice(0, 5) : "en";
    const count = typeof body.count === "number" && body.count >= 1 && body.count <= 20 ? body.count : 5;

    if (!subject || !country || !grade) {
      return new Response(JSON.stringify({ error: "Missing required fields: subject, country, grade" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langNames: Record<string, string> = {
      en: 'English', ar: 'Arabic', fr: 'French', es: 'Spanish', de: 'German'
    };

    const systemPrompt = `You are an expert educational content generator. Generate exactly ${count} quiz questions for students.

Context:
- Subject: ${subject}
- Country: ${country}
- Education level: ${educationLevel}
- Grade: ${grade}
- Current term: ${term}
- Language: ${langNames[language] || 'English'}

Rules:
- Questions must be appropriate for the student's grade level
- Difficulty should progress: first questions easy, last questions challenging
- All text must be in ${langNames[language] || 'English'}
- Each question must have exactly 4 options
- Questions should be unique and varied
- Follow the curriculum standards of ${country}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate ${count} quiz questions for ${subject} grade ${grade}.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_questions",
              description: "Generate quiz questions with options and correct answers",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string", description: "The question text" },
                        options: { type: "array", items: { type: "string" }, description: "Exactly 4 answer options" },
                        correct: { type: "number", description: "Index (0-3) of the correct answer" },
                        explanation: { type: "string", description: "Brief explanation of the correct answer" },
                      },
                      required: ["question", "options", "correct", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_questions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-exercises error:", e);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
