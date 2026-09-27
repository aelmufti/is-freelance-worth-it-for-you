// Pages légales : mentions légales (LCEN, art. 1-1 II — éditeur non
// professionnel) et politique de confidentialité (RGPD, art. 13).
//
// Elles étaient une fenêtre modale ouverte par un bouton : absentes du HTML,
// sans URL, illisibles sans JavaScript — alors que la loi exige un accès
// « direct et permanent ». Ce sont désormais de vraies pages prérendues, liées
// depuis le pied de chaque page. Leur contenu, qui contient des liens et un
// interrupteur, est rendu par src/components/Legal.tsx (layout « legal »).
// Exclues des moteurs (noindex) : aucune valeur de recherche, et elles
// diluaient le site.
import type { StatutPage } from "../lib/pages";

export const MENTIONS_LEGALES: StatutPage = {
  slug: "mentions-legales",
  breadcrumb: "Mentions légales",
  layout: "legal",
  noindex: true,
  hideFromFooter: true,
  metaTitle: "Mentions légales — freelance-ou-cdi.fr",
  metaDescription:
    "Éditeur, hébergeur, licences de réutilisation, indépendance vis-à-vis de l'administration et nature indicative des simulations de freelance-ou-cdi.fr.",
  h1: "Mentions légales",
  intro:
    "Qui édite ce site, qui l'héberge, ce que vous pouvez réutiliser et dans quelles limites les simulations peuvent être utilisées.",
  sections: [],
  faq: [],
};

export const CONFIDENTIALITE: StatutPage = {
  slug: "confidentialite",
  breadcrumb: "Confidentialité",
  layout: "legal",
  noindex: true,
  hideFromFooter: true,
  metaTitle: "Politique de confidentialité — freelance-ou-cdi.fr",
  metaDescription:
    "Données traitées par freelance-ou-cdi.fr : aucune donnée saisie collectée, mesure d'audience sans cookie avec droit d'opposition, hébergement, vos droits RGPD.",
  h1: "Politique de confidentialité",
  intro:
    "Ce que ce site sait de vous — très peu —, pourquoi, pour combien de temps, et comment vous y opposer.",
  sections: [],
  faq: [],
};

export const LEGAL_PAGES = [MENTIONS_LEGALES, CONFIDENTIALITE];
