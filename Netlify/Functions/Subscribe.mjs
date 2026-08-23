const LISTE = 3;
const TEXTE = ['PRENOM','CHEMIN_VIE','ANNEE_PERSO','SIGNE','RELIEF','PORTE','DUREE','MOUVEMENT','ENJEU','PHRASE'];
const DATES = ['DATE_NAISSANCE','DATE_BASCULE'];

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const cle = process.env.BREVO_API_KEY;
  if (!cle) { console.error('BREVO_API_KEY absente'); return new Response('{}', { status: 500 }); }

  const d = await req.json().catch(() => null);
  if (!d || !d.email) return new Response('{}', { status: 400 });

  const attributes = {};
  for (const c of TEXTE) if (d[c] != null && String(d[c]).trim()) attributes[c] = String(d[c]).trim();
  for (const c of DATES) if (/^\d{4}-\d{2}-\d{2}$/.test(d[c] || '')) attributes[c] = d[c];
  attributes.SOURCE = 'releve-express';
  attributes.DATE_RELEVE = new Date().toISOString().slice(0, 10);

  const rep = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'api-key': cle },
    body: JSON.stringify({ email: d.email.trim().toLowerCase(), attributes, listIds: [LISTE], updateEnabled: true })
  });

  if (!rep.ok) { console.error('Brevo ' + rep.status + ' : ' + await rep.text()); return new Response('{}', { status: 502 }); }
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
