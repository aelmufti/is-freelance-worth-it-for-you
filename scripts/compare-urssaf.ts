// Compare notre moteur au moteur officiel URSSAF (modele-social / mon-entreprise).
// Usage : npx tsx scripts/compare-urssaf.ts
import Engine from "publicodes";
import rules from "modele-social";
import { DEFAULT_PARAMS, DEFAULT_INPUT } from "../src/lib/params";
import { cotisationsTns } from "../src/lib/engine";
import { impotFoyer } from "../src/lib/ir";

const p = DEFAULT_PARAMS;
const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR") + " €";

function urssaf(situation: Record<string, unknown>, objectif: string): number {
  const engine = new Engine(rules, {
    logger: { warn() {}, error() {}, log() {} },
  });
  engine.setSituation(situation as never);
  const r = engine.evaluate({ valeur: objectif, unité: "€/an" });
  if (r.nodeValue == null) {
    console.log(
      "   [variables manquantes]",
      Object.keys(r.missingVariables ?? {}).slice(0, 6).join(" | "),
    );
    return NaN;
  }
  return r.nodeValue as number;
}

function ligne(label: string, officiel: number, nous: number) {
  const delta = officiel !== 0 ? ((nous - officiel) / officiel) * 100 : NaN;
  const flag = Math.abs(delta) > 3 ? " ⚠️" : " ✓";
  console.log(
    label.padEnd(48),
    ("URSSAF " + fmt(officiel)).padEnd(18),
    ("nous " + fmt(nous)).padEnd(16),
    (delta >= 0 ? "+" : "") + delta.toFixed(1) + " %" + flag,
  );
}

const MICRO_BASE = {
  "entreprise . catégorie juridique": "'EI'",
  "entreprise . catégorie juridique . EI . auto-entrepreneur": "oui",
  "entreprise . activité . nature": "'libérale'",
  "entreprise . activité . nature . libérale . réglementée": "non",
  "entreprise . imposition . IR . type de bénéfices": "'BNC'",
  "entreprise . date de création": "01/01/2023",
};

console.log("=== MICRO-ENTREPRISE BNC (régime général) — cotisations + CFP ===");
for (const ca of [30000, 60000, 80000]) {
  const off = urssaf(
    {
      ...MICRO_BASE,
      "dirigeant . auto-entrepreneur . chiffre d'affaires": `${ca} €/an`,
    },
    "dirigeant . auto-entrepreneur . cotisations et contributions",
  );
  const nous = ca * (p.microCotisations.bnc + p.microCfp.bnc);
  ligne(`CA ${fmt(ca)}`, off, nous);
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

console.log("\n=== EI AU RÉEL BNC (TNS) — cotisations depuis rémunération totale ===");
for (const totale of [40000, 70000, 110000, 160000]) {
  const off = urssaf(
    { ...EI_BASE, "dirigeant . rémunération . totale": `${totale} €/an` },
    "dirigeant . indépendant . cotisations et contributions",
  );
  ligne(`Rému totale ${fmt(totale)}`, off, cotisationsTns(totale, p));
}

console.log("\n=== IR (barème, célibataire, 1 part) — via le scénario EI ===");
for (const totale of [40000, 70000, 110000]) {
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
  ligne(`Imposable ${fmt(offImposable)}`, offIr, nous);
}

console.log("\n=== SASU (assimilé salarié) — du coût total au net ===");
for (const totale of [50000, 90000]) {
  const offNet = urssaf(
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
  ligne(`Coût total ${fmt(totale)} → net`, offNet, brut * (1 - p.sasuSalariales));
}

console.log("\n=== CDI CADRE — brut → net avant impôt / coût employeur ===");
for (const brut of [40000, 55000, 80000]) {
  const situation = {
    "salarié . contrat": "'CDI'",
    "salarié . contrat . statut cadre": "oui",
    "salarié . contrat . salaire brut": `${brut} €/an`,
  };
  const offNet = urssaf(situation, "salarié . rémunération . net . à payer avant impôt");
  ligne(`Brut ${fmt(brut)} → net`, offNet, brut * (1 - p.cdiSalariales));
  const offCout = urssaf(situation, "salarié . coût total employeur");
  ligne(`Brut ${fmt(brut)} → coût employeur`, offCout, brut * (1 + p.cdiPatronales));
}

