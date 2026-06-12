// Drapeau positionné pendant la capture statique par scripts/prerender.ts.
// Permet de désactiver les useEffect qui muteraient l'état initial (lecture
// du localStorage, montage des graphiques) — sinon le HTML prérendu ne
// correspondrait pas à ce que React rendrait au premier render côté client,
// et l'hydration échouerait avec un mismatch.
export const IS_PRERENDER =
  typeof window !== "undefined" &&
  window.location.search.includes("__prerender=1");
