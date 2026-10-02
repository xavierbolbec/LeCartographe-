// Fichier temporaire : retiré du dépôt juste après usage.
const JETON = '6d8d568a9ed8467ccf614da9';

const COUT = `{% if contact.REVENU == "r200" %}
<p style="margin:0 0 14px 0;">Vous estimiez que ce projet vous rapporterait au moins 200&nbsp;€ par mois. Depuis votre relevé, trois jours ont passé&nbsp;: c’est près de 20&nbsp;€ de plus qui ne sont pas arrivés. Sur trois jours, rien de grave. Sur une année, c’est 2&nbsp;400&nbsp;€.</p>
{% elif contact.REVENU == "r500" %}
<p style="margin:0 0 14px 0;">Vous estimiez que ce projet vous rapporterait au moins 500&nbsp;€ par mois. Depuis votre relevé, trois jours ont passé&nbsp;: c’est près de 50&nbsp;€ de plus qui ne sont pas arrivés. Sur trois jours, rien de grave. Sur une année, c’est 6&nbsp;000&nbsp;€.</p>
{% elif contact.REVENU == "r2000" %}
<p style="margin:0 0 14px 0;">Vous estimiez que ce projet vous rapporterait plus de 2&nbsp;000&nbsp;€ par mois. Depuis votre relevé, trois jours ont passé&nbsp;: c’est déjà 200&nbsp;€ de plus qui ne sont pas arrivés. Sur une année, c’est au moins 24&nbsp;000&nbsp;€.</p>
{% endif %}`;

async function brevo(cle, chemin, options = {}) {
  const rep = await fetch('https://api.brevo.com/v3' + chemin, {
    ...options,
    headers: { 'content-type': 'application/json', 'accept': 'application/json', 'api-key': cle }
  });
  const texte = await rep.text();
  return { ok: rep.ok, status: rep.status, texte };
}

export default async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get('cle') !== JETON) return new Response('Non autorise', { status: 403 });
  const cle = process.env.BREVO_API_KEY;
  if (!cle) return new Response('BREVO_API_KEY absente', { status: 500 });
  const a = url.searchParams.get('a');
  const lignes = [];

  if (a === 'attributs') {
    for (const nom of ['REVENU', 'CAUSE']) {
      const r = await brevo(cle, '/contacts/attributes/normal/' + nom, { method: 'POST', body: JSON.stringify({ type: 'text' }) });
      lignes.push(nom + ' : ' + (r.ok ? 'cree' : (r.status + ' ' + r.texte)));
    }
  } else if (a === 'mail2') {
    const r = await brevo(cle, '/smtp/templates/15');
    if (!r.ok) return new Response('lecture ' + r.status + ' ' + r.texte, { status: 502 });
    let html = JSON.parse(r.texte).htmlContent;
    const avant = html.length;
    const n1 = html.split('neuf questions').length - 1, n2 = html.split('Neuf questions').length - 1;
    html = html.split('neuf questions').join('onze questions').split('Neuf questions').join('Onze questions');
    let insere = 'non';
    if (!html.includes('contact.REVENU')) {
      const reperes = ['L’exercice et la question vous montrent', 'L&rsquo;exercice et la question vous montrent', "L'exercice et la question vous montrent"];
      for (const rep of reperes) {
        const i = html.indexOf(rep);
        if (i > 0) { const debut = html.lastIndexOf('<', i); html = html.slice(0, debut) + COUT + html.slice(debut); insere = 'oui, avant : ' + rep; break; }
      }
    } else insere = 'deja present';
    if (url.searchParams.get('ecrire') === '1') {
      const w = await brevo(cle, '/smtp/templates/15', { method: 'PUT', body: JSON.stringify({ htmlContent: html }) });
      lignes.push('ecriture : ' + w.status + ' ' + w.texte);
    } else lignes.push('simulation seulement');
    lignes.push('neuf questions : ' + n1 + ', Neuf questions : ' + n2 + ', cout insere : ' + insere + ', taille ' + avant + ' -> ' + html.length);
    if (url.searchParams.get('voir') === '1') lignes.push(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(-2600));
  } else lignes.push('action inconnue');

  return new Response(lignes.join('\n'), { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
