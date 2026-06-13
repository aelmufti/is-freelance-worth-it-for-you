// Tableau « seuil de TJM par statut » CALCULÉ par le moteur, sur le même
// scénario que la FAQ (DEFAULT_INPUT) : cadre, célibataire sans enfant,
// 18 j × 11 mois, 3 000 € de frais pro. Seul le brut du CDI varie.
//
// Comme la FAQ, les chiffres ne peuvent pas diverger de ce qu'affiche le
// simulateur : ils sortent de la même fonction tjmEquivalentCdi().

import { DEFAULT_INPUT, DEFAULT_PARAMS } from "../lib/params";
import {
  calcCdi,
  calcEi,
  calcMicro,
  calcPortage,
  calcSasu,
  tjmEquivalentCdi,
} from "../lib/engine";

export interface BreakEvenRow {
  brut: number;
  netCdiMensuel: number;
  micro: number | null;
  eiEurl: number | null;
  sasu: number | null;
  portage: number | null;
}

const BRUTS = [
  35000, 40000, 45000, 50000, 55000, 60000, 70000, 80000, 90000, 100000, 120000,
];
const p = DEFAULT_PARAMS;

// Arrondi à 5 € : précision affichable sans fausse exactitude (idem FAQ).
const round5 = (n: number | null): number | null =>
  n === null ? null : Math.round(n / 5) * 5;

// EI au réel et EURL à 100 % de rémunération aboutissent au même seuil
// (même assiette TNS, IS et dividendes nuls) : une seule colonne « EI/EURL ».
export const BREAKEVEN_ROWS: BreakEvenRow[] = BRUTS.map((brut) => {
  const input = { ...DEFAULT_INPUT, cdiBrutAnnuel: brut };
  return {
    brut,
    netCdiMensuel: calcCdi(input, p).netMensuel,
    micro: round5(tjmEquivalentCdi(input, p, calcMicro)),
    eiEurl: round5(tjmEquivalentCdi(input, p, calcEi)),
    sasu: round5(tjmEquivalentCdi(input, p, calcSasu)),
    portage: round5(tjmEquivalentCdi(input, p, calcPortage)),
  };
});

export const BREAKEVEN_REF = BREAKEVEN_ROWS.find((r) => r.brut === 55000)!;

export const BREAKEVEN_SCENARIO = {
  joursParMois: DEFAULT_INPUT.joursParMois,
  moisFactures: DEFAULT_INPUT.moisFactures,
  fraisPro: DEFAULT_INPUT.fraisPro,
};
