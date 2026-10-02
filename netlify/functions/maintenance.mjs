// Fichier temporaire, retiré du dépôt juste après usage.
// Tâche planifiée idempotente : corrige le mail 2 (modèle Brevo 15).
const ST = "font-family:Poppins,'Segoe UI',Helvetica,Arial,sans-serif;font-weight:300;font-size:15.5px;line-height:1.75;color:#E8E2D4;padding-bottom:14px;text-align:center;";
const COUT = `{% if contact.REVENU == "r200" %}<div style="${ST}">Vous estimiez que ce projet vous rapporterait au moins 200&nbsp;€ par mois. Depuis votre relevé, trois jours ont passé&nbsp;: c’est près de 20&nbsp;€ de plus qui ne sont pas arrivés. Sur trois jours, rien de grave. Sur une année, c’est 2&nbsp;400&nbsp;€.</div>{% elif contact.REVENU == "r500" %}<div style="${ST}">Vous estimiez que ce projet vous rapporterait au moins 500&nbsp;€ par mois. Depuis votre relevé, trois jours ont passé&nbsp;: c’est près de 50&nbsp;€ de plus qui ne sont pas arrivés. Sur trois jours, rien de grave. Sur une année, c’est 6&nbsp;000&nbsp;€.</div>{% elif contact.REVENU == "r2000" %}<div style="${ST}">Vous estimiez que ce projet vous rapporterait plus de 2&nbsp;000&nbsp;€ par mois. Depuis votre relevé, trois jours ont passé&nbsp;: c’est déjà 200&nbsp;€ de plus qui ne sont pas arrivés. Sur une année, c’est au moins 24&nbsp;000&nbsp;€.</div>{% endif %}`;
const REPERE = 'L’exercice et la question vous montrent';

export default async () => {
  const cle = process.env.BREVO_API_KEY;
  if (!cle) return;
  const h = { 'content-type': 'application/json', accept: 'application/json', 'api-key': cle };
  const r = await fetch('https://api.brevo.com/v3/smtp/templates/15', { headers: h });
  if (!r.ok) { console.error('lecture', r.status); return; }
  let html = (await r.json()).htmlContent;
  const aFaire = html.includes('neuf questions') || html.includes('Neuf questions') || !html.includes('contact.REVENU');
  if (!aFaire) { console.log('mail 2 deja corrige'); return; }
  html = html.split('neuf questions').join('onze questions').split('Neuf questions').join('Onze questions');
  if (!html.includes('contact.REVENU')) {
    const i = html.indexOf(REPERE);
    if (i < 0) { console.error('repere introuvable'); return; }
    const d = html.lastIndexOf('<div', i);
    html = html.slice(0, d) + COUT + html.slice(d);
  }
  const w = await fetch('https://api.brevo.com/v3/smtp/templates/15', { method: 'PUT', headers: h, body: JSON.stringify({ htmlContent: html }) });
  console.log('ecriture', w.status, await w.text());
};

export const config = { schedule: '* * * * *' };
