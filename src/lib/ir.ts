import type { FiscalParams, SimulationInput } from "./params";
import { partsFiscales } from "./params";

function impotParPart(quotient: number, bareme: Array<[number, number]>): number {
  let impot = 0;
  for (let i = 0; i < bareme.length; i++) {
    const [seuil, taux] = bareme[i];
    const plafond = i + 1 < bareme.length ? bareme[i + 1][0] : Infinity;
    if (quotient <= seuil) break;
    impot += (Math.min(quotient, plafond) - seuil) * taux;
  }
  return impot;
}

/** Impôt du foyer sur un revenu net imposable total (barème + quotient familial + décote). */
export function impotFoyer(
  revenuImposable: number,
  input: SimulationInput,
  p: FiscalParams,
): number {
  if (revenuImposable <= 0) return 0;
  const parts = partsFiscales(input);
  let impot = impotParPart(revenuImposable / parts, p.irBareme) * parts;

  const couple = input.situation === "couple";
  const seuil = couple ? p.decoteSeuilCouple : p.decoteSeuilSolo;
  const forfait = couple ? p.decoteForfaitCouple : p.decoteForfaitSolo;
  if (impot <= seuil) {
    impot = Math.max(0, impot - Math.max(0, forfait - impot * p.decoteTaux));
  }
  return Math.max(0, impot);
}

/** Abattement de 10 % pour frais professionnels (revenus salariaux). */
export function abattementSalaire(brut: number, p: FiscalParams): number {
  return brut - Math.min(brut * p.abattementSalaireTaux, p.abattementSalaireMax);
}

/**
 * Impôt attribuable à un revenu d'activité : différence entre l'impôt du foyer
 * avec et sans ce revenu (le conjoint est toujours inclus dans la base).
 */
export function impotActivite(
  revenuImposableActivite: number,
  input: SimulationInput,
  p: FiscalParams,
): number {
  const conjointImposable =
    input.situation === "couple" ? Math.max(0, input.revenuConjoint) : 0;
  const avec = impotFoyer(conjointImposable + revenuImposableActivite, input, p);
  const sans = impotFoyer(conjointImposable, input, p);
  return Math.max(0, avec - sans);
}
