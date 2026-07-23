// Pages programmatiques « Quel TJM pour X € net par mois ? ».
//
// Le raisonnement est inversé par rapport aux pages tjm-XXX : on part d'un
// objectif de revenu NET mensuel et on cherche, statut par statut, le TJM
// minimal qui l'atteint (18 j × 11 mois, 3 000 € de frais pro, célibataire).
// Tous les chiffres sont CALCULÉS par le moteur — contenu réellement unique
// d'une page à l'autre (anti « doorway page »), et jamais divergent du
// simulateur.

import { DEFAULT_INPUT, DEFAULT_PARAMS, caAnnuel } from "../lib/params";
import {
  brutCdiEquivalent,
  calcEi,
  calcMicro,
  calcPortage,
  calcSasu,
  type StatutId,
  type StatutResult,
} from "../lib/engine";
import type { FiscalParams, SimulationInput } from "../lib/params";
import type { StatutPage } from "../lib/pages";
import { TJMS } from "./tjm";

const p = DEFAULT_PARAMS;
const ref = DEFAULT_INPUT;

const fmt = (n: number): string => {
  const s = String(Math.round(n));
  return s.length > 3 ? `${s.slice(0, -3)} ${s.slice(-3)}` : s;
};

const LABEL: Record<string, string> = {
  micro: "micro-entreprise",
  ei: "EI au réel",
  sasu: "SASU",
  portage: "portage salarial",
};

type Calc = (i: SimulationInput, p: FiscalParams) => StatutResult;
const CALCS: Array<[StatutId, Calc]> = [
  ["micro", calcMicro],
  ["ei", calcEi],
  ["sasu", calcSasu],
  ["portage", calcPortage],
];

// TJM minimal (pas de 5 €) auquel le statut, tout en restant éligible, atteint
// le net mensuel visé. `null` si le plafond du statut l'en empêche (micro).
function tjmPourStatut(netMensuel: number, calc: Calc): number | null {
  for (let tjm = 50; tjm <= 3000; tjm += 5) {
    const r = calc({ ...ref, tjm }, p);
    if (r.eligible && r.netMensuel >= netMensuel) return tjm;
  }
  return null;
}

function nearestPalier(tjm: number): number {
  return TJMS.reduce((best, t) =>
    Math.abs(t - tjm) < Math.abs(best - tjm) ? t : best,
  );
}

export const OBJECTIFS = [3000, 3500, 4000, 4500, 5000, 6000];

interface ObjFigures {
  net: number;
  tjm: Partial<Record<StatutId, number | null>>;
  bestId: StatutId;
  bestLabel: string;
  bestTjm: number;
  bestCa: number;
  brutEquivalent: number; // brut CDI annuel équivalent, arrondi à 500 €
}

function figuresFor(net: number): ObjFigures {
  const tjm: Partial<Record<StatutId, number | null>> = {};
  for (const [id, calc] of CALCS) tjm[id] = tjmPourStatut(net, calc);
  const reachable = CALCS.map(([id]) => ({ id, t: tjm[id] }))
    .filter((x): x is { id: StatutId; t: number } => x.t != null)
    .sort((a, b) => a.t - b.t);
  const best = reachable[0];
  const brut = brutCdiEquivalent(ref, p, net * 12);
  return {
    net,
    tjm,
    bestId: best.id,
    bestLabel: LABEL[best.id],
    bestTjm: best.t,
    bestCa: caAnnuel({ ...ref, tjm: best.t }),
    brutEquivalent: brut === null ? NaN : Math.round(brut / 500) * 500,
  };
}

const FIGURES = OBJECTIFS.map(figuresFor);

function microTxt(f: ObjFigures): string {
  const t = f.tjm.micro;
  return t == null
    ? `la micro-entreprise ne permet pas d'atteindre ce revenu : son plafond de chiffre d'affaires (${fmt(p.microPlafondService)} € en prestations) est atteint avant`
    : `${fmt(t)} €/jour en micro-entreprise`;
}

function makeObjectifPage(f: ObjFigures, prev?: number, next?: number): StatutPage {
  const related = [
    ...(prev ? [`tjm-pour-${prev}-euros-net`] : []),
    ...(next ? [`tjm-pour-${next}-euros-net`] : []),
    "tjm-en-salaire",
    `tjm-${nearestPalier(f.bestTjm)}`,
  ];
  const eiTxt = `${fmt(f.tjm.ei!)} €/jour en EI au réel`;
  const sasuTxt = `${fmt(f.tjm.sasu!)} €/jour en SASU`;
  const portageTxt = `${fmt(f.tjm.portage!)} €/jour en portage salarial`;

  return {
    slug: `tjm-pour-${f.net}-euros-net`,
    breadcrumb: `TJM pour ${fmt(f.net)} € net`,
    hideFromFooter: true,
    metaTitle: `Quel TJM pour ${fmt(f.net)} € net par mois en 2026 ? (micro, SASU, portage)`,
    metaDescription: `Pour ${fmt(f.net)} € net par mois après impôt en freelance, visez environ ${fmt(f.bestTjm)} €/jour en ${f.bestLabel} (${fmt(f.bestCa)} € de CA/an), l'équivalent d'un CDI à ${fmt(f.brutEquivalent)} € brut. Le TJM à viser statut par statut, calculs 2026 validés URSSAF.`,
    h1: `Quel TJM pour ${fmt(f.net)} € net par mois en 2026 ?`,
    intro: `Pour toucher ${fmt(f.net)} € net par mois après cotisations ET impôt sur le revenu, le chemin le plus court passe par ${f.bestLabel} : il faut facturer environ ${fmt(f.bestTjm)} €/jour, à 18 jours par mois sur 11 mois, soit ${fmt(f.bestCa)} € de chiffre d'affaires dans l'année. C'est l'équivalent d'un CDI à environ ${fmt(f.brutEquivalent)} € brut. Voici le TJM à viser statut par statut, calculé au taux 2026.`,
    inputOverrides: { tjm: f.bestTjm },
    sections: [
      {
        heading: `Le TJM à viser pour ${fmt(f.net)} €/mois net, statut par statut`,
        paragraphs: [
          `Le même objectif de net demande un TJM très différent selon le statut, parce que chacun prélève des cotisations plus ou moins lourdes. Pour ${fmt(f.net)} € net par mois : ${microTxt(f)}, ${eiTxt}, ${sasuTxt} et ${portageTxt}. Ces seuils sortent du même moteur de calcul que le simulateur ci-dessus, validé contre le calculateur officiel de l'URSSAF.`,
          f.tjm.micro == null
            ? `À ce niveau de revenu, la micro-entreprise est hors jeu : atteindre ${fmt(f.net)} € net supposerait un chiffre d'affaires supérieur à son plafond de ${fmt(p.microPlafondService)} €. Le choix se resserre sur l'EI au réel et l'EURL (cotisations TNS allégées, net maximal), la SASU (arbitrage salaire/dividendes) et le portage (protection du salariat, TJM le plus élevé).`
            : `L'ordre n'est pas un hasard : la micro et l'EI, aux cotisations légères, atteignent l'objectif avec le TJM le plus bas ; la SASU et surtout le portage, qui financent une protection sociale complète, exigent de facturer sensiblement plus cher pour le même net dans votre poche.`,
        ],
      },
      {
        heading: `L'équivalent en CDI : environ ${fmt(f.brutEquivalent)} € brut`,
        paragraphs: [
          `Pour retrouver ${fmt(f.net)} € net par mois en tant que salarié, il faudrait un CDI cadre à environ ${fmt(f.brutEquivalent)} € brut par an — le calcul intègre les cotisations salariales du privé et le barème 2026 de l'impôt sur le revenu. Si vous quittez un poste moins bien payé que ce niveau, un freelance à ${fmt(f.bestTjm)} €/jour représente une vraie augmentation de pouvoir d'achat, à protection sociale près.`,
          `Cette équivalence se lit à net égal : elle ne valorise ni l'assurance chômage, ni les congés payés, ni la retraite plus garnie du salarié. Un CDI « équivalent » protège donc davantage qu'un TJM équivalent ; à l'inverse, le TJM se négocie et peut grimper bien plus vite qu'un salaire. Comparez à net égal, puis pondérez selon la valeur que VOUS accordez à ce filet.`,
        ],
      },
      {
        heading: "Ce qui fait bouger ce seuil",
        paragraphs: [
          `Trois curseurs comptent autant que le statut. Les jours réellement facturés d'abord : ${fmt(f.bestTjm)} €/jour vise ${fmt(f.net)} € net à 18 jours par mois ; à 15 jours, il faut monter le TJM d'environ 20 % pour le même revenu, car prospection, intermission et congés ne se facturent pas. Les frais professionnels ensuite (${fmt(ref.fraisPro)} € par an dans ce scénario), qui pèsent différemment en micro (non déductibles) et au réel. Votre foyer fiscal enfin : un couple avec enfants paie moins d'impôt qu'un célibataire, donc atteint ${fmt(f.net)} € net avec un TJM plus bas.`,
          `Le simulateur en haut de page est préréglé sur ${fmt(f.bestTjm)} € (le seuil du meilleur statut) : modifiez les jours facturés, les frais ou la situation familiale pour voir le TJM exact qu'il vous faut, statut par statut, pour votre objectif de ${fmt(f.net)} € net par mois.`,
        ],
      },
    ],
    faq: [
      {
        question: `Quel TJM faut-il pour gagner ${fmt(f.net)} € net par mois en freelance ?`,
        answer: `Environ ${fmt(f.bestTjm)} €/jour dans le statut le plus favorable (${f.bestLabel}), à 18 jours facturés par mois sur 11 mois, soit ${fmt(f.bestCa)} € de chiffre d'affaires annuel (célibataire sans enfant, ${fmt(ref.fraisPro)} € de frais pro, taux 2026). En portage salarial, le statut le plus chargé, il faut viser ${fmt(f.tjm.portage!)} €/jour pour le même net. Le seuil baisse si vous facturez plus de jours ou si votre foyer fiscal réduit votre impôt.`,
      },
      {
        question: `Peut-on atteindre ${fmt(f.net)} € net par mois en micro-entreprise ?`,
        answer:
          f.tjm.micro == null
            ? `Non. Pour ${fmt(f.net)} € net par mois, le chiffre d'affaires nécessaire dépasse le plafond de la micro-entreprise (${fmt(p.microPlafondService)} € en prestations de services). À ce niveau de revenu, il faut passer à l'EI au réel (${fmt(f.tjm.ei!)} €/jour), à l'EURL ou à la SASU, qui n'ont pas de plafond de chiffre d'affaires.`
            : `Oui : il faut viser environ ${fmt(f.tjm.micro)} €/jour, ce qui reste sous le plafond de ${fmt(p.microPlafondService)} € de chiffre d'affaires en prestations. La micro est même le statut qui atteint ${fmt(f.net)} € net avec le TJM le plus bas, grâce à ses cotisations légères (24,6 % du CA en BNC) et à l'abattement forfaitaire de 34 % — à condition d'avoir peu de frais professionnels réels.`,
      },
      {
        question: `${fmt(f.net)} € net par mois, c'est quel chiffre d'affaires annuel ?`,
        answer: `Dans le meilleur statut (${f.bestLabel}), il faut facturer environ ${fmt(f.bestCa)} € par an pour dégager ${fmt(f.net)} € net par mois après cotisations et impôt — soit ${fmt(f.bestTjm)} €/jour sur 198 jours facturés. La différence entre ce chiffre d'affaires et votre net part en cotisations sociales, en impôt sur le revenu et en frais professionnels : c'est exactement ce que le simulateur décompose, ligne par ligne.`,
      },
      {
        question: `${fmt(f.net)} € net par mois en freelance, ça vaut quel salaire ?`,
        answer: `Environ ${fmt(f.brutEquivalent)} € brut par an en CDI cadre : c'est le salaire qui laisse le même net après cotisations salariales et impôt. L'équivalence ne compte ni le chômage, ni les congés payés, ni la retraite du salarié — à pondérer selon votre situation. Autrement dit, un freelance qui atteint ${fmt(f.net)} € net « travaille » au niveau d'un cadre payé ${fmt(f.brutEquivalent)} € brut, en échange d'une protection sociale qu'il gère lui-même.`,
      },
    ],
    related,
  };
}

export const OBJECTIF_PAGES: StatutPage[] = FIGURES.map((f, i) =>
  makeObjectifPage(f, OBJECTIFS[i - 1], OBJECTIFS[i + 1]),
);
