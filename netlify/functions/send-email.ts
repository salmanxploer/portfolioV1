import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { Resend } from 'resend';

const DEFAULT_SITE_URL = 'https://salmanhafiz.me';
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const getAllowedOrigins = () => {
  const configured = String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const siteUrl = String(process.env.SITE_URL || DEFAULT_SITE_URL).trim();
  return Array.from(new Set([siteUrl, DEFAULT_SITE_URL, ...configured]));
};

const checkRateLimit = (key: string) => {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) return false;

  current.count += 1;
  rateLimitStore.set(key, current);
  return true;
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const origin = String(event.headers.origin || '');
  const allowedOrigins = getAllowedOrigins();
  const allowOrigin = allowedOrigins.includes(origin) ? origin : (allowedOrigins[0] || DEFAULT_SITE_URL);

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };

  if (origin && !allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Origin not allowed' }),
    };
  }

  // Check if API key exists
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Server configuration error'
      }),
    };
  }
  
  // Initialize Resend inside the handler to ensure env vars are available
  const resend = new Resend(apiKey);
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const ip = String(event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'unknown');
  if (!checkRateLimit(`email:${ip}`)) {
    return {
      statusCode: 429,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Too many requests' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const type = String(payload.type || 'contact').trim().toLowerCase();

    if (type === 'study-reminder') {
      const email = String(payload.email || '').trim();
      const subjectName = String(payload.subjectName || 'General').trim();
      const title = String(payload.title || '').trim();
      const details = String(payload.details || '').trim();
      const date = String(payload.date || '').trim();
      const time = String(payload.time || '').trim();

      if (!email || !title || !date) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing required reminder fields' }),
        };
      }

      const data = await resend.emails.send({
        from: 'Study Reminder <onboarding@resend.dev>',
        to: [email],
        subject: `Study Reminder: ${title}`,
        html: `
          <h2>Study Reminder</h2>
          <p><strong>Subject:</strong> ${subjectName}</p>
          <p><strong>Task:</strong> ${title}</p>
          <p><strong>Date:</strong> ${date}${time ? ` ${time}` : ''}</p>
          ${details ? `<p><strong>Details:</strong> ${details.replace(/\n/g, '<br>')}</p>` : ''}
        `,
      });

      if (data.error) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Email provider rejected reminder request' }),
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data }),
      };
    }

    const { name, email, project } = payload;

    if (!name || !email || !project) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

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

    // Check if Resend returned an error
    if (data.error) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Email provider rejected request' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (error: any) {
    console.error('Resend error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to send email' }),
    };
  }
};

export { handler };
