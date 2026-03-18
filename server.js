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
const DEFAULT_SYSTEM_PROMPT = "You are an expert SEO content strategist and senior web engineer.";
const DEFAULT_AUDIENCE_PROMPT = "Business owners and clients searching for tech services and modern web solutions.";
const DEFAULT_CTA_PROMPT = "Invite the reader to discuss or hire Salman Hafiz for implementation.";

const getLengthInstruction = (lengthPreset) => {
  if (lengthPreset === "short") return "Target 650-900 words with concise sections and direct implementation advice.";
  if (lengthPreset === "medium") return "Target 900-1200 words with practical examples and clear section flow.";
  return "Target 1200-1600 words with deep implementation detail and business outcomes.";
};

const resolveProvider = () => {
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
      extraHeaders: {},
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
      extraHeaders: {},
    };
  }

  if (!preferred && groqKey) {
    return {
      provider: "groq",
      apiKey: groqKey,
      model: process.env.GROQ_MODEL || process.env.OPENAI_MODEL || "llama-3.1-8b-instant",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      extraHeaders: {},
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
      extraHeaders: {},
    };
  }

  return null;
};

const buildPrompt = (count, mode, keywords, topics, primaryKeyword, secondaryKeywords, options) => {
  const promptLines = [
    `Generate ${count} SEO-focused blog posts in strict JSON format for a professional developer portfolio blog.`,
    `Target mode: ${mode}.`,
    `Topic pool: ${topics.join(", ")}.`,
    `Primary keyword to include in every post title/H1 naturally: ${primaryKeyword}.`,
    `Secondary keywords to distribute in headings and body: ${secondaryKeywords.join(", ")}.`,
    `Audience: ${options.audiencePrompt}.`,
    `Required keywords to naturally include in every post: ${keywords.join(", ")}.`,
    "Each post must be tech related and recent-topic oriented (2025-2026 relevance), especially around the selected topic pool.",
    getLengthInstruction(options.lengthPreset),
    `CTA requirement: ${options.ctaPrompt}.`,
    options.tonePrompt ? `Writing tone/style guidance: ${options.tonePrompt}.` : "",
    "Return ONLY valid JSON with this exact shape:",
    '{"posts":[{"title":"...","excerpt":"...","content":"markdown long-form 800+ words","tags":["..."],"metaTitle":"...","metaDescription":"..."}]}',
    "No markdown fences. No extra text.",
  ].filter(Boolean);

  if (options.customPrompt) {
    promptLines.push("Additional strict instructions from admin:");
    promptLines.push(options.customPrompt);
  }

  return promptLines.join("\n");
};

const buildImprovePrompt = (sourcePost, mode, keywords, topics, primaryKeyword, secondaryKeywords, options) => {
  const lines = [
    "Improve the following existing blog post for SEO, clarity, depth, and conversion intent.",
    `Target mode: ${mode}.`,
    `Topic pool: ${topics.join(", ")}.`,
    `Audience: ${options.audiencePrompt}.`,
    `Primary keyword: ${primaryKeyword}.`,
    `Secondary keywords: ${secondaryKeywords.join(", ")}.`,
    `Required keywords: ${keywords.join(", ")}.`,
    getLengthInstruction(options.lengthPreset),
    `CTA requirement: ${options.ctaPrompt}.`,
    options.tonePrompt ? `Writing tone/style guidance: ${options.tonePrompt}.` : "",
    options.improveInstructions ? `Specific improvement instructions: ${options.improveInstructions}.` : "",
    "Return ONLY valid JSON in this exact shape:",
    '{"post":{"title":"...","excerpt":"...","content":"markdown","tags":["..."],"metaTitle":"...","metaDescription":"..."}}',
    "No markdown fences. No extra text.",
    "Source post title:",
    String(sourcePost.title || ""),
    "Source post excerpt:",
    String(sourcePost.excerpt || ""),
    "Source post tags:",
    Array.isArray(sourcePost.tags) ? sourcePost.tags.join(", ") : "",
    "Source post content:",
    String(sourcePost.content || ""),
  ].filter(Boolean);

  if (options.customPrompt) {
    lines.push("Additional strict instructions from admin:");
    lines.push(options.customPrompt);
  }

  return lines.join("\n");
};

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

const safeParseSinglePost = (raw) => {
  const cleaned = String(raw || "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  const post = parsed.post;
  if (!post) return null;

  const normalized = {
    title: String(post.title || "").trim(),
    excerpt: String(post.excerpt || "").trim(),
    content: String(post.content || "").trim(),
    tags: Array.isArray(post.tags) ? post.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
    metaTitle: String(post.metaTitle || "").trim(),
    metaDescription: String(post.metaDescription || "").trim(),
  };

  if (!normalized.title || !normalized.excerpt || !normalized.content) return null;
  return normalized;
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

    const customPrompt = String(payload.customPrompt || '').trim();
    const systemPrompt = String(payload.systemPrompt || '').trim() || DEFAULT_SYSTEM_PROMPT;
    const audiencePrompt = String(payload.audiencePrompt || '').trim() || DEFAULT_AUDIENCE_PROMPT;
    const ctaPrompt = String(payload.ctaPrompt || '').trim() || DEFAULT_CTA_PROMPT;
    const tonePrompt = String(payload.tonePrompt || '').trim();
    const improveInstructions = String(payload.improveInstructions || '').trim();
    const lengthPreset = payload.lengthPreset === 'short' || payload.lengthPreset === 'medium' || payload.lengthPreset === 'long'
      ? payload.lengthPreset
      : 'medium';

    if (action === 'improve-post') {
      const improvePost = payload.improvePost || {};
      if (!String(improvePost.title || '').trim() || !String(improvePost.content || '').trim()) {
        return res.status(400).json({ error: 'Missing improvePost.title or improvePost.content for improve-post action.' });
      }

      const improvePrompt = buildImprovePrompt(improvePost, mode, keywords, topics, primaryKeyword, secondaryKeywords, {
        customPrompt,
        audiencePrompt,
        ctaPrompt,
        tonePrompt,
        lengthPreset,
        improveInstructions,
      });

      const improveResponse = await fetch(endpoint, {
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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: improvePrompt },
          ],
        }),
      });

      const improveData = await improveResponse.json();
      if (!improveResponse.ok) {
        return res.status(improveResponse.status).json({ error: improveData?.error?.message || 'Failed to improve post.' });
      }

      const improved = safeParseSinglePost(improveData?.choices?.[0]?.message?.content || '');
      if (!improved) {
        return res.status(422).json({ error: 'AI returned an invalid improved post payload.' });
      }

      return res.status(200).json({ post: improved });
    }

    const prompt = buildPrompt(count, mode, keywords, topics, primaryKeyword, secondaryKeywords, {
      customPrompt,
      audiencePrompt,
      ctaPrompt,
      tonePrompt,
      lengthPreset,
    });

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
          { role: 'system', content: systemPrompt },
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
