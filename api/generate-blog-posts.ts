type GenerationMode = "tech" | "client-centric" | "mixed";

type RequestPayload = {
  action?: "generate" | "health-check";
  count?: number;
  mode?: GenerationMode;
  keywords?: string[];
  topics?: string[];
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  maxTokens?: number;
  temperature?: number;
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

type ProviderConfig = {
  provider: "openrouter" | "groq" | "openai";
  apiKey: string;
  model: string;
  endpoint: string;
  extraHeaders?: Record<string, string>;
};

const DEFAULT_KEYWORDS = ["Salman Hafiz", "WordPress developer", "frontend developer", "WordPress frontend development"];
const DEFAULT_TOPICS = ["WordPress", "Frontend Development", "AI", "Crypto", "SEO", "Web Performance"];
const DEFAULT_MAX_TOKENS = 12000;
const DEFAULT_TEMPERATURE = 0.75;

const resolveProvider = (): ProviderConfig | null => {
  const preferred = String(process.env.AI_PROVIDER || "").trim().toLowerCase();

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (preferred === "groq" && groqKey) {
    return {
      provider: "groq",
      apiKey: groqKey,
      model: process.env.GROQ_MODEL || process.env.OPENAI_MODEL || "llama-3.1-8b-instant",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
    };
  }

  if (preferred === "openrouter" && openRouterKey) {
    return {
      provider: "openrouter",
      apiKey: openRouterKey,
      model: process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || "openrouter/auto",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      extraHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "https://salmanhafiz.me",
        "X-Title": "Salman Hafiz Portfolio AI Generator",
      },
    };
  }

  if (preferred === "openai" && openAiKey) {
    return {
      provider: "openai",
      apiKey: openAiKey,
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      endpoint: "https://api.openai.com/v1/chat/completions",
    };
  }

  if (!preferred && groqKey) {
    return {
      provider: "groq",
      apiKey: groqKey,
      model: process.env.GROQ_MODEL || process.env.OPENAI_MODEL || "llama-3.1-8b-instant",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
    };
  }

  if (!preferred && openRouterKey) {
    return {
      provider: "openrouter",
      apiKey: openRouterKey,
      model: process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || "openrouter/auto",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      extraHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "https://salmanhafiz.me",
        "X-Title": "Salman Hafiz Portfolio AI Generator",
      },
    };
  }

  if (!preferred && openAiKey) {
    return {
      provider: "openai",
      apiKey: openAiKey,
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      endpoint: "https://api.openai.com/v1/chat/completions",
    };
  }

  return null;
};

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
    "Each content body should be detailed and long-form, approximately 900-1400 words.",
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

const shouldRetryWithOpenRouterAuto = (provider: ProviderConfig["provider"], status: number, errorMessage?: string) => {
  if (provider !== "openrouter") return false;
  if (status === 404) return true;
  return String(errorMessage || "").toLowerCase().includes("no endpoints found");
};

const callProvider = async (
  providerConfig: ProviderConfig,
  body: Record<string, unknown>
): Promise<{ response: Response; data: OpenAIResponse; modelUsed: string }> => {
  const run = async (model: string) => {
    const response = await fetch(providerConfig.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${providerConfig.apiKey}`,
        ...(providerConfig.extraHeaders || {}),
      },
      body: JSON.stringify({ ...body, model }),
    });
    const data = (await response.json()) as OpenAIResponse;
    return { response, data, modelUsed: model };
  };

  const first = await run(providerConfig.model);
  if (first.response.ok) return first;

  if (shouldRetryWithOpenRouterAuto(providerConfig.provider, first.response.status, first.data.error?.message)) {
    return run("openrouter/auto");
  }

  return first;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const providerConfig = resolveProvider();
  if (!providerConfig) {
    return res
      .status(500)
      .json({ error: "No AI provider key configured. Set OPENROUTER_API_KEY (free), GROQ_API_KEY (free tier), or OPENAI_API_KEY." });
  }

  try {
    const payload = (req.body || {}) as RequestPayload;
    const action = payload.action || "generate";

    const { provider, apiKey, model, endpoint, extraHeaders } = providerConfig;

    if (action === "health-check") {
      const healthCall = await callProvider(providerConfig, {
        temperature: 0,
        max_tokens: 10,
        messages: [{ role: "user", content: "Reply with OK" }],
      });

      if (!healthCall.response.ok) {
        return res.status(healthCall.response.status).json({ ok: false, error: healthCall.data.error?.message || "GPT health-check failed." });
      }

      return res.status(200).json({ ok: true, model: healthCall.modelUsed, provider });
    }

    const count = Math.max(1, Math.min(20, Number(payload.count || 10)));
    const mode: GenerationMode = payload.mode || "mixed";
    const keywords = Array.isArray(payload.keywords) && payload.keywords.length > 0 ? payload.keywords : DEFAULT_KEYWORDS;
    const topics = Array.isArray(payload.topics) && payload.topics.length > 0 ? payload.topics : DEFAULT_TOPICS;
    const primaryKeyword = String(payload.primaryKeyword || keywords[0] || "Salman Hafiz").trim();
    const secondaryKeywords =
      Array.isArray(payload.secondaryKeywords) && payload.secondaryKeywords.length > 0 ? payload.secondaryKeywords : keywords.slice(1);
    const maxTokens = Math.max(1000, Math.min(16000, Number(payload.maxTokens || process.env.AI_MAX_TOKENS || DEFAULT_MAX_TOKENS)));
    const temperature = Math.max(0, Math.min(1.2, Number(payload.temperature ?? process.env.AI_TEMPERATURE ?? DEFAULT_TEMPERATURE)));

    const prompt = buildPrompt(count, mode, keywords, topics, primaryKeyword, secondaryKeywords);

    const generationCall = await callProvider(providerConfig, {
      temperature,
      top_p: 0.95,
      frequency_penalty: 0.2,
      presence_penalty: 0.1,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
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
    });

    if (!generationCall.response.ok) {
      return res.status(generationCall.response.status).json({ error: generationCall.data.error?.message || "Failed to generate blog posts." });
    }

    const content = generationCall.data.choices?.[0]?.message?.content || "";
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
