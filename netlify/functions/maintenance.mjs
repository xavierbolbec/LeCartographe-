// Fichier temporaire, retiré du dépôt juste après usage.
// Supprime de Brevo l'inscription injurieuse du 1er octobre 2026 (idempotent : 404 ensuite).
export default async () => {
  const cle = process.env.BREVO_API_KEY;
  if (!cle) return;
  const r = await fetch('https://api.brevo.com/v3/contacts/lah4a9d4r%40mozmail.com', { method: 'DELETE', headers: { 'api-key': cle, accept: 'application/json' } });
  console.log('suppression', r.status);
};
export const config = { schedule: '* * * * *' };
