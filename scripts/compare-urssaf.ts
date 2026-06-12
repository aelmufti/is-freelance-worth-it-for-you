// Compare notre moteur au moteur officiel URSSAF (modele-social / mon-entreprise).
// Usage : npx tsx scripts/compare-urssaf.ts
import Engine from "publicodes";
import rules from "modele-social";
import { DEFAULT_PARAMS, DEFAULT_INPUT } from "../src/lib/params";
import {
  cotisationsTns,
  cotisationsSalarialesPrivees,
  cotisationsFonctionnaire,
} from "../src/lib/engine";
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

for (const cadre of [true, false]) {
  console.log(
    `\n=== CDI ${cadre ? "CADRE" : "NON-CADRE"} — brut → net avant impôt / coût employeur ===`,
  );
  for (const brut of [30000, 40000, 55000, 80000, 120000]) {
    const situation = {
      "salarié . contrat": "'CDI'",
      "salarié . contrat . statut cadre": cadre ? "oui" : "non",
      "salarié . contrat . salaire brut": `${brut} €/an`,
      // Pas de complémentaire santé dans notre modèle (montant forfaitaire, pas un taux)
      "salarié . cotisations . prévoyances . santé . montant": "0 €/mois",
    };
    const offNet = urssaf(
      situation,
      "salarié . rémunération . net . à payer avant impôt",
    );
    ligne(
      `Brut ${fmt(brut)} → net`,
      offNet,
      brut - cotisationsSalarialesPrivees(brut, cadre, p),
    );
    const offCout = urssaf(situation, "salarié . coût total employeur");
    ligne(`Brut ${fmt(brut)} → coût employeur`, offCout, brut * (1 + p.cdiPatronales));
  }
}

console.log(
  "\n=== POURQUOI on diffère des convertisseurs forfaitaires (ex. salaire-brut-en-net.fr : non-cadre -22 %, cadre -25 %, fonction publique -17 %) ===",
);
for (const brut of [40000, 55000, 80000]) {
  const situation = {
    "salarié . contrat": "'CDI'",
    "salarié . contrat . statut cadre": "oui",
    "salarié . contrat . salaire brut": `${brut} €/an`,
    "salarié . cotisations . prévoyances . santé . montant": "0 €/mois",
  };
  const offNet = urssaf(
    situation,
    "salarié . rémunération . net . à payer avant impôt",
  );
  const nous = brut - cotisationsSalarialesPrivees(brut, true, p);
  const forfait = brut * (1 - 0.25);
  console.log(
    `Cadre brut ${fmt(brut)} :`.padEnd(28),
    `URSSAF ${fmt(offNet)}`.padEnd(18),
    `nous ${fmt(nous)} (${(((nous - offNet) / offNet) * 100).toFixed(1)} %)`.padEnd(26),
    `forfait -25 % ${fmt(forfait)} (${(((forfait - offNet) / offNet) * 100).toFixed(1)} %)`,
  );
}

console.log("\n=== FONCTIONNAIRE — vérification sur les taux service-public.fr (F468) ===");
// Pension civile 11,10 % du traitement indiciaire ; RAFP 5 % des primes
// (plafonnées à 20 % du TI) ; CSG 9,2 % + CRDS 0,5 % sur 98,25 % du brut.
for (const brut of [30000, 55000, 80000]) {
  const partPrimes = 0.2;
  const ti = brut * (1 - partPrimes);
  const primes = brut * partPrimes;
  const attendu =
    ti * 0.111 +
    Math.min(primes, ti * 0.2) * 0.05 +
    brut * 0.9825 * (0.092 + 0.005);
  ligne(
    `Brut ${fmt(brut)} (primes 20 %) → cotisations`,
    attendu,
    cotisationsFonctionnaire(brut, partPrimes, p),
  );
}

