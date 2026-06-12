import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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

    const subject = typeof body.subject === "string" ? body.subject.slice(0, 100) : "";
    const country = typeof body.country === "string" ? body.country.slice(0, 50) : "";
    const educationLevel = typeof body.educationLevel === "string" ? body.educationLevel.slice(0, 50) : "";
    const grade = typeof body.grade === "string" ? body.grade.slice(0, 10) : "";
    const term = typeof body.term === "string" ? body.term.slice(0, 20) : "";
    const language = typeof body.language === "string" ? body.language.slice(0, 5) : "en";
    const count = typeof body.count === "number" && body.count >= 1 && body.count <= 20 ? body.count : 5;
    // New: adaptive + variety params
    const difficultyTarget = ["easy", "mixed", "hard"].includes(body.difficultyTarget) ? body.difficultyTarget : "mixed";
    const writtenRatio = typeof body.writtenRatio === "number" && body.writtenRatio >= 0 && body.writtenRatio <= 1 ? body.writtenRatio : 0.2;
    const recentQuestions: string[] = Array.isArray(body.recentQuestions)
      ? body.recentQuestions.filter((s: unknown) => typeof s === "string").slice(0, 40).map((s: string) => s.slice(0, 200))
      : [];
    const variationSeed = typeof body.variationSeed === "string" ? body.variationSeed.slice(0, 32) : Math.random().toString(36).slice(2, 10);

    if (!subject) {
      return new Response(JSON.stringify({ error: "Missing required field: subject" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langNames: Record<string, string> = {
      en: 'English', ar: 'Arabic', fr: 'French', es: 'Spanish', de: 'German'
    };

    let difficultyInstructions = "";
    if (difficultyTarget === "easy") {
      difficultyInstructions = `- The user is struggling. Make most questions EASY, with at most one MEDIUM. Build confidence with clear, fundamental questions.`;
    } else if (difficultyTarget === "hard") {
      difficultyInstructions = `- The user is performing very well. Make most questions HARD or VERY HARD with one MEDIUM. Push their understanding with multi-step reasoning.`;
    } else {
      difficultyInstructions = `- Balanced mix: progress from easy → medium → hard across the set.`;
    }

    const writtenCount = Math.round(count * writtenRatio);
    const writtenInstr = writtenCount > 0
      ? `- Make EXACTLY ${writtenCount} of the ${count} questions written-answer (type "written"): short factual answers (1-3 words), definitions, vocabulary, or simple calculations. The rest must be multiple-choice (type "mcq"). For written questions, provide "accepted_answers": an array of 2-6 acceptable lowercase string variations (synonyms, with/without articles, common spellings). Do NOT include options or correct for written items.`
      : `- All questions must be multiple-choice (type "mcq").`;

    const avoidInstr = recentQuestions.length > 0
      ? `- VARIETY CRITICAL: The user has recently seen these questions — generate completely DIFFERENT questions covering different sub-topics, numbers, and concepts. Do not paraphrase them. Avoided:\n${recentQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
      : `- Generate fresh, varied questions across different sub-topics.`;

    const systemPrompt = `You are an expert educational content generator. Generate exactly ${count} quiz questions for students.

Context:
- Subject: ${subject}
- Country: ${country || 'International'}
- Education level: ${educationLevel || 'middle school'}
- Grade: ${grade || '7'}
- Current term: ${term || 'general'}
- Language: ${langNames[language] || 'English'}
- Variation seed (use to ensure novelty): ${variationSeed}

Rules:
- Questions must be appropriate for the student's grade level
${difficultyInstructions}
${writtenInstr}
${avoidInstr}
- All text must be in ${langNames[language] || 'English'}
- Each MCQ must have exactly 4 distinct options
- CRITICAL: For MCQ, "correct" is the 0-based index in "options"; double-check options[correct] is the right answer
- For math: compute the result FIRST, then set indices
- Every question must have ONE verifiably correct answer
- Cover varied sub-topics within the subject; do not cluster the same concept
- Each item must include a "difficulty" field: "easy" | "medium" | "hard" | "very_hard"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate ${count} fresh quiz questions for ${subject} (grade ${grade || '7'}). Seed: ${variationSeed}.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_questions",
              description: "Generate quiz questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["mcq", "written"] },
                        question: { type: "string" },
                        options: { type: "array", items: { type: "string" }, description: "MCQ only: exactly 4 options" },
                        correct: { type: "number", description: "MCQ only: 0-3 index" },
                        accepted_answers: { type: "array", items: { type: "string" }, description: "Written only: acceptable answer variations (lowercase)" },
                        explanation: { type: "string" },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard", "very_hard"] },
                      },
                      required: ["type", "question", "explanation", "difficulty"],
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

      if (parsed.questions && Array.isArray(parsed.questions)) {
        const validated = parsed.questions.filter((q: any) => {
          if (!q.question || !q.explanation || !q.difficulty) return false;
          if (q.type === "mcq") {
            if (!Array.isArray(q.options) || q.options.length !== 4) return false;
            if (typeof q.correct !== "number" || q.correct < 0 || q.correct > 3) return false;
            if (!q.options[q.correct] || q.options[q.correct].trim() === "") return false;
            return true;
          }
          if (q.type === "written") {
            if (!Array.isArray(q.accepted_answers) || q.accepted_answers.length === 0) return false;
            return true;
          }
          return false;
        });

        if (validated.length === 0) {
          return new Response(JSON.stringify({ error: "All generated questions failed validation" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ questions: validated }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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
