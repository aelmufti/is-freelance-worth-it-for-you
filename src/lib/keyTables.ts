// Tableaux « chiffres clés » : la réponse chiffrée de la page, sous forme de
// <table> sémantique. C'est le format que Google extrait en extrait optimisé
// (featured snippet tableau) et que les moteurs génératifs citent le plus
// fidèlement — un tableau survit à l'extraction, une phrase à cinq chiffres
// non.
//
// Tous les montants sortent du moteur (DEFAULT_INPUT + TJM de la page), donc
// ne peuvent pas diverger du simulateur affiché juste en dessous.
//
// Les tableaux sont construits PARESSEUSEMENT (StatutPage.keyTable est une
// fonction) : seule la page affichée calcule le sien. Les précalculer pour les
// 67 pages au chargement du bundle rallongerait le Total Blocking Time.
import { DEFAULT_INPUT, DEFAULT_PARAMS, caAnnuel } from "./params";
import { calcAll, calcCdi, type StatutId } from "./engine";

export interface KeyTable {
  title: string; // intertitre (H2) de la section
  caption: string; // hypothèses du calcul, affichées sous le tableau
  head: string[];
  rows: string[][]; // 1re cellule = en-tête de ligne (<th scope="row">)
}

// Milliers séparés par une espace ordinaire, sans Intl : le texte doit être
// identique au prerender (Chromium) et à l'hydration (tout navigateur).
export const fmt = (n: number): string => {
  const s = String(Math.round(n));
  return s.length > 3 ? `${s.slice(0, -3)} ${s.slice(-3)}` : s;
};

export const LABEL: Record<StatutId, string> = {
  micro: "Micro-entreprise",
  ei: "EI au réel",
  eurl: "EURL",
  sasu: "SASU",
  portage: "Portage salarial",
  cdi: "CDI",
};

const ref = DEFAULT_INPUT;
const p = DEFAULT_PARAMS;
const SCENARIO = `${ref.joursParMois} jours facturés par mois sur ${ref.moisFactures} mois, ${fmt(ref.fraisPro)} € de frais professionnels par an, célibataire sans enfant, rémunération intégrale (sans dividendes). Taux 2026, moteur de calcul open source.`;

// Net de chaque statut à un TJM donné : pages palier, métier, objectif.
export function statutsAtTjm(tjm: number): KeyTable {
  const input = { ...ref, tjm };
  const ca = caAnnuel(input);
  const rows = calcAll(input, p)
    .filter((r) => r.id !== "cdi")
    .map((r) =>
      r.eligible
        ? [
            LABEL[r.id],
            `${fmt(r.netMensuel)} €`,
            `${fmt(r.netAnnuel)} €`,
            `${Math.round((r.netAnnuel / ca) * 100)} %`,
          ]
        : [LABEL[r.id], "Plafond dépassé", "—", "—"],
    );
  return {
    title: `TJM ${tjm} € : le net de chaque statut`,
    caption: `Pour ${fmt(ca)} € de chiffre d'affaires annuel (${tjm} € × ${ref.joursParMois} jours × ${ref.moisFactures} mois). Net après cotisations sociales ET impôt sur le revenu. Hypothèses : ${SCENARIO}`,
    head: ["Statut", "Net mensuel", "Net annuel", "Part du CA conservée"],
    rows,
  };
}

const GRID_TJMS = [300, 400, 500, 600, 700, 800];

// Net mensuel selon le TJM pour les statuts d'une page statut ou comparatif.
export function tjmGrid(statuts: StatutId[]): KeyTable {
  const ids = statuts.filter((s) => s !== "cdi");
  const labels = ids.map((id) => LABEL[id]);
  const rows = GRID_TJMS.map((tjm) => {
    const res = calcAll({ ...ref, tjm }, p);
    return [
      `${tjm} €/jour`,
      ...ids.map((id) => {
        const r = res.find((x) => x.id === id)!;
        return r.eligible ? `${fmt(r.netMensuel)} €` : "Plafond dépassé";
      }),
    ];
  });
  const cdi = calcCdi(ref, p);
  const titre =
    labels.length === 1
      ? `${labels[0]} : le net mensuel selon le TJM`
      : `${labels.join(" ou ")} : le net mensuel selon le TJM`;
  return {
    title: titre,
    caption: `Net mensuel après cotisations sociales ET impôt sur le revenu. Repère : un CDI cadre à ${fmt(ref.cdiBrutAnnuel)} € brut laisse ${fmt(cdi.netMensuel)} € net par mois après impôt. Hypothèses : ${SCENARIO}`,
    head: ["TJM", ...labels.map((l) => `${l} — net/mois`)],
    rows,
  };
}
