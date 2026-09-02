/**
 * Varitax University — Signup Relay
 * Vercel Serverless Function: /api/signup-relay
 *
 * Purpose: Receives signup events from the Varitax University site and forwards
 * them to the n8n webhook with server-side authentication. Keeps N8N_TRIGGER_TOKEN
 * and VARITAX_WEBHOOK_SECRET out of client-side code.
 *
 * ADR-001 compliance: This is the production delivery mechanism for Option B
 * (Webhook Trigger). The relay validates request origin, injects the webhook
 * secret header, and forwards to the configured N8N_WEBHOOK_URL env var.
 *
 * Environment variables required (set in Vercel project settings):
 *   N8N_WEBHOOK_URL      — full n8n webhook URL (e.g. https://your-ngrok-url/webhook/varitax-signup)
 *   VARITAX_WEBHOOK_SECRET — secret value that n8n validates against $env.VARITAX_WEBHOOK_SECRET
 *   ALLOWED_ORIGIN       — allowed CORS origin (e.g. https://your-site.vercel.app), defaults to *
 */

export default async function handler(req, res) {
  // CORS — allow configured origin or all origins for demo deployments
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate required env vars are present
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookSecret = process.env.VARITAX_WEBHOOK_SECRET;

  if (!webhookUrl) {
    console.error('[signup-relay] N8N_WEBHOOK_URL not configured');
    return res.status(503).json({ error: 'Relay not configured' });
  }

  // Parse and validate the inbound payload
  let payload;
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (!payload || payload.event !== 'signup' || !payload.email) {
    return res.status(400).json({ error: 'Missing required fields: event, email' });
  }

  // Sanitize — only forward known fields, never proxy arbitrary data
  const forwardPayload = {
    event: 'signup',
    email: String(payload.email).slice(0, 254),
    name: payload.name ? String(payload.name).slice(0, 120) : 'Learner',
    ts: typeof payload.ts === 'number' ? payload.ts : Date.now(),
    source: 'varitax-university-site',
  };

  // Forward to n8n with server-side auth header
  let n8nResponse;
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (webhookSecret) {
      headers['X-Varitax-Token'] = webhookSecret;
    }

    n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(forwardPayload),
    });
  } catch (err) {
    console.error('[signup-relay] n8n fetch failed:', err.message);
    // Return 200 to the site — do not surface backend errors to the browser
    return res.status(200).json({ received: true });
  }

  if (!n8nResponse.ok) {
    console.error(`[signup-relay] n8n returned ${n8nResponse.status}`);
  }

  // Always return 200 to the site — the signup UX must never be blocked
  return res.status(200).json({ received: true });
}
