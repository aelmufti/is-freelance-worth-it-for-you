// Génère le tableau « TJM break-even par statut » à partir du VRAI moteur.
// Même scénario que la FAQ (DEFAULT_INPUT) : cadre, célibataire sans enfant,
// 18 j × 11 mois, 3 000 € de frais pro. Le seul paramètre qui varie est le
// brut annuel du CDI de référence.
//
//   npx tsx scripts/breakeven-table.ts            → markdown
//   npx tsx scripts/breakeven-table.ts --json      → JSON (pour la page)
import { DEFAULT_INPUT, DEFAULT_PARAMS } from "../src/lib/params";
import {
  calcCdi,
  calcEi,
  calcEurl,
  calcMicro,
  calcPortage,
  calcSasu,
  tjmEquivalentCdi,
} from "../src/lib/engine";

const BRUTS = [35000, 40000, 45000, 50000, 55000, 60000, 70000, 80000, 90000, 100000, 120000];
const p = DEFAULT_PARAMS;

const STATUTS = [
  { id: "micro", label: "Micro (BNC)", calc: calcMicro },
  { id: "ei", label: "EI au réel", calc: calcEi },
  { id: "eurl", label: "EURL (IS)", calc: calcEurl },
  { id: "sasu", label: "SASU", calc: calcSasu },
  { id: "portage", label: "Portage", calc: calcPortage },
] as const;

const round5 = (n: number) => Math.round(n / 5) * 5;

interface Row {
  brut: number;
  netCdiMensuel: number;
  seuils: Record<string, number | null>;
}

const rows: Row[] = BRUTS.map((brut) => {
  const input = { ...DEFAULT_INPUT, cdiBrutAnnuel: brut };
  const netCdiMensuel = calcCdi(input, p).netMensuel;
  const seuils: Record<string, number | null> = {};
  for (const s of STATUTS) {
    const tjm = tjmEquivalentCdi(input, p, s.calc);
    seuils[s.id] = tjm === null ? null : round5(tjm);
  }
  return { brut, netCdiMensuel, seuils };
});

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ scenario: DEFAULT_INPUT, rows }, null, 2));
} else {
  const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;
  const cell = (v: number | null) => (v === null ? "—" : `${String(v)} €`);
  const header = ["Brut CDI/an", "Net CDI/mois", ...STATUTS.map((s) => s.label)];
  console.log(`| ${header.join(" | ")} |`);
  console.log(`|${header.map(() => "---").join("|")}|`);
  for (const r of rows) {
    const cells = [
      eur(r.brut),
      eur(r.netCdiMensuel),
      ...STATUTS.map((s) => cell(r.seuils[s.id])),
    ];
    console.log(`| ${cells.join(" | ")} |`);
  }
}
