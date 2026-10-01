/* Questionnaires du Cartographe · contenu
   Règle : aucune question n'annonce ce qu'elle mesure. Une question par idée.
   Santé et terrain sentimental hors périmètre. Faits, gestes et dates plutôt qu'opinions. */

var ETAT_CIVIL = {
  titre: 'Pour établir votre lecture',
  intro: 'Ces informations servent au calcul. Recopiez-les telles qu’elles figurent sur votre acte de naissance.',
  questions: [
    {id:'prenom_usage', type:'text', label:'Le prénom que vous utilisez au quotidien', requis:true, auto:'given-name'},
    {id:'email', type:'email', label:'Votre adresse électronique', aide:'Celle utilisée lors du paiement, pour que je vous retrouve.', requis:true, auto:'email'},
    {id:'etat_civil', type:'text', label:'Tous vos prénoms et votre nom de naissance, dans l’ordre exact de l’acte de naissance', aide:'Par exemple : Marie Louise Josette Dupont. Tous les prénoms comptent, même ceux que vous n’utilisez jamais.', requis:true},
    {id:'nom_usage', type:'text', label:'Le nom que vous portez au quotidien, s’il diffère, et depuis quelle année', aide:'Nom marital, nom d’usage. Laissez vide si c’est le même.'},
    {id:'naissance_date', type:'date', label:'Votre date de naissance', requis:true},
    {id:'naissance_heure', type:'heure', label:'Votre heure de naissance', aide:'Celle de l’acte de naissance intégral, que la mairie de votre lieu de naissance délivre gratuitement, souvent en ligne. Si vous ne la connaissez pas, cochez la case : ne l’estimez pas.'},
    {id:'naissance_lieu', type:'text', label:'Votre commune et votre pays de naissance', requis:true}
  ]
};

var Q = {};

/* ================= LE RELEVÉ ================= */
Q.releve = {
  nom: 'Le Relevé',
  duree: 'Environ 15 minutes',
  chapo: 'Répondez court et concret. Ce que vous ne savez pas, laissez-le vide plutôt que de l’approximer. Vos réponses s’enregistrent au fur et à mesure sur cet appareil : vous pouvez vous arrêter et reprendre plus tard.',
  sections: [
    {titre:ETAT_CIVIL.titre, intro:ETAT_CIVIL.intro, questions:ETAT_CIVIL.questions.filter(function(q){return q.id!=='naissance_heure';})},
    {titre:'Votre projet', intro:'Celui qui vous a amené ici.', questions:[
      {id:'projet', type:'textarea', lignes:3, label:'Le projet que vous repoussez, en une phrase, tel que vous le diriez à quelqu’un de proche', requis:true},
      {id:'projet_depuis', type:'text', label:'Depuis quand y pensez-vous ? L’année, et si possible le mois', requis:true},
      {id:'tentative', type:'textarea', lignes:6, label:'Racontez la dernière fois où vous avez failli vous y mettre. Que s’est-il passé, du début à la fin ?', aide:'Racontez comme vous le feriez à voix haute. Les détails comptent plus que l’explication.', requis:true},
      {id:'deja_fait', type:'textarea', lignes:4, label:'Qu’avez-vous déjà fait pour ce projet, même de petit ? Une ligne par chose, avec une date approximative'},
      {id:'pari', type:'textarea', lignes:3, label:'Si vous deviez parier sur la manière dont vous allez encore le repousser, vous parieriez sur quoi ?', requis:true}
    ]},
    {titre:'Votre rythme', intro:'Tel qu’il est, pas tel qu’il devrait être.', questions:[
      {id:'hier', type:'textarea', lignes:6, label:'Décrivez votre journée d’hier, du réveil au coucher, heure par heure si vous le pouvez', requis:true},
      {id:'heures', type:'text', label:'Combien d’heures par semaine pourriez-vous réellement consacrer à ce projet ?', aide:'Le chiffre honnête, pas le chiffre souhaité.', requis:true},
      {id:'cout_12mois', type:'textarea', lignes:3, label:'Qu’est-ce qui vous a le plus coûté ces douze derniers mois ? Un fait, pas un sentiment'}
    ]},
    {titre:'Votre histoire', intro:'Quelques repères, sans avoir à vous justifier.', questions:[
      {id:'annees', type:'text', label:'Trois années de votre vie qui ont compté. Ne dites pas pourquoi', requis:true},
      {id:'gestes', type:'textarea', lignes:5, label:'Quand vous avez un choix important à faire, que faites-vous concrètement avant de trancher ?', aide:'Décrivez les gestes, pas l’état d’esprit : à qui vous parlez, ce que vous lisez, où vous êtes, combien de temps cela prend.', requis:true},
      {id:'decision_fiere', type:'textarea', lignes:5, label:'Racontez une décision que vous avez prise et dont vous êtes content aujourd’hui. Comment l’avez-vous prise ?'},
      {id:'entourage', type:'textarea', lignes:3, label:'Qu’est-ce que votre entourage vous répète à votre sujet, que vous n’êtes pas sûr d’accepter ?'},
      {id:'arrete', type:'textarea', lignes:3, label:'Un projet que vous avez arrêté alors qu’il fonctionnait. Lequel, et en quelle année ?'}
    ]},
    {titre:'Le cadre', intro:'Pour que votre premier pas tienne dans votre vie réelle.', questions:[
      {id:'ne_bouge_pas', type:'textarea', lignes:3, label:'Qu’est-ce qui ne doit pas bouger, quoi que vous décidiez ?', aide:'Un engagement, un revenu, un lieu, un horaire.'},
      {id:'non_demande', type:'textarea', lignes:4, label:'Il reste quelque chose que ces questions n’ont pas demandé. Écrivez-le ici'}
    ]}
  ]
};

/* ================= LA CARTOGRAPHIE ================= */
var CARTO_SECTIONS = [
  {titre:'Pour établir votre lecture', intro:ETAT_CIVIL.intro, questions:ETAT_CIVIL.questions.concat([
    {id:'nom_public', type:'text', label:'Un pseudonyme, un nom de scène ou un nom commercial que vous portez publiquement, et depuis quand', aide:'Laissez vide si vous n’en avez pas.'},
    {id:'residence', type:'text', label:'Où vivez-vous aujourd’hui, et depuis quelle année ?', requis:true}
  ])},
  {titre:'Votre projet', intro:'Celui qui vous a amené ici.', questions:[
    {id:'projet', type:'textarea', lignes:3, label:'Le projet que vous repoussez, en une phrase, tel que vous le diriez à quelqu’un de proche', requis:true},
    {id:'projet_depuis', type:'text', label:'Depuis quand y pensez-vous ? L’année, et si possible le mois', requis:true},
    {id:'tentative', type:'textarea', lignes:6, label:'Racontez la dernière fois où vous avez failli vous y mettre. Que s’est-il passé, du début à la fin ?', aide:'Racontez comme vous le feriez à voix haute. Les détails comptent plus que l’explication.', requis:true},
    {id:'deja_fait', type:'textarea', lignes:4, label:'Qu’avez-vous déjà fait pour ce projet, même de petit ? Une ligne par chose, avec une date approximative'},
    {id:'premiere_pierre', type:'textarea', lignes:3, label:'À quoi verrez-vous, concrètement, que la première pierre est posée ?', aide:'Un fait que quelqu’un d’autre pourrait constater : un dossier envoyé, une inscription faite, un premier client, une date fixée.', requis:true},
    {id:'dix_huit_mois', type:'textarea', lignes:4, label:'Si rien ne change d’ici dix-huit mois, à quoi ressemble votre vie ?'},
    {id:'pari', type:'textarea', lignes:3, label:'Si vous deviez parier sur la manière dont vous allez encore le repousser, vous parieriez sur quoi ?', requis:true}
  ]},
  {titre:'Votre rythme', intro:'Tel qu’il est, pas tel qu’il devrait être.', questions:[
    {id:'semaine', type:'textarea', lignes:7, label:'Décrivez une semaine ordinaire, jour par jour, en une ligne par jour', requis:true},
    {id:'lever', type:'text', label:'À quelle heure vous levez-vous quand personne ne vous l’impose ?'},
    {id:'moment_cout', type:'textarea', lignes:3, label:'Quel moment de la semaine vous coûte le plus ? Lequel vous redonne de l’élan ?'},
    {id:'heures_choix', type:'text', label:'Sur une semaine, combien d’heures vont à ce qui vous fait vivre, et combien à ce que vous avez choisi ?'},
    {id:'tient_effort', type:'textarea', lignes:3, label:'Qu’est-ce qui, dans votre organisation actuelle, ne tient que parce que vous y remettez de l’effort chaque semaine ?'},
    {id:'heures', type:'text', label:'Sur les trente prochains jours, combien d’heures par semaine pourrez-vous réellement consacrer à ce projet ?', aide:'Le chiffre honnête, pas le chiffre souhaité. Votre plan sera bâti dessus.', requis:true}
  ]},
  {titre:'Votre histoire', intro:'Quelques repères, sans avoir à vous justifier.', questions:[
    {id:'annees', type:'text', label:'Cinq années de votre vie qui ont compté. Ne dites pas pourquoi', requis:true},
    {id:'annee_refaire', type:'text', label:'Parmi ces années, laquelle referiez-vous à l’identique ?'},
    {id:'annee_subie', type:'textarea', lignes:3, label:'Quelle année vous a fait changer de direction sans que vous l’ayez choisi ?'},
    {id:'premier_argent', type:'textarea', lignes:2, label:'Quel âge aviez-vous la première fois que vous avez gagné de l’argent par vous-même, et comment ?'},
    {id:'metier_12', type:'text', label:'Quel métier vouliez-vous faire à douze ans ?'},
    {id:'parents', type:'textarea', lignes:3, label:'Qu’est-ce que vos parents attendaient de vous, explicitement ?'},
    {id:'entourage', type:'textarea', lignes:3, label:'Qu’est-ce que votre entourage vous répète à votre sujet, que vous n’acceptez pas ?'},
    {id:'don', type:'textarea', lignes:3, label:'Quelle est la chose que vous savez faire et que vous donnez sans jamais la compter ?'},
    {id:'arrete', type:'textarea', lignes:3, label:'Qu’avez-vous arrêté alors que cela fonctionnait, et en quelle année ?'},
    {id:'reussite_vide', type:'textarea', lignes:3, label:'Quelle réussite ne vous a rien fait ?'},
    {id:'echec_argument', type:'textarea', lignes:3, label:'Quel échec vous sert encore d’argument aujourd’hui ?'}
  ]},
  {titre:'Votre terrain', intro:'Ce qui vous entoure, côté travail et entourage.', questions:[
    {id:'decide_avec', type:'textarea', lignes:3, label:'Qui décide avec vous, et sur quoi exactement ?'},
    {id:'compte_sur', type:'textarea', lignes:3, label:'Qui compte sur vous au quotidien, à quel titre, et qui prend le relais en votre absence ?'},
    {id:'relation_cout', type:'textarea', lignes:3, label:'Quelle relation de travail ou d’entourage vous coûte le plus aujourd’hui ?'},
    {id:'relation_porte', type:'textarea', lignes:3, label:'Laquelle vous porte, et qu’est-ce qu’elle vous apporte que vous ne trouvez pas ailleurs ?'},
    {id:'ressources', type:'textarea', lignes:3, label:'De quoi disposez-vous déjà et que vous n’utilisez pas ?', aide:'Un lieu, une compétence, un diplôme, une épargne, un réseau, du temps.'},
    {id:'contraintes_30j', type:'textarea', lignes:3, label:'Quelles contraintes fermes tombent dans les trente prochains jours ? Avec leurs dates', aide:'Une échéance, un déplacement, un examen, un événement familial, une saison chargée.'},
    {id:'activite', type:'choix', label:'Dirigez-vous une activité à votre compte, ou une entreprise ?', options:['Oui','Non'], requis:true},
    {id:'activite_equipe', type:'textarea', lignes:3, label:'Avec qui travaillez-vous, et à quel statut ?', si:{id:'activite', val:'Oui'}},
    {id:'activite_absence', type:'textarea', lignes:2, label:'Qui tranche en votre absence ?', si:{id:'activite', val:'Oui'}},
    {id:'activite_client', type:'text', label:'Quelle part de vos revenus repose sur un seul client ?', si:{id:'activite', val:'Oui'}}
  ]},
  {titre:'Votre manière de décider', intro:'Les dernières questions, les plus importantes.', questions:[
    {id:'gestes', type:'textarea', lignes:5, label:'Quand vous avez un choix important à faire, que faites-vous concrètement avant de trancher ?', aide:'Décrivez les gestes, pas l’état d’esprit : à qui vous parlez, ce que vous lisez, où vous êtes, combien de temps cela prend.', requis:true},
    {id:'decision_fiere', type:'textarea', lignes:5, label:'Racontez une décision que vous avez prise et dont vous êtes content aujourd’hui. Comment l’avez-vous prise ?'},
    {id:'bonne_decision', type:'textarea', lignes:3, label:'À quoi reconnaissez-vous qu’une décision était bonne ?'},
    {id:'pas_change', type:'textarea', lignes:3, label:'Sur quoi refusez-vous qu’on vous fasse changer d’avis ?'},
    {id:'reserve', type:'textarea', lignes:3, label:'Sur quel sujet ne voulez-vous pas que je m’avance ?', aide:'Votre réponse sera respectée, sans discussion.'},
    {id:'non_demande', type:'textarea', lignes:4, label:'Il reste quelque chose que ce questionnaire n’a pas demandé. Écrivez-le ici'}
  ]}
];

Q.cartographie = {
  nom: 'La Cartographie',
  duree: 'Environ 40 minutes',
  chapo: 'Prenez-le sur un moment calme. Aucune réponse n’est meilleure qu’une autre, et les questions courtes demandent une réponse courte. Vos réponses s’enregistrent au fur et à mesure sur cet appareil : vous pouvez vous arrêter et reprendre plus tard.',
  sections: CARTO_SECTIONS
};

/* ================= LE CAP : Cartographie + fiche de départ scellée ================= */
Q.cap = {
  nom: 'Le Cap',
  duree: 'Environ 50 minutes',
  chapo: Q.cartographie.chapo,
  sections: CARTO_SECTIONS.concat([
    {titre:'Votre point de départ', intro:'Cette dernière partie est mise sous scellé. Vous la relirez dans quatre-vingt-dix jours, telle quelle, à côté de ce que vous aurez fait. Répondez avec des chiffres et des dates, pas avec des intentions.', scelle:true, questions:[
      {id:'j0_semaines', type:'textarea', lignes:5, label:'À quoi passent vos semaines aujourd’hui ? Vos engagements réguliers, avec pour chacun un nombre d’heures approximatif', requis:true},
      {id:'j0_revenus', type:'textarea', lignes:3, label:'Vos revenus des trois derniers mois, mois par mois, et d’où ils viennent'},
      {id:'j0_charges', type:'textarea', lignes:3, label:'Vos charges fixes mensuelles, et celles qui vont bouger dans les quatre-vingt-dix jours'},
      {id:'j0_comptent', type:'textarea', lignes:3, label:'Qui compte sur vous aujourd’hui, pour quoi, et à quelle fréquence ?'},
      {id:'j0_heures', type:'text', label:'Sur les quatre-vingt-dix prochains jours, combien d’heures par semaine pourrez-vous réellement consacrer à ce projet ?', requis:true},
      {id:'j0_contraintes', type:'textarea', lignes:3, label:'Quelles contraintes fermes tombent dans ces quatre-vingt-dix jours ? Avec leurs dates'},
      {id:'j0_preuve', type:'textarea', lignes:3, label:'Au quatre-vingt-dixième jour, qu’est-ce qui rendra votre projet impossible à repousser encore ?', aide:'C’est votre point de non-retour. Une phrase, et un fait vérifiable : un engagement signé, un premier client, une date publique, un dossier déposé. Pas un état d’esprit.', requis:true},
      {id:'j0_decrocher', type:'textarea', lignes:3, label:'Qu’est-ce qui va vous faire décrocher ? Vous le savez déjà, nommez-le', requis:true},
      {id:'j0_refus', type:'textarea', lignes:3, label:'Qu’est-ce que vous ne ferez pas, quelles que soient mes recommandations ?'},
      {id:'j0_activite', type:'textarea', lignes:4, label:'Si vous dirigez une activité : chiffre d’affaires des trois derniers mois, nombre de clients actifs et part du plus important, heures travaillées dans une semaine normale', si:{id:'activite', val:'Oui'}}
    ]}
  ])
};
