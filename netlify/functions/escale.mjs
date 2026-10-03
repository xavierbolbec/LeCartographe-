// Formulaire de l'Escale : envoie les réponses à Xavier, que la personne réserve ou non.
// Aucune inscription à une liste : la personne n'a pas consenti à recevoir des messages.
const XAVIER = 'xavier.bolbec@gmail.com';
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const cle = process.env.BREVO_API_KEY;
  if (!cle) { console.error('BREVO_API_KEY absente'); return new Response('{}', { status: 500 }); }

  const d = await req.json().catch(() => null);
  if (!d) return new Response('{}', { status: 400 });
  const email = String(d.email || '').trim().toLowerCase().slice(0, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return new Response('{}', { status: 400 });
  const nom = String(d.nom || '').trim().slice(0, 120);
  const suite = String(d.suite || '').slice(0, 60);
  const resume = String(d.resume || '').slice(0, 4000);
  const date = new Date().toLocaleString('fr-FR', { timeZone: 'America/Guadeloupe', dateStyle: 'long', timeStyle: 'short' });

  const html = `<div style="font-family:Georgia,serif;max-width:640px;margin:0 auto;color:#1B2A40;">
<p style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase;color:#A8841A;margin:0 0 6px;">L'Escale · formulaire rempli</p>
<h1 style="font-size:24px;font-weight:500;margin:0 0 4px;">${esc(nom)}</h1>
<p style="font-family:Arial,sans-serif;font-size:13px;color:#56637A;margin:0 0 20px;">${esc(email)} · ${esc(date)} · ${esc(suite)}. Répondre à ce message écrit directement à la personne.</p>
<p style="font-size:15.5px;line-height:1.65;white-space:pre-wrap;margin:0;">${esc(resume)}</p></div>`;

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'api-key': cle },
    body: JSON.stringify({
      sender: { name: 'Le Cartographe', email: XAVIER },
      to: [{ email: XAVIER, name: 'Xavier Bolbec' }],
      replyTo: { email, name: nom || email },
      subject: `Escale · ${nom || email} · ${suite}`,
      htmlContent: html,
      tags: ['escale']
    })
  });
  if (!r.ok) { console.error('Brevo ' + r.status + ' : ' + await r.text()); return new Response('{}', { status: 502 }); }
  return new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } });
};
