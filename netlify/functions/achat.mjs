// Paiement Stripe reçu : le client est marqué dans Brevo et reçoit son mail de bienvenue avec le lien de son questionnaire.
import crypto from 'node:crypto';

const SITE = 'https://lecartographe.netlify.app';
const XAVIER = 'xavier.bolbec@gmail.com';

// lien de paiement Stripe → offre achetée, et questionnaire à remplir
const LIENS = {
  plink_1ULYe8EFJxiSCMKjTpLywQDw: { offre: 'releve', questionnaire: 'releve' },
  plink_1ULYeBEFJxiSCMKjzENWCtE4: { offre: 'cartographie', questionnaire: 'cartographie' },
  plink_1ULYeFEFJxiSCMKj6KbhQMoE: { offre: 'cap', questionnaire: 'cap' },
  plink_1ULb00EFJxiSCMKjgSxVJAI7: { offre: 'cartographie', questionnaire: 'cartographie', depuis: 'releve' },
  plink_1ULb03EFJxiSCMKj56S2fjU7: { offre: 'cap', questionnaire: 'cap', depuis: 'releve' },
  plink_1ULb05EFJxiSCMKjpgYCQ8zt: { offre: 'cap', questionnaire: 'cap-suite', depuis: 'cartographie' }
};

const NOMS = { releve: 'Le Relevé', cartographie: 'La Cartographie', cap: 'Le Cap' };

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- le mail de bienvenue ----------
export function mailBienvenue({ offre, questionnaire, depuis, prenom }) {
  const nom = NOMS[offre];
  const lien = `${SITE}/questionnaire?offre=${questionnaire}`;
  const C = {
    releve: {
      sujet: 'Le Relevé : votre questionnaire vous attend',
      chapo: 'Votre Relevé commence par vos réponses.',
      duree: 'Environ 15 minutes.',
      consigne: 'Répondez court et concret. Ce que vous ne savez pas, laissez-le vide plutôt que de l’approximer : votre lecture repose sur ce que vous écrivez.',
      suite: [
        ['Vos réponses m’arrivent dès l’envoi', 'Vous recevez aussitôt un accusé de réception.'],
        ['Votre Relevé vous parvient sous 7 jours', 'En PDF, à votre nom, 7 jours au plus après réception de votre questionnaire complété.']
      ]
    },
    cartographie: {
      sujet: 'La Cartographie : votre questionnaire vous attend',
      chapo: 'Votre Cartographie commence par vos réponses.',
      duree: 'Environ 40 minutes, en une ou plusieurs fois.',
      consigne: 'Prenez-le sur un moment calme. Les questions courtes demandent une réponse courte, et ce que vous ne savez pas, laissez-le vide plutôt que de l’approximer.',
      suite: [
        ['Je vous écris sous 24 heures', 'Pour fixer la date de votre séance de restitution, qui a lieu sous 14 jours après réception de votre questionnaire.'],
        ['Votre séance, puis votre carte', 'Votre carte vous est remise sous 48 heures après la séance.']
      ]
    },
    cap: {
      sujet: 'Le Cap : votre questionnaire vous attend',
      chapo: 'Votre accompagnement commence par vos réponses.',
      duree: 'Environ 50 minutes, en une ou plusieurs fois.',
      consigne: 'Prenez-le sur un moment calme. La dernière partie est mise sous scellé : nous la relirons ensemble au quatre-vingt-dixième jour, à côté de ce que vous aurez fait.',
      suite: [
        ['Je vous écris sous 24 heures', 'Pour fixer notre premier rendez-vous. Vos 90 jours démarrent sous 14 jours, par le contenu de La Cartographie.'],
        ['Un point toutes les deux semaines', 'Avec un accès écrit entre les points, et un bilan écrit à la fin des 90 jours.']
      ]
    }
  }[offre];

  let note = '';
  if (depuis === 'releve') {
    note = 'Certaines questions reprennent celles de votre Relevé. Répondez-y comme aujourd’hui, sans relire vos anciennes réponses : l’écart entre les deux m’est utile.';
  }
  if (questionnaire === 'cap-suite') {
    C.duree = 'Environ 10 minutes.';
    C.consigne = 'Vous avez déjà répondu au questionnaire de La Cartographie. Il ne vous reste que la dernière partie, votre point de départ. Elle est mise sous scellé : nous la relirons ensemble au quatre-vingt-dixième jour, à côté de ce que vous aurez fait.';
  }

  const sep = `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;"><tr><td width="54" style="border-top:1px solid #C9A227;font-size:0;line-height:0;">&nbsp;</td><td style="padding:0 10px;font-family:Georgia,serif;font-size:12px;line-height:12px;color:#C9A227;">&#10022;</td><td width="54" style="border-top:1px solid #C9A227;font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
  const pan = (contenu, centre) => `<tr><td style="padding:0 0 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#13233A" style="background-color:#13233A;border:1px solid #5C5126;border-radius:6px;"><tr><td${centre ? ' align="center"' : ''} style="padding:34px 22px 30px;${centre ? 'text-align:center;' : ''}">${sep}${contenu}</td></tr></table></td></tr>`;
  const sur = (t) => `<div style="font-family:Poppins,Arial,sans-serif;font-size:12px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:#C9A227;padding-bottom:12px;text-align:center;">${t}</div>`;
  const p = (t, extra = '') => `<div style="font-family:Poppins,Arial,sans-serif;font-weight:300;font-size:15.5px;line-height:1.7;color:#E8E2D4;padding-bottom:14px;${extra}">${t}</div>`;

  const etapes = C.suite.map(([t, d], i) => `<tr><td valign="top" width="40" style="padding:0 0 18px;"><div style="width:28px;height:28px;border:1px solid #C9A227;border-radius:50%;text-align:center;font-family:Lora,Georgia,serif;font-size:14px;line-height:28px;color:#C9A227;">${i + 2}</div></td><td valign="top" style="padding:2px 0 18px;"><div style="font-family:Lora,Georgia,serif;font-weight:500;font-size:16.5px;color:#F2E6CE;padding-bottom:3px;">${t}</div><div style="font-family:Poppins,Arial,sans-serif;font-weight:300;font-size:14.5px;line-height:1.6;color:#E8E2D4;">${d}</div></td></tr>`).join('');

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(C.sujet)}</title></head>
<body style="margin:0;padding:0;background-color:#0E1B2E;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0E1B2E"><tr><td align="center" style="padding:26px 12px 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td style="padding:4px 4px 30px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:Lora,Georgia,serif;font-size:15px;letter-spacing:.16em;text-transform:uppercase;color:#F2E6CE;">Le Cartographe</td><td align="right" style="font-family:Poppins,Arial,sans-serif;font-size:11px;letter-spacing:.13em;color:#C9A227;">16°15′N · 61°35′W</td></tr></table></td></tr>
${pan(`${sur(esc(nom) + ' · paiement reçu')}
<div style="font-family:Lora,Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;color:#F2E6CE;padding-bottom:14px;">Bienvenue${prenom ? ', ' + esc(prenom) : ''}.</div>
<div style="font-family:Lora,Georgia,serif;font-style:italic;font-size:17px;line-height:1.6;color:#E8E2D4;">${C.chapo}</div>`, true)}
${pan(`${sur('Étape 1 · votre questionnaire')}
${p(C.consigne)}
${note ? `<div style="background-color:#1B2F4C;border-left:2px solid #C9A227;border-radius:5px;padding:14px 16px;margin:0 0 16px;font-family:Poppins,Arial,sans-serif;font-weight:300;font-size:14.5px;line-height:1.65;color:#E8E2D4;">${note}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 10px;"><tr><td align="center" bgcolor="#C9A227" style="border-radius:8px;"><a href="${lien}" style="display:block;padding:16px 14px;font-family:Poppins,Arial,sans-serif;font-weight:500;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:#0E1B2E;text-decoration:none;">Remplir mon questionnaire</a></td></tr></table>
<div style="font-family:Poppins,Arial,sans-serif;font-size:13px;line-height:1.6;color:#A9B8CA;text-align:center;">${C.duree} Vos réponses s’enregistrent au fur et à mesure sur l’appareil où vous les commencez : reprenez sur le même pour retrouver où vous en étiez.</div>`)}
${pan(`${sur('La suite')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${etapes}</table>
${p('Une question d’ici là ? Répondez simplement à ce message, je réponds à chacun.', 'padding-bottom:0;')}`)}
<tr><td style="padding:6px 4px 0;font-family:Lora,Georgia,serif;font-size:17px;line-height:1.6;color:#F2E6CE;text-align:center;">Xavier<br><span style="font-family:Poppins,Arial,sans-serif;font-size:12px;color:#A9B8CA;">Le Cartographe, Guadeloupe</span></td></tr>
<tr><td align="center" style="padding:30px 0 0;font-family:Poppins,Arial,sans-serif;font-size:12px;letter-spacing:.15em;color:#A9B8CA;">Respire · Écoute · Agis</td></tr>
<tr><td align="center" style="padding:14px 0 0;font-family:Poppins,Arial,sans-serif;font-size:11px;line-height:1.6;color:#6F7F95;">Vous recevez ce message parce que vous venez de régler ${esc(nom)}. Votre reçu et votre facture vous sont envoyés séparément par Stripe.</td></tr>
</table></td></tr></table></body></html>`;

  const texte = `${nom} · paiement reçu\n\nBienvenue${prenom ? ', ' + prenom : ''}.\n${C.chapo}\n\nÉtape 1 : votre questionnaire\n${C.consigne}\n${note ? '\n' + note + '\n' : ''}\nRemplir mon questionnaire : ${lien}\n${C.duree}\n\nLa suite\n${C.suite.map(([t, d]) => '· ' + t + ' : ' + d).join('\n')}\n\nUne question ? Répondez simplement à ce message.\n\nXavier\nLe Cartographe, Guadeloupe`;

  return { sujet: C.sujet, html, texte };
}

// ---------- Stripe ----------
function signatureValide(brut, entete, secret) {
  if (!entete || !secret) return false;
  const parts = Object.fromEntries(entete.split(',').map((x) => x.split('=')).filter((x) => x.length === 2).map(([k, v]) => [k, v]));
  const t = parts.t;
  const v1s = entete.split(',').filter((x) => x.startsWith('v1=')).map((x) => x.slice(3));
  if (!t || !v1s.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 600) return false;
  const attendu = crypto.createHmac('sha256', secret).update(`${t}.${brut}`, 'utf8').digest('hex');
  return v1s.some((v) => v.length === attendu.length && crypto.timingSafeEqual(Buffer.from(v), Buffer.from(attendu)));
}

// ---------- Brevo ----------
async function brevo(cle, chemin, methode = 'GET', corps) {
  const r = await fetch('https://api.brevo.com/v3' + chemin, {
    method: methode,
    headers: { 'content-type': 'application/json', accept: 'application/json', 'api-key': cle },
    body: corps ? JSON.stringify(corps) : undefined
  });
  const txt = await r.text();
  let json = null; try { json = txt ? JSON.parse(txt) : null; } catch { json = null; }
  return { ok: r.ok, status: r.status, json, txt };
}

let LISTE_CLIENTS = null;
async function listeClients(cle) {
  if (LISTE_CLIENTS) return LISTE_CLIENTS;
  const l = await brevo(cle, '/contacts/lists?limit=50&offset=0');
  const trouvee = (l.json?.lists || []).find((x) => x.name === 'Clients');
  if (trouvee) return (LISTE_CLIENTS = trouvee.id);
  const dossier = (l.json?.lists || [])[0]?.folderId || 1;
  const c = await brevo(cle, '/contacts/lists', 'POST', { name: 'Clients', folderId: dossier });
  if (c.ok && c.json?.id) return (LISTE_CLIENTS = c.json.id);
  console.error('Liste Clients : ' + c.status + ' ' + c.txt);
  return null;
}

const ATTRIBUTS = [['CLIENT', 'text'], ['OFFRE_ACHAT', 'text'], ['DATE_ACHAT', 'date'], ['SESSION_ACHAT', 'text']];
async function creerAttributs(cle) {
  for (const [nom, type] of ATTRIBUTS) await brevo(cle, '/contacts/attributes/normal/' + nom, 'POST', { type });
}

const majuscule = (s) => s ? s.charAt(0).toLocaleUpperCase('fr-FR') + s.slice(1).toLocaleLowerCase('fr-FR') : '';

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const cle = process.env.BREVO_API_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!cle || !secret) { console.error('BREVO_API_KEY ou STRIPE_WEBHOOK_SECRET absente'); return new Response('{}', { status: 500 }); }

  const brut = await req.text();
  if (!signatureValide(brut, req.headers.get('stripe-signature'), secret)) return new Response('signature', { status: 400 });

  const ev = JSON.parse(brut);
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(ev.type)) return new Response('{}', { status: 200 });
  const s = ev.data?.object || {};
  if (s.payment_status !== 'paid') return new Response('{}', { status: 200 }); // paiement différé : on attend async_payment_succeeded

  const lien = LIENS[s.payment_link];
  if (!lien) { console.log('Lien de paiement inconnu : ' + s.payment_link); return new Response('{}', { status: 200 }); }

  const email = String(s.customer_details?.email || s.customer_email || '').trim().toLowerCase();
  if (!email) { console.error('Session sans e-mail : ' + s.id); return new Response('{}', { status: 200 }); }

  // contact existant ? (prénom du quiz, et anti-doublon si Stripe renvoie le même événement)
  const existant = await brevo(cle, '/contacts/' + encodeURIComponent(email));
  const attrs = existant.ok ? (existant.json?.attributes || {}) : {};
  if (attrs.SESSION_ACHAT === s.id) return new Response('{"deja":true}', { status: 200 });

  const nomStripe = String(s.customer_details?.name || '').trim();
  const prenom = attrs.PRENOM || majuscule(nomStripe.split(/\s+/)[0] || '');

  const attributes = {
    CLIENT: 'oui',
    OFFRE_ACHAT: lien.offre,
    DATE_ACHAT: new Date((s.created || Date.now() / 1000) * 1000).toISOString().slice(0, 10)
  };
  if (!attrs.PRENOM && prenom) attributes.PRENOM = prenom;
  if (!attrs.NOM && nomStripe.includes(' ')) attributes.NOM = nomStripe.split(/\s+/).slice(1).join(' ');

  const idListe = await listeClients(cle);
  const fiche = { email, attributes, updateEnabled: true, ...(idListe ? { listIds: [idListe] } : {}) };
  let r = await brevo(cle, '/contacts', 'POST', fiche);
  if (!r.ok) { await creerAttributs(cle); r = await brevo(cle, '/contacts', 'POST', fiche); }
  if (!r.ok) console.error('Contact : ' + r.status + ' ' + r.txt); // on envoie quand même le mail

  const m = mailBienvenue({ ...lien, prenom });
  const envoi = await brevo(cle, '/smtp/email', 'POST', {
    sender: { name: 'Le Cartographe', email: XAVIER },
    to: [{ email, name: nomStripe || email }],
    replyTo: { email: XAVIER, name: 'Xavier Bolbec' },
    subject: m.sujet,
    htmlContent: m.html,
    textContent: m.texte,
    tags: ['bienvenue', lien.offre]
  });
  if (!envoi.ok) { console.error('Bienvenue : ' + envoi.status + ' ' + envoi.txt); return new Response('{}', { status: 502 }); } // Stripe réessaiera

  // noté seulement une fois le mail parti : si l'envoi échoue, Stripe réessaie et le mail repart
  const note = await brevo(cle, '/contacts/' + encodeURIComponent(email), 'PUT', { attributes: { SESSION_ACHAT: s.id } });
  if (!note.ok) console.error('Session : ' + note.status + ' ' + note.txt);

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
};
