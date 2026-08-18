// Applique le HTML prérendu (committé) sur le dist/ fraîchement produit par
// vite, pour CHAQUE route, en remplaçant les références d'assets (les hashes
// vite changent à chaque build).
//
// Sans Chromium : pur Node, identique en local et sur Vercel. La capture
// initiale se fait en local via `npm run prerender:capture` (Playwright), qui
// écrit prerendered.html + prerendered/<slug>.html.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES } from "../src/lib/pages";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");
const DIST = resolve(root, "dist");
const FRESH = resolve(DIST, "index.html");

const fresh = readFileSync(FRESH, "utf8");
const newScript = fresh.match(
  /<script[^>]+src="\/assets\/index-[^"]+\.js"[^>]*><\/script>/,
)?.[0];
const newCssLink = fresh.match(
  /<link[^>]+href="\/assets\/index-[^"]+\.css"[^>]*>/,
)?.[0];

if (!newScript || !newCssLink) {
  console.error("Impossible d'extraire les références d'assets depuis dist/index.html");
  process.exit(1);
}

// Préchargement des polices. Les .woff2 sont déclarés DANS la feuille de style :
// le navigateur ne les découvre qu'une fois le CSS téléchargé et analysé, ce qui
// retarde d'un aller-retour l'affichage du texte — donc le LCP, sur un site où
// tout est en JetBrains Mono. Les hashes changent à chaque build, on les relit
// donc dans dist/assets/ plutôt que de les écrire en dur.
const fontPreloads = readdirSync(resolve(DIST, "assets"))
  .filter((f) => f.endsWith(".woff2"))
  .sort()
  .map(
    (f) =>
      `<link rel="preload" as="font" type="font/woff2" href="/assets/${f}" crossorigin>`,
  )
  .join("\n    ");

function templatePath(slug: string): string {
  return slug
    ? resolve(root, "prerendered", `${slug}.html`)
    : resolve(root, "prerendered.html");
}

function distPath(slug: string): string {
  return slug
    ? resolve(DIST, slug, "index.html")
    : resolve(DIST, "index.html");
}

let applied = 0;
for (const page of PAGES) {
  const tpl = templatePath(page.slug);
  if (!existsSync(tpl)) {
    console.warn(
      `⚠ Pas de prerender pour « ${page.slug || "home"} » (${tpl}) — route ignorée. ` +
        "Lancez `npm run prerender:capture` puis commitez.",
    );
    continue;
  }
  let out = readFileSync(tpl, "utf8");
  out = out.replace(
    /<script[^>]+src="\/assets\/index-[^"]+\.js"[^>]*><\/script>/g,
    newScript,
  );
  out = out.replace(
    /<link[^>]+href="\/assets\/index-[^"]+\.css"[^>]*>/g,
    newCssLink,
  );
  // Purge les préchargements du build précédent (hashes périmés = requêtes
  // gaspillées), puis réinjecte ceux du build courant.
  out = out.replace(
    /\s*<link rel="preload" as="font"[^>]*>/g,
    "",
  );
  if (fontPreloads) {
    out = out.replace("</head>", `  ${fontPreloads}\n  </head>`);
  }
  const dest = distPath(page.slug);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, out);
  applied++;
  console.log(`✓ ${page.slug || "home"} (${(out.length / 1024).toFixed(1)} KB)`);
}

console.log(`✓ Prerender appliqué sur ${applied}/${PAGES.length} route(s) — assets à jour`);
