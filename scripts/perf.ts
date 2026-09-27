// Mesure de laboratoire des Core Web Vitals sur le build de production, dans
// des conditions proches du profil mobile de Lighthouse : CPU bridé ×4, 4G
// lente (1,6 Mb/s, 150 ms de latence), viewport de téléphone. Médiane de 3.
//
//   npm run build && npm run perf                 # pages de référence
//   npm run perf -- /tjm-500/ /simulateur-sasu/   # pages au choix
//
// La page est ensuite défilée jusqu'en bas : c'est là que les graphiques se
// montent (chargement différé), et le CLS doit rester nul pendant ce défilement.
// Chromium fourni par l'environnement : CHROMIUM_EXECUTABLE_PATH=/chemin/chrome
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4399;
const args = process.argv.slice(2);
const paths = args.length ? args : ["/", "/tjm-500/", "/simulateur-sasu/", "/observatoire-tjm-2026/"];

// Chaîne et non fonction : tsx injecte un helper __name absent de la page.
const OBSERVE = `
  window.__m = { lcp: 0, cls: 0, tbt: 0, fcp: 0 };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === "first-contentful-paint") window.__m.fcp = e.startTime; }).observe({ type: "paint", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.tbt += Math.max(0, e.duration - 50); }).observe({ type: "longtask", buffered: true });
`;
const JS_BYTES = `performance.getEntriesByType("resource").filter((r) => /\\.js($|\\?)/.test(r.name)).reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0)`;
const SCROLL = `(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } })()`;

const srv = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  stdio: ["ignore", "pipe", "pipe"],
  detached: true,
});
try {
  await new Promise<void>((res, rej) => {
    srv.stdout!.on("data", (b) => String(b).includes("Local") && res());
    srv.on("exit", (c) => rej(new Error(`vite preview s'est arrêté (${c})`)));
  });
  const browser = await chromium.launch({
    args: ["--no-sandbox"],
    ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}),
  });
  console.log("page".padEnd(30), "FCP     LCP     TBT     CLS(chargement)  CLS(défilement)  JS");
  for (const path of paths) {
    const runs: Array<Record<string, number>> = [];
    for (let i = 0; i < 3; i++) {
      const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1638.4 * 1024) / 8, uploadThroughput: (675 * 1024) / 8 });
      await page.addInitScript(OBSERVE);
      await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
      const load = (await page.evaluate("window.__m")) as Record<string, number>;
      await page.evaluate(SCROLL);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
      const after = (await page.evaluate("window.__m")) as Record<string, number>;
      runs.push({ ...load, clsScroll: after.cls - load.cls, js: (await page.evaluate(JS_BYTES)) as number });
      await ctx.close();
    }
    const med = (k: string) => runs.map((r) => r[k]).sort((a, b) => a - b)[1];
    console.log(
      path.padEnd(30),
      `${Math.round(med("fcp"))}ms`.padEnd(7),
      `${Math.round(med("lcp"))}ms`.padEnd(7),
      `${Math.round(med("tbt"))}ms`.padEnd(7),
      med("cls").toFixed(3).padEnd(16),
      med("clsScroll").toFixed(3).padEnd(16),
      `${Math.round(med("js") / 1024)} Ko`,
    );
  }
  await browser.close();
} finally {
  try { process.kill(-srv.pid!, "SIGTERM"); } catch { srv.kill(); }
}
