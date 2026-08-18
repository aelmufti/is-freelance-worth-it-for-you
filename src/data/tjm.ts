// Pages programmatiques « TJM XXX € en salaire » + page hub de conversion.
//
// Chaque page porte des chiffres CALCULÉS par le moteur pour son palier de
// TJM (nets par statut, salaire CDI équivalent, éligibilité micro) : le
// contenu est réellement unique d'une page à l'autre (anti « doorway page »),
// et ne peut pas diverger de ce qu'affiche le simulateur.
//
// Scénario de référence = DEFAULT_INPUT (18 j × 11 mois, 3 000 € de frais pro,
// célibataire sans enfant) — seul le TJM varie.

import { DEFAULT_INPUT, DEFAULT_PARAMS, caAnnuel } from "../lib/params";
import {
  brutCdiEquivalent,
  calcEi,
  calcMicro,
  calcPortage,
  calcSasu,
  type StatutResult,
} from "../lib/engine";
import type { StatutPage } from "../lib/pages";

export const TJMS = [
  250, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 600, 650, 700,
  750, 800, 900, 1000,
];

const p = DEFAULT_PARAMS;
const ref = DEFAULT_INPUT;

const fmt = (n: number): string => {
  const s = String(Math.round(n));
  return s.length > 3 ? `${s.slice(0, -3)} ${s.slice(-3)}` : s;
};

// Libellés en toutes lettres, insérables en milieu de phrase (les labels du
// moteur comme « EI au réel (IR) » supportent mal le toLowerCase).
const LABEL: Record<string, string> = {
  micro: "micro-entreprise",
  ei: "EI au réel",
  eurl: "EURL",
  sasu: "SASU",
  portage: "portage salarial",
};

export interface TjmFigures {
  tjm: number;
  ca: number;
  microEligible: boolean;
  netMicro: number; // net mensuel — sans objet si !microEligible
  netEi: number;
  netSasu: number;
  netPortage: number;
  bestLabel: string;
  bestNetMensuel: number;
  brutEquivalent: number; // brut CDI annuel équivalent, arrondi à 500 €
}

export function figuresFor(tjm: number): TjmFigures {
  const input = { ...ref, tjm };
  const micro = calcMicro(input, p);
  const ei = calcEi(input, p);
  const sasu = calcSasu(input, p);
  const portage = calcPortage(input, p);
  const candidats: StatutResult[] = [micro, ei, sasu, portage].filter(
    (r) => r.eligible,
  );
  const best = candidats.sort((a, b) => b.netAnnuel - a.netAnnuel)[0];
  const brut = brutCdiEquivalent(input, p, best.netAnnuel);
  return {
    tjm,
    ca: caAnnuel(input),
    microEligible: micro.eligible,
    netMicro: micro.netMensuel,
    netEi: ei.netMensuel,
    netSasu: sasu.netMensuel,
    netPortage: portage.netMensuel,
    bestLabel: LABEL[best.id] ?? best.label,
    bestNetMensuel: best.netMensuel,
    brutEquivalent: brut === null ? NaN : Math.round(brut / 500) * 500,
  };
}

const FIGURES: TjmFigures[] = TJMS.map(figuresFor);

// TJM (arrondi à 5 €) à partir duquel le meilleur statut atteint un net
// mensuel donné — pour la FAQ du hub (« quel TJM pour 4 000 € net ? »).
function tjmPourNetMensuel(netMensuel: number): number {
  let lo = 1;
  let hi = 5000;
  const bestNet = (tjm: number): number => {
    const input = { ...ref, tjm };
    return Math.max(
      ...[calcMicro(input, p), calcEi(input, p), calcSasu(input, p), calcPortage(input, p)]
        .filter((r) => r.eligible)
        .map((r) => r.netMensuel),
    );
  };
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (bestNet(mid) >= netMensuel) hi = mid;
    else lo = mid;
  }
  return Math.round(hi / 5) * 5;
}

// ------------------------------------------------------- PAGES TJM-XXX
function makeTjmPage(f: TjmFigures, prev?: number, next?: number): StatutPage {
  const microTxt = f.microEligible
    ? `${fmt(f.netMicro)} € en micro-entreprise`
    : `micro-entreprise inaccessible (le chiffre d'affaires dépasse le plafond de ${fmt(p.microPlafondService)} €)`;
  // Objectif de net le plus proche de ce que ce TJM laisse réellement : donne
  // à chaque palier un lien vers l'autre grappe de la longue traîne, et à
  // celle-ci les liens entrants qui lui manquaient.
  const OBJECTIFS_NET = [3000, 3500, 4000, 4500, 5000, 6000];
  const objectif = OBJECTIFS_NET.reduce((best, n) =>
    Math.abs(n - f.bestNetMensuel) < Math.abs(best - f.bestNetMensuel) ? n : best,
  );
  const related = [
    "tjm-en-salaire",
    ...(prev ? [`tjm-${prev}`] : []),
    ...(next ? [`tjm-${next}`] : []),
    `tjm-pour-${objectif}-euros-net`,
  ];
  return {
    slug: `tjm-${f.tjm}`,
    breadcrumb: `TJM ${f.tjm} €`,
    hideFromFooter: true,
    metaTitle: `TJM ${f.tjm} € : quel salaire net en 2026 ?`,
    metaDescription: `Un TJM de ${f.tjm} € = ${fmt(f.ca)} € facturés/an. Meilleur net : ${fmt(f.bestNetMensuel)} €/mois (${f.bestLabel}), soit un CDI à ~${fmt(f.brutEquivalent)} € brut. Validé URSSAF.`,
    h1: `TJM ${f.tjm} € : ce que ça fait en salaire net (2026)`,
    tldr: `À ${f.tjm} € par jour, 18 jours facturés par mois sur 11 mois, vous facturez ${fmt(f.ca)} € par an et conservez au mieux ${fmt(f.bestNetMensuel)} € net par mois après cotisations et impôt (${f.bestLabel}) — l'équivalent d'un CDI à environ ${fmt(f.brutEquivalent)} € brut par an. Taux 2026, calculs validés URSSAF.`,
    intro: `À ${f.tjm} € par jour, 18 jours facturés par mois sur 11 mois, vous facturez ${fmt(f.ca)} € dans l'année. Une fois cotisations et impôt déduits, le meilleur statut (${f.bestLabel}) laisse ${fmt(f.bestNetMensuel)} €/mois — l'équivalent d'un CDI à environ ${fmt(f.brutEquivalent)} € brut par an. Le détail statut par statut, calculé au taux 2026.`,
    inputOverrides: { tjm: f.tjm },
    sections: [
      {
        heading: `Ce que ${f.tjm} € par jour rapportent vraiment, statut par statut`,
        paragraphs: [
          `Sur ${fmt(f.ca)} € facturés dans l'année, le net mensuel après cotisations sociales ET impôt sur le revenu s'établit à : ${microTxt}, ${fmt(f.netEi)} € en EI au réel, ${fmt(f.netSasu)} € en SASU (100 % salaire) et ${fmt(f.netPortage)} € en portage salarial. Ces montants sortent du même moteur de calcul que le simulateur ci-dessus, validé contre le calculateur officiel de l'URSSAF.`,
          f.microEligible
            ? `L'ordre n'est pas un hasard : la micro et l'EI, aux cotisations légères, convertissent le mieux le chiffre d'affaires en net ; la SASU et le portage paient leur protection sociale complète par des charges bien plus lourdes. À ce niveau de TJM, l'écart entre le premier et le dernier statut représente plusieurs centaines d'euros par mois — d'où l'intérêt de comparer avant de choisir.`
            : `À ce niveau de facturation, la micro-entreprise n'est plus une option : son plafond de ${fmt(p.microPlafondService)} € de chiffre d'affaires en prestations est dépassé. Le choix se joue entre l'EI au réel (net maximal, protection légère), la SASU (arbitrage salaire/dividendes possible) et le portage (protection du salariat, net minimal).`,
        ],
      },
      {
        heading: `L'équivalent en salaire : un CDI à environ ${fmt(f.brutEquivalent)} € brut`,
        paragraphs: [
          `Pour retrouver en CDI le net du meilleur statut à ${f.tjm} €/jour (${fmt(f.bestNetMensuel)} €/mois après impôt), il faudrait un salaire d'environ ${fmt(f.brutEquivalent)} € brut par an — le calcul intègre les cotisations salariales du privé (statut cadre) et le barème 2026 de l'impôt sur le revenu.`,
          "Cette équivalence est un ordre de grandeur, pas une égalité : le CDI apporte en plus l'assurance chômage, les congés payés, une retraite mieux garnie et souvent des avantages annexes (mutuelle, titres-restaurant). À l'inverse, le freelance déduit ses frais et pilote son rythme. Comparez à net égal, puis pondérez selon la valeur que VOUS accordez à ce filet.",
        ],
      },
      {
        heading: "Affinez avec vos propres paramètres",
        paragraphs: [
          `Trois curseurs font bouger ces chiffres plus que tout : les jours réellement facturés (18 par mois est un bon taux d'occupation — les intermissions, la prospection et les congés ne se facturent pas), les frais professionnels (${fmt(ref.fraisPro)} € par an dans ce scénario), et votre foyer fiscal (le célibataire sans enfant de ce scénario paie plus d'impôt qu'un parent en couple).`,
          `Le simulateur en haut de page est préréglé sur ${f.tjm} € : modifiez les jours, les frais ou la situation familiale pour voir votre vrai net, statut par statut, et le seuil auquel chaque statut bat le CDI que vous comparez.`,
        ],
      },
    ],
    faq: [
      {
        question: `Un TJM de ${f.tjm} €, c'est quel salaire ?`,
        answer: `À 18 jours facturés par mois sur 11 mois (${fmt(f.ca)} € de chiffre d'affaires annuel), un TJM de ${f.tjm} € équivaut à environ ${fmt(f.brutEquivalent)} € brut par an en CDI cadre, soit ${fmt(f.bestNetMensuel)} €/mois net après impôt dans le meilleur statut (${f.bestLabel}). L'équivalence ne tient pas compte du chômage et des congés payés du salarié, à pondérer selon votre situation.`,
      },
      {
        question: `Quel revenu net avec un TJM de ${f.tjm} € en micro-entreprise ?`,
        answer: f.microEligible
          ? `Environ ${fmt(f.netMicro)} € par mois net après cotisations (24,6 % du CA en BNC) et impôt sur le revenu, pour ${fmt(f.ca)} € facturés dans l'année (18 jours par mois, 11 mois, célibataire sans enfant). Au-delà de 37 500 € de chiffre d'affaires, la TVA devient exigible mais ne change pas ce net si vos clients sont des entreprises.`
          : `Aucun : avec ${fmt(f.ca)} € de chiffre d'affaires annuel, le plafond de la micro-entreprise en prestations de services (${fmt(p.microPlafondService)} €) est dépassé. À ce niveau de TJM, les statuts accessibles sont l'EI au réel (${fmt(f.netEi)} €/mois net), la SASU (${fmt(f.netSasu)} €/mois à 100 % salaire) et le portage salarial (${fmt(f.netPortage)} €/mois).`,
      },
      {
        question: `Quel statut choisir avec un TJM de ${f.tjm} € ?`,
        answer: `Pour maximiser le net : ${f.bestLabel} (${fmt(f.bestNetMensuel)} €/mois après impôt dans ce scénario). Pour maximiser la protection sociale : le portage salarial (${fmt(f.netPortage)} €/mois), seul statut qui ouvre des droits au chômage. Entre les deux, la SASU permet l'arbitrage salaire/dividendes et le cumul avec l'ARE en sortie de CDI. Le bon choix dépend de vos frais, de votre foyer fiscal et de votre besoin de filet — le simulateur les met côte à côte.`,
      },
      {
        question: `Quel chiffre d'affaires annuel avec un TJM de ${f.tjm} € ?`,
        answer: `${fmt(f.ca)} € en facturant 18 jours par mois sur 11 mois — un rythme de croisière réaliste qui réserve du temps pour la prospection, l'intermission et les congés. À temps plein maximal théorique (21 jours sur 12 mois), le même TJM produirait environ ${fmt(f.tjm * 21 * 12)} €, mais ce rythme est rarement tenable sur la durée.`,
      },
    ],
    related,
  };
}

export const TJM_PAGES: StatutPage[] = FIGURES.map((f, i) =>
  makeTjmPage(f, TJMS[i - 1], TJMS[i + 1]),
);

// ------------------------------------------------------------ HUB TJM
const TJM_4000 = tjmPourNetMensuel(4000);
const TJM_3000 = tjmPourNetMensuel(3000);

export const TJM_HUB: StatutPage = {
  slug: "tjm-en-salaire",
  breadcrumb: "Convertir un TJM en salaire",
  metaTitle: "Convertir un TJM en salaire : le tableau 2026",
  metaDescription: `Le tableau de conversion 2026, de 250 à 1 000 €/jour : chiffre d'affaires, net mensuel par statut et salaire CDI équivalent. Validé URSSAF.`,
  h1: "Convertir un TJM en salaire : le tableau 2026",
  tldr: `Pour convertir un TJM en salaire, multipliez-le par les jours réellement facturés (18 par mois sur 11 mois, soit 198 jours), puis retirez cotisations, frais et impôt. Selon le statut, il reste entre 40 et 60 % du chiffre d'affaires en net. Repères 2026 : environ ${fmt(TJM_3000)} €/jour pour 3 000 € net par mois, ${fmt(TJM_4000)} €/jour pour 4 000 € net.`,
  intro: `Un TJM ne se compare pas à un salaire journalier : il finance aussi les cotisations, l'impôt, les jours non facturés et les frais. Cette page convertit chaque palier de TJM en net mensuel réel et en salaire CDI équivalent — de 250 à 1 000 €/jour, au taux 2026, sur un rythme de 18 jours facturés par mois sur 11 mois. Chaque palier a sa page détaillée.`,
  sections: [
    {
      heading: "La conversion, palier par palier",
      paragraphs: FIGURES.map(
        (f) =>
          `TJM ${f.tjm} € — ${fmt(f.ca)} € facturés par an : ${fmt(f.bestNetMensuel)} €/mois net après impôt au mieux (${f.bestLabel}), soit l'équivalent d'un CDI à environ ${fmt(f.brutEquivalent)} € brut par an.`,
      ),
    },
    {
      heading: "Comment lire cette conversion",
      paragraphs: [
        "Le chemin du TJM au net passe par quatre étapes : le chiffre d'affaires (TJM × jours réellement facturés), les cotisations sociales du statut choisi, l'impôt sur le revenu du foyer, et les frais professionnels. C'est pourquoi le même TJM produit des nets très différents selon le statut : à cotisations légères (micro, EI), il reste beaucoup ; à protection complète (SASU, portage), il reste nettement moins.",
        "L'équivalent CDI affiché est calculé à net égal : c'est le salaire brut qui laisserait le même montant sur votre compte après cotisations salariales et impôt. Il ne valorise ni le chômage, ni les congés payés, ni la retraite du salarié — un CDI « équivalent » protège donc mieux qu'un TJM équivalent. À l'inverse, le TJM peut monter bien plus vite qu'un salaire.",
      ],
    },
    {
      heading: "Quel TJM viser pour votre objectif de revenu",
      paragraphs: [
        `Deux repères utiles, calculés sur le même scénario : pour dégager 3 000 € net par mois après impôt, il faut un TJM d'environ ${fmt(TJM_3000)} € dans le meilleur statut ; pour 4 000 € net, environ ${fmt(TJM_4000)} €. Ces seuils montent si vous facturez moins de 18 jours par mois ou si vos frais dépassent ${fmt(ref.fraisPro)} € par an.`,
        "Pour fixer votre TJM, partez du salaire que vous voulez remplacer : le tableau « À partir de quel TJM le freelance bat le CDI » plus bas donne le point de bascule pour chaque niveau de brut, et le simulateur affine avec vos jours, vos frais et votre foyer fiscal. Négociez ensuite au-dessus de votre seuil — jamais en dessous.",
      ],
    },
  ],
  faq: [
    {
      question: "Comment convertir un TJM en salaire ?",
      answer:
        "Multipliez le TJM par les jours réellement facturés dans l'année (18 par mois sur 11 mois est un rythme réaliste, soit 198 jours) pour obtenir le chiffre d'affaires. Retirez les cotisations sociales du statut (de 24,6 % du CA en micro BNC à 75-80 % de charges sur salaire en SASU), les frais professionnels puis l'impôt sur le revenu : le résultat est votre net mensuel, à comparer au net après impôt d'un salaire. Un simulateur fait ce calcul statut par statut — c'est l'objet de ce site.",
    },
    {
      question: "Quel TJM pour gagner 4 000 € net par mois ?",
      answer: `Environ ${fmt(TJM_4000)} € par jour dans le statut le plus favorable, à 18 jours facturés par mois sur 11 mois (célibataire sans enfant, 3 000 € de frais pro, taux 2026). En portage salarial, statut le plus chargé, il faut viser sensiblement plus haut. Le seuil dépend surtout de vos jours réellement facturés : à 15 jours par mois, ajoutez environ 20 % au TJM.`,
    },
    {
      question: "Un TJM de 500 € correspond-il à un salaire de 500 € par jour ?",
      answer:
        "Non, loin de là. Le TJM est un prix de vente hors taxes, pas un salaire : il doit financer les cotisations sociales, l'impôt, les jours non facturés (congés, prospection, intermission), les frais professionnels et l'absence d'avantages salariés. En pratique, selon le statut, il reste entre 40 et 60 % du chiffre d'affaires en net disponible — un TJM de 500 € produit un niveau de vie comparable à un très bon salaire de cadre, pas à 500 € net quotidiens.",
    },
    {
      question: "Quel TJM demander pour égaler mon salaire actuel ?",
      answer:
        "Repérez votre brut annuel dans le tableau des seuils de ce site : il donne, pour chaque niveau de salaire de 35 000 à 120 000 €, le TJM minimal par statut (micro, EI/EURL, SASU, portage) qui produit le même net après impôt. Par exemple, un CDI cadre à 55 000 € brut se remplace à partir d'environ 320 €/jour en micro-entreprise et 455 €/jour en portage salarial. Ajoutez une marge de sécurité pour les intermissions.",
    },
  ],
  // Le hub liste TOUS les paliers et tous les objectifs de net : sans cela,
  // les paliers extrêmes n'étaient atteignables qu'au bout d'une longue chaîne
  // prev/next (profondeur de clic > 7, donc quasi jamais crawlés).
  related: [
    ...TJMS.map((t) => `tjm-${t}`),
    ...[3000, 3500, 4000, 4500, 5000, 6000].map(
      (n) => `tjm-pour-${n}-euros-net`,
    ),
    "observatoire-tjm-2026",
  ],
};
