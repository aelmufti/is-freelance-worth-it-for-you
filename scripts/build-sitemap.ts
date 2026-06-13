// Génère public/sitemap.xml depuis le registre de pages (src/lib/pages.ts) :
// pas de drift quand on ajoute une page. Lancé avant `vite build` (le fichier
// est ensuite copié dans dist/ par vite).
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES, pageUrl } from "../src/lib/pages";

const __dir = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dir, "..", "public", "sitemap.xml");

const urls = PAGES.map((p) => {
  const loc = pageUrl(p);
  return `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="fr-FR" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />
    <changefreq>monthly</changefreq>
    <priority>${p.slug ? "0.8" : "1.0"}</priority>
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
