// Jumeaux Markdown : pour chaque page, dist/<slug>/index.html.md (convention
// llmstxt.org pour les URL finissant par « / »). Lancé APRÈS vite build : les
// fichiers vont directement dans dist/, rien n'est committé.
//
// Pourquoi : un agent IA (ChatGPT, Perplexity, Claude…) qui consulte une page
// en direct doit sinon extraire le texte d'un HTML de ~60 Ko encombré par le
// formulaire du simulateur. Le jumeau lui donne la réponse, le tableau de
// chiffres clés et la FAQ, en tête, sans bruit — et l'URL HTML à citer.
// Découverte : <link rel="alternate" type="text/markdown"> injecté dans chaque
// page par apply-prerender.ts. Indexation Google bloquée par X-Robots-Tag
// (vercel.json) pour éviter tout doublon avec la page HTML.
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { INDEXABLE_PAGES as PAGES } from "../src/lib/pages";
import { pageToMarkdown } from "./lib/pageMarkdown";

const __dir = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dir, "..", "dist");

let bytes = 0;
for (const p of PAGES) {
  const out = p.slug
    ? resolve(DIST, p.slug, "index.html.md")
    : resolve(DIST, "index.html.md");
  const md = pageToMarkdown(p, true) + "\n";
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, md);
  bytes += md.length;
}
console.log(
  `✓ ${PAGES.length} jumeaux Markdown (${(bytes / 1024 / PAGES.length).toFixed(1)} Ko en moyenne)`,
);
