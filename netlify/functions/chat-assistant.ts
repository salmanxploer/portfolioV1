import type { Handler, HandlerEvent } from "@netlify/functions";

type ProviderConfig = {
  provider: "openrouter" | "groq" | "openai";
  apiKey: string;
  model: string;
  endpoint: string;
  extraHeaders?: Record<string, string>;
};

type ChatPayload = {
  message?: string;
  mode?: "default" | "study" | string;
  subject?: string;
  studyContext?: {
    selectedDate?: string;
    noteSnippet?: string;
    upcoming?: string[];
  };
  history?: Array<{ role?: string; text?: string; content?: string }>;
};

type OpenAIResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

const BOT_NAME = "Salman Assist AI";
const DEFAULT_SITE_URL = "https://salmanhafiz.me";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 24;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const getAllowedOrigins = () => {
  const configured = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const siteUrl = String(process.env.SITE_URL || DEFAULT_SITE_URL).trim();
  const devOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"];
  return Array.from(new Set([siteUrl, DEFAULT_SITE_URL, ...configured, ...devOrigins]));
};

const isAllowedOrigin = (origin: string, allowedOrigins: string[]) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};

const checkRateLimit = (key: string) => {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return true;
};

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
        "X-Title": "Salman Hafiz Portfolio AI Assistant",
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
        "X-Title": "Salman Hafiz Portfolio AI Assistant",
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

const buildSystemPrompt = (mode?: string, subject?: string, studyContext?: ChatPayload["studyContext"]) => {
  if (String(mode || "").toLowerCase() === "study") {
    const cleanSubject = String(subject || "General").trim() || "General";
    const noteSnippet = String(studyContext?.noteSnippet || "").trim().slice(0, 1000);
    const upcoming = Array.isArray(studyContext?.upcoming)
      ? studyContext?.upcoming.slice(0, 5).map((item) => String(item || "").trim()).filter(Boolean)
      : [];

    return [
      `You are ${BOT_NAME}, an educational study assistant for Salman Hafiz's Study Hub.`,
      `Current subject: ${cleanSubject}.`,
      "Your goal is to help the learner understand topics deeply and study efficiently.",
      "Provide structured help: short explanations, bullet steps, memory tips, and practical examples.",
      "When asked, create revision plans with time blocks, priority topics, and checklists.",
      "When topics are unclear, ask one concise follow-up question before giving final guidance.",
      "Never fabricate facts. If uncertain, say so and suggest verification sources.",
      "Keep answers clear and concise, and end with an actionable next step.",
      noteSnippet ? `Learner notes snippet:\n${noteSnippet}` : "",
      upcoming.length ? `Upcoming reminders:\n- ${upcoming.join("\n- ")}` : "",
    ].join("\n");
  }

  return [
    `You are ${BOT_NAME}, the buyer assistant for Salman Hafiz's portfolio website.`,
    "Your goal is to help potential clients understand services, timeline, and next steps with confidence.",
    "Keep the tone positive, honest, and practical.",
    "Never invent fake achievements or guarantees.",
    "Highlight strengths: WordPress frontend development, React frontend engineering, performance optimization, practical SEO implementation.",
    "When relevant, suggest contacting Salman on WhatsApp for project discussion.",
    "Use concise paragraphs and actionable guidance.",
  ].join("\n");
};

const normalizeHistory = (history: ChatPayload["history"]) => {
  if (!Array.isArray(history)) return [];

  return history
    .map((entry) => {
      const role = String(entry.role || "").toLowerCase();
      const content = String(entry.text || entry.content || "").trim();
      if (!content) return null;

      if (role === "assistant" || role === "bot") return { role: "assistant" as const, content };
      if (role === "user") return { role: "user" as const, content };
      return null;
    })
    .filter((entry): entry is { role: "assistant" | "user"; content: string } => Boolean(entry))
    .slice(-10);
};

export const handler: Handler = async (event: HandlerEvent) => {
  const origin = String(event.headers.origin || "");
  const allowedOrigins = getAllowedOrigins();
  const allowOrigin = allowedOrigins[0] || DEFAULT_SITE_URL;
  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (origin) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
    corsHeaders["Vary"] = "Origin";
  }

  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return { statusCode: 403, headers: corsHeaders, body: JSON.stringify({ error: "Origin not allowed" }) };
  }

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const ip = String(event.headers["x-nf-client-connection-ip"] || event.headers["x-forwarded-for"] || "unknown");
  if (!checkRateLimit(`chat:${ip}`)) {
    return { statusCode: 429, headers: corsHeaders, body: JSON.stringify({ error: "Too many requests" }) };
  }

  const providerConfig = resolveProvider();
  if (!providerConfig) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "No AI provider configured for assistant chat." }),
    };
  }

  try {
    const payload = (event.body ? JSON.parse(event.body) : {}) as ChatPayload;
    const message = String(payload.message || "").trim();

    if (!message) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Missing message" }) };
    }

    const mode = String(payload.mode || "default").trim().toLowerCase();
    const subject = String(payload.subject || "").trim();

    const messages = [
      { role: "system", content: buildSystemPrompt(mode, subject, payload.studyContext) },
      ...normalizeHistory(payload.history),
      { role: "user", content: message },
    ];

    const aiCall = await callProvider(providerConfig, {
      temperature: mode === "study" ? 0.35 : 0.5,
      top_p: 0.9,
      max_tokens: 550,
      messages,
    });

    if (!aiCall.response.ok) {
      return {
        statusCode: aiCall.response.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: aiCall.data.error?.message || "Assistant response failed." }),
      };
    }

    const reply = String(aiCall.data.choices?.[0]?.message?.content || "").trim();
    if (!reply) {
      return { statusCode: 422, headers: corsHeaders, body: JSON.stringify({ error: "Empty assistant response." }) };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ ok: true, reply, provider: providerConfig.provider, model: aiCall.modelUsed }),
    };
  } catch (error) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "Assistant service unavailable" }) };
  }
};
