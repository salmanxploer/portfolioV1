import { Resend } from 'resend';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing Resend API key' });
  }

  const resend = new Resend(apiKey);
  const payload = req.body || {};
  const type = String(payload.type || 'contact').trim().toLowerCase();

  if (type === 'study-reminder') {
    const email = String(payload.email || '').trim();
    const subjectName = String(payload.subjectName || 'General').trim();
    const title = String(payload.title || '').trim();
    const details = String(payload.details || '').trim();
    const date = String(payload.date || '').trim();
    const time = String(payload.time || '').trim();

    if (!email || !title || !date) {
      return res.status(400).json({ error: 'Missing required reminder fields' });
    }

    try {
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

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Resend study reminder error:', error);
      return res.status(500).json({ error: 'Failed to send reminder email' });
    }
  }

  const { name, email, project } = payload;

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
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
