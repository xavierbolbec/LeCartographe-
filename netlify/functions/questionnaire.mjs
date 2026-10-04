// Réception d'un questionnaire du Cartographe : envoi des réponses à Xavier, accusé de réception au client.
const OFFRES = { releve: 'Le Relevé', cartographie: 'La Cartographie', cap: 'Le Cap' };
const XAVIER = 'xavier.bolbec@gmail.com';
const SUITE = {
  releve: 'Votre Relevé vous parvient sous 7 jours, en PDF, à votre nom.',
  cartographie: 'Je reviens vers vous pour fixer notre séance de restitution, qui aura lieu sous 14 jours.',
  cap: 'Je reviens vers vous pour fixer la suite de votre accompagnement.'
};

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nl = (t) => esc(t).replace(/\n/g, '<br>');

async function brevo(cle, corps) {
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'api-key': cle },
    body: JSON.stringify(corps)
  });
  if (!r.ok) throw new Error('Brevo ' + r.status + ' : ' + (await r.text()));
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const cle = process.env.BREVO_API_KEY;
  if (!cle) { console.error('BREVO_API_KEY absente'); return new Response('{}', { status: 500 }); }

  const d = await req.json().catch(() => null);
  if (!d || !OFFRES[d.offre] || !Array.isArray(d.sections)) return new Response('{}', { status: 400 });
  if (d.site) return new Response('{}', { status: 200 }); // pot de miel : robot

  const email = String(d.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return new Response('{}', { status: 400 });
  const prenom = String(d.prenom || '').trim().slice(0, 80);
  const offre = OFFRES[d.offre];
  const date = new Date().toLocaleString('fr-FR', { timeZone: 'America/Guadeloupe', dateStyle: 'long', timeStyle: 'short' });

  // ---- texte brut, en pièce jointe pour archivage ----
  let txt = `${offre} · questionnaire de ${prenom} <${email}>\nReçu le ${date} (heure de Guadeloupe)\n`;
  // ---- html pour Xavier ----
  let html = `<div style="font-family:Georgia,serif;max-width:680px;margin:0 auto;color:#1B2A40;">
<p style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase;color:#A8841A;margin:0 0 6px;">${esc(offre)} · questionnaire reçu</p>
<h1 style="font-size:24px;font-weight:500;margin:0 0 4px;">${esc(prenom)}</h1>
<p style="font-family:Arial,sans-serif;font-size:13px;color:#56637A;margin:0 0 24px;">${esc(email)} · reçu le ${esc(date)}. Répondre à ce message écrit directement au client.</p>`;
  for (const s of d.sections.slice(0, 20)) {
    txt += `\n\n=== ${s.titre}${s.scelle ? ' (scellé, à relire à J+90)' : ''} ===\n`;
    html += `<h2 style="font-size:18px;font-weight:500;border-bottom:1px solid #C9A227;padding-bottom:6px;margin:30px 0 12px;">${esc(s.titre)}${s.scelle ? ' <span style="font-family:Arial,sans-serif;font-size:11px;color:#A8841A;letter-spacing:.1em;">SCELLÉ, À RELIRE À J+90</span>' : ''}</h2>`;
    for (const r of (s.reponses || []).slice(0, 80)) {
      const rep = String(r.reponse || '').slice(0, 8000);
      txt += `\n${r.question}\n${rep || '(sans réponse)'}\n`;
      html += `<p style="font-family:Arial,sans-serif;font-size:13px;color:#56637A;margin:14px 0 4px;">${esc(r.question)}</p>
<p style="font-size:15.5px;line-height:1.6;margin:0;${rep ? '' : 'color:#9AA3B2;font-style:italic;'}">${rep ? nl(rep) : 'sans réponse'}</p>`;
    }
  }
  html += '</div>';

  const nomFichier = `${d.offre}-${(prenom || 'client').normalize('NFD').replace(/[^\w-]+/g, '').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`;

  try {
    await brevo(cle, {
      sender: { name: 'Le Cartographe', email: XAVIER },
      to: [{ email: XAVIER, name: 'Xavier Bolbec' }],
      replyTo: { email, name: prenom || email },
      subject: `Questionnaire reçu · ${offre} · ${prenom || email}`,
      htmlContent: html,
      attachment: [{ name: nomFichier, content: Buffer.from(txt, 'utf8').toString('base64') }],
      tags: ['questionnaire', d.offre]
    });
  } catch (e) {
    console.error(e.message);
    return new Response('{}', { status: 502 });
  }

  // ---- accusé de réception au client, dans la charte ----
  const accuse = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background-color:#0E1B2E;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0E1B2E"><tr><td align="center" style="padding:20px 8px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td align="center" style="padding:4px 4px 26px;text-align:center;"><div style="font-family:Lora,Georgia,serif;font-size:17px;font-weight:600;letter-spacing:.22em;color:#F2E6CE;">LE CARTOGRAPHE</div><div style="font-family:Poppins,Arial,sans-serif;font-size:12px;letter-spacing:.12em;color:#A9B8CA;padding-top:6px;">16°15′N · 61°35′W</div></td></tr>
<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#13233A" style="background-color:#13233A;border:1px solid #5C5126;border-radius:6px;"><tr><td align="center" style="padding:32px 18px 28px;text-align:center;">
<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;"><tr><td width="54" style="border-top:1px solid #C9A227;font-size:0;line-height:0;">&nbsp;</td><td style="padding:0 10px;font-family:Georgia,serif;font-size:12px;line-height:12px;color:#C9A227;">&#10022;</td><td width="54" style="border-top:1px solid #C9A227;font-size:0;line-height:0;">&nbsp;</td></tr></table>
<div style="font-family:Poppins,Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#C9A227;padding-bottom:12px;">${esc(offre)} · questionnaire reçu</div>
<div style="font-family:Lora,Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;color:#F2E6CE;padding-bottom:14px;">Merci${prenom ? ', ' + esc(prenom) : ''}.</div>
<div style="font-family:Lora,Georgia,serif;font-style:italic;font-size:18px;line-height:1.6;color:#E8E2D4;">Vos réponses sont bien arrivées. ${esc(SUITE[d.offre])}</div>
<div style="font-family:Poppins,Arial,sans-serif;font-size:17px;line-height:1.65;color:#E8E2D4;padding-top:18px;text-align:left;">Si quelque chose vous revient d’ici là, répondez simplement à ce message : je l’ajouterai à vos réponses.</div>
</td></tr></table></td></tr>
<tr><td style="padding:24px 4px 0;font-family:Lora,Georgia,serif;font-size:21px;line-height:1.5;color:#F2E6CE;text-align:center;">Xavier<br><span style="font-family:Poppins,Arial,sans-serif;font-size:14px;color:#A9B8CA;">Le Cartographe, Sainte-Anne, Guadeloupe</span></td></tr>
<tr><td align="center" style="padding:30px 0 0;font-family:Poppins,Arial,sans-serif;font-size:14px;letter-spacing:.15em;color:#A9B8CA;">Respire · Écoute · Agis</td></tr>
</table></td></tr></table></body></html>`;
  try {
    await brevo(cle, {
      sender: { name: 'Le Cartographe', email: XAVIER },
      to: [{ email, name: prenom || email }],
      replyTo: { email: XAVIER, name: 'Xavier Bolbec' },
      subject: `${offre} : vos réponses sont bien arrivées`,
      htmlContent: accuse,
      tags: ['questionnaire-accuse', d.offre]
    });
  } catch (e) { console.error('Accusé : ' + e.message); }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
};
