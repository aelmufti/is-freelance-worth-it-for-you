import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App";

const container = document.getElementById("root")!;
const tree = (
  <StrictMode>
    <App />
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
