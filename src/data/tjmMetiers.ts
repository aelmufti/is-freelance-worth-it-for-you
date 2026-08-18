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
  },
  {
    slug: "consultant-marketing",
    nom: "consultant marketing digital",
    court: "consultant marketing",
    tjm: 590,
    bas: 350,
    haut: 800,
    contexte:
      "Le baromètre Malt situe le TJM médian d'un consultant marketing confirmé autour de 590 €/jour, avec des juniors vers 300 € et des seniors au-delà de 800 €.",
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
    breadcrumb: `TJM ${m.court}`,
    hideFromFooter: true,
    inputOverrides: { tjm: m.tjm },
    metaTitle: `TJM ${m.court} freelance 2026 : tarif et net réel`,
    metaDescription: `TJM ${m.court} freelance 2026 : médiane ~${m.tjm} €/jour (${m.bas}–${m.haut} €). Ce qu'il reste vraiment en net par statut. Validé URSSAF.`,
    h1: `TJM ${m.court} freelance : tarif moyen et net réel (2026)`,
    tldr: `En 2026, un ${m.nom} freelance facture en médiane environ ${m.tjm} € par jour en France (fourchette ${m.bas} à ${m.haut} € selon séniorité et spécialité, d'après les ${TJM_METIERS_SOURCE}). À ce tarif et 18 jours facturés par mois sur 11 mois, il lui reste au mieux ${fmt(f.bestNetMensuel)} € net par mois après cotisations et impôt (${f.bestLabel}), soit l'équivalent d'un CDI à environ ${fmt(f.brutEquivalent)} € brut.`,
    intro: `Le TJM médian observé pour un ${m.nom} en France tourne autour de ${m.tjm} €/jour en 2026, dans une fourchette d'environ ${m.bas} à ${m.haut} € selon l'expérience et la spécialité. À ce tarif, 18 jours facturés par mois sur 11 mois, le meilleur statut (${f.bestLabel}) laisse ${fmt(f.bestNetMensuel)} €/mois net après impôt — l'équivalent d'un CDI à environ ${fmt(f.brutEquivalent)} € brut. ${m.contexte}`,
    sections: [
      {
        heading: `Le TJM d'un ${m.court} en 2026`,
        paragraphs: [
          `D'après les ${TJM_METIERS_SOURCE}, un ${m.nom} facture le plus souvent entre ${m.bas} et ${m.haut} €/jour, avec une médiane autour de ${m.tjm} €. Ces montants sont des ordres de grandeur : le tarif réel dépend de votre séniorité, de votre spécialité, du secteur du client et de la durée de la mission.`,
          `La géographie joue aussi : hors Île-de-France, les TJM des métiers du numérique sont en moyenne inférieurs de 7 à 10 %. À l'inverse, une compétence rare ou une mission urgente peut faire monter le tarif bien au-dessus de la médiane. Prenez ${m.tjm} €/jour comme un repère de marché, pas comme un plafond.`,
        ],
      },
      {
        heading: `Ce que ${m.tjm} €/jour laissent en net, statut par statut`,
        paragraphs: [
          `Sur ${fmt(f.ca)} € facturés dans l'année, le net mensuel après cotisations ET impôt s'établit à : ${microTxt}, ${fmt(f.netEi)} € en EI au réel, ${fmt(f.netSasu)} € en SASU (100 % salaire) et ${fmt(f.netPortage)} € en portage salarial. Ces chiffres sortent du même moteur que le simulateur ci-dessus, validé contre le calculateur officiel de l'URSSAF.`,
          f.microEligible
            ? `À ce niveau de TJM, la micro et l'EI convertissent le mieux le chiffre d'affaires en net ; la SASU et le portage paient leur protection sociale complète par des charges plus lourdes. L'écart entre le premier et le dernier statut se compte en centaines d'euros par mois — d'où l'intérêt de simuler avant de choisir.`
            : `À ce niveau de facturation, la micro-entreprise n'est plus accessible (plafond de chiffre d'affaires dépassé). Le choix se joue entre l'EI au réel et l'EURL (net maximal, cotisations TNS), la SASU (arbitrage salaire/dividendes) et le portage (protection du salariat, chômage compris).`,
        ],
      },
      {
        heading: "Faire évoluer son TJM",
        paragraphs: [
          `Trois leviers font monter un TJM au-dessus de la médiane : la séniorité (un portfolio et des références solides), la spécialisation sur une compétence rare et bien valorisée, et la capacité à parler « impact business » plutôt que « jours-homme ». Un ${m.court} qui démarre vise le bas de la fourchette ; avec quelques années et une niche, le haut devient atteignable.`,
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
  metaDescription: `Les TJM médians par métier (dev, data, DevOps, product, conseil, design, cyber) croisés avec le net réel après impôt, statut par statut. Validé URSSAF.`,
  h1: "Observatoire du TJM freelance 2026",
  tldr: `En 2026, les TJM médians des freelances français vont d'environ 450 €/jour (design, SEO) à 650 €/jour (conseil en stratégie, cybersécurité), le développement web se situant autour de 535 € et la data science autour de 645 € (d'après les ${TJM_METIERS_SOURCE}). À TJM égal, le net conservé varie de plus de 1 000 € par mois selon le statut choisi.`,
  intro: `Combien facture vraiment un freelance selon son métier — et surtout, combien lui reste-t-il en net ? Cet observatoire croise les TJM médians observés sur le marché en 2026 (d'après les ${TJM_METIERS_SOURCE}) avec le revenu net réellement disponible après cotisations et impôt, calculé par notre moteur validé URSSAF. Chaque métier a sa page détaillée, statut par statut.`,
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
      answer: `Ce sont des médianes indicatives issues des baromètres freelance publics 2026 (Malt, Blog du Modérateur, tjmetre.fr). Elles servent de repère de marché. Les revenus nets associés, eux, sont calculés par notre moteur, validé contre le simulateur officiel de l'URSSAF. Vérifiez le baromètre Malt pour un chiffrage à jour de votre spécialité.`,
    },
  ],
  related: [
    ...METIERS.map((m) => `tjm-freelance-${m.slug}`),
    "tjm-en-salaire",
    "methodologie",
  ],
};
