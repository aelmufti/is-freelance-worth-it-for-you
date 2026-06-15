// Validation du moteur contre le calculateur officiel URSSAF (modele-social,
// le moteur de mon-entreprise.urssaf.fr). Tolérance : 2 % en régime courant,
// 4 % sur les cas extrêmes (réduction générale de charges et hauts revenus
// TNS non modélisés finement).
import { describe, expect, it } from "vitest";
import Engine from "publicodes";
import rules from "modele-social";
import { DEFAULT_PARAMS, DEFAULT_INPUT } from "../src/lib/params";
import {
  calcAll,
  calcCdi,
  calcPortage,
  cotisationsSalarialesPrivees,
  cotisationsTns,
} from "../src/lib/engine";
import { impotFoyer } from "../src/lib/ir";

const p = DEFAULT_PARAMS;

function urssaf(situation: Record<string, unknown>, objectif: string): number {
  const engine = new Engine(rules, {
    logger: { warn() {}, error() {}, log() {} },
  });
  engine.setSituation(situation as never);
  const v = engine.evaluate({ valeur: objectif, unité: "€/an" }).nodeValue;
  if (typeof v !== "number") throw new Error(`URSSAF n'a pas évalué ${objectif}`);
  return v;
}

function expectClose(nous: number, officiel: number, tolerancePct: number) {
  const delta = Math.abs((nous - officiel) / officiel) * 100;
  expect(delta, `écart ${delta.toFixed(1)} % (URSSAF ${Math.round(officiel)}, nous ${Math.round(nous)})`).toBeLessThanOrEqual(tolerancePct);
}

const EI_BASE = {
  "entreprise . catégorie juridique": "'EI'",
  "entreprise . catégorie juridique . EI . auto-entrepreneur": "non",
  "entreprise . imposition": "'IR'",
  "entreprise . imposition . IR . type de bénéfices": "'BNC'",
  "entreprise . activité . nature": "'libérale'",
  "entreprise . activité . nature . libérale . réglementée": "non",
  "entreprise . date de création": "01/01/2023",
};

describe("micro-entreprise BNC : cotisations + CFP vs URSSAF", () => {
  for (const ca of [30000, 60000, 80000]) {
    it(`CA ${ca} €`, () => {
      const off = urssaf(
        {
          ...EI_BASE,
          "entreprise . catégorie juridique . EI . auto-entrepreneur": "oui",
          "dirigeant . auto-entrepreneur . chiffre d'affaires": `${ca} €/an`,
        },
        "dirigeant . auto-entrepreneur . cotisations et contributions",
      );
      expectClose(ca * (p.microCotisations.bnc + p.microCfp.bnc), off, 1);
    });
  }
});

describe("TNS (EI/EURL) : cotisations vs URSSAF", () => {
  for (const [totale, tol] of [
    [40000, 2],
    [70000, 2],
    [110000, 2],
    [160000, 4],
  ] as const) {
    it(`rémunération totale ${totale} €`, () => {
      const off = urssaf(
        { ...EI_BASE, "dirigeant . rémunération . totale": `${totale} €/an` },
        "dirigeant . indépendant . cotisations et contributions",
      );
      expectClose(cotisationsTns(totale, p), off, tol);
    });
  }
});

describe("impôt sur le revenu (barème, célibataire) vs URSSAF", () => {
  for (const totale of [40000, 70000, 110000]) {
    it(`scénario EI à ${totale} €`, () => {
      const situation = {
        ...EI_BASE,
        "dirigeant . rémunération . totale": `${totale} €/an`,
        "impôt . méthode de calcul": "'barème standard'",
      };
      const offIr = urssaf(situation, "impôt . montant");
      const offImposable = urssaf(situation, "impôt . revenu imposable");
      const nous = impotFoyer(
        offImposable,
        { ...DEFAULT_INPUT, situation: "celibataire", enfants: 0 },
        p,
      );
      expectClose(nous, offIr, 1);
    });
  }
});

describe("SASU (assimilé salarié) : coût total → net vs URSSAF", () => {
  for (const totale of [50000, 90000]) {
    it(`coût total ${totale} €`, () => {
      const off = urssaf(
        {
          "entreprise . catégorie juridique": "'SAS'",
          "entreprise . catégorie juridique . SAS . unipersonnelle": "oui",
          "entreprise . imposition": "'IS'",
          "entreprise . date de création": "01/01/2023",
          "dirigeant . rémunération . totale": `${totale} €/an`,
        },
        "salarié . rémunération . net . à payer avant impôt",
      );
      const brut = totale / (1 + p.sasuPatronales);
      expectClose(brut * (1 - p.sasuSalariales), off, 2);
    });
  }
});

describe("CDI cadre : brut → net et coût employeur vs URSSAF", () => {
  for (const brut of [40000, 55000, 80000]) {
    const situation = {
      "salarié . contrat": "'CDI'",
      "salarié . contrat . statut cadre": "oui",
      "salarié . contrat . salaire brut": `${brut} €/an`,
    };
    it(`brut ${brut} € → net`, () => {
      const off = urssaf(situation, "salarié . rémunération . net . à payer avant impôt");
      expectClose(brut - cotisationsSalarialesPrivees(brut, true, p), off, 2);
    });
    it(`brut ${brut} € → coût employeur`, () => {
      const off = urssaf(situation, "salarié . coût total employeur");
      expectClose(brut * (1 + p.cdiPatronales), off, 4);
    });
  }
});

describe("avantages salarié (estimation indicative)", () => {
  const ON = { ...DEFAULT_INPUT, avantagesEstimes: true };

  const detail = (lignes: { label: string; value: number }[], prefix: string) =>
    lignes.find((d) => d.label.startsWith(prefix))?.value ?? 0;

  it("toggle OFF (défaut) : aucun avantage sur aucun statut", () => {
    for (const r of calcAll(DEFAULT_INPUT, p)) {
      expect(r.avantages).toBe(0);
      expect(r.avantagesDetails).toHaveLength(0);
    }
  });

  it("le toggle ne modifie jamais le net validé ni le taux de restitution", () => {
    const off = calcAll(DEFAULT_INPUT, p);
    const on = calcAll(ON, p);
    off.forEach((r, i) => {
      expect(on[i].netAnnuel).toBe(r.netAnnuel);
      expect(on[i].tauxRestitution).toBe(r.tauxRestitution);
    });
  });

  it("seuls CDI et portage portent des avantages", () => {
    for (const r of calcAll(ON, p)) {
      if (r.id === "cdi" || r.id === "portage") expect(r.avantages).toBeGreaterThan(0);
      else expect(r.avantages).toBe(0);
    }
  });

  it("CDI : titres-resto + transport exonérés, total = somme des lignes", () => {
    const cdi = calcCdi(ON, p);
    const trTitre = Math.min(ON.trValeurFaciale * ON.trPartPatronale, p.trPlafondExo);
    expect(detail(cdi.avantagesDetails, "Titres-resto")).toBeCloseTo(
      trTitre * ON.joursTravaillesCdi,
      6,
    );
    expect(detail(cdi.avantagesDetails, "Transport")).toBeCloseTo(
      ON.transportAnnuel * p.transportTauxPriseEnCharge,
      6,
    );
    const somme = cdi.avantagesDetails.reduce((s, d) => s + d.value, 0);
    expect(cdi.avantages).toBeCloseTo(somme, 6);
  });

  it("CDI : la mutuelle est imposable → part nette strictement < part employeur", () => {
    const cdi = calcCdi(ON, p);
    const mutNet = detail(cdi.avantagesDetails, "Mutuelle");
    expect(mutNet).toBeGreaterThan(0);
    expect(mutNet).toBeLessThan(ON.mutuelleEmployeurAnnuel);
  });

  it("titre-resto : la part patronale est plafonnée à trPlafondExo", () => {
    // 20 € × 60 % = 12 € > plafond 7,32 € → la ligne doit être plafonnée
    const cdi = calcCdi({ ...ON, trValeurFaciale: 20, trPartPatronale: 0.6 }, p);
    expect(detail(cdi.avantagesDetails, "Titres-resto")).toBeCloseTo(
      p.trPlafondExo * ON.joursTravaillesCdi,
      6,
    );
  });

  it("portage : gain auto-financé > 0 mais < valeur employeur-financée du CDI", () => {
    const portage = calcPortage(ON, p);
    const cdi = calcCdi(ON, p);
    expect(portage.avantages).toBeGreaterThan(0);
    // En portage le gain n'est que l'économie de charges/impôt, pas la valeur faciale.
    expect(portage.avantages).toBeLessThan(cdi.avantages);
  });

  it("portage : un warning explique le caractère auto-financé", () => {
    const portage = calcPortage(ON, p);
    expect(portage.warnings.some((w) => w.toLowerCase().includes("auto-financé"))).toBe(true);
  });

  it("avantages tous nuls si les montants saisis sont à zéro", () => {
    const zero = {
      ...ON,
      trValeurFaciale: 0,
      transportAnnuel: 0,
      mutuelleEmployeurAnnuel: 0,
    };
    expect(calcCdi(zero, p).avantages).toBe(0);
    expect(calcPortage(zero, p).avantages).toBe(0);
  });
});
