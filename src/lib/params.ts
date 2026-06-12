// Paramètres fiscaux et sociaux — France, 2026 (revenus 2025 pour le barème IR).
// Toutes les valeurs sont modifiables dans l'UI (panneau "Paramètres avancés").

export const PASS_2026 = 48060; // plafond annuel de la Sécurité sociale (4 005 € × 12)

export type ActiviteMicro = "bnc" | "bic-service" | "bic-vente";
export type CaisseRetraite = "regime-general" | "cipav";
export type SituationFamiliale = "celibataire" | "couple";
export type StatutSalarie = "cadre" | "non-cadre" | "fonctionnaire";

export interface FiscalParams {
  // Barème IR 2026 (revenus 2025) : [seuil bas, taux]
  irBareme: Array<[number, number]>;
  decoteSeuilSolo: number;
  decoteSeuilCouple: number;
  decoteForfaitSolo: number;
  decoteForfaitCouple: number;
  decoteTaux: number;
  abattementSalaireTaux: number; // 10 % frais professionnels
  abattementSalaireMax: number;

  // Flat tax (PFU) 2026 : 12,8 % IR + 18,6 % prélèvements sociaux (CSG à 10,6 %)
  flatTax: number;

  // Impôt sur les sociétés
  isTauxReduit: number;
  isSeuilTauxReduit: number;
  isTauxNormal: number;

  // Micro-entreprise (taux 2026)
  microCotisations: Record<ActiviteMicro, number>;
  microCotisationsCipav: number; // BNC affilié CIPAV
  microCfp: Record<ActiviteMicro, number>; // contribution formation professionnelle
  microAbattement: Record<ActiviteMicro, number>;
  microVfl: Record<ActiviteMicro, number>; // versement fiscal libératoire
  microPlafondService: number;
  microPlafondVente: number;
  microSeuilTvaService: number;
  microSeuilTvaVente: number;
  vflPlafondRfrParPart: number;
  acreReduction: number; // part des cotisations exonérée la 1ère année

  // TNS (EI au réel, gérant d'EURL) — réforme assiette unique 2026
  tnsAbattementAssiette: number; // 26 %
  tnsRetraiteBaseT1: number; // jusqu'à 1 PASS
  tnsRetraiteBaseT2: number; // au-delà
  tnsRetraiteCompT1: number;
  tnsRetraiteCompT2: number;
  tnsRetraiteCompSeuil: number;
  tnsMaladie: number; // taux plein, progressif jusqu'à 110 % du PASS
  tnsIndemnitesJournalieres: number; // plafonné à 5 PASS
  tnsInvaliditeDeces: number;
  tnsAllocFamiliales: number; // taux plein, progressif entre 110 % et 140 % du PASS
  tnsCsgCrds: number;
  tnsCfp: number;

  // Assimilé salarié (SASU) et portage
  sasuPatronales: number; // % du brut
  sasuSalariales: number; // % du brut
  portagePatronales: number;
  portageSalariales: number;
  portageFraisGestion: number; // % du CA
  csgNonDeductible: number; // % du brut réintégré au net imposable

  // Salarié du privé — part salariale détaillée
  // Sources : urssaf.fr (taux secteur privé, màj 01/01/2026) et agirc-arrco.fr
  salVieillessePlaf: number; // 6,90 % dans la limite du PASS
  salVieillesseDeplaf: number; // 0,40 % sur la totalité
  salCsgCrds: number; // CSG 9,2 % + CRDS 0,5 %
  salCsgAssiette: number; // 98,25 % du brut, dans la limite de 4 PASS
  agircT1: number; // retraite complémentaire, jusqu'à 1 PASS
  agircT2: number; // de 1 à 8 PASS
  cegT1: number;
  cegT2: number;
  cetSalarie: number; // si brut > PASS
  apecSalarie: number; // cadres uniquement, jusqu'à 4 PASS
  cdiPatronales: number;

  // Fonctionnaire — part agent (service-public.fr fiche F468)
  fonctPensionCivile: number; // 11,10 % du traitement indiciaire brut
  fonctRafp: number; // 5 % des primes
  fonctRafpPlafondPrimes: number; // primes retenues dans la limite de 20 % du TI
}

export const DEFAULT_PARAMS: FiscalParams = {
  irBareme: [
    [0, 0],
    [11600, 0.11],
    [29579, 0.3],
    [84577, 0.41],
    [181917, 0.45],
  ],
  decoteSeuilSolo: 1982,
  decoteSeuilCouple: 3277,
  decoteForfaitSolo: 897,
  decoteForfaitCouple: 1483,
  decoteTaux: 0.4525,
  abattementSalaireTaux: 0.1,
  abattementSalaireMax: 14426,

  flatTax: 0.314,

  isTauxReduit: 0.15,
  isSeuilTauxReduit: 42500,
  isTauxNormal: 0.25,

  microCotisations: { bnc: 0.256, "bic-service": 0.212, "bic-vente": 0.123 },
  microCotisationsCipav: 0.231,
  microCfp: { bnc: 0.002, "bic-service": 0.001, "bic-vente": 0.001 },
  microAbattement: { bnc: 0.34, "bic-service": 0.5, "bic-vente": 0.71 },
  microVfl: { bnc: 0.022, "bic-service": 0.017, "bic-vente": 0.01 },
  microPlafondService: 83600,
  microPlafondVente: 203100,
  microSeuilTvaService: 37500,
  microSeuilTvaVente: 85000,
  vflPlafondRfrParPart: 29315,
  acreReduction: 0.5,

  tnsAbattementAssiette: 0.26,
  tnsRetraiteBaseT1: 0.1787,
  tnsRetraiteBaseT2: 0.0072,
  tnsRetraiteCompT1: 0.081,
  tnsRetraiteCompT2: 0.091,
  tnsRetraiteCompSeuil: 43000,
  tnsMaladie: 0.065,
  tnsIndemnitesJournalieres: 0.005,
  tnsInvaliditeDeces: 0.013,
  tnsAllocFamiliales: 0.031,
  tnsCsgCrds: 0.097,
  tnsCfp: 0.0025,

  sasuPatronales: 0.405,
  sasuSalariales: 0.215,
  portagePatronales: 0.45,
  portageSalariales: 0.215,
  portageFraisGestion: 0.07,
  csgNonDeductible: 0.029,

  salVieillessePlaf: 0.069,
  salVieillesseDeplaf: 0.004,
  salCsgCrds: 0.097,
  salCsgAssiette: 0.9825,
  agircT1: 0.0315,
  agircT2: 0.0864,
  cegT1: 0.0086,
  cegT2: 0.0108,
  cetSalarie: 0.0014,
  apecSalarie: 0.00024,
  cdiPatronales: 0.42,

  fonctPensionCivile: 0.111,
  fonctRafp: 0.05,
  fonctRafpPlafondPrimes: 0.2,
};

export interface SimulationInput {
  tjm: number;
  joursParMois: number;
  moisFactures: number;
  fraisPro: number; // frais professionnels annuels (matériel, mutuelle, compta…)

  situation: SituationFamiliale;
  enfants: number;
  revenuConjoint: number; // revenu net imposable annuel du conjoint

  cdiBrutAnnuel: number;
  statutSalarie: StatutSalarie;
  partPrimes: number; // fonctionnaire : part des primes/indemnités dans le brut, 0..1
  pasManuel: boolean; // utiliser un taux de prélèvement à la source saisi
  tauxPas: number; // taux PAS personnalisé (fiche de paie), 0..0.43

  activite: ActiviteMicro;
  caisse: CaisseRetraite;
  acre: boolean;
  versementLiberatoire: boolean;

  capitalSocial: number; // EURL : seuil des 10 % pour les dividendes
  partRemuneration: number; // EURL/SASU : part de l'enveloppe versée en rémunération (vs dividendes), 0..1
}

export const DEFAULT_INPUT: SimulationInput = {
  tjm: 550,
  joursParMois: 18,
  moisFactures: 11,
  fraisPro: 3000,

  situation: "celibataire",
  enfants: 0,
  revenuConjoint: 0,

  cdiBrutAnnuel: 55000,
  statutSalarie: "cadre",
  partPrimes: 0.2,
  pasManuel: false,
  tauxPas: 0,

  activite: "bnc",
  caisse: "regime-general",
  acre: false,
  versementLiberatoire: false,

  capitalSocial: 1000,
  partRemuneration: 1,
};

export function caAnnuel(input: SimulationInput): number {
  return input.tjm * input.joursParMois * input.moisFactures;
}

export function partsFiscales(input: SimulationInput): number {
  const base = input.situation === "couple" ? 2 : 1;
  const enfants =
    input.enfants <= 2 ? input.enfants * 0.5 : 1 + (input.enfants - 2);
  return base + enfants;
}
