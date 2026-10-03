// Fichier temporaire, retiré du dépôt juste après usage.
// Corrige trois phrases des mails 2 et 4 (modèles Brevo 15 et 17). Idempotent.
const CHANTIERS = [
  { id: 15, subject: ['{{ contact.PRENOM }}, une seule question', 'Une seule question'],
    html: [['Ce regret a déjà commencé&nbsp;: c’est lui qui vous a fait répondre à ces onze questions.', 'Si ce regret est déjà là, il ne partira pas tout seul.']] },
  { id: 17, html: [['Le risque est de mon côté, pas du vôtre.', 'Vous ne payez donc pas une lecture qui vous laisse dans le flou.']] }
];
export default async () => {
  const cle = process.env.BREVO_API_KEY;
  if (!cle) return;
  const h = { 'content-type': 'application/json', accept: 'application/json', 'api-key': cle };
  for (const c of CHANTIERS) {
    const r = await fetch(`https://api.brevo.com/v3/smtp/templates/${c.id}`, { headers: h });
    if (!r.ok) { console.error('lecture', c.id, r.status); continue; }
    const t = await r.json(); const maj = {};
    let html = t.htmlContent;
    for (const [a, b] of c.html) if (html.includes(a)) html = html.split(a).join(b);
    if (html !== t.htmlContent) maj.htmlContent = html;
    if (c.subject && t.subject === c.subject[0]) maj.subject = c.subject[1];
    if (!Object.keys(maj).length) { console.log(c.id, 'deja corrige'); continue; }
    const w = await fetch(`https://api.brevo.com/v3/smtp/templates/${c.id}`, { method: 'PUT', headers: h, body: JSON.stringify(maj) });
    console.log(c.id, 'ecriture', w.status);
  }
};
export const config = { schedule: '* * * * *' };
