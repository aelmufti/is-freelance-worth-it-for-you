// Prerender la SPA pour CHAQUE route (home + pages statut) après vite build.
//
// Pourquoi : les crawlers GPTBot / PerplexityBot / ClaudeBot / Bytespider
// n'exécutent PAS le JavaScript. Sans prerender, ils ne voient qu'une
// <div id="root"></div> vide.
//
// Chaque route est rendue depuis le shell vite vierge (root vide → createRoot,
// pas d'hydration), via ?__route=<slug> qui force la page sans dépendre du
// fallback SPA du preview. Le <head> est réécrit par route (title, meta,
// canonical, OG, Twitter) + un BreadcrumbList est injecté. Résultat écrit dans
// dist/<slug>/index.html ET committé dans prerendered/<slug>.html (réappliqué
// sur Vercel par apply-prerender.ts, sans Chromium).
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES, pageUrl, SITE, type StatutPage } from "../src/lib/pages";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");

const PORT = 4321;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Réécrit le <head> capturé (issu de index.html, donc orienté home) avec les
// méta propres à la page. Tolérant au slash de fermeture optionnel : Chromium
// sérialise les éléments void sans « / ».
function rewriteHead(html: string, page: StatutPage): string {
  const url = pageUrl(page);
  const t = esc(page.metaTitle);
  const d = esc(page.metaDescription);
  const repl: Array<[RegExp, string]> = [
    [/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`],
    [/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${d}">`],
    [/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}">`],
    [/<link rel="alternate" hreflang="fr-FR" href="[^"]*"\s*\/?>/, `<link rel="alternate" hreflang="fr-FR" href="${url}">`],
    [/<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/?>/, `<link rel="alternate" hreflang="x-default" href="${url}">`],
    [/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}">`],
    [/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${t}">`],
    [/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${d}">`],
    [/<meta name="twitter:url" content="[^"]*"\s*\/?>/, `<meta name="twitter:url" content="${url}">`],
    [/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${t}">`],
    [/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${d}">`],
  ];
  let h = html;
  for (const [re, val] of repl) {
    if (!re.test(h)) throw new Error(`rewriteHead: motif introuvable pour ${page.slug} → ${re}`);
    h = h.replace(re, val);
  }
  const breadcrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: page.breadcrumb, item: url },
    ],
  });
  return h.replace(
    "</head>",
    `  <script type="application/ld+json">${breadcrumb}</script>\n  </head>`,
  );
}

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

  const browser = await chromium.launch({ args: ["--no-sandbox"] });

  for (const page of PAGES) {
    const url =
      `http://localhost:${PORT}/?__prerender=1` +
      (page.slug ? `&__route=${page.slug}` : "");
    console.log(`→ rendu ${page.slug || "(home)"}…`);

    const tab = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await tab.goto(url, { waitUntil: "networkidle" });
    await tab.waitForSelector("main#main-content", { timeout: 8000 });
    await tab.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 200));

    let html = await tab.evaluate(() => {
      document
        .querySelectorAll("script[data-prerender-ignore]")
        .forEach((n) => n.remove());
      return "<!doctype html>\n" + document.documentElement.outerHTML;
    });
    await tab.close();

    if (page.slug) html = rewriteHead(html, page);

    const distOut = page.slug
      ? resolve(root, "dist", page.slug, "index.html")
      : resolve(root, "dist", "index.html");
    const tplOut = page.slug
      ? resolve(root, "prerendered", `${page.slug}.html`)
      : resolve(root, "prerendered.html");
    mkdirSync(dirname(distOut), { recursive: true });
    mkdirSync(dirname(tplOut), { recursive: true });
    writeFileSync(distOut, html);
    writeFileSync(tplOut, html);
    console.log(`  ✓ ${page.slug || "home"} (${(html.length / 1024).toFixed(1)} KB)`);
  }

  await browser.close();
  console.log(`✓ ${PAGES.length} route(s) prérendue(s)`);
} finally {
  preview.kill();
}
