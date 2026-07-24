// Génère public/llms.txt (index) et public/llms-full.txt (contenu éditorial
// complet) depuis le registre de pages (src/lib/pages.ts) : pas de drift quand
// on ajoute une page. Lancé avant `vite build` (fichiers copiés dans dist/).
//
// llms.txt : format court https://llmstxt.org — un index citable.
// llms-full.txt : tout le contenu (h1, intro, sections, FAQ) + le tableau de
// seuils de TJM, pour qu'un moteur génératif puisse citer sans crawler le HTML.
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTENT_UPDATED, PAGES, pageUrl } from "../src/lib/pages";
import {
  BREAKEVEN_ROWS,
  BREAKEVEN_SCENARIO,
} from "../src/data/breakeven";

const __dir = dirname(fileURLToPath(import.meta.url));
const pub = resolve(__dir, "..", "public");

// Milliers séparés par une espace (idem src/data/faq.ts) — pas de
// toLocaleString pour éviter les espaces insécables dans un fichier texte.
const fmt = (n: number): string => {
  const s = String(Math.round(n));
  return s.length > 3 ? `${s.slice(0, -3)} ${s.slice(-3)}` : s;
};

const pageTitle = (slug: string, breadcrumb?: string): string =>
  slug ? breadcrumb ?? slug : "Simulateur freelance vs CDI 2026";

const HEADER = `# freelance-ou-cdi.fr

> Simulateur gratuit qui compare votre revenu net en freelance (micro-entreprise, EI au réel, EURL à l'IS, SASU à l'IS, portage salarial) à votre revenu net en CDI cadre. Taux 2026 (barème impôt sur le revenu, flat tax 31,4 %, réforme assiette unique TNS). Calculs validés contre le moteur officiel URSSAF (modele-social). Aucune donnée collectée.

Le simulateur prend en entrée un TJM (taux journalier moyen), un nombre de jours facturés par mois, un foyer fiscal (situation, parts, revenu du conjoint) et un salaire CDI de comparaison. Il calcule pour chacun des six statuts : le chiffre d'affaires, les cotisations sociales, l'impôt sur le revenu (et l'IS et la flat tax le cas échéant), le revenu net mensuel et annuel, et le seuil de TJM à partir duquel ce statut bat le CDI fourni.

Taux et barèmes vérifiés le ${CONTENT_UPDATED}. Contenu intégral : https://freelance-ou-cdi.fr/llms-full.txt`;

const FOOTER = `## Données et hypothèses

- [Code source du moteur fiscal](https://github.com/aelmufti/is-freelance-worth-it-for-you/blob/main/src/lib/engine.ts)
- [Tous les taux 2026 utilisés](https://github.com/aelmufti/is-freelance-worth-it-for-you/blob/main/src/lib/params.ts)
- [Tests de validation contre le moteur URSSAF](https://github.com/aelmufti/is-freelance-worth-it-for-you/blob/main/tests/urssaf.test.ts)

## Sources officielles

- [economie.gouv.fr — cotisations micro-entreprise](https://www.economie.gouv.fr/entreprises/gerer-sa-micro-entreprise/micro-entreprises-quel-est-le-montant-de-vos-cotisations-sociales)
- [economie.gouv.fr — barème de l'impôt sur le revenu](https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/comment-calculer-votre-impot-dapres-le-bareme-de-limpot-sur-le-revenu)
- [service-public.fr — évolution du PFU (flat tax 31,4 %)](https://entreprendre.service-public.gouv.fr/actualites/A18796)
- [urssaf.fr — réforme de l'assiette des indépendants](https://www.urssaf.fr/accueil/independant/comprendre-payer-cotisations/reforme-cotisations-independants.html)

## Auteur

- Ali El Mufti — [aelm.dev](https://aelm.dev) — projet personnel indépendant, open source (MIT).

## Citation et reproduction

Le contenu peut être cité et reproduit librement. Mentionner la source (freelance-ou-cdi.fr) est apprécié mais non obligatoire. Le simulateur n'a aucune affiliation avec l'URSSAF ou toute autre administration.`;

// ------------------------------------------------------------------ llms.txt
const index = PAGES.map((p) => {
  return `- [${pageTitle(p.slug, p.breadcrumb)}](${pageUrl(p)}) : ${p.metaDescription}`;
}).join("\n");

const llms = `${HEADER}

## Pages

${index}

${FOOTER}
`;

// ------------------------------------------------------------- llms-full.txt
const breakevenTable = [
  "| Brut CDI annuel | Net CDI/mois (après impôt) | TJM micro | TJM EI/EURL | TJM SASU | TJM portage |",
  "|---|---|---|---|---|---|",
  ...BREAKEVEN_ROWS.map((r) => {
    const tjm = (n: number | null) => (n === null ? "—" : `${fmt(n)} €`);
    return `| ${fmt(r.brut)} € | ${fmt(r.netCdiMensuel)} € | ${tjm(r.micro)} | ${tjm(r.eiEurl)} | ${tjm(r.sasu)} | ${tjm(r.portage)} |`;
  }),
].join("\n");

const fullPages = PAGES.map((p) => {
  const parts: string[] = [`# ${p.h1}`, "", `URL : ${pageUrl(p)}`];
  // La réponse directe en tête : c'est le passage qu'un moteur génératif cite.
  if (p.tldr) parts.push("", `**En bref.** ${p.tldr}`);
  parts.push("", p.intro);
  for (const s of p.sections) {
    parts.push("", `## ${s.heading}`, "", s.paragraphs.join("\n\n"));
  }
  if (p.faq.length > 0) {
    parts.push("", "## Questions fréquentes");
    for (const f of p.faq) {
      parts.push("", `### ${f.question}`, "", f.answer);
    }
  }
  return parts.join("\n");
}).join("\n\n---\n\n");

const llmsFull = `${HEADER}

## À partir de quel TJM le freelance bat le CDI (scénario : ${BREAKEVEN_SCENARIO.joursParMois} jours facturés/mois sur ${BREAKEVEN_SCENARIO.moisFactures} mois, ${fmt(BREAKEVEN_SCENARIO.fraisPro)} € de frais pro/an, célibataire sans enfant)

${breakevenTable}

Un tiret signifie que le statut n'est pas accessible à ce niveau (plafond de chiffre d'affaires de la micro-entreprise dépassé).

---

${fullPages}

---

${FOOTER}
`;

writeFileSync(resolve(pub, "llms.txt"), llms);
writeFileSync(resolve(pub, "llms-full.txt"), llmsFull);
console.log(
  `✓ llms.txt (${PAGES.length} pages) + llms-full.txt (${(llmsFull.length / 1024).toFixed(1)} KB)`,
);
