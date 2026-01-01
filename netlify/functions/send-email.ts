import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { Resend } from 'resend';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Check if API key exists
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Server configuration error',
        details: 'RESEND_API_KEY environment variable is not set in Netlify'
      }),
    };
  }
  
  // Initialize Resend inside the handler to ensure env vars are available
  const resend = new Resend(apiKey);
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { name, email, project } = JSON.parse(event.body || '{}');

    if (!name || !email || !project) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
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
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Resend API error',
          details: data.error.message || JSON.stringify(data.error)
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, data }),
    };
  } catch (error: any) {
    console.error('Resend error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error?.message || error?.name || JSON.stringify(error) || 'Unknown error'
      }),
    };
  }
};

export { handler };
