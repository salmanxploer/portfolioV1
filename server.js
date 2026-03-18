import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

const DEFAULT_KEYWORDS = ["Salman Hafiz", "WordPress developer", "frontend developer", "WordPress frontend development"];
const DEFAULT_TOPICS = ["WordPress", "Frontend Development", "AI", "Crypto", "SEO", "Web Performance"];

const resolveProvider = () => {
  const preferred = String(process.env.AI_PROVIDER || "").trim().toLowerCase();

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if ((preferred === "openrouter" || !preferred) && openRouterKey) {
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

  if ((preferred === "groq" || (!preferred && !openRouterKey)) && groqKey) {
    return {
      provider: "groq",
      apiKey: groqKey,
      model: process.env.GROQ_MODEL || process.env.OPENAI_MODEL || "llama-3.1-8b-instant",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      extraHeaders: {},
    };
  }

  if ((preferred === "openai" || !preferred) && openAiKey) {
    return {
      provider: "openai",
      apiKey: openAiKey,
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      endpoint: "https://api.openai.com/v1/chat/completions",
      extraHeaders: {},
    };
  }

  return null;
};

const buildPrompt = (count, mode, keywords, topics, primaryKeyword, secondaryKeywords) =>
  [
    `Generate ${count} SEO-focused blog posts in strict JSON format for a professional developer portfolio blog.`,
    `Target mode: ${mode}.`,
    `Topic pool: ${topics.join(", ")}.`,
    `Primary keyword to include in every post title/H1 naturally: ${primaryKeyword}.`,
    `Secondary keywords to distribute in headings and body: ${secondaryKeywords.join(", ")}.`,
    "Audience: business owners and clients searching for tech services and modern web solutions.",
    `Required keywords to naturally include in every post: ${keywords.join(", ")}.`,
    "Each post must be tech related and recent-topic oriented (2025-2026 relevance), especially around the selected topic pool.",
    "Each content body should be detailed and long-form, approximately 900-1400 words.",
    "Return ONLY valid JSON with this exact shape:",
    '{"posts":[{"title":"...","excerpt":"...","content":"markdown long-form 800+ words","tags":["..."],"metaTitle":"...","metaDescription":"..."}]}',
    "No markdown fences. No extra text.",
  ].join("\n");

const safeParsePosts = (raw) => {
  const cleaned = String(raw || "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
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

app.post('/api/send-email', async (req, res) => {
  const { name, email, project } = req.body;

  if (!name || !email || !project) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const data = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: ['insideshuv01@gmail.com'],
      replyTo: email,
      subject: `New project inquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Project Details:</strong></p>
        <p>${project.replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

app.post('/api/generate-blog-posts', async (req, res) => {
  const providerConfig = resolveProvider();
  if (!providerConfig) {
    return res.status(500).json({
      error: 'No AI provider key configured. Set OPENROUTER_API_KEY (free), GROQ_API_KEY (free tier), or OPENAI_API_KEY.',
    });
  }

  try {
    const payload = req.body || {};
    const action = payload.action || 'generate';

    const { provider, apiKey, model, endpoint, extraHeaders } = providerConfig;

    if (action === 'health-check') {
      const healthResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          ...(extraHeaders || {}),
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Reply with OK' }],
        }),
      });

      const healthData = await healthResponse.json();
      if (!healthResponse.ok) {
        return res.status(healthResponse.status).json({ ok: false, error: healthData?.error?.message || 'GPT health-check failed.' });
      }

      return res.status(200).json({ ok: true, provider, model });
    }

    const count = Math.max(1, Math.min(20, Number(payload.count || 10)));
    const mode = payload.mode || 'mixed';
    const keywords = Array.isArray(payload.keywords) && payload.keywords.length > 0 ? payload.keywords : DEFAULT_KEYWORDS;
    const topics = Array.isArray(payload.topics) && payload.topics.length > 0 ? payload.topics : DEFAULT_TOPICS;
    const primaryKeyword = String(payload.primaryKeyword || keywords[0] || 'Salman Hafiz').trim();
    const secondaryKeywords = Array.isArray(payload.secondaryKeywords) && payload.secondaryKeywords.length > 0 ? payload.secondaryKeywords : keywords.slice(1);
    const maxTokens = Math.max(1000, Math.min(16000, Number(payload.maxTokens || process.env.AI_MAX_TOKENS || 12000)));
    const temperature = Math.max(0, Math.min(1.2, Number(payload.temperature ?? process.env.AI_TEMPERATURE ?? 0.75)));

    const prompt = buildPrompt(count, mode, keywords, topics, primaryKeyword, secondaryKeywords);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(extraHeaders || {}),
      },
      body: JSON.stringify({
        model,
        temperature,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are an expert SEO content strategist and senior web engineer.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Failed to generate blog posts.' });
    }

    const content = data?.choices?.[0]?.message?.content || '';
    const posts = safeParsePosts(content);

    if (posts.length === 0) {
      return res.status(422).json({ error: 'AI returned an invalid posts payload.' });
    }

    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Unknown generation error' });
  }
});

app.listen(PORT, () => {
  console.log(`Email server running on http://localhost:${PORT}`);
});
