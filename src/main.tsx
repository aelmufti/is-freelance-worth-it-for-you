import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App";
import { getPage } from "./lib/pages";

const container = document.getElementById("root")!;
// La page est choisie d'après l'URL : modèle multi-document, pas de routing
// client. En prerender, on force la route via ?__route=<slug> (Playwright
// charge toujours "/", qui existe, sans dépendre du fallback SPA du preview).
const routeOverride = new URLSearchParams(window.location.search).get("__route");
const page = getPage(
  routeOverride !== null ? `/${routeOverride}/` : window.location.pathname,
);
const tree = (
  <StrictMode>
    <App page={page} />
    <Analytics />
  </StrictMode>
);

// Si le HTML a été prérendu (présence d'éléments enfants dans #root),
// on hydrate au lieu de re-rendre, pour éviter le « flash de remplacement ».
if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
