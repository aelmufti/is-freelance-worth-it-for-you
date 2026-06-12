// Génère public/og.png (1200×630) au format Open Graph.
// Ouvre une page Playwright sur un HTML inline néo-brutaliste et la capture.
// Usage : npx tsx scripts/og-image.ts
import { chromium } from "playwright";

// chromium-headless-shell est suffisant pour nos screenshots et est ~3× plus
// léger à télécharger que le binaire complet.
const browser_args = ["--no-sandbox"];
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>og</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: "JetBrains Mono", ui-monospace, Menlo, monospace; }
  body { width: 1200px; height: 630px; background: hsl(48 30% 96%); position: relative; overflow: hidden; }
  /* grille technique */
  body::before {
    content: ""; position: absolute; inset: 0;
    background-image:
      linear-gradient(to right, rgba(13,13,13,0.12) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(13,13,13,0.12) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .wrap { position: relative; padding: 60px 70px; display: flex; flex-direction: column; gap: 28px; height: 100%; }
  .badges { display: flex; gap: 12px; flex-wrap: wrap; }
  .badge { border: 3px solid #0d0d0d; padding: 6px 14px; font-weight: 900; font-size: 18px; text-transform: uppercase; letter-spacing: 0.08em; }
  .y { background: #d4a800; color: #0d0d0d; }
  .g { background: #0a9438; color: #fff; }
  .w { background: #fff; color: #0d0d0d; }
  h1 { font-size: 86px; font-weight: 900; line-height: 1; text-transform: uppercase; letter-spacing: -0.02em; color: #0d0d0d; }
  .hl { background: hsl(220 76% 46%); color: #fff; padding: 4px 12px 8px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
  p.sub { font-size: 24px; font-weight: 700; color: #0d0d0d; opacity: 0.75; max-width: 940px; }
  .cards { display: flex; gap: 16px; margin-top: auto; }
  .card { border: 3px solid #0d0d0d; padding: 14px 18px; background: #fff; box-shadow: 6px 6px 0 0 #0d0d0d; }
  .card .lbl { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
  .card .val { font-size: 30px; font-weight: 900; line-height: 1.1; margin-top: 4px; white-space: nowrap; }
  .micro { background: #d4a800; }
  .sasu  { background: hsl(220 76% 46%); color: #fff; }
  .cdi   { background: #0d0d0d; color: #fff; }
  .url { position: absolute; top: 60px; right: 70px; font-size: 18px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; background: #0d0d0d; color: #fff; padding: 8px 14px; border: 3px solid #0d0d0d; box-shadow: 4px 4px 0 0 #d4a800; }
</style></head><body>
  <div class="wrap">
    <div class="badges">
      <span class="badge y">100 % gratuit</span>
      <span class="badge g">taux 2026</span>
      <span class="badge w">validé URSSAF</span>
    </div>
    <h1>Freelance ou CDI :<br><span class="hl">combien il vous reste vraiment</span></h1>
    <p class="sub">Comparez micro, EURL, SASU, portage et CDI en net après cotisations et impôt. Trouvez le TJM à partir duquel chaque statut bat votre CDI.</p>
    <div class="cards">
      <div class="card micro"><div class="lbl">Micro-entreprise</div><div class="val">5 261 €/mois</div></div>
      <div class="card sasu"><div class="lbl">SASU</div><div class="val">3 992 €/mois</div></div>
      <div class="card cdi"><div class="lbl">CDI 55 k€</div><div class="val">3 048 €/mois</div></div>
    </div>
    <div class="url">freelance-ou-cdi.fr</div>
  </div>
</body></html>`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, "..", "public", "og.png");

const browser = await chromium.launch({ args: browser_args });
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: "networkidle" });
// Laisser la police custom se charger
await page.evaluate(() => document.fonts.ready);
const buf = await page.screenshot({ omitBackground: false, type: "png" });
writeFileSync(out, buf);
await browser.close();
console.log(`✓ og.png écrit (${(buf.length / 1024).toFixed(1)} KB) → ${out}`);
