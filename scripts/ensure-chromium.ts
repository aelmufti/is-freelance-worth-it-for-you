// Installe le binaire Chromium headless avant le prerender.
// Sur Vercel le cache disparaît entre les builds, donc on l'installe à
// chaque fois. Sur le poste local, si Chromium est déjà là, l'installeur
// Playwright ne fait quasiment rien.
import { spawnSync } from "node:child_process";

const r = spawnSync("npx", ["playwright", "install", "chromium-headless-shell"], {
  stdio: "inherit",
  env: process.env,
});
if (r.status !== 0) {
  console.error("Échec install Chromium :", r.status);
  process.exit(r.status ?? 1);
}
