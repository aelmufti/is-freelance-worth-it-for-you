// Applique le HTML prérendu (committé dans le repo) sur le dist/ fraîchement
// produit par vite, en remplaçant les références d'assets (les hashes vite
// changent à chaque build).
//
// Cette étape est volontairement sans Chromium : elle tourne en pur Node,
// donc s'exécute identique en local et sur Vercel.
//
// La capture initiale du prerender se fait en local via
// `npm run prerender:capture` (qui utilise Playwright et écrit prerendered.html).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");
const TEMPLATE = resolve(root, "prerendered.html");
const DIST = resolve(root, "dist", "index.html");

if (!existsSync(TEMPLATE)) {
  console.warn(
    "⚠ Pas de prerendered.html — dist/index.html reste un shell SPA vide.\n" +
      "  Lancez `npm run prerender:capture` puis commitez prerendered.html.",
  );
  process.exit(0);
}

const fresh = readFileSync(DIST, "utf8");
const template = readFileSync(TEMPLATE, "utf8");

// Extraire les références d'assets fraîches générées par vite
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

// Remplacer les références d'assets dans le template par les fraîches
let out = template.replace(
  /<script[^>]+src="\/assets\/index-[^"]+\.js"[^>]*><\/script>/g,
  newScript,
);
out = out.replace(
  /<link[^>]+href="\/assets\/index-[^"]+\.css"[^>]*>/g,
  newCssLink,
);

writeFileSync(DIST, out);
console.log(
  `✓ Prerender appliqué (${(out.length / 1024).toFixed(1)} KB) — assets à jour`,
);
