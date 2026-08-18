// Génère public/sitemap.xml depuis le registre de pages (src/lib/pages.ts) :
// pas de drift quand on ajoute une page. Lancé avant `vite build` (le fichier
// est ensuite copié dans dist/ par vite).
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES, pageUpdated, pageUrl, type StatutPage } from "../src/lib/pages";

const __dir = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dir, "..", "public", "sitemap.xml");

// Priorité par nature de page. Avant, les 66 URL sortaient toutes à 0.8 : une
// valeur uniforme ne transmet aucune hiérarchie, autant ne rien dire. Ici
// l'accueil, les hubs et les simulateurs passent devant la longue traîne.
function priority(p: StatutPage): string {
  if (!p.slug) return "1.0";
  if (p.slug.startsWith("simulateur-")) return "0.9";
  if (["tjm-en-salaire", "guides", "observatoire-tjm-2026"].includes(p.slug)) {
    return "0.9";
  }
  if (p.slug.startsWith("guides/") || p.slug.includes("-ou-")) return "0.8";
  if (["methodologie", "a-propos", "glossaire"].includes(p.slug)) return "0.5";
  return "0.6"; // longue traîne TJM (paliers, objectifs de net, métiers)
}

const urls = PAGES.map((p) => {
  const loc = pageUrl(p);
  return `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="fr-FR" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />
    <lastmod>${pageUpdated(p)}</lastmod>
    <priority>${priority(p)}</priority>
  </url>`;
}).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

writeFileSync(out, xml);
console.log(`✓ sitemap.xml — ${PAGES.length} URL(s)`);
