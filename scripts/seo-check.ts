// Contrôle SEO on-page, à lancer APRÈS `npm run prerender:capture` :
//   npm run seo:check
// Lit le HTML prérendu (prerendered.html + prerendered/**), le sitemap
// (public/sitemap.xml) et le registre de pages (src/lib/pages.ts), imprime un
// tableau PASS/FAIL par page et sort en code 1 si un contrôle échoue.
// Les doublons de contenu (similarité) sont des WARN : rapport pour le
// propriétaire, jamais bloquant.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES, SITE, pageUrl } from "../src/lib/pages";


const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ------------------------------------------------------------------ MOTS-CLÉS
// Mot-clé cible de chaque page (une seule source, à relire / amender ici).
// Comparaison insensible à la casse et aux accents, ordre des mots libre,
// mots-outils ignorés (cf. STOPWORDS). Dans le <title> : tous les mots présents ET
// le premier mot-clé rencontré commence dans la première moitié. Dans le H1 :
// tous les mots présents. Un mot-clé = une page (vérifié plus bas).
const KEYWORDS: Record<string, string> = {
  "": "freelance ou CDI",
  "simulateur-micro-entreprise": "simulateur micro-entreprise",
  "simulateur-ei": "simulateur EI au réel",
  "simulateur-eurl": "simulateur EURL",
  "simulateur-sasu": "simulateur SASU",
  "simulateur-portage-salarial": "simulateur portage salarial",
  "sasu-ou-eurl": "SASU ou EURL",
  "micro-entreprise-ou-sasu": "micro-entreprise ou SASU",
  "portage-salarial-ou-micro-entreprise": "portage salarial ou micro-entreprise",
  "portage-salarial-ou-cdi": "portage salarial ou CDI",
  "micro-entreprise-ou-eurl": "micro-entreprise ou EURL",
  "micro-entreprise-ou-ei": "micro-entreprise ou EI",
  "ei-ou-eurl": "EI au réel ou EURL",
  "ei-ou-sasu": "EI au réel ou SASU",
  "portage-salarial-ou-sasu": "portage salarial ou SASU",
  "portage-salarial-ou-eurl": "portage salarial ou EURL",
  "micro-entreprise-ou-cdi": "micro-entreprise ou CDI",
  "sasu-ou-cdi": "SASU ou CDI",
  "eurl-ou-cdi": "EURL ou CDI",
  "ei-ou-cdi": "EI au réel ou CDI",
  guides: "guides du freelance",
  "guides/comment-fixer-son-tjm": "fixer son TJM freelance",
  "guides/charges-sociales-freelance": "charges sociales freelance",
  "guides/freelance-et-chomage-are": "freelance chômage ARE",
  "guides/acre-premiere-annee": "ACRE exonération",
  "guides/franchise-tva-freelance": "franchise de TVA freelance",
  "guides/passer-de-salarie-a-freelance": "passer de salarié à freelance",
  "observatoire-tjm-2026": "TJM freelance par métier",
  methodologie: "méthodologie",
  "a-propos": "à propos",
  glossaire: "glossaire freelance",
  "tjm-en-salaire": "TJM en salaire",
  "tjm-250": "TJM 250 €",
  "tjm-300": "TJM 300 €",
  "tjm-325": "TJM 325 €",
  "tjm-350": "TJM 350 €",
  "tjm-375": "TJM 375 €",
  "tjm-400": "TJM 400 €",
  "tjm-425": "TJM 425 €",
  "tjm-450": "TJM 450 €",
  "tjm-475": "TJM 475 €",
  "tjm-500": "TJM 500 €",
  "tjm-525": "TJM 525 €",
  "tjm-550": "TJM 550 €",
  "tjm-600": "TJM 600 €",
  "tjm-650": "TJM 650 €",
  "tjm-700": "TJM 700 €",
  "tjm-750": "TJM 750 €",
  "tjm-800": "TJM 800 €",
  "tjm-900": "TJM 900 €",
  "tjm-1000": "TJM 1000 €",
  "tjm-pour-3000-euros-net": "TJM 3000 € net",
  "tjm-pour-3500-euros-net": "TJM 3500 € net",
  "tjm-pour-4000-euros-net": "TJM 4000 € net",
  "tjm-pour-4500-euros-net": "TJM 4500 € net",
  "tjm-pour-5000-euros-net": "TJM 5000 € net",
  "tjm-pour-6000-euros-net": "TJM 6000 € net",
  "tjm-freelance-developpeur-web": "TJM développeur web freelance",
  "tjm-freelance-devops-cloud": "TJM DevOps cloud freelance",
  "tjm-freelance-data-scientist": "TJM data scientist freelance",
  "tjm-freelance-data-engineer": "TJM data engineer freelance",
  "tjm-freelance-product-manager": "TJM product manager freelance",
  "tjm-freelance-consultant-strategie": "TJM consultant stratégie freelance",
  "tjm-freelance-consultant-marketing": "TJM consultant marketing freelance",
  "tjm-freelance-consultant-seo": "TJM consultant SEO freelance",
  "tjm-freelance-designer-ux-ui": "TJM designer UX/UI freelance",
  "tjm-freelance-expert-cybersecurite": "TJM expert cybersécurité freelance",
};

const STOPWORDS = new Set(["de", "du", "des", "la", "le", "les", "l", "d", "en", "un", "une", "et", "au", "a", "son"]);

// ---------------------------------------------------------------- EXCEPTIONS
// Exceptions explicites : check -> { slug: raison }. Rien d'autre n'est toléré.
const EXCEPTIONS: Record<string, Record<string, string>> = {
  // check: { slug: raison } -- aucune exception à ce jour.
};

// ------------------------------------------------------------------- HELPERS
const read = (p: string) => readFileSync(p, "utf8");

function decode(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripTags(html: string): string {
  return decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function norm(s: string): string {
  return decode(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/(\d)[\s  ]+(?=\d{3}\b)/g, "$1")
    .replace(/€/g, " euros ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function keywordMatch(text: string, keyword: string, halfOnly: boolean): boolean {
  const t = norm(text);
  const toks = norm(keyword)
    .split(" ")
    .filter((w) => w && !STOPWORDS.has(w));
  // « euros » est produit par « € » dans le mot-clé comme dans le texte.
  const idx = toks.map((w) => {
    const m = new RegExp(`(^| )${w}( |$)`).exec(t);
    return m ? m.index + m[1].length : -1;
  });
  if (idx.some((i) => i < 0)) return false;
  // Titre : le premier mot-clé à apparaître doit commencer dans la 1re moitié.
  return !halfOnly || Math.min(...idx) < t.length / 2;
}

function metaContent(html: string, name: string): string | null {
  const re = new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, "i");
  const m = re.exec(html);
  return m ? decode(m[1]) : null;
}

// ------------------------------------------------------------- COLLECTE FICHIERS
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = resolve(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
  });
}

const fileBySlug = new Map<string, string>();
const homeFile = resolve(root, "prerendered.html");
if (existsSync(homeFile)) fileBySlug.set("", homeFile);
const pdir = resolve(root, "prerendered");
if (existsSync(pdir)) {
  for (const f of walk(pdir)) fileBySlug.set(relative(pdir, f).replace(/\.html$/, ""), f);
}

const sitemapXml = read(resolve(root, "public", "sitemap.xml"));
const sitemapLocs = [...sitemapXml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapSet = new Set(sitemapLocs);

const sourceSlugs = new Set(PAGES.map((p) => p.slug));
// Pages noindex : détectées via la donnée de page OU la meta robots du HTML prérendu.
const noindexSlugs = new Set<string>();
for (const p of PAGES) if (p.noindex) noindexSlugs.add(p.slug);
for (const [slug, file] of fileBySlug)
  if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(read(file))) noindexSlugs.add(slug);
const allSlugs = [...new Set([...sourceSlugs, ...fileBySlug.keys()])];

// ---------------------------------------------------------------- ANALYSE
interface Info {
  slug: string;
  url: string;
  html: string;
  title: string | null;
  desc: string | null;
  h1s: string[];
  canonicals: string[];
  imgs: string[];
  jsonld: string[];
  mainText: string;
  links: { href: string; text: string; inFooter: boolean; inMain: boolean }[];
}

function urlToSlug(href: string): string | null {
  let h = href.trim();
  if (h.startsWith(SITE)) h = h.slice(SITE.length) || "/";
  if (!h.startsWith("/") || h.startsWith("//")) return null;
  h = h.split("#")[0].split("?")[0];
  return h.replace(/^\/+|\/+$/g, "");
}

function analyse(slug: string, file: string): Info {
  const html = read(file);
  const body = html.slice(html.indexOf("<body"));
  const footerStart = body.indexOf("<footer");
  const mainStart = body.indexOf("<main");
  const mainEnd = body.indexOf("</main>");
  const links: Info["links"] = [];
  for (const m of body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const href = /href="([^"]*)"/.exec(m[1])?.[1];
    if (href === undefined) continue;
    const aria = /aria-label="([^"]*)"/.exec(m[1])?.[1];
    const pos = m.index ?? 0;
    links.push({
      href: decode(href),
      text: stripTags(m[2]) || (aria ? decode(aria) : ""),
      inFooter: footerStart >= 0 && pos > footerStart,
      inMain: pos > mainStart && pos < mainEnd,
    });
  }
  const mainHtml = mainStart >= 0 ? body.slice(mainStart, mainEnd) : "";
  const cleaned = mainHtml
    .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/g, " ");
  return {
    slug,
    url: slug ? `${SITE}/${slug}/` : `${SITE}/`,
    html,
    title: /<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ? decode(/<title>([\s\S]*?)<\/title>/.exec(html)![1]) : null,
    desc: metaContent(html, "description"),
    h1s: [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => stripTags(m[1])),
    canonicals: [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]*)"/g)].map((m) => m[1]),
    imgs: [...body.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]),
    jsonld: [...html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]),
    mainText: stripTags(cleaned),
    links,
  };
}

const infos = new Map<string, Info>();
for (const [slug, file] of fileBySlug) infos.set(slug, analyse(slug, file));

// ------------------------------------------------------------------ CHECKS
const CHECKS = ["title", "desc", "h1", "url", "canon", "links", "img", "ld", "map", "dupe", "home"] as const;
type Check = (typeof CHECKS)[number];
const failures = new Map<string, Map<Check, string[]>>();
const exceptionsUsed: string[] = [];

function fail(slug: string, check: Check, msg: string) {
  const reason = EXCEPTIONS[check]?.[slug];
  if (reason) {
    exceptionsUsed.push(`${slug || "(home)"} / ${check}: ${msg} -- exception : ${reason}`);
    return;
  }
  if (!failures.has(slug)) failures.set(slug, new Map());
  const m = failures.get(slug)!;
  if (!m.has(check)) m.set(check, []);
  m.get(check)!.push(msg);
}

// Comptes transverses
const count = <T,>(items: T[], key: (t: T) => string) => {
  const m = new Map<string, T[]>();
  for (const i of items) (m.get(key(i)) ?? m.set(key(i), []).get(key(i))!).push(i);
  return m;
};
const infoList = [...infos.values()];
const descDup = count(infoList.filter((i) => i.desc), (i) => norm(i.desc!));
const titleDup = count(infoList.filter((i) => i.title), (i) => norm(i.title!));
const h1Dup = count(infoList.filter((i) => i.h1s[0]), (i) => norm(i.h1s[0]));
const kwDup = count(Object.entries(KEYWORDS), ([, k]) => norm(k));

// Liens entrants : <main> + <header>, hors footer (le footer est un bloc
// sitewide qui rendrait la métrique triviale).
const inbound = new Map<string, Set<string>>();
const outbound = new Map<string, Set<string>>();
for (const i of infoList) {
  for (const l of i.links) {
    if (l.inFooter) continue;
    const t = urlToSlug(l.href);
    if (t === null || t === i.slug) continue;
    (inbound.get(t) ?? inbound.set(t, new Set()).get(t)!).add(i.slug);
    (outbound.get(i.slug) ?? outbound.set(i.slug, new Set()).get(i.slug)!).add(t);
  }
}
const GENERIC = new Set(["cliquez ici", "cliquez", "ici", "en savoir plus", "lire la suite", "voir plus", "plus d infos", "lien", "ce lien", "la", "click here", "read more"]);

for (const slug of allSlugs) {
  const info = infos.get(slug);
  const src = PAGES.find((p) => p.slug === slug);
  const noindex = noindexSlugs.has(slug);

  // sitemap / prerender (présence)
  if (!src) fail(slug, "map", "page prérendue absente de src/lib/pages.ts");
  if (!info) {
    fail(slug, "map", "pas de fichier prérendu pour une page déclarée en source");
    continue;
  }
  const loc = src ? pageUrl(src) : info.url;
  if (noindex) {
    // Page noindex : l'inverse des pages normales (hors sitemap, robots noindex).
    if (sitemapSet.has(loc)) fail(slug, "map", `page noindex présente dans public/sitemap.xml (${loc})`);
    if (!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(info.html)) fail(slug, "map", "page noindex sans meta robots noindex");
  } else if (!sitemapSet.has(loc)) fail(slug, "map", `absente de public/sitemap.xml (${loc})`);

  // title
  const kw = KEYWORDS[slug];
  if (kw === undefined && !noindex) fail(slug, "title", "aucun mot-clé cible dans KEYWORDS");
  if (!info.title) fail(slug, "title", "<title> absent");
  else {
    if (info.title.length > 60) fail(slug, "title", `${info.title.length} caractères (> 60) : « ${info.title} »`);
    if (!noindex && kw !== undefined && !keywordMatch(info.title, kw, true))
      fail(slug, "title", `mot-clé « ${kw} » absent du titre ou débutant après sa 1re moitié : « ${info.title} »`);
  }
  if (titleDup.get(norm(info.title ?? ""))!?.length > 1 && info.title)
    fail(slug, "dupe", `titre partagé avec ${titleDup.get(norm(info.title))!.filter((x) => x !== info).map((x) => x.slug || "(home)").join(", ")}`);

  // description
  if (!info.desc) fail(slug, "desc", "meta description absente");
  else {
    if (info.desc.length < 70 || info.desc.length > 160) fail(slug, "desc", `${info.desc.length} caractères (hors 70–160)`);
    const d = descDup.get(norm(info.desc))!;
    if (d.length > 1) fail(slug, "desc", `identique à ${d.filter((x) => x !== info).map((x) => x.slug || "(home)").join(", ")}`);
  }

  // h1
  if (info.h1s.length !== 1) fail(slug, "h1", `${info.h1s.length} H1 (attendu 1)`);
  else {
    if (!noindex && kw !== undefined && !keywordMatch(info.h1s[0], kw, false)) fail(slug, "h1", `mot-clé « ${kw} » absent du H1 : « ${info.h1s[0]} »`);
    const d = h1Dup.get(norm(info.h1s[0]))!;
    if (d.length > 1) fail(slug, "dupe", `H1 partagé avec ${d.filter((x) => x !== info).map((x) => x.slug || "(home)").join(", ")}`);
  }
  if (kw !== undefined && kwDup.get(norm(kw))!.length > 1) fail(slug, "dupe", `mot-clé cible « ${kw} » partagé avec une autre page`);

  // url
  if (slug) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/.test(slug)) fail(slug, "url", "slug non minuscule / non tiret");
    if (slug.length > 60) fail(slug, "url", `slug trop long (${slug.length})`);
    if (/(^|-)(19|20)\d{2}-\d{1,2}(-\d{1,2})?(-|$)/.test(slug)) fail(slug, "url", "date dans le slug");
  }

  // canonical
  if (info.canonicals.length !== 1) fail(slug, "canon", `${info.canonicals.length} canonical (attendu 1)`);
  else {
    const c = info.canonicals[0];
    if (!/^https:\/\//.test(c)) fail(slug, "canon", `non absolue : ${c}`);
    if (!c.endsWith("/")) fail(slug, "canon", `sans slash final (trailingSlash: true) : ${c}`);
    if (c !== loc) fail(slug, "canon", `${c} ≠ URL attendue ${loc}`);
    if (!noindex && !sitemapSet.has(c)) fail(slug, "canon", `canonical absente du sitemap : ${c}`);
  }

  // liens
  const inb = inbound.get(slug)?.size ?? 0;
  const outb = outbound.get(slug)?.size ?? 0;
  if (!noindex && inb < 2) fail(slug, "links", `${inb} lien(s) entrant(s) (< 2)`);
  if (outb === 0) fail(slug, "links", "aucun lien interne sortant");
  for (const l of info.links) {
    const t = urlToSlug(l.href);
    if (t === null) continue;
    const text = norm(l.text);
    if (!text || GENERIC.has(text) || /^https?\b|^www\b/.test(text) || /^[\w-]+(\/[\w-]+)+$/.test(l.text.replace(/^\W+/, "")))
      fail(slug, "links", `ancre non descriptive « ${l.text || "(vide)"} » -> ${l.href}`);
  }

  // images
  for (const img of info.imgs) {
    const alt = /\balt="([^"]*)"/.exec(img);
    const decorative = /aria-hidden="true"|role="presentation"/.test(img);
    if (!alt) fail(slug, "img", `<img> sans alt : ${img.slice(0, 80)}`);
    else if (!alt[1].trim() && !decorative) fail(slug, "img", `alt vide sans aria-hidden/role=presentation : ${img.slice(0, 80)}`);
  }

  // JSON-LD
  if (info.jsonld.length === 0) fail(slug, "ld", "aucun bloc JSON-LD");
  info.jsonld.forEach((raw, idx) => {
    try {
      const j = JSON.parse(raw);
      const nodes = Array.isArray(j) ? j : [j];
      for (const n of nodes) {
        if (!n["@context"]) fail(slug, "ld", `bloc #${idx + 1} sans @context`);
        if (!n["@type"] && !n["@graph"]) fail(slug, "ld", `bloc #${idx + 1} sans @type`);
      }
    } catch (e) {
      fail(slug, "ld", `bloc #${idx + 1} JSON invalide : ${(e as Error).message}`);
    }
  });
}
// entrées du sitemap sans page
const expectedLocs = new Set(PAGES.filter((p) => !noindexSlugs.has(p.slug)).map(pageUrl));
for (const loc of sitemapLocs) {
  if (!expectedLocs.has(loc)) {
    const slug = urlToSlug(loc) ?? loc;
    fail(slug, "map", `entrée du sitemap sans page en source : ${loc}`);
  }
  if (!fileBySlug.has(urlToSlug(loc) ?? "\0")) fail(urlToSlug(loc) ?? loc, "map", `entrée du sitemap sans page prérendue : ${loc}`);
}

// ------------------------------------------------------------ HOME-SYNC
// Le <head> de index.html est synchronisé À LA MAIN avec HOME (src/lib/pages.ts) :
// title et meta description doivent être strictement identiques.
{
  const home = PAGES.find((p) => p.slug === "");
  const idx = read(resolve(root, "index.html"));
  const idxTitle = /<title>([\s\S]*?)<\/title>/.exec(idx)?.[1];
  const idxDesc = /<meta\s+name="description"\s+content="([^"]*)"/.exec(idx)?.[1];
  if (!home) fail("", "home", "HOME introuvable dans PAGES");
  else {
    const t = idxTitle === undefined ? null : decode(idxTitle);
    const d = idxDesc === undefined ? null : decode(idxDesc);
    if (t !== home.metaTitle) fail("", "home", `title index.html ≠ HOME.metaTitle\n      index.html : ${t}\n      HOME       : ${home.metaTitle}`);
    if (d !== home.metaDescription) fail("", "home", `description index.html ≠ HOME.metaDescription\n      index.html : ${d}\n      HOME       : ${home.metaDescription}`);
  }
}

// --------------------------------------------------------------- SIMILARITÉ
const SHINGLE = 5;
function shingles(text: string): Set<string> {
  const w = norm(text).split(" ").filter(Boolean);
  const s = new Set<string>();
  for (let i = 0; i + SHINGLE <= w.length; i++) s.add(w.slice(i, i + SHINGLE).join(" "));
  return s;
}
function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
}
const FAMILIES: Record<string, (s: string) => boolean> = {
  "tjm-NNN": (s) => /^tjm-\d+$/.test(s),
  "tjm-pour-NNNN-euros-net": (s) => /^tjm-pour-\d+-euros-net$/.test(s),
  "tjm-freelance-<métier>": (s) => s.startsWith("tjm-freelance-"),
  "X-ou-Y (comparatifs)": (s) => /-ou-/.test(s) && !s.startsWith("guides/"),
};
const simReport: { family: string; pairs: { a: string; b: string; score: number }[] }[] = [];
const THRESHOLD = 0.85;
for (const [family, test] of Object.entries(FAMILIES)) {
  const members = infoList.filter((i) => test(i.slug));
  const sh = members.map((m) => shingles(m.mainText));
  const pairs: { a: string; b: string; score: number }[] = [];
  for (let i = 0; i < members.length; i++)
    for (let j = i + 1; j < members.length; j++) pairs.push({ a: members[i].slug, b: members[j].slug, score: jaccard(sh[i], sh[j]) });
  pairs.sort((x, y) => y.score - x.score);
  simReport.push({ family, pairs });
}

// ------------------------------------------------------------------ SORTIE
const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s.padEnd(n));
console.log(`\nSEO check — ${allSlugs.length} page(s), ${sitemapLocs.length} entrée(s) sitemap\n`);
console.log(pad("page", 40) + CHECKS.map((c) => pad(c, 6)).join("") + "in/out");
let nFailPages = 0;
let nNoindex = 0;
for (const slug of allSlugs) {
  const f = failures.get(slug);
  if (f) nFailPages++;
  const inb = inbound.get(slug)?.size ?? 0;
  const outb = outbound.get(slug)?.size ?? 0;
  if (noindexSlugs.has(slug)) {
    nNoindex++;
    // noindex : seul le contrôle « absent du sitemap + robots noindex » (colonne map) s'applique.
    console.log(pad(slug, 40) + CHECKS.map((c) => pad(c === "map" ? (f?.has(c) ? "FAIL" : "noidx") : f?.has(c) ? "FAIL" : "skip", 6)).join("") + `${inb}/${outb}`);
    continue;
  }
  console.log(pad(slug || "(home)", 40) + CHECKS.map((c) => pad(f?.has(c) ? "FAIL" : "ok", 6)).join("") + `${inb}/${outb}`);
}
const totalFails = [...failures.values()].reduce((n, m) => n + [...m.values()].reduce((k, v) => k + v.length, 0), 0);

if (failures.size) {
  console.log("\nDétails des échecs :");
  for (const [slug, m] of failures)
    for (const [check, msgs] of m) for (const msg of msgs) console.log(`  FAIL [${check}] ${slug || "(home)"} — ${msg}`);
}
if (exceptionsUsed.length) {
  console.log("\nExceptions appliquées :");
  for (const e of exceptionsUsed) console.log(`  ${e}`);
}

let nWarn = 0;
console.log(`\nSimilarité de contenu (shingles de ${SHINGLE} mots, Jaccard ; WARN si > ${THRESHOLD}) :`);
for (const { family, pairs } of simReport) {
  const above = pairs.filter((p) => p.score > THRESHOLD);
  nWarn += above.length;
  console.log(`  ${family} : ${pairs.length} paires, ${above.length} > ${THRESHOLD}` + (pairs.length ? ` (max ${pairs[0].score.toFixed(3)})` : ""));
  for (const p of pairs.slice(0, 3)) console.log(`    ${p.score > THRESHOLD ? "WARN" : "    "} ${p.score.toFixed(3)}  ${p.a} <-> ${p.b}`);
}

console.log(
  `\nRésultat : ${allSlugs.length - nNoindex - [...failures.keys()].filter((s) => !noindexSlugs.has(s)).length} page(s) PASS, ${nFailPages} FAIL (${totalFails} problème(s)), ${nNoindex} noindex (hors total PASS), ${nWarn} paire(s) WARN`,
);
process.exit(failures.size ? 1 : 0);
