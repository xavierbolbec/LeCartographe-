// Paiement Stripe confirmé : marque l'acheteur dans Brevo (attributs CLIENT et DATE_ACHAT),
// pour que l'automatisation de relance du Relevé express le fasse sortir.
// Aucune inscription à une liste : un acheteur ne reçoit pas de messages de vente pour autant.
import { createHmac, timingSafeEqual } from 'node:crypto';

const OFFRES = {
  plink_1ULYe8EFJxiSCMKjTpLywQDw: 'releve',
  plink_1ULYeBEFJxiSCMKjzENWCtE4: 'cartographie',
  plink_1ULb00EFJxiSCMKjgSxVJAI7: 'cartographie',
  plink_1ULYeFEFJxiSCMKj6KbhQMoE: 'cap',
  plink_1ULb03EFJxiSCMKj56S2fjU7: 'cap',
  plink_1ULb05EFJxiSCMKjpgYCQ8zt: 'cap'
};

function signatureValide(brut, entete, secret) {
  const morceaux = Object.fromEntries(String(entete || '').split(',').map((p) => p.split('=')).filter((p) => p.length === 2 && p[0] !== 'v1'));
  const v1 = String(entete || '').split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  const t = Number(morceaux.t);
  if (!t || !v1.length || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const attendu = Buffer.from(createHmac('sha256', secret).update(`${t}.${brut}`).digest('hex'));
  return v1.some((s) => { const b = Buffer.from(s); return b.length === attendu.length && timingSafeEqual(b, attendu); });
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET, cle = process.env.BREVO_API_KEY;
  if (!secret || !cle) { console.error('variable absente'); return new Response('{}', { status: 500 }); }

  const brut = await req.text();
  if (!signatureValide(brut, req.headers.get('stripe-signature'), secret)) return new Response('signature', { status: 400 });

  const ev = JSON.parse(brut);
  if (ev.type !== 'checkout.session.completed') return new Response('{}', { status: 200 });
  const s = ev.data.object;
  if (s.payment_status !== 'paid') return new Response('{}', { status: 200 });
  const email = String(s.customer_details?.email || s.customer_email || '').trim().toLowerCase();
  if (!email) return new Response('{}', { status: 200 });
  const offre = OFFRES[s.payment_link] || 'autre';

  const h = { 'content-type': 'application/json', 'api-key': cle };
  // les attributs sont créés au premier passage ; ensuite Brevo répond « existe déjà », sans effet
  await fetch('https://api.brevo.com/v3/contacts/attributes/normal/CLIENT', { method: 'POST', headers: h, body: JSON.stringify({ type: 'text' }) }).catch(() => {});
  await fetch('https://api.brevo.com/v3/contacts/attributes/normal/DATE_ACHAT', { method: 'POST', headers: h, body: JSON.stringify({ type: 'date' }) }).catch(() => {});

  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST', headers: h,
    body: JSON.stringify({ email, updateEnabled: true, attributes: { CLIENT: offre, DATE_ACHAT: new Date().toISOString().slice(0, 10) } })
  });
  if (!r.ok) { console.error('Brevo ' + r.status + ' : ' + await r.text()); return new Response('{}', { status: 502 }); }
  return new Response('{"ok":true}', { status: 200 });
};
