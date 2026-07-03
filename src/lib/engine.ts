import type { FiscalParams, SimulationInput } from "./params";
import { caAnnuel, PASS_2026, partsFiscales } from "./params";
import { abattementSalaire, impotActivite, impotFoyer } from "./ir";

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
  baseLabel?: string; // dénominateur du taux de restitution (défaut : "CA")
  details: LigneDetail[];
  // Avantages salarié estimés (titres-resto, transport, mutuelle) — indicatif,
  // EXCLU de netAnnuel / tauxRestitution pour ne pas polluer les chiffres validés.
  avantages: number;
  avantagesDetails: LigneDetail[];
  warnings: string[];
}

function finalise(
  r: Omit<
    StatutResult,
    "netMensuel" | "tauxRestitution" | "eligible" | "avantages" | "avantagesDetails"
  > & {
    eligible?: boolean;
    avantages?: number;
    avantagesDetails?: LigneDetail[];
  },
): StatutResult {
  return {
    ...r,
    eligible: r.eligible ?? true,
    avantages: r.avantages ?? 0,
    avantagesDetails: r.avantagesDetails ?? [],
    netMensuel: r.netAnnuel / 12,
    tauxRestitution: r.ca > 0 ? r.netAnnuel / r.ca : 0,
  };
}

// ----------------------------------------------- AVANTAGES SALARIÉ (indicatif)
/**
 * Valeur nette des avantages en nature financés par l'employeur (CDI privé) :
 * titres-resto (part patronale exonérée) + transport (50 % exonéré) + mutuelle
 * (part employeur, IMPOSABLE → on déduit le surcoût d'IR). Hors net validé.
 */
function avantagesCdi(
  input: SimulationInput,
  p: FiscalParams,
  netImposable: number,
): { total: number; details: LigneDetail[] } {
  if (!input.avantagesEstimes) return { total: 0, details: [] };
  const trTitre = Math.max(
    0,
    Math.min(input.trValeurFaciale * input.trPartPatronale, p.trPlafondExo),
  );
  const tr = trTitre * Math.max(0, input.joursTravaillesCdi);
  const transport = Math.max(0, input.transportAnnuel) * p.transportTauxPriseEnCharge;
  const mut = Math.max(0, input.mutuelleEmployeurAnnuel);

  const irBase = impotActivite(abattementSalaire(netImposable, p), input, p);
  const irAvecMut = impotActivite(abattementSalaire(netImposable + mut, p), input, p);
  const mutNet = mut - Math.max(0, irAvecMut - irBase);

  const details: LigneDetail[] = [];
  if (tr > 0)
    details.push({
      label: `Titres-resto — part patronale (${String(Math.round(input.joursTravaillesCdi))} j)`,
      value: tr,
    });
  if (transport > 0)
    details.push({ label: "Transport — 50 % exonéré", value: transport });
  if (mutNet > 0)
    details.push({ label: "Mutuelle employeur — net d'impôt", value: mutNet });

  return { total: tr + transport + mutNet, details };
}

/**
 * En portage, ces avantages sont AUTO-FINANCÉS depuis le CA : le gain réel n'est
 * pas la valeur faciale mais les cotisations + l'impôt évités en routant ce
 * montant via des canaux exonérés plutôt qu'en salaire.
 */
function avantagesPortage(
  input: SimulationInput,
  p: FiscalParams,
  baseImposable: number,
): { total: number; details: LigneDetail[] } {
  if (!input.avantagesEstimes) return { total: 0, details: [] };
  const nbTitres = Math.max(0, input.joursParMois * input.moisFactures);
  const trTitre = Math.max(
    0,
    Math.min(input.trValeurFaciale * input.trPartPatronale, p.trPlafondExo),
  );
  const totalExo =
    trTitre * nbTitres +
    Math.max(0, input.transportAnnuel) * p.transportTauxPriseEnCharge +
    Math.max(0, input.mutuelleEmployeurAnnuel);
  if (totalExo <= 0) return { total: 0, details: [] };

  // Ce que totalExo rapporterait s'il était salarisé (puis − IR marginal).
  const brut = totalExo / (1 + p.portagePatronales);
  const net = brut * (1 - p.portageSalariales);
  const imposableBlock = net + brut * p.csgNonDeductible;
  const irBase = impotActivite(abattementSalaire(baseImposable, p), input, p);
  const irAvec = impotActivite(
    abattementSalaire(baseImposable + imposableBlock, p),
    input,
    p,
  );
  const irBlock = Math.max(0, irAvec - irBase);
  const gain = Math.max(0, totalExo - (net - irBlock));

  return {
    total: gain,
    details: [
      {
        label: "Économie cotisations + impôt (titres-resto, transport, mutuelle)",
        value: gain,
      },
    ],
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
      `CA (${String(Math.round(ca))} €) > plafond micro de ${String(plafond)} € : ce statut n'est pas accessible à ce niveau de revenu.`,
    );
  }
  const seuilTva =
    input.activite === "bic-vente" ? p.microSeuilTvaVente : p.microSeuilTvaService;
  if (ca > seuilTva) {
    warnings.push(
      `CA > ${String(seuilTva)} € : TVA à facturer (sans impact sur le net si clients professionnels).`,
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
        `Versement libératoire : revenu fiscal par part estimé > ${String(p.vflPlafondRfrParPart)} €, vous n'y êtes probablement pas éligible.`,
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
/**
 * Cotisations TNS 2026 (réforme de l'assiette unique) : calculées sur le
 * revenu AVANT cotisations, diminué d'un abattement de 26 %.
 * Barème calibré sur le moteur officiel URSSAF (cf. scripts/compare-urssaf.ts).
 */
export function cotisationsTns(revenuAvantCotisations: number, p: FiscalParams): number {
  if (revenuAvantCotisations <= 0) return 0;
  const assiette = revenuAvantCotisations * (1 - p.tnsAbattementAssiette);
  const pass = PASS_2026;

  const retraiteBase =
    Math.min(assiette, pass) * p.tnsRetraiteBaseT1 +
    Math.max(0, assiette - pass) * p.tnsRetraiteBaseT2;
  const retraiteComp =
    Math.min(assiette, p.tnsRetraiteCompSeuil) * p.tnsRetraiteCompT1 +
    Math.max(0, Math.min(assiette, 4 * pass) - p.tnsRetraiteCompSeuil) *
      p.tnsRetraiteCompT2;

  // Maladie : taux progressif, plein à partir de 110 % du PASS
  const maladie =
    assiette * p.tnsMaladie * Math.min(1, assiette / (1.1 * pass));
  const ij = Math.min(assiette, 5 * pass) * p.tnsIndemnitesJournalieres;
  const invalidite = Math.min(assiette, pass) * p.tnsInvaliditeDeces;

  // Allocations familiales : 0 sous 110 % du PASS, progressif jusqu'à 140 %
  const tauxFamille =
    assiette < 1.1 * pass
      ? 0
      : assiette > 1.4 * pass
        ? p.tnsAllocFamiliales
        : (p.tnsAllocFamiliales * (assiette - 1.1 * pass)) / (0.3 * pass);
  const allocations = assiette * tauxFamille;

  const csg = assiette * p.tnsCsgCrds;
  const cfp = pass * p.tnsCfp;

  return (
    retraiteBase + retraiteComp + maladie + ij + invalidite + allocations + csg + cfp
  );
}

/** Réforme 2026 : plus de circularité, l'assiette part du revenu avant cotisations. */
function tnsDepuisEnveloppe(enveloppe: number, p: FiscalParams): {
  remuneration: number;
  cotisations: number;
} {
  const cotisations = cotisationsTns(enveloppe, p);
  return { remuneration: enveloppe - cotisations, cotisations };
}

// ---------------------------------------------------------------- EI (IR)
export function calcEi(input: SimulationInput, p: FiscalParams): StatutResult {
  const ca = caAnnuel(input);
  const enveloppe = Math.max(0, ca - input.fraisPro);
  const { remuneration, cotisations } = tnsDepuisEnveloppe(enveloppe, p);

  // Une partie de la CSG (2,9 pts sur 9,7) n'est pas déductible de l'IR.
  const csgNonDeductible =
    enveloppe > 0 ? enveloppe * (1 - p.tnsAbattementAssiette) * 0.029 : 0;
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

  const csgNonDeductible = envRemu * (1 - p.tnsAbattementAssiette) * 0.029;
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

  const av = avantagesPortage(input, p, net + brut * p.csgNonDeductible);
  const warnings = [
    "Le portage ouvre droit au chômage et à la retraite du régime général — un filet de sécurité que les autres statuts n'offrent pas.",
  ];
  if (av.total > 0) {
    warnings.push(
      "Avantages auto-financés : en portage, titres-resto, transport et mutuelle sont payés depuis votre CA. La valeur affichée est l'économie de cotisations et d'impôt, pas un cadeau de l'employeur.",
    );
  }

  return finalise({
    id: "portage",
    label: "PORTAGE SALARIAL",
    ca,
    cotisations,
    impots: ir,
    fraisDivers: fraisGestion + input.fraisPro,
    netAnnuel: net - ir,
    avantages: av.total,
    avantagesDetails: av.details,
    details: [
      { label: "Chiffre d'affaires", value: ca },
      { label: `Frais de gestion (${(p.portageFraisGestion * 100).toFixed(0)} %)`, value: -fraisGestion },
      { label: "Frais professionnels", value: -input.fraisPro },
      { label: "Cotisations (salariales + patronales)", value: -cotisations },
      { label: "Impôt sur le revenu", value: -ir },
    ],
    warnings,
  });
}

// ---------------------------------------------------------------- CDI
/**
 * Cotisations salariales du privé, ligne par ligne.
 * Sources : urssaf.fr « Taux de cotisations - Secteur privé » (màj 01/01/2026)
 * et agirc-arrco.fr (retraite complémentaire).
 */
export function cotisationsSalarialesPrivees(
  brut: number,
  cadre: boolean,
  p: FiscalParams,
): number {
  const pass = PASS_2026;
  const t1 = Math.min(brut, pass);
  const t2 = Math.max(0, Math.min(brut, 8 * pass) - pass);

  const vieillesse = t1 * p.salVieillessePlaf + brut * p.salVieillesseDeplaf;
  const retraiteComp = t1 * (p.agircT1 + p.cegT1) + t2 * (p.agircT2 + p.cegT2);
  const cet = brut > pass ? (t1 + t2) * p.cetSalarie : 0;
  const apec = cadre ? Math.min(brut, 4 * pass) * p.apecSalarie : 0;

  // CSG/CRDS : assiette de 98,25 % du brut dans la limite de 4 PASS, 100 % au-delà
  const baseCsg =
    Math.min(brut, 4 * pass) * p.salCsgAssiette + Math.max(0, brut - 4 * pass);
  const csgCrds = baseCsg * p.salCsgCrds;

  return vieillesse + retraiteComp + cet + apec + csgCrds;
}

/**
 * Cotisations « part agent » d'un fonctionnaire (service-public.fr, fiche F468) :
 * pension civile sur le traitement indiciaire, RAFP sur les primes
 * (plafonnées à 20 % du traitement), CSG/CRDS sur l'ensemble.
 */
export function cotisationsFonctionnaire(
  brut: number,
  partPrimes: number,
  p: FiscalParams,
): number {
  const traitement = brut * (1 - partPrimes);
  const primes = brut * partPrimes;

  const pension = traitement * p.fonctPensionCivile;
  const rafp =
    Math.min(primes, traitement * p.fonctRafpPlafondPrimes) * p.fonctRafp;
  const baseCsg =
    Math.min(brut, 4 * PASS_2026) * p.salCsgAssiette +
    Math.max(0, brut - 4 * PASS_2026);
  const csgCrds = baseCsg * p.salCsgCrds;

  return pension + rafp + csgCrds;
}

export function calcCdi(input: SimulationInput, p: FiscalParams): StatutResult {
  const brut = input.cdiBrutAnnuel;
  const fonctionnaire = input.statutSalarie === "fonctionnaire";

  const cotisations = fonctionnaire
    ? cotisationsFonctionnaire(brut, input.partPrimes, p)
    : cotisationsSalarialesPrivees(brut, input.statutSalarie === "cadre", p);
  const net = brut - cotisations;

  // Net imposable (avant déduction de 10 %) : net versé + CSG/CRDS non déductible
  const netImposable = net + brut * p.csgNonDeductible;

  // Taux de prélèvement à la source du foyer (CGI art. 204 H, BOI-IR-PAS-20-20-10) :
  // IR du foyer / revenus nets imposables AVANT la déduction de 10 %.
  const conjointImposable =
    input.situation === "couple" ? Math.max(0, input.revenuConjoint) : 0;
  const irFoyer = impotFoyer(
    conjointImposable + abattementSalaire(netImposable, p),
    input,
    p,
  );
  const assiettePas = netImposable + conjointImposable;
  const tauxPasBareme = assiettePas > 0 ? irFoyer / assiettePas : 0;
  const fmtPct = (t: number) => (t * 100).toFixed(1).replace(".", ",");

  let ir: number;
  let labelIr: string;
  if (input.pasManuel) {
    // Retenue à la source = taux saisi × salaire net imposable (CGI art. 204 H)
    ir = netImposable * Math.max(0, input.tauxPas);
    labelIr = `Prélèvement à la source (taux saisi ${fmtPct(input.tauxPas)} %)`;
  } else {
    ir = impotActivite(abattementSalaire(netImposable, p), input, p);
    labelIr = `Impôt sur le revenu (taux PAS ≈ ${fmtPct(tauxPasBareme)} %)`;
  }

  const labels: Record<string, string> = {
    cadre: "CDI (CADRE)",
    "non-cadre": "CDI (NON-CADRE)",
    fonctionnaire: "FONCTIONNAIRE",
  };

  const warnings: string[] = [];
  if (fonctionnaire) {
    warnings.push(
      `Hypothèse : primes/indemnités = ${String(Math.round(input.partPrimes * 100))} % du brut. Pension civile 11,10 % sur le traitement indiciaire, RAFP 5 % sur les primes (source : service-public.fr).`,
    );
  }
  if (input.pasManuel) {
    warnings.push(
      `Taux PAS saisi : l'impôt définitif est régularisé après la déclaration annuelle (estimation au barème 2026 du foyer : ${fmtPct(tauxPasBareme)} %).`,
    );
  }

  if (fonctionnaire) {
    return finalise({
      id: "cdi",
      label: labels[input.statutSalarie],
      ca: brut,
      cotisations,
      impots: ir,
      fraisDivers: 0,
      netAnnuel: net - ir,
      baseLabel: "brut",
      details: [
        { label: "Traitement brut + primes", value: brut },
        { label: "Pension civile, RAFP, CSG-CRDS", value: -cotisations },
        { label: labelIr, value: -ir },
      ],
      warnings,
    });
  }

  const av = avantagesCdi(input, p, netImposable);
  const coutEmployeur = brut * (1 + p.cdiPatronales);
  return finalise({
    id: "cdi",
    label: labels[input.statutSalarie],
    ca: coutEmployeur,
    cotisations: cotisations + brut * p.cdiPatronales,
    impots: ir,
    fraisDivers: 0,
    netAnnuel: net - ir,
    avantages: av.total,
    avantagesDetails: av.details,
    baseLabel: "coût employeur",
    details: [
      { label: "Coût total employeur", value: coutEmployeur },
      { label: "Salaire brut", value: brut },
      { label: "Cotisations salariales", value: -cotisations },
      { label: labelIr, value: -ir },
    ],
    warnings,
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

/**
 * Salaire brut annuel CDI dont le net après impôt égale le net annuel visé
 * (recherche binaire — réciproque de tjmEquivalentCdi, côté salarié).
 */
export function brutCdiEquivalent(
  input: SimulationInput,
  p: FiscalParams,
  netAnnuelCible: number,
): number | null {
  let lo = 10000;
  let hi = 1000000;
  const net = (brut: number) =>
    calcCdi({ ...input, cdiBrutAnnuel: brut }, p).netAnnuel;
  if (net(hi) < netAnnuelCible || net(lo) > netAnnuelCible) return null;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (net(mid) >= netAnnuelCible) hi = mid;
    else lo = mid;
  }
  return hi;
}
