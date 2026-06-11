import type { FiscalParams, SimulationInput } from "./params";
import { caAnnuel, PASS_2026, partsFiscales } from "./params";
import { abattementSalaire, impotActivite } from "./ir";

export type StatutId = "micro" | "ei" | "eurl" | "sasu" | "portage" | "cdi";

export interface LigneDetail {
  label: string;
  value: number; // négatif = prélèvement, positif = revenu
}

export interface StatutResult {
  id: StatutId;
  label: string;
  ca: number;
  cotisations: number;
  impots: number; // IR + IS + flat tax
  fraisDivers: number; // frais pro + frais de gestion
  netAnnuel: number;
  netMensuel: number;
  tauxRestitution: number;
  eligible: boolean;
  details: LigneDetail[];
  warnings: string[];
}

function finalise(
  r: Omit<StatutResult, "netMensuel" | "tauxRestitution" | "eligible"> & {
    eligible?: boolean;
  },
): StatutResult {
  return {
    ...r,
    eligible: r.eligible ?? true,
    netMensuel: r.netAnnuel / 12,
    tauxRestitution: r.ca > 0 ? r.netAnnuel / r.ca : 0,
  };
}

// ---------------------------------------------------------------- MICRO
export function calcMicro(input: SimulationInput, p: FiscalParams): StatutResult {
  const ca = caAnnuel(input);
  const warnings: string[] = [];

  const plafond =
    input.activite === "bic-vente" ? p.microPlafondVente : p.microPlafondService;
  const eligible = ca <= plafond;
  if (!eligible) {
    warnings.push(
      `CA (${Math.round(ca).toLocaleString("fr-FR")} €) > plafond micro de ${plafond.toLocaleString("fr-FR")} € : ce statut n'est pas accessible à ce niveau de revenu.`,
    );
  }
  const seuilTva =
    input.activite === "bic-vente" ? p.microSeuilTvaVente : p.microSeuilTvaService;
  if (ca > seuilTva) {
    warnings.push(
      `CA > ${seuilTva.toLocaleString("fr-FR")} € : TVA à facturer (sans impact sur le net si clients professionnels).`,
    );
  }

  let tauxCotis =
    input.activite === "bnc" && input.caisse === "cipav"
      ? p.microCotisationsCipav
      : p.microCotisations[input.activite];
  if (input.acre) tauxCotis *= 1 - p.acreReduction;
  const cotisations = ca * (tauxCotis + p.microCfp[input.activite]);

  const abattement = p.microAbattement[input.activite];
  // L'abattement forfaitaire est d'au moins 305 €.
  const beneficeImposable = Math.max(0, ca - Math.max(ca * abattement, 305));

  let ir: number;
  if (input.versementLiberatoire) {
    ir = ca * p.microVfl[input.activite];
    const rfrParPart = beneficeImposable / partsFiscales(input);
    if (rfrParPart > p.vflPlafondRfrParPart) {
      warnings.push(
        `Versement libératoire : revenu fiscal par part estimé > ${p.vflPlafondRfrParPart.toLocaleString("fr-FR")} €, vous n'y êtes probablement pas éligible.`,
      );
    }
  } else {
    ir = impotActivite(beneficeImposable, input, p);
  }

  // En micro, les frais réels ne sont pas déductibles mais restent payés de votre poche.
  const netAnnuel = ca - cotisations - ir - input.fraisPro;
  if (input.fraisPro > 0) {
    warnings.push(
      "En micro, vos frais réels ne sont pas déductibles : l'abattement forfaitaire s'applique quoi qu'il arrive.",
    );
  }

  return finalise({
    id: "micro",
    label: "MICRO-ENTREPRISE",
    eligible,
    ca,
    cotisations,
    impots: ir,
    fraisDivers: input.fraisPro,
    netAnnuel,
    details: [
      { label: "Chiffre d'affaires", value: ca },
      { label: "Cotisations sociales + CFP", value: -cotisations },
      { label: input.versementLiberatoire ? "Versement libératoire" : "Impôt sur le revenu", value: -ir },
      { label: "Frais professionnels (non déductibles)", value: -input.fraisPro },
    ],
    warnings,
  });
}

// ------------------------------------------------------- TNS (EI / EURL)
/** Cotisations TNS 2026 : assiette unique = revenu × (1 − 26 %), barème simplifié. */
export function cotisationsTns(revenu: number, p: FiscalParams): number {
  if (revenu <= 0) return 0;
  const assiette = revenu * (1 - p.tnsAbattementAssiette);
  const pass = PASS_2026;

  const retraiteBase =
    Math.min(assiette, pass) * p.tnsRetraiteBaseT1 +
    Math.max(0, assiette - pass) * p.tnsRetraiteBaseT2;
  const retraiteComp =
    Math.min(assiette, p.tnsRetraiteCompSeuil) * p.tnsRetraiteCompT1 +
    Math.max(0, Math.min(assiette, 4 * pass) - p.tnsRetraiteCompSeuil) *
      p.tnsRetraiteCompT2;
  const maladie = assiette * p.tnsMaladie;
  const invalidite = Math.min(assiette, pass) * p.tnsInvaliditeDeces;
  const allocations = assiette * p.tnsAllocFamiliales;
  const csg = assiette * p.tnsCsgCrds;
  const cfp = pass * p.tnsCfp;

  return retraiteBase + retraiteComp + maladie + invalidite + allocations + csg + cfp;
}

/**
 * En réalité les cotisations sont calculées sur le revenu APRÈS cotisations
 * (problème circulaire) — résolu par itération.
 */
function tnsDepuisEnveloppe(enveloppe: number, p: FiscalParams): {
  remuneration: number;
  cotisations: number;
} {
  let remuneration = enveloppe * 0.72;
  for (let i = 0; i < 30; i++) {
    const cot = cotisationsTns(remuneration, p);
    const next = enveloppe - cot;
    if (Math.abs(next - remuneration) < 0.5) break;
    remuneration = next;
  }
  return { remuneration, cotisations: enveloppe - remuneration };
}

// ---------------------------------------------------------------- EI (IR)
export function calcEi(input: SimulationInput, p: FiscalParams): StatutResult {
  const ca = caAnnuel(input);
  const enveloppe = Math.max(0, ca - input.fraisPro);
  const { remuneration, cotisations } = tnsDepuisEnveloppe(enveloppe, p);

  // Une partie de la CSG (2,4 pts sur 9,7) n'est pas déductible de l'IR.
  const csgNonDeductible =
    remuneration > 0
      ? remuneration * (1 - p.tnsAbattementAssiette) * 0.029
      : 0;
  const imposable = Math.max(0, remuneration + csgNonDeductible);
  const ir = impotActivite(imposable, input, p);

  return finalise({
    id: "ei",
    label: "EI AU RÉEL (IR)",
    ca,
    cotisations,
    impots: ir,
    fraisDivers: input.fraisPro,
    netAnnuel: remuneration - ir,
    details: [
      { label: "Chiffre d'affaires", value: ca },
      { label: "Frais professionnels (déductibles)", value: -input.fraisPro },
      { label: "Cotisations sociales TNS", value: -cotisations },
      { label: "Impôt sur le revenu", value: -ir },
    ],
    warnings: [],
  });
}

// ---------------------------------------------------------------- EURL (IS)
export function calcEurl(input: SimulationInput, p: FiscalParams): StatutResult {
  const ca = caAnnuel(input);
  const warnings: string[] = [];
  const enveloppe = Math.max(0, ca - input.fraisPro);

  const envRemu = enveloppe * input.partRemuneration;
  const { remuneration, cotisations } = tnsDepuisEnveloppe(envRemu, p);

  const resultatAvantIs = enveloppe - envRemu;
  const is =
    Math.min(resultatAvantIs, p.isSeuilTauxReduit) * p.isTauxReduit +
    Math.max(0, resultatAvantIs - p.isSeuilTauxReduit) * p.isTauxNormal;
  const distribuable = Math.max(0, resultatAvantIs - is);

  // Dividendes : ≤ 10 % du capital → flat tax ; au-delà → cotisations TNS + IR 12,8 %
  const seuil10 = input.capitalSocial * 0.1;
  const divFlat = Math.min(distribuable, seuil10);
  const divTns = Math.max(0, distribuable - seuil10);
  const taxeDivFlat = divFlat * p.flatTax;
  const cotisDivTns = cotisationsTns(divTns, p);
  const irDivTns = divTns * 0.128;
  if (divTns > 0) {
    warnings.push(
      "Dividendes au-delà de 10 % du capital social : soumis aux cotisations TNS (et non aux prélèvements sociaux de 18,6 %).",
    );
  }

  const csgNonDeductible =
    remuneration * (1 - p.tnsAbattementAssiette) * 0.029;
  const ir = impotActivite(Math.max(0, remuneration + csgNonDeductible), input, p);

  const netAnnuel =
    remuneration - ir + divFlat - taxeDivFlat + divTns - cotisDivTns - irDivTns;

  return finalise({
    id: "eurl",
    label: "EURL (IS)",
    ca,
    cotisations: cotisations + cotisDivTns,
    impots: ir + is + taxeDivFlat + irDivTns,
    fraisDivers: input.fraisPro,
    netAnnuel,
    details: [
      { label: "Chiffre d'affaires", value: ca },
      { label: "Frais professionnels (déductibles)", value: -input.fraisPro },
      { label: "Cotisations sociales TNS", value: -(cotisations + cotisDivTns) },
      { label: "Impôt sur les sociétés", value: -is },
      { label: "Fiscalité des dividendes", value: -(taxeDivFlat + irDivTns) },
      { label: "Impôt sur le revenu", value: -ir },
    ],
    warnings,
  });
}

// ---------------------------------------------------------------- SASU (IS)
export function calcSasu(input: SimulationInput, p: FiscalParams): StatutResult {
  const ca = caAnnuel(input);
  const enveloppe = Math.max(0, ca - input.fraisPro);

  const coutEmployeur = enveloppe * input.partRemuneration;
  const brut = coutEmployeur / (1 + p.sasuPatronales);
  const net = brut * (1 - p.sasuSalariales);
  const cotisations = coutEmployeur - net;

  const resultatAvantIs = enveloppe - coutEmployeur;
  const is =
    Math.min(resultatAvantIs, p.isSeuilTauxReduit) * p.isTauxReduit +
    Math.max(0, resultatAvantIs - p.isSeuilTauxReduit) * p.isTauxNormal;
  const dividendes = Math.max(0, resultatAvantIs - is);
  const flatTax = dividendes * p.flatTax;

  const imposable = abattementSalaire(net + brut * p.csgNonDeductible, p);
  const ir = impotActivite(imposable, input, p);

  const netAnnuel = net - ir + dividendes - flatTax;

  return finalise({
    id: "sasu",
    label: "SASU (IS)",
    ca,
    cotisations,
    impots: ir + is + flatTax,
    fraisDivers: input.fraisPro,
    netAnnuel,
    details: [
      { label: "Chiffre d'affaires", value: ca },
      { label: "Frais professionnels (déductibles)", value: -input.fraisPro },
      { label: "Cotisations (salariales + patronales)", value: -cotisations },
      { label: "Impôt sur les sociétés", value: -is },
      { label: "Flat tax sur dividendes (31,4 %)", value: -flatTax },
      { label: "Impôt sur le revenu", value: -ir },
    ],
    warnings: [],
  });
}

// ---------------------------------------------------------------- PORTAGE
export function calcPortage(input: SimulationInput, p: FiscalParams): StatutResult {
  const ca = caAnnuel(input);
  const fraisGestion = ca * p.portageFraisGestion;
  const enveloppe = Math.max(0, ca - fraisGestion - input.fraisPro);

  const brut = enveloppe / (1 + p.portagePatronales);
  const net = brut * (1 - p.portageSalariales);
  const cotisations = enveloppe - net;

  const imposable = abattementSalaire(net + brut * p.csgNonDeductible, p);
  const ir = impotActivite(imposable, input, p);

  return finalise({
    id: "portage",
    label: "PORTAGE SALARIAL",
    ca,
    cotisations,
    impots: ir,
    fraisDivers: fraisGestion + input.fraisPro,
    netAnnuel: net - ir,
    details: [
      { label: "Chiffre d'affaires", value: ca },
      { label: `Frais de gestion (${(p.portageFraisGestion * 100).toFixed(0)} %)`, value: -fraisGestion },
      { label: "Frais professionnels", value: -input.fraisPro },
      { label: "Cotisations (salariales + patronales)", value: -cotisations },
      { label: "Impôt sur le revenu", value: -ir },
    ],
    warnings: [
      "Le portage ouvre droit au chômage et à la retraite du régime général — un filet de sécurité que les autres statuts n'offrent pas.",
    ],
  });
}

// ---------------------------------------------------------------- CDI
export function calcCdi(input: SimulationInput, p: FiscalParams): StatutResult {
  const brut = input.cdiBrutAnnuel;
  const net = brut * (1 - p.cdiSalariales);
  const cotisations = brut * p.cdiSalariales;

  const imposable = abattementSalaire(net + brut * p.csgNonDeductible, p);
  const ir = impotActivite(imposable, input, p);

  const coutEmployeur = brut * (1 + p.cdiPatronales);

  return finalise({
    id: "cdi",
    label: "CDI (CADRE)",
    ca: coutEmployeur,
    cotisations: cotisations + brut * p.cdiPatronales,
    impots: ir,
    fraisDivers: 0,
    netAnnuel: net - ir,
    details: [
      { label: "Coût total employeur", value: coutEmployeur },
      { label: "Salaire brut", value: brut },
      { label: "Cotisations salariales", value: -cotisations },
      { label: "Impôt sur le revenu", value: -ir },
    ],
    warnings: [],
  });
}

// ---------------------------------------------------------------- GLOBAL
export function calcAll(input: SimulationInput, p: FiscalParams): StatutResult[] {
  return [
    calcMicro(input, p),
    calcEi(input, p),
    calcEurl(input, p),
    calcSasu(input, p),
    calcPortage(input, p),
    calcCdi(input, p),
  ];
}

/** TJM minimal pour égaler le net annuel du CDI, par statut (recherche binaire). */
export function tjmEquivalentCdi(
  input: SimulationInput,
  p: FiscalParams,
  statut: (i: SimulationInput, p: FiscalParams) => StatutResult,
): number | null {
  const cible = calcCdi(input, p).netAnnuel;
  let lo = 1;
  let hi = 5000;
  if (statut({ ...input, tjm: hi }, p).netAnnuel < cible) return null;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (statut({ ...input, tjm: mid }, p).netAnnuel >= cible) hi = mid;
    else lo = mid;
  }
  // Statut inaccessible à ce niveau de CA (ex. plafond micro dépassé)
  if (!statut({ ...input, tjm: hi }, p).eligible) return null;
  return hi;
}
