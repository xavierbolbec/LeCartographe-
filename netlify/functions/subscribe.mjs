const LISTE = Number(process.env.BREVO_LIST_ID) || 3;
const MODELE = Number(process.env.BREVO_TEMPLATE_ID) || 2;

const TEXTE = ['PRENOM','CHEMIN_VIE','ANNEE_PERSO','SIGNE','RELIEF','PORTE','DUREE','MOUVEMENT','ENJEU','PHRASE'];
const DATES = ['DATE_NAISSANCE','DATE_BASCULE'];
const CONNUS = ['PRENOM','RELIEF','PORTE','SOURCE','DECISION','DATE_RELEVE'];

// ---- BLOC TEMPORAIRE : creation des attributs. A RETIRER une fois fait. ----
const JETON = 'releve-2608-gp';
const A_CREER = [
  ['CHEMIN_VIE','text'], ['ANNEE_PERSO','text'], ['SIGNE','text'],
  ['DUREE','text'], ['MOUVEMENT','text'], ['ENJEU','text'],
  ['PHRASE','text'], ['DATE_NAISSANCE','date'], ['DATE_BASCULE','date']
];

async function creerAttributs(cle) {
  const lignes = [];
  for (const [nom, type] of A_CREER) {
    try {
      const rep = await fetch('https://api.brevo.com/v3/contacts/attributes/normal/' + nom, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'api-key': cle },
        body: JSON.stringify({ type })
      });
      if (rep.ok) lignes.push(nom + ' (' + type + ') : cree');
      else {
        const t = await rep.text();
        lignes.push(/exist/i.test(t) ? nom + ' : existait deja' : nom + ' : ECHEC ' + rep.status + ' - ' + t);
      }
    } catch (e) { lignes.push(nom + ' : ERREUR - ' + e.message); }
  }
  lignes.push('', 'Termine. Retirez maintenant le bloc temporaire de ce fichier.');
  return lignes.join('\n');
}
// ---- FIN DU BLOC TEMPORAIRE ----

const simplifier = (v) =>
  String(v || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/^(le |la |l'|les )/, '')
    .trim();

export default async (req) => {
  const cle = process.env.BREVO_API_KEY;
  if (!cle) { console.error('BREVO_API_KEY absente'); return new Response('{}', { status: 500 }); }

  // Declencheur temporaire des attributs.
  if (req.method === 'GET') {
    const url = new URL(req.url);
    if (url.searchParams.get('cle') === JETON) {
      const rapport = await creerAttributs(cle);
      return new Response(rapport, { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }
    return new Response('Non autorise', { status: 403 });
  }

  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const d = await req.json().catch(() => null);
  if (!d || !d.email) return new Response('{}', { status: 400 });

  const email = d.email.trim().toLowerCase();

  const attributes = {};
  for (const c of TEXTE) if (d[c] != null && String(d[c]).trim()) attributes[c] = String(d[c]).trim();
  for (const c of DATES) if (/^\d{4}-\d{2}-\d{2}$/.test(d[c] || '')) attributes[c] = d[c];
  attributes.SOURCE = 'releve-express';
  attributes.DATE_RELEVE = new Date().toISOString().slice(0, 10);
  if (attributes.PHRASE && !attributes.DECISION) attributes.DECISION = attributes.PHRASE;

  const ecrire = (attrs) => fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'api-key': cle },
    body: JSON.stringify({ email, attributes: attrs, listIds: [LISTE], updateEnabled: true })
  });

  let rep = await ecrire(attributes);

  if (rep.status === 400) {
    console.error('Brevo 400, nouvel essai restreint : ' + await rep.text());
    const sur = {};
    for (const c of CONNUS) if (attributes[c] != null) sur[c] = attributes[c];
    rep = await ecrire(sur);
  }

  if (!rep.ok) {
    console.error('Brevo contacts ' + rep.status + ' : ' + await rep.text());
    return new Response('{}', { status: 502 });
  }

  try {
    const params = {
      PRENOM:   attributes.PRENOM || '',
      RELIEF:   simplifier(attributes.RELIEF),
      PORTE:    simplifier(attributes.PORTE),
      DECISION: attributes.DECISION || ''
    };
    const envoi = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'api-key': cle },
      body: JSON.stringify({ to: [{ email }], templateId: MODELE, params })
    });
    if (!envoi.ok) console.error('Brevo smtp ' + envoi.status + ' : ' + await envoi.text());
    else console.log('Releve envoye a ' + email + ' (relief=' + params.RELIEF + ')');
  } catch (e) {
    console.error('Envoi impossible : ' + e.message);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
