// Observatoire du TJM freelance par métier — le « moat » de données du site.
//
// Chaque page métier croise UNE donnée de marché sourcée (TJM médian observé
// dans les baromètres publics 2026) avec le net réel calculé par le moteur.
// Les fourchettes sont indicatives et citées ; les nets sont calculés (jamais
// divergents du simulateur). C'est la combinaison « TJM de marché + net après
// impôt par statut » qui rend ces pages uniques et utiles.
//
// Sources des TJM : baromètres freelance 2026 (Malt « barometre-tarifs »,
// Blog du Modérateur, tjmetre.fr). Ordres de grandeur médians, à vérifier sur
// le baromètre Malt pour un chiffrage à jour.

import { TJMS, figuresFor } from "./tjm";
import type { StatutPage } from "../lib/pages";
import { statutsAtTjm } from "../lib/keyTables";

const fmt = (n: number): string => {
  const s = String(Math.round(n));
  return s.length > 3 ? `${s.slice(0, -3)} ${s.slice(-3)}` : s;
};

export const TJM_METIERS_SOURCE =
  "baromètres TJM freelance 2026 (Malt, Blog du Modérateur, tjmetre.fr)";

interface Metier {
  slug: string; // → /tjm-freelance-<slug>
  nom: string; // en milieu de phrase (« un développeur web full-stack »)
  court: string; // pour titre/fil d'Ariane (« développeur web »)
  tjm: number; // TJM médian observé
  bas: number; // bas de fourchette (junior)
  haut: number; // haut de fourchette (senior)
  contexte: string; // 1-2 phrases spécifiques au métier (anti-templating)
  // Prose propre au métier, strictement qualitative (aucun chiffre) : sans elle,
  // deux métiers de même TJM médian produiraient des pages quasi identiques.
  specialites: string; // ce qui fait varier le TJM (spécialités, compétences, certifications)
  missions: string; // types de missions, livrables, clients, régie vs forfait
  progression: string; // trajectoire réaliste du bas vers le haut de la fourchette
}

// Fourchettes indicatives 2026 issues des baromètres publics.
const METIERS: Metier[] = [
  {
    slug: "developpeur-web",
    nom: "développeur web full-stack",
    court: "développeur web",
    tjm: 535,
    bas: 350,
    haut: 900,
    contexte:
      "C'est le métier le plus demandé de la tech freelance : les profils full-stack maîtrisant les frameworks récents (React, Node, TypeScript) tirent les tarifs vers le haut, et les seniors dépassent souvent 700 €/jour.",
    specialites:
      "Le tarif d'un développeur web se joue d'abord sur la profondeur technique et la capacité à tenir un produit de bout en bout. Une expertise reconnue sur un framework front moderne, une solide maîtrise de TypeScript côté serveur, ou la connaissance des enjeux de performance, d'accessibilité et de sécurité applicative, justifient un tarif au-dessus de la médiane. À l'inverse, des intégrations simples sur un CMS ou des sites vitrines se négocient plus bas, car le client les compare à une offre abondante.",
    missions:
      "Les missions vont de la construction d'un produit à partir de zéro pour une jeune entreprise à la reprise d'une application existante chez un grand compte, en passant par la refonte d'un front ou l'écriture d'API. En régie, vous êtes intégré à l'équipe du client et facturé au temps passé, ce qui donne un revenu stable. Au forfait, vous vendez un livrable défini : le prix doit alors absorber les imprévus et les allers-retours, mais il rémunère mieux un freelance qui livre vite.",
    progression:
      "On monte en tarif en passant de l'exécution de tickets à la responsabilité des choix d'architecture. Un profil qui débute prend des tâches cadrées au sein d'une équipe ; avec l'expérience, il porte un produit entier, arbitre la dette technique et accompagne d'autres développeurs. Se spécialiser sur une stack ou un domaine métier précis, plutôt que rester généraliste, ouvre l'accès aux missions les mieux rémunérées.",
  },
  {
    slug: "devops-cloud",
    nom: "ingénieur DevOps / cloud",
    court: "DevOps / cloud",
    tjm: 600,
    bas: 500,
    haut: 800,
    contexte:
      "La rareté des compétences cloud (AWS, Kubernetes, Terraform) maintient les tarifs élevés ; les architectes cloud expérimentés dépassent régulièrement 750 €/jour.",
    specialites:
      "Chez les profils DevOps et cloud, le tarif suit le périmètre de responsabilité. Les certifications d'un fournisseur cloud, la maîtrise de Kubernetes et de l'infrastructure as code, puis des acquis en observabilité ou en sécurité des plateformes, placent un profil au-dessus de la médiane. Celui qui sait concevoir une plateforme complète se facture plus cher que celui qui exécute des déploiements sur un outillage existant. Les environnements réglementés ou à forte disponibilité, où une erreur coûte cher, tirent aussi les tarifs vers le haut.",
    missions:
      "Les missions typiques : migrer des applications vers le cloud, construire des chaînes d'intégration et de livraison continues, industrialiser l'infrastructure ou fiabiliser l'exploitation d'un produit. Beaucoup se déroulent en régie longue au sein d'une équipe plateforme. Les audits d'architecture ou de coûts cloud sont plus courts et se vendent souvent au forfait. Les astreintes et le support de production sont un élément de négociation à part : mieux vaut les cadrer dans le contrat plutôt que les absorber dans le tarif.",
    progression:
      "Le point de départ est l'exécution d'un outillage déjà en place, comme maintenir des pipelines et des déploiements. Le haut de fourchette s'atteint quand vous concevez l'architecture elle-même, choisissez les services et assumez la fiabilité de la production. Une certification cloud, une compétence en sécurité et une référence sur une migration complète accélèrent ce passage.",
  },
  {
    slug: "data-scientist",
    nom: "data scientist",
    court: "data scientist",
    tjm: 645,
    bas: 500,
    haut: 850,
    contexte:
      "L'un des TJM médians les plus hauts de la tech. La maîtrise de la mise en production (MLOps) et des sujets d'intelligence artificielle pousse les seniors au-delà de 800 €/jour.",
    specialites:
      "Dans la data science, ce qui sépare un profil standard d'un profil mieux payé, c'est la distance entre le modèle et son usage. Savoir déployer un modèle et le suivre en production (MLOps), maîtriser le traitement du langage ou l'apprentissage profond, ou connaître le domaine du client (santé, finance, industrie) pèse davantage que la liste des bibliothèques connues. Une formation de recherche, comme un doctorat, aide à décrocher des sujets difficiles, mais le client paie surtout un résultat exploitable.",
    missions:
      "Un data scientist freelance intervient pour cadrer un cas d'usage, prototyper un modèle de prédiction ou de classification, évaluer sa fiabilité puis le transmettre aux équipes qui l'exploiteront. Les phases d'exploration ou de preuve de concept sont courtes et souvent au forfait ; l'industrialisation s'étend plutôt en régie. Un client qui ne dispose pas encore de données propres demandera d'abord un travail de préparation, moins valorisé mais indispensable pour obtenir un bon tarif sur la suite.",
    progression:
      "Un profil débutant applique des méthodes connues sur des données déjà préparées, sous la direction d'un responsable. Pour viser le haut de la fourchette, il faut savoir cadrer le problème avec le métier, justifier ses choix de modélisation et amener un modèle jusqu'à la production. Une spécialité reconnue, en langage naturel ou en séries temporelles par exemple, renforce le positionnement.",
  },
  {
    slug: "data-engineer",
    nom: "data engineer / analyste data",
    court: "data engineer",
    tjm: 600,
    bas: 450,
    haut: 800,
    contexte:
      "Data engineering et analytics (BigQuery, Snowflake, dbt) : demande forte et tarifs proches des data scientists. Hors Île-de-France, comptez environ 9 % de moins sur ces profils.",
    specialites:
      "Le tarif d'un data engineer dépend de la taille et de la criticité des plateformes qu'il sait construire. La maîtrise d'un entrepôt de données cloud, d'outils de transformation et d'orchestration, du traitement en flux avec Kafka ou Spark, puis des bonnes pratiques de qualité et de gouvernance des données, fait la différence. Un profil qui sait maîtriser les coûts et la performance d'une plateforme se facture mieux que celui qui écrit uniquement des requêtes. Le versant analyste, plus proche du reporting, se situe plutôt en bas de la fourchette.",
    missions:
      "Les missions consistent à bâtir des pipelines d'ingestion, modéliser un entrepôt de données, migrer un système décisionnel historique vers le cloud ou fiabiliser des flux existants. Les clients vont de la scale-up qui structure sa donnée au grand groupe qui modernise son système d'information. Les chantiers de migration durent longtemps et se prêtent à la régie ; la mise en place d'un socle de données ou un audit de qualité se vend plus volontiers au forfait.",
    progression:
      "On démarre en maintenant et en enrichissant des pipelines conçus par d'autres. On monte en choisissant l'architecture de la plateforme, en dimensionnant les coûts et en posant des règles de qualité que toute l'équipe suit. Passer de l'analyse à la conception, puis à la conduite de chantiers de migration, est le chemin le plus direct vers le haut de la fourchette.",
  },
  {
    slug: "product-manager",
    nom: "product manager / chef de projet digital",
    court: "product manager",
    tjm: 595,
    bas: 450,
    haut: 800,
    contexte:
      "Le TJM médian d'un product manager ou chef de projet digital est solide, mais très dépendant du secteur client : une scale-up bien financée paie souvent mieux qu'un grand compte traditionnel.",
    specialites:
      "En product management, le tarif reflète la responsabilité sur les résultats plus que la maîtrise d'outils. Un profil qui a lancé et fait grandir un produit, qui sait arbitrer entre des demandes concurrentes et parler aux équipes techniques comme à la direction, se facture au-dessus de la médiane. L'expérience dans un domaine précis (paiement, marketplace, logiciel pour entreprises) compte beaucoup. Un chef de projet digital qui coordonne surtout des délais et des prestataires se situe plus bas qu'un product manager qui définit la stratégie du produit.",
    missions:
      "Les missions typiques : structurer la démarche produit d'une jeune entreprise, prendre en charge un produit en l'absence de responsable, cadrer un lancement ou piloter une refonte. Elles se déroulent presque toujours en régie, intégrées à l'équipe, sur plusieurs mois. Les missions de cadrage ou de conseil en organisation produit sont plus courtes. Le client juge la valeur sur l'impact apporté, ce qui permet de défendre un tarif plus élevé quand vous pouvez montrer des résultats passés.",
    progression:
      "Un profil qui débute gère un périmètre limité, rédige des spécifications et suit la réalisation. Le haut de la fourchette est réservé à ceux qui définissent la vision du produit, fixent les priorités et rendent des comptes sur les résultats. Documenter vos lancements passés et leur effet sur l'activité du client est l'argument le plus solide en négociation.",
  },
  {
    slug: "consultant-strategie",
    nom: "consultant en stratégie / management de transition",
    court: "consultant stratégie",
    tjm: 650,
    bas: 450,
    haut: 950,
    contexte:
      "La fourchette est large : un consultant junior tourne autour de 450 €/jour, tandis que les managers de transition atteignent couramment 1 000 à 1 200 €/jour.",
    specialites:
      "Le TJM d'un consultant en stratégie ou en transition dépend de la séniorité du poste occupé et de la confiance accordée par la direction. Un parcours d'ancien dirigeant ou d'ancien consultant d'un cabinet reconnu, une expertise sectorielle pointue (énergie, santé, distribution) ou une expérience de redressement, de fusion ou de réorganisation justifient les tarifs les plus hauts. Le conseil généraliste sans spécialité claire se vend plus difficilement, car le client le compare à l'offre des grands cabinets.",
    missions:
      "Les missions vont de l'étude de marché ou du plan stratégique, livré sous forme de recommandations, au management de transition, où vous dirigez une activité ou conduisez un changement pendant une période définie. Les études se vendent plutôt au forfait, sur un livrable précis. Le management de transition se facture au jour, en régie, et se négocie en fonction du niveau de responsabilité et de l'urgence du besoin.",
    progression:
      "Un consultant qui débute travaille sur des analyses cadrées par un associé ou un client. Il monte en tarif en assumant des décisions : présenter directement au comité de direction, conduire un changement jusqu'à son terme, puis être sollicité pour des postes de direction temporaire. Une réputation dans un secteur précis et le bouche-à-oreille entre dirigeants pèsent souvent autant que les plateformes de mise en relation.",
  },
  {
    slug: "consultant-marketing",
    nom: "consultant marketing digital",
    court: "consultant marketing",
    tjm: 590,
    bas: 350,
    haut: 800,
    contexte:
      "Le baromètre Malt situe le TJM médian d'un consultant marketing confirmé autour de 590 €/jour, avec des juniors vers 310 € et des seniors autour de 780 € et plus.",
    specialites:
      "Le marketing digital regroupe des métiers très différents, et la spécialité explique l'essentiel de l'écart. L'acquisition payante, l'automatisation du marketing, l'analyse de données et la stratégie de marque ne se facturent pas de la même façon. Un consultant qui sait relier ses actions à des résultats mesurables (prospects, ventes, fidélisation) et qui maîtrise les outils d'analyse se positionne plus haut qu'un exécutant de campagnes. La connaissance d'un secteur, comme le logiciel en ligne ou l'e-commerce, est aussi valorisée.",
    missions:
      "Un consultant marketing audite une stratégie existante, structure l'acquisition d'une jeune entreprise, met en place des outils d'automatisation ou accompagne une équipe interne pendant quelques mois. Les audits et les ateliers sont courts et se vendent bien au forfait. L'accompagnement de longue durée, comme le pilotage de campagnes, se prête à la régie ou à un forfait mensuel. Un client qui attend un résultat chiffré négociera plus durement qu'un client qui achète du temps d'expertise.",
    progression:
      "Au début, on exécute des actions décidées par d'autres : paramétrage de campagnes, rédaction, reporting. La progression passe par le choix d'un domaine où l'on obtient des résultats prouvables, puis par la capacité à construire la stratégie, répartir un budget et convaincre une direction. Des études de cas avant-après, présentées sans exagération, valent plus qu'une liste d'outils.",
  },
  {
    slug: "consultant-seo",
    nom: "consultant SEO / acquisition",
    court: "consultant SEO",
    tjm: 450,
    bas: 350,
    haut: 650,
    contexte:
      "Les tarifs SEO sont plus accessibles que le développement, mais les experts en SEO technique ou en data SEO montent au-delà de 600 €/jour.",
    specialites:
      "En SEO, le tarif distingue le conseil éditorial du travail technique. L'audit technique de grands sites, la gestion des migrations, l'analyse des journaux serveur, l'automatisation par script ou la maîtrise des données de recherche placent un consultant plus haut qu'un accompagnement centré sur la rédaction et les mots-clés. Une expérience sur des sites comptant énormément de pages, ou sur plusieurs langues, est précieuse. Le client juge surtout la capacité à expliquer les priorités aux développeurs et à la direction.",
    missions:
      "Les missions courantes sont l'audit de référencement, la refonte d'un site sans perte de visibilité, la définition d'une stratégie de contenus et la formation d'équipes internes. L'audit est un livrable court et se vend au forfait. Le suivi mensuel prend la forme d'un accompagnement régulier. Comme les effets du SEO mettent du temps à apparaître et dépendent aussi du moteur de recherche, un engagement de résultat est risqué : mieux vaut vendre une méthode et un plan d'action.",
    progression:
      "Un débutant produit des audits à partir de listes de contrôle et rédige des recommandations. Le haut de la fourchette est atteint quand on traite les problèmes techniques complexes, qu'on dialogue d'égal à égal avec les développeurs et qu'on relie le référencement aux objectifs de l'entreprise. Un site personnel ou des cas clients documentés servent de preuve concrète de compétence.",
  },
  {
    slug: "designer-ux-ui",
    nom: "designer UX/UI",
    court: "designer UX/UI",
    tjm: 450,
    bas: 300,
    haut: 650,
    contexte:
      "En design produit, les juniors démarrent autour de 300 €/jour ; les seniors dotés d'un vrai portfolio produit et de compétences en design system dépassent 550 €.",
    specialites:
      "Un designer UX/UI se fait payer davantage quand son travail va au-delà de l'écran. La recherche utilisateur, la conception de systèmes de design partagés avec les développeurs, le design de produits complexes comme les outils professionnels, et l'aisance en prototypage ou en tests d'usage font monter le tarif. Un profil purement graphique, qui livre des maquettes sans lien avec la réalité du produit, se négocie plus bas. La qualité du portfolio compte plus ici que les diplômes.",
    missions:
      "Les missions typiques sont la conception d'un parcours d'application mobile ou web, la refonte d'une interface vieillissante, la création ou l'évolution d'un design system, ou la conduite d'entretiens et de tests avec des utilisateurs. Les sprints de conception se vendent au forfait avec des livrables clairs ; l'intégration dans une équipe produit se fait en régie. Précisez le nombre d'itérations dans le devis, sinon les retours successifs rognent votre rémunération réelle.",
    progression:
      "Un designer qui débute produit des écrans à partir d'un brief précis. Il monte en tarif en prenant en charge le problème avant la maquette : comprendre les utilisateurs, justifier ses choix devant une équipe et mesurer l'effet de ses décisions. Des études de cas détaillées, montrant le raisonnement autant que le résultat final, sont la base d'une négociation réussie.",
  },
  {
    slug: "expert-cybersecurite",
    nom: "expert en cybersécurité",
    court: "expert cybersécurité",
    tjm: 650,
    bas: 520,
    haut: 900,
    contexte:
      "La pénurie de profils place la cybersécurité parmi les TJM les plus hauts ; le pentest et la gouvernance sécurité se situent au sommet de la fourchette.",
    specialites:
      "En cybersécurité, le tarif suit le niveau de responsabilité et la rareté de la spécialité. Les tests d'intrusion, la réponse à incident, l'architecture de sécurité cloud, la sécurité des applications et la conformité (normes ISO, cadre réglementaire européen) ne s'adressent pas aux mêmes clients. Les certifications reconnues du domaine rassurent les directions et sont souvent exigées dans les appels d'offres. Les profils qui gèrent une crise, ou qui conseillent la direction sur le risque, se situent en haut de fourchette.",
    missions:
      "Un expert intervient pour auditer un système, conduire des tests d'intrusion, mettre en place une démarche de gouvernance ou accompagner une certification, et parfois pour gérer une crise après une attaque. Les audits et tests sont des missions courtes au forfait, avec un rapport comme livrable. Le pilotage d'un programme de sécurité s'étend sur la durée en régie. Les missions d'urgence se facturent plus cher, car la disponibilité immédiate fait partie de la prestation.",
    progression:
      "Un débutant réalise des audits cadrés et applique des référentiels. Il monte en tarif en prenant la responsabilité d'un périmètre complet, en menant des interventions sensibles et en parlant le langage du risque à la direction. Les certifications du métier et les retours d'expérience sur des incidents réels, présentés dans le respect de la confidentialité des clients, ouvrent les missions les mieux rémunérées.",
  },
];

function makeMetierPage(m: Metier, prev?: Metier, next?: Metier): StatutPage {
  const f = figuresFor(m.tjm);
  const microTxt = f.microEligible
    ? `${fmt(f.netMicro)} € en micro-entreprise`
    : `micro-entreprise inaccessible (le chiffre d'affaires dépasse le plafond en prestations)`;
  // Le palier de TJM le plus proche du TJM médian du métier : c'est la page
  // qui détaille les nets, et le lien manquait entre les deux grappes TJM.
  const palier = TJMS.reduce((best, t) =>
    Math.abs(t - m.tjm) < Math.abs(best - m.tjm) ? t : best,
  );
  const related = [
    "observatoire-tjm-2026",
    "tjm-en-salaire",
    `tjm-${palier}`,
    ...(prev ? [`tjm-freelance-${prev.slug}`] : []),
    ...(next ? [`tjm-freelance-${next.slug}`] : []),
  ];
  return {
    slug: `tjm-freelance-${m.slug}`,
    updated: "2026-11-10",
    breadcrumb: `TJM ${m.court}`,
    hideFromFooter: true,
    inputOverrides: { tjm: m.tjm },
    keyTable: () => ({
      ...statutsAtTjm(m.tjm),
      title: `${m.court.charAt(0).toUpperCase()}${m.court.slice(1)} freelance à ${m.tjm} €/jour : le net de chaque statut`,
    }),
    metaTitle: `TJM ${m.court} freelance 2026 : tarif et net réel`,
    metaDescription: `TJM ${m.court} freelance 2026 : médiane ~${m.tjm} €/jour (${m.bas}–${m.haut} €). Ce qu'il reste vraiment en net par statut. Moteur open source.`,
    h1: `TJM ${m.court} freelance : tarif moyen et net réel (2026)`,
    tldr: `En 2026, un ${m.nom} freelance facture en médiane environ ${m.tjm} € par jour en France (fourchette ${m.bas} à ${m.haut} € selon séniorité et spécialité, d'après les ${TJM_METIERS_SOURCE}). À ce tarif et 18 jours facturés par mois sur 11 mois, il lui reste au mieux ${fmt(f.bestNetMensuel)} € net par mois après cotisations et impôt (${f.bestLabel}), soit l'équivalent d'un CDI à environ ${fmt(f.brutEquivalent)} € brut.`,
    intro: `Le TJM médian indicatif d'un ${m.nom} en France tourne autour de ${m.tjm} €/jour en 2026, dans une fourchette d'environ ${m.bas} à ${m.haut} € selon l'expérience et la spécialité. À ce tarif, 18 jours facturés par mois sur 11 mois, le meilleur statut (${f.bestLabel}) laisse ${fmt(f.bestNetMensuel)} €/mois net après impôt — l'équivalent d'un CDI à environ ${fmt(f.brutEquivalent)} € brut. ${m.contexte}`,
    sections: [
      {
        heading: `Le TJM d'un ${m.court} en 2026`,
        paragraphs: [
          `D'après les ${TJM_METIERS_SOURCE}, un ${m.nom} facture le plus souvent entre ${m.bas} et ${m.haut} €/jour, avec une médiane autour de ${m.tjm} €. Ces montants sont des ordres de grandeur : le tarif réel dépend de votre séniorité, de votre spécialité, du secteur du client et de la durée de la mission.`,
          `La géographie joue aussi : hors Île-de-France, les TJM des métiers du numérique sont en moyenne inférieurs de 7 à 10 %. À l'inverse, une compétence rare ou une mission urgente peut faire monter le tarif bien au-dessus de la médiane. Prenez ${m.tjm} €/jour comme un repère de marché, pas comme un plafond.`,
        ],
      },
      {
        heading: `Ce qui fait varier le TJM d'un ${m.court}`,
        paragraphs: [m.specialites, m.missions],
      },
      {
        heading: `Ce que ${m.tjm} €/jour laissent en net, statut par statut`,
        paragraphs: [
          `Sur ${fmt(f.ca)} € facturés dans l'année, le net mensuel après cotisations ET impôt s'établit à : ${microTxt}, ${fmt(f.netEi)} € en EI au réel, ${fmt(f.netSasu)} € en SASU (100 % salaire) et ${fmt(f.netPortage)} € en portage salarial. Ces chiffres sortent du même moteur que le simulateur ci-dessus, comparé au moteur open source de mon-entreprise.urssaf.fr.`,
          f.microEligible
            ? `À ce niveau de TJM, la micro et l'EI convertissent le mieux le chiffre d'affaires en net ; la SASU et le portage paient leur protection sociale complète par des charges plus lourdes. L'écart entre le premier et le dernier statut se compte en centaines d'euros par mois — d'où l'intérêt de simuler avant de choisir.`
            : `À ce niveau de facturation, la micro-entreprise n'est plus accessible (plafond de chiffre d'affaires dépassé). Le choix se joue entre l'EI au réel et l'EURL (net maximal, cotisations TNS), la SASU (arbitrage salaire/dividendes) et le portage (protection du salariat, chômage compris).`,
        ],
      },
      {
        heading: "Faire évoluer son TJM",
        paragraphs: [
          m.progression,
          `Réglez le simulateur en haut de page sur votre TJM réel et vos jours facturés pour voir votre net exact, statut par statut, et le salaire CDI qu'il faudrait pour l'égaler. C'est le meilleur argument, chiffré, pour négocier votre prochaine mission au-dessus de votre seuil de rentabilité.`,
        ],
      },
    ],
    faq: [
      {
        question: `Quel est le TJM moyen d'un ${m.court} freelance en 2026 ?`,
        answer: `Environ ${m.tjm} €/jour en médiane, dans une fourchette de ${m.bas} à ${m.haut} € selon l'expérience et la spécialité, d'après les ${TJM_METIERS_SOURCE}. Les juniors se situent vers ${m.bas} €, les profils seniors ou rares vers ${m.haut} € et au-delà. Hors Île-de-France, comptez environ 7 à 10 % de moins.`,
      },
      {
        question: `Combien gagne un ${m.court} freelance en net par mois ?`,
        answer: `À ${m.tjm} €/jour et 18 jours facturés par mois sur 11 mois (${fmt(f.ca)} € de CA annuel), le meilleur statut (${f.bestLabel}) laisse environ ${fmt(f.bestNetMensuel)} €/mois net après cotisations et impôt — l'équivalent d'un CDI à ${fmt(f.brutEquivalent)} € brut. Le net exact dépend de vos frais, de vos jours facturés et de votre foyer fiscal.`,
      },
      {
        question: `Quel statut choisir quand on est ${m.court} freelance ?`,
        answer: `Pour maximiser le net : ${f.bestLabel} (${fmt(f.bestNetMensuel)} €/mois dans ce scénario). Pour maximiser la protection : le portage salarial (${fmt(f.netPortage)} €/mois), seul statut ouvrant droit au chômage. La SASU permet l'arbitrage salaire/dividendes et le cumul avec l'ARE en sortie de CDI. Le simulateur compare les six statuts sur votre situation.`,
      },
      {
        question: `Le TJM d'un ${m.court} dépend-il de la région ?`,
        answer: `Oui : les baromètres montrent des TJM en moyenne inférieurs de 7 à 10 % hors Île-de-France pour les métiers du numérique. Paris et les grandes métropoles concentrent les missions les mieux payées, mais le télétravail atténue l'écart. La médiane de ${m.tjm} €/jour est un repère national, à ajuster selon votre marché local.`,
      },
    ],
    related,
  };
}

export const METIER_PAGES: StatutPage[] = METIERS.map((m, i) =>
  makeMetierPage(m, METIERS[i - 1], METIERS[i + 1]),
);

// ------------------------------------------------------- OBSERVATOIRE (hub)
const RANKED = [...METIERS].sort((a, b) => b.tjm - a.tjm);

export const OBSERVATOIRE_TJM: StatutPage = {
  slug: "observatoire-tjm-2026",
  breadcrumb: "Observatoire du TJM 2026",
  layout: "content",
  metaTitle: "Observatoire du TJM freelance 2026 : tarifs par métier",
  metaDescription: `Les TJM médians par métier (dev, data, DevOps, product, conseil, design, cyber) croisés avec le net réel après impôt, statut par statut. Moteur open source.`,
  h1: "Observatoire du TJM freelance 2026",
  // Le jeu de données de la page (déclaré en schema Dataset au prerender) sous
  // sa forme la plus citable : une ligne par métier.
  keyTable: () => ({
    title: "TJM freelance par métier en 2026 : tarif et net réel",
    caption: `TJM médian et fourchette junior–senior indicatifs : synthèse des ${TJM_METIERS_SOURCE}, dont les chiffres peuvent différer entre eux. Net : meilleur statut, après cotisations sociales ET impôt sur le revenu, à 18 jours facturés par mois sur 11 mois, célibataire sans enfant. Équivalent CDI : brut cadre donnant le même net. Taux 2026, moteur de calcul open source.`,
    head: ["Métier", "TJM médian", "Fourchette", "Meilleur net/mois", "Équivalent CDI brut/an"],
    rows: RANKED.map((m) => {
      const f = figuresFor(m.tjm);
      return [
        m.court.charAt(0).toUpperCase() + m.court.slice(1),
        `${m.tjm} €`,
        `${m.bas}–${m.haut} €`,
        `${fmt(f.bestNetMensuel)} €`,
        `${fmt(f.brutEquivalent)} €`,
      ];
    }),
  }),
  tldr: `En 2026, les TJM médians des freelances français vont d'environ 450 €/jour (design, SEO) à 650 €/jour (conseil en stratégie, cybersécurité), le développement web se situant autour de 535 € et la data science autour de 645 € (d'après les ${TJM_METIERS_SOURCE}). À TJM égal, le net conservé varie de plus de 1 000 € par mois selon le statut choisi.`,
  intro: `Combien facture vraiment un freelance selon son métier — et surtout, combien lui reste-t-il en net ? Cet observatoire croise les TJM médians indicatifs de 2026 (synthèse des ${TJM_METIERS_SOURCE}) avec le revenu net réellement disponible après cotisations et impôt, calculé par notre moteur open source. Chaque métier a sa page détaillée, statut par statut.`,
  sections: [
    {
      heading: "Ce que gagnent les freelances par métier (médiane 2026)",
      paragraphs: RANKED.map((m) => {
        const f = figuresFor(m.tjm);
        return `${m.court.charAt(0).toUpperCase() + m.court.slice(1)} — TJM médian ${m.tjm} €/jour (fourchette ${m.bas}–${m.haut} €) : jusqu'à ${fmt(f.bestNetMensuel)} €/mois net au mieux (${f.bestLabel}), soit l'équivalent d'un CDI à environ ${fmt(f.brutEquivalent)} € brut par an.`;
      }),
    },
    {
      heading: "Comment lire ces chiffres",
      paragraphs: [
        `Les TJM affichés sont des médianes indicatives issues des baromètres publics : ils donnent un ordre de grandeur, pas une garantie. Le tarif réel dépend de la séniorité, de la spécialité, du secteur du client et de la région — hors Île-de-France, les TJM du numérique sont en moyenne inférieurs de 7 à 10 %.`,
        `Le net mensuel, lui, est calculé : à partir de chaque TJM médian, le moteur applique les cotisations, l'impôt sur le revenu et les frais du scénario de référence (18 jours facturés par mois sur 11 mois, 3 000 € de frais pro, célibataire sans enfant), puis retient le statut le plus avantageux. C'est ce croisement — tarif de marché d'un côté, net réel de l'autre — qui manque à la plupart des baromètres.`,
      ],
    },
    {
      heading: "Du TJM au choix de statut",
      paragraphs: [
        `Un TJM élevé ne dit rien du net tant qu'on n'a pas choisi son statut : à 650 €/jour, l'écart entre la micro (quand elle reste accessible) et le portage salarial dépasse largement 1 000 €/mois. Le bon réflexe est donc de partir de son métier et de son TJM de marché, puis de simuler les six statuts pour trouver celui qui maximise le net — ou la protection.`,
        `Ouvrez la page de votre métier pour le détail complet, ou réglez directement le simulateur sur votre TJM : vous obtiendrez votre net réel, statut par statut, et le salaire CDI qu'il faudrait pour l'égaler.`,
      ],
    },
  ],
  faq: [
    {
      question: "Quel métier freelance a le meilleur TJM en 2026 ?",
      answer: `D'après les ${TJM_METIERS_SOURCE}, les TJM médians les plus élevés se trouvent en data science (~645 €/jour), en cybersécurité et en conseil en stratégie (~650 €), suivis du cloud/DevOps et du data engineering (~600 €). Le développement web se situe autour de 535 €, le design et le SEO vers 450 €. Ce sont des médianes : les seniors dépassent souvent ces montants.`,
    },
    {
      question: "Un TJM élevé signifie-t-il un revenu net élevé ?",
      answer: `Pas mécaniquement : le net dépend autant du statut que du TJM. À TJM égal, la micro-entreprise ou l'EI laissent bien plus de net que le portage salarial, qui finance en échange le chômage et une retraite complète. L'observatoire affiche pour chaque métier le net du meilleur statut ; le simulateur compare les six.`,
    },
    {
      question: "D'où viennent ces TJM par métier ?",
      answer: `Ce sont des médianes indicatives issues des baromètres freelance publics 2026 (Malt, Blog du Modérateur, tjmetre.fr). Elles servent de repère de marché. Les revenus nets associés, eux, sont calculés par notre moteur, comparé au moteur open source de mon-entreprise.urssaf.fr. Vérifiez le baromètre Malt pour un chiffrage à jour de votre spécialité.`,
    },
  ],
  related: [
    ...METIERS.map((m) => `tjm-freelance-${m.slug}`),
    "tjm-en-salaire",
    "methodologie",
  ],
};
