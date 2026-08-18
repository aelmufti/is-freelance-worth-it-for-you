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
import {
  PAGES,
  pageUrl,
  pagePublished,
  pageUpdated,
  ogImagePath,
  SITE,
  type StatutPage,
} from "../src/lib/pages";
import { OBSERVATOIRE_TJM } from "../src/data/tjmMetiers";

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
  const og = `${SITE}${ogImagePath(page)}`;
  const ogAlt = esc(
    page.slug ? page.metaTitle : "Capture du simulateur freelance vs CDI 2026",
  );
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
    [/<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${og}">`],
    [/<meta property="og:image:secure_url" content="[^"]*"\s*\/?>/, `<meta property="og:image:secure_url" content="${og}">`],
    [/<meta property="og:image:alt" content="[^"]*"\s*\/?>/, `<meta property="og:image:alt" content="${ogAlt}">`],
    [/<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${og}">`],
    [/<meta name="twitter:image:alt" content="[^"]*"\s*\/?>/, `<meta name="twitter:image:alt" content="${ogAlt}">`],
  ];
  let h = html;
  for (const [re, val] of repl) {
    if (!re.test(h)) throw new Error(`rewriteHead: motif introuvable pour ${page.slug} → ${re}`);
    h = h.replace(re, val);
  }
  // Le fil d'Ariane doit refléter l'URL : /guides/<x>/ passe par /guides/.
  // Un fil à deux niveaux sur une URL à deux segments produit un fil d'Ariane
  // faux dans les SERP (et un « parent » manquant pour le crawl).
  const trail: Array<{ name: string; item: string }> = [
    { name: "Accueil", item: `${SITE}/` },
  ];
  if (page.slug.startsWith("guides/")) {
    trail.push({ name: "Guides", item: `${SITE}/guides/` });
  }
  trail.push({ name: page.breadcrumb!, item: url });

  const jsonLd: string[] = [
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: trail.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        item: t.item,
      })),
    }),
  ];
  const AUTHOR = {
    "@type": "Person",
    name: "Ali El Mufti",
    url: "https://aelm.dev",
  };

  // Pages éditoriales (institutionnelles, guides, observatoire, pages métier) :
  // un schema Article daté + auteur/éditeur renforce l'E-E-A-T sur un sujet YMYL
  // et donne aux moteurs génératifs une entité datée à citer.
  const isEditorial =
    page.layout === "content" ||
    page.slug.startsWith("guides/") ||
    page.slug.startsWith("tjm-freelance-");
  if (isEditorial) {
    jsonLd.push(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: page.h1,
        description: page.metaDescription,
        abstract: page.tldr,
        inLanguage: "fr-FR",
        url,
        image: og,
        datePublished: pagePublished(page),
        dateModified: pageUpdated(page),
        author: AUTHOR,
        publisher: AUTHOR,
        isPartOf: { "@type": "WebSite", name: "freelance-ou-cdi.fr", url: `${SITE}/` },
      }),
    );
  }

  // Guides procéduraux : schema HowTo (étapes ordonnées).
  if (page.howTo) {
    jsonLd.push(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: page.h1,
        description: page.metaDescription,
        inLanguage: "fr-FR",
        step: page.howTo.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      }),
    );
  }

  // L'observatoire est un jeu de données : le schema Dataset est celui que les
  // moteurs génératifs privilégient pour citer une étude chiffrée.
  if (page.slug === OBSERVATOIRE_TJM.slug) {
    jsonLd.push(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: "Observatoire du TJM freelance 2026",
        description:
          "TJM médians observés par métier chez les freelances français en 2026, croisés avec le revenu net après cotisations et impôt pour chaque statut juridique.",
        url,
        inLanguage: "fr-FR",
        license: "https://opensource.org/licenses/MIT",
        isAccessibleForFree: true,
        creator: AUTHOR,
        datePublished: pagePublished(page),
        dateModified: pageUpdated(page),
        temporalCoverage: "2026",
        spatialCoverage: { "@type": "Place", name: "France" },
        keywords: ["TJM", "freelance", "tarif journalier", "revenu net", "France"],
        variableMeasured: [
          { "@type": "PropertyValue", name: "TJM médian", unitText: "EUR/jour" },
          { "@type": "PropertyValue", name: "Net mensuel après impôt", unitText: "EUR/mois" },
          { "@type": "PropertyValue", name: "Salaire CDI équivalent", unitText: "EUR brut/an" },
        ],
      }),
    );
  }
  return h.replace(
    "</head>",
    jsonLd
      .map((s) => `  <script type="application/ld+json">${s}</script>`)
      .join("\n") + "\n  </head>",
  );
}

// Remplace le bloc @graph hérité de index.html (donc orienté accueil) par un
// graphe propre à la page. Sans ça, chaque URL déclarait un WebApplication dont
// l'url pointait sur l'accueil et AUCUN nœud WebPage la décrivant : les moteurs
// n'avaient aucune entité datée rattachée à l'URL courante.
function injectGraph(html: string, page: StatutPage): string {
  const url = pageUrl(page);
  const og = `${SITE}${ogImagePath(page)}`;
  const hasSimulateur = page.layout !== "content";
  const person = { "@id": `${SITE}/#person` };

  const graph: unknown[] = [
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: `${SITE}/`,
      name: "freelance-ou-cdi.fr",
      inLanguage: "fr-FR",
      publisher: person,
    },
    {
      "@type": "Person",
      "@id": `${SITE}/#person`,
      name: "Ali El Mufti",
      url: "https://aelm.dev",
      sameAs: ["https://aelm.dev", "https://github.com/aelmufti"],
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE}/#app`,
      name: "Freelance ou CDI : simulateur de revenu 2026",
      alternateName: "Simulateur freelance vs CDI",
      url: `${SITE}/`,
      applicationCategory: "FinanceApplication",
      applicationSubCategory: "Tax Calculator",
      operatingSystem: "Any (web)",
      browserRequirements: "Requires JavaScript",
      inLanguage: "fr-FR",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      featureList: [
        "Comparaison micro-entreprise, EI au réel, EURL, SASU, portage salarial et CDI",
        "Barème impôt sur le revenu 2026",
        "Flat tax 31,4 % et impôt sur les sociétés",
        "Réforme assiette unique TNS 2026",
        "Seuil de TJM équivalent au CDI",
        "Calculs validés contre le moteur officiel URSSAF",
        "Aucune donnée collectée — calculs dans le navigateur",
      ],
      author: person,
      publisher: person,
      softwareVersion: "1.0",
      datePublished: pagePublished(page),
      // Date de dernière révision réelle, plus une constante recopiée à la main
      // dans index.html (qui dérivait immanquablement du contenu).
      dateModified: pageUpdated(page),
      license: "https://opensource.org/licenses/MIT",
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: page.metaTitle,
      description: page.metaDescription,
      ...(page.tldr ? { abstract: page.tldr } : {}),
      inLanguage: "fr-FR",
      isPartOf: { "@id": `${SITE}/#website` },
      about: { "@id": `${SITE}/#app` },
      ...(hasSimulateur ? { mainEntity: { "@id": `${SITE}/#app` } } : {}),
      primaryImageOfPage: { "@type": "ImageObject", url: og },
      datePublished: pagePublished(page),
      dateModified: pageUpdated(page),
      author: person,
      publisher: person,
      ...(page.slug ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
      ...(page.faq.length ? { mainContentOfPage: { "@id": `${url}#faq` } } : {}),
    },
  ];

  const block = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  })}</script>`;

  // Le bloc de index.html est le seul ld+json présent dans le HTML capturé qui
  // contienne « @graph » (celui de la FAQ est généré par le composant).
  const re = /<script type="application\/ld\+json">\s*\{[\s\S]*?"@graph"[\s\S]*?\}\s*<\/script>/;
  if (!re.test(html)) {
    throw new Error(`injectGraph: bloc @graph introuvable pour ${page.slug || "home"}`);
  }
  return html.replace(re, block);
}

console.log("→ démarrage de vite preview…");
// `detached: true` place le serveur dans son propre groupe de processus. Sans
// ça, preview.kill() ne tue que le wrapper npx : le vrai process vite est
// réattaché à init, le port 4321 reste occupé et le script ne rend jamais la
// main (le handle stdio ouvert garde la boucle d'événements vivante).
const preview = spawn(
  "npx",
  ["vite", "preview", "--port", String(PORT), "--strictPort"],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"], detached: true },
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

  const browser = await chromium.launch({
    args: ["--no-sandbox"],
    // Permet d'utiliser un Chromium déjà présent (CI/conteneur sans accès au
    // CDN Playwright) : CHROMIUM_EXECUTABLE_PATH=/chemin/vers/chrome
    ...(process.env.CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH }
      : {}),
  });

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
    html = injectGraph(html, page);

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
  // Tue tout le groupe (npx + vite), pas seulement le wrapper.
  try {
    if (preview.pid) process.kill(-preview.pid, "SIGTERM");
  } catch {
    preview.kill();
  }
}
