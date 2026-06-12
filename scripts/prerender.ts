// Prerender la SPA dans dist/index.html après vite build.
//
// Pourquoi : les crawlers GPTBot / PerplexityBot / ClaudeBot / Bytespider
// n'exécutent PAS le JavaScript. Sans prerender, ils ne voient qu'une
// <div id="root"></div> vide et ne peuvent rien indexer ni citer.
//
// Avec prerender : le HTML servi contient déjà toute la page rendue
// (hero, podium, sources, FAQ, mentions). Les bots et les utilisateurs
// reçoivent du contenu instantanément ; React hydrate par-dessus pour
// rendre la page interactive.
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");
const distHtml = resolve(root, "dist", "index.html");
const templateOut = resolve(root, "prerendered.html");

const PORT = 4321;
const URL = `http://localhost:${PORT}/?__prerender=1`;

// 1. Démarrer `vite preview` en arrière-plan
console.log("→ démarrage de vite preview…");
const preview = spawn(
  "npx",
  ["vite", "preview", "--port", String(PORT), "--strictPort"],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
);

const ready = new Promise<void>((res, rej) => {
  const timer = setTimeout(() => rej(new Error("preview timeout")), 15000);
  preview.stdout!.on("data", (b) => {
    if (b.toString().includes("Local")) {
      clearTimeout(timer);
      res();
    }
  });
  preview.stderr!.on("data", (b) => process.stderr.write(b));
  preview.on("exit", (c) => rej(new Error(`preview exited (${c})`)));
});

try {
  await ready;
  await new Promise((r) => setTimeout(r, 400));

  // 2. Récupérer le HTML rendu
  console.log("→ rendu de la page avec Playwright…");
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(URL, { waitUntil: "networkidle" });
  // Laisser une frame à React pour finir de monter
  await page.waitForSelector("main#main-content", { timeout: 8000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 200));

  // Nettoyer les attributs liés à l'état Vercel Analytics / scripts dynamiques
  const html = await page.evaluate(() => {
    // S'assurer que les nœuds injectés au runtime (GA, etc.) ne sont pas
    // figés dans le HTML statique
    document.querySelectorAll("script[data-prerender-ignore]").forEach((n) => n.remove());
    return "<!doctype html>\n" + document.documentElement.outerHTML;
  });

  await browser.close();

  // 3. Écrire le résultat dans dist/ ET sauvegarder une copie à la racine
  // pour qu'elle soit committée. La version committée sera réutilisée par
  // scripts/apply-prerender.ts sur Vercel (sans avoir besoin de Chromium).
  writeFileSync(distHtml, html);
  writeFileSync(templateOut, html);
  console.log(
    `✓ dist/index.html prérendu (${(html.length / 1024).toFixed(1)} KB)`,
  );
  console.log(`✓ prerendered.html sauvegardé pour les builds Vercel`);
} finally {
  preview.kill();
}
