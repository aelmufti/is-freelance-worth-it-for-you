import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const html = `<!doctype html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:180px;height:180px;background:hsl(220 76% 46%);display:flex;align-items:center;justify-content:center;font-family:ui-monospace,Menlo,Consolas,monospace;color:#fff;font-weight:900;font-size:120px;border:8px solid #0d0d0d}
</style></head><body>€</body></html>`;

const __dir = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dir, "..", "public", "apple-touch-icon.png");

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 });
await p.setContent(html, { waitUntil: "networkidle" });
writeFileSync(out, await p.screenshot({ type: "png" }));
await b.close();
console.log("✓ apple-touch-icon.png");
