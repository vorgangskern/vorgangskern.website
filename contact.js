const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', ...headers }
});

const clean = (value, max = 4000) => String(value ?? '').trim().slice(0, max);
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function onRequestPost(context) {
  const { request, env } = context;
  const allowedOrigin = env.ALLOWED_ORIGIN || 'https://vorgangskern.com';
  const origin = request.headers.get('origin');
  if (origin && origin !== allowedOrigin && !origin.startsWith('http://localhost') && !origin.startsWith('http://127.0.0.1')) {
    return json({ ok: false, error: 'origin_not_allowed' }, 403);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'invalid_json' }, 400); }

  if (clean(body.website, 100)) return json({ ok: true }); // Honeypot

  const payload = {
    phase: clean(body.phase, 120),
    service: clean(body.service, 160),
    organization: clean(body.organization, 160),
    deadline: clean(body.deadline, 40),
    reference: clean(body.reference, 600),
    message: clean(body.message, 5000),
    company: clean(body.company, 220),
    name: clean(body.name, 220),
    email: clean(body.email, 320),
    phone: clean(body.phone, 80),
    submittedAt: new Date().toISOString(),
    userAgent: clean(request.headers.get('user-agent'), 300)
  };

  if (!payload.company || !payload.name || !validEmail(payload.email)) {
    return json({ ok: false, error: 'required_fields_missing' }, 422);
  }

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (env.CONTACT_RATE_LIMIT) {
    const key = `contact:${ip}`;
    const last = await env.CONTACT_RATE_LIMIT.get(key);
    if (last) return json({ ok: false, error: 'rate_limited' }, 429, { 'retry-after': '60' });
    await env.CONTACT_RATE_LIMIT.put(key, String(Date.now()), { expirationTtl: 60 });
  }

  // Recommended deployment: Google Apps Script webhook or another trusted mail endpoint.
  if (env.CONTACT_WEBHOOK_URL) {
    const webhookUrl = new URL(env.CONTACT_WEBHOOK_URL);
    if (env.CONTACT_WEBHOOK_SECRET) webhookUrl.searchParams.set('secret', env.CONTACT_WEBHOOK_SECRET);
    const webhookResponse = await fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-vorgangskern-secret': env.CONTACT_WEBHOOK_SECRET || ''
      },
      body: JSON.stringify(payload)
    });
    if (!webhookResponse.ok) return json({ ok: false, error: 'delivery_failed' }, 502);
    return json({ ok: true });
  }

  // Optional provider: Resend. Do not expose the key in client code.
  if (env.RESEND_API_KEY) {
    const text = [
      'Neue Anfrage über vorgangskern.com', '',
      `Organisation: ${payload.company || payload.organization}`,
      `Ansprechpartner: ${payload.name}`,
      `E-Mail: ${payload.email}`,
      `Telefon: ${payload.phone || '—'}`,
      `Status: ${payload.phase || '—'}`,
      `Leistungsfeld: ${payload.service || '—'}`,
      `Termin: ${payload.deadline || '—'}`,
      `Referenz / Link: ${payload.reference || '—'}`, '',
      'Beschreibung:', payload.message || '—'
    ].join('\n');
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACT_FROM || 'Vorgangskern Website <website@vorgangskern.com>',
        to: [env.CONTACT_TO || 'info@vorgangskern.com'],
        reply_to: payload.email,
        subject: `Projektanfrage: ${payload.service || 'Digitales Vorhaben'} – ${payload.company}`,
        text
      })
    });
    if (!resendResponse.ok) return json({ ok: false, error: 'delivery_failed' }, 502);
    return json({ ok: true });
  }

  return json({ ok: false, error: 'contact_backend_not_configured' }, 503);
}

export function onRequestGet() {
  return json({ ok: false, error: 'method_not_allowed' }, 405, { allow: 'POST' });
}
