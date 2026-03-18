type GenerationMode = "tech" | "client-centric" | "mixed";

type RequestPayload = {
  action?: "generate" | "health-check";
  count?: number;
  mode?: GenerationMode;
  keywords?: string[];
  topics?: string[];
  primaryKeyword?: string;
  secondaryKeywords?: string[];
};

type GeneratedPost = {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
};

type OpenAIResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_KEYWORDS = ["Salman Hafiz", "WordPress developer", "frontend developer", "WordPress frontend development"];
const DEFAULT_TOPICS = ["WordPress", "Frontend Development", "AI", "Crypto", "SEO", "Web Performance"];

const buildPrompt = (count: number, mode: GenerationMode, keywords: string[], topics: string[], primaryKeyword: string, secondaryKeywords: string[]) => {
  return [
    `Generate ${count} SEO-focused blog posts in strict JSON format for a professional developer portfolio blog.`,
    `Target mode: ${mode}.`,
    `Topic pool: ${topics.join(", ")}.`,
    `Primary keyword to include in every post title/H1 naturally: ${primaryKeyword}.`,
    `Secondary keywords to distribute in headings and body: ${secondaryKeywords.join(", ")}.`,
    "Audience: business owners and clients searching for tech services and modern web solutions.",
    `Required keywords to naturally include in every post: ${keywords.join(", ")}.`,
    "Each post must be tech related and recent-topic oriented (2025-2026 relevance), especially around the selected topic pool.",
    "Each post should include practical implementation advice and clear business outcomes.",
    "SEO rules: unique title per post, scannable headings, natural keyword placement, semantic variations, and intent-aligned CTA.",
    "Meta title should be 50-60 chars when possible, meta description 140-160 chars when possible.",
    "Return ONLY valid JSON with this exact shape:",
    '{"posts":[{"title":"...","excerpt":"...","content":"markdown long-form 800+ words","tags":["..."],"metaTitle":"...","metaDescription":"..."}]}',
    "No markdown fences. No extra text.",
  ].join("\n");
};

const safeParsePosts = (raw: string): GeneratedPost[] => {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as { posts?: GeneratedPost[] };
  if (!parsed.posts || !Array.isArray(parsed.posts)) return [];

  return parsed.posts
    .map((post) => ({
      title: String(post.title || "").trim(),
      excerpt: String(post.excerpt || "").trim(),
      content: String(post.content || "").trim(),
      tags: Array.isArray(post.tags) ? post.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
      metaTitle: String(post.metaTitle || "").trim(),
      metaDescription: String(post.metaDescription || "").trim(),
    }))
    .filter((post) => post.title && post.excerpt && post.content);
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });
  }

  try {
    const payload = (req.body || {}) as RequestPayload;
    const action = payload.action || "generate";

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    if (action === "health-check") {
      const healthResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          max_tokens: 10,
          messages: [{ role: "user", content: "Reply with OK" }],
        }),
      });

      const healthData = (await healthResponse.json()) as OpenAIResponse;
      if (!healthResponse.ok) {
        return res.status(healthResponse.status).json({ ok: false, error: healthData.error?.message || "GPT health-check failed." });
      }

      return res.status(200).json({ ok: true, model });
    }

    const count = Math.max(1, Math.min(20, Number(payload.count || 10)));
    const mode: GenerationMode = payload.mode || "mixed";
    const keywords = Array.isArray(payload.keywords) && payload.keywords.length > 0 ? payload.keywords : DEFAULT_KEYWORDS;
    const topics = Array.isArray(payload.topics) && payload.topics.length > 0 ? payload.topics : DEFAULT_TOPICS;
    const primaryKeyword = String(payload.primaryKeyword || keywords[0] || "Salman Hafiz").trim();
    const secondaryKeywords =
      Array.isArray(payload.secondaryKeywords) && payload.secondaryKeywords.length > 0 ? payload.secondaryKeywords : keywords.slice(1);

    const prompt = buildPrompt(count, mode, keywords, topics, primaryKeyword, secondaryKeywords);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content: "You are an expert SEO content strategist and senior web engineer.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = (await response.json()) as OpenAIResponse;

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Failed to generate blog posts." });
    }

    const content = data.choices?.[0]?.message?.content || "";
    const posts = safeParsePosts(content);

    if (posts.length === 0) {
      return res.status(422).json({ error: "AI returned an invalid posts payload." });
    }

    return res.status(200).json({ posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown generation error";
    return res.status(500).json({ error: message });
  }
}
