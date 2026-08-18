// Registre des pages — source de vérité unique pour le routing (côté app),
// le prerender par route (scripts/prerender.ts, apply-prerender.ts) et le
// sitemap (scripts/build-sitemap.ts).
//
// Modèle « multi-document » : pas de librairie de routing. Chaque page est un
// document prérendu autonome ; la navigation interne se fait par <a href>.
// Au chargement, l'app lit location.pathname → getPage() → config.
//
// Une page statut = le simulateur pré-focalisé + un bloc éditorial UNIQUE
// (H1, intro, sections, FAQ propres). Le contenu doit rester distinct d'une
// page à l'autre (anti « doorway page »).

import type { SimulationInput } from "./params";
import { DEFAULT_INPUT, DEFAULT_PARAMS, caAnnuel } from "./params";
import type { StatutId } from "./engine";
import {
  calcCdi,
  calcEurl,
  calcMicro,
  calcPortage,
  calcSasu,
  tjmEquivalentCdi,
} from "./engine";
import type { FaqItem } from "../data/faq";
import { FAQ } from "../data/faq";
import { TJM_HUB, TJM_PAGES } from "../data/tjm";
import { OBJECTIF_PAGES } from "../data/objectifNet";
import { COMPARATIF_PAGES } from "../data/comparatifs";
import { GUIDE_PAGES } from "../data/guides";
import { INSTITUTIONNEL_PAGES } from "../data/institutionnel";
import { METIER_PAGES, OBSERVATOIRE_TJM } from "../data/tjmMetiers";

export const SITE = "https://freelance-ou-cdi.fr";

// Date de dernière vérification des taux / mise à jour du contenu (ISO).
// À mettre à jour à chaque changement de contenu ou de taux, EN MÊME TEMPS que
// le champ "dateModified" du JSON-LD dans index.html (sync manuelle).
// Alimente : <lastmod> du sitemap, ligne « Taux vérifiés le … » (App.tsx).
export const CONTENT_UPDATED = "2026-07-03";

// Date de dernière RÉVISION ÉDITORIALE du site (ISO). Distincte de
// CONTENT_UPDATED, qui date la dernière vérification des TAUX : une refonte de
// structure ou de maillage change le contenu sans que les barèmes bougent.
// Alimente <lastmod> (sitemap) et dateModified (JSON-LD) — les deux signaux de
// fraîcheur lus par les moteurs. Une page peut la surcharger via `updated`.
export const SITE_UPDATED = "2026-08-18";

// Date de première publication du site — `datePublished` du JSON-LD, qui ne
// doit PAS être égale à dateModified (sinon la page paraît jamais révisée).
export const SITE_PUBLISHED = "2026-06-11";

export interface PageSection {
  heading: string;
  // Un paragraphe = une chaîne = un seul nœud texte (sécurité hydration #418).
  paragraphs: string[];
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface StatutPage {
  slug: string; // "" pour la home
  statuts?: StatutId[]; // statuts mis en avant (focus podium) — 1 pour une page statut, 2 pour un comparatif
  breadcrumb?: string; // libellé fil d'Ariane
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  // Réponse directe, auto-suffisante et citable (chiffre + unité + cadre),
  // affichée en encadré « En bref » en tête de page et reprise en tête de
  // llms-full.txt. C'est le format que les moteurs génératifs extraient.
  tldr?: string;
  // Étapes d'un processus → schema HowTo (guides procéduraux uniquement).
  howTo?: HowToStep[];
  sections: PageSection[];
  faq: FaqItem[];
  inputOverrides?: Partial<SimulationInput>;
  related?: string[]; // slugs des pages liées (bloc « À lire aussi » — maillage interne)
  hideFromFooter?: boolean; // pages longue traîne (TJM) non listées dans le footer
  // « content » = page éditoriale sans simulateur (méthodologie, à propos,
  // glossaire) : App.tsx masque le verdict, le simulateur, les graphiques, le
  // tableau de seuils et les forces/faiblesses, et prerender.ts injecte un
  // schema Article au lieu du WebApplication.
  layout?: "content";
  // Dernière révision éditoriale PROPRE à cette page (ISO). Par défaut
  // SITE_UPDATED. Permet un <lastmod> et un dateModified justes page par page
  // au lieu d'une date unique recopiée sur 67 URL (signal de fraîcheur nul).
  updated?: string;
  // Première publication de la page (ISO). Par défaut SITE_PUBLISHED.
  published?: string;
}

// ----------------------------------------------------- REGROUPEMENT FOOTER
// Le footer plat listait 22 liens sans hiérarchie ; groupés par intention, les
// mêmes liens donnent des chemins de crawl lisibles et des ancres contextuelles.
export type FooterGroup =
  | "simulateurs"
  | "comparatifs"
  | "tjm"
  | "guides"
  | "ressources";

export const FOOTER_GROUP_LABELS: Record<FooterGroup, string> = {
  simulateurs: "Simulateurs par statut",
  comparatifs: "Comparatifs",
  tjm: "TJM et revenus",
  guides: "Guides pratiques",
  ressources: "Ressources",
};

export const FOOTER_GROUP_ORDER: FooterGroup[] = [
  "simulateurs",
  "comparatifs",
  "tjm",
  "guides",
  "ressources",
];

// Déduit le groupe depuis le slug : pas de champ à maintenir dans les six
// fichiers de données, et une nouvelle page atterrit automatiquement au bon
// endroit.
export function footerGroup(page: StatutPage): FooterGroup {
  const s = page.slug;
  if (s.startsWith("simulateur-")) return "simulateurs";
  if (s.startsWith("guides")) return "guides";
  if (s.startsWith("tjm-") || s === "observatoire-tjm-2026") return "tjm";
  if (s.includes("-ou-")) return "comparatifs";
  return "ressources";
}

// Date de dernière révision effective d'une page (fallback site).
export function pageUpdated(page: StatutPage): string {
  return page.updated ?? SITE_UPDATED;
}

export function pagePublished(page: StatutPage): string {
  return page.published ?? SITE_PUBLISHED;
}

// ------------------------------------------------- CHIFFRES POUR COMPARATIFS
// Calculés par le moteur sur le scénario par défaut (18 j × 11 mois, 3 000 €
// de frais pro, célibataire, CDI 55 000 € brut) — même principe que
// src/data/faq.ts : impossible qu'ils divergent du simulateur.
const _p = DEFAULT_PARAMS;
const _ref = DEFAULT_INPUT;
const _fmt = (n: number): string => {
  const s = String(Math.round(n));
  return s.length > 3 ? `${s.slice(0, -3)} ${s.slice(-3)}` : s;
};
const _round5 = (n: number | null): number =>
  n === null ? NaN : Math.round(n / 5) * 5;

// Nets mensuels au TJM par défaut (550 €), 100 % rémunération
const NET_EURL_MOIS = _fmt(calcEurl(_ref, _p).netMensuel);
const NET_SASU_MOIS = _fmt(calcSasu(_ref, _p).netMensuel);
const NET_CDI_MOIS = _fmt(calcCdi(_ref, _p).netMensuel);

// Seuils de TJM pour battre le CDI de référence (55 000 € brut)
const TJM_MICRO_CDI = _round5(tjmEquivalentCdi(_ref, _p, calcMicro));
const TJM_SASU_CDI = _round5(tjmEquivalentCdi(_ref, _p, calcSasu));
const TJM_PORTAGE_CDI = _round5(tjmEquivalentCdi(_ref, _p, calcPortage));

// Part du CA conservée en net après cotisations ET impôt, à TJM 400 €
// (niveau où micro et portage sont tous deux accessibles)
const _in400 = { ..._ref, tjm: 400 };
const _ca400 = caAnnuel(_in400);
const PCT_MICRO_400 = Math.round(
  (calcMicro(_in400, _p).netAnnuel / _ca400) * 100,
);
const PCT_PORTAGE_400 = Math.round(
  (calcPortage(_in400, _p).netAnnuel / _ca400) * 100,
);

// TJM au-delà duquel le plafond micro (prestations) est dépassé, au rythme
// de facturation par défaut
const TJM_PLAFOND_MICRO = Math.round(
  _p.microPlafondService / (_ref.joursParMois * _ref.moisFactures),
);
// CA annuel à facturer en portage pour égaler le CDI de référence
const CA_PORTAGE_CDI = _fmt(
  TJM_PORTAGE_CDI * _ref.joursParMois * _ref.moisFactures,
);

// --------------------------------------------------------------------- HOME
const HOME: StatutPage = {
  slug: "",
  metaTitle: "Freelance ou CDI 2026 : simulateur de revenu net",
  metaDescription:
    "Comparez votre net en micro-entreprise, EURL, SASU, portage et CDI. Cotisations, impôt, flat tax et seuil de TJM. Gratuit, validé URSSAF.",
  h1: "Freelance ou CDI : combien il vous reste vraiment",
  tldr: `Pour égaler un CDI cadre à 55 000 € brut (${NET_CDI_MOIS} € net par mois après impôt), il faut facturer environ ${TJM_MICRO_CDI} € par jour en micro-entreprise, ${TJM_SASU_CDI} € en SASU et jusqu'à ${TJM_PORTAGE_CDI} € en portage salarial — à 18 jours facturés par mois sur 11 mois. Taux 2026, calculs validés URSSAF.`,
  intro:
    "Micro-entreprise, EI au réel, EURL, SASU, portage salarial — net après cotisations ET impôt sur le revenu, comparé à votre CDI. Barème IR 2026, flat tax 31,4 %, réforme TNS incluse.",
  sections: [],
  faq: FAQ,
  related: [
    "tjm-en-salaire",
    "sasu-ou-eurl",
    "micro-entreprise-ou-sasu",
    "portage-salarial-ou-cdi",
    "observatoire-tjm-2026",
    "guides/comment-fixer-son-tjm",
    "guides/passer-de-salarie-a-freelance",
  ],
};

// ------------------------------------------------------------------- PORTAGE
const PORTAGE: StatutPage = {
  slug: "simulateur-portage-salarial",
  statuts: ["portage"],
  breadcrumb: "Simulateur portage salarial",
  metaTitle: "Simulateur portage salarial 2026 : salaire net réel",
  metaDescription:
    "Frais de gestion, cotisations du régime général, net après impôt et le TJM à partir duquel le portage bat votre CDI. Validé URSSAF.",
  h1: "Simulateur portage salarial 2026 : ce qu'il vous reste vraiment",
  tldr: `En portage salarial, la société de portage prélève 5 à 10 % de frais de gestion, puis l'enveloppe restante supporte les cotisations patronales et salariales du régime général : il reste environ ${PCT_PORTAGE_400} % du chiffre d'affaires en net. Pour égaler un CDI à 55 000 € brut, il faut facturer environ ${TJM_PORTAGE_CDI} € par jour, soit ${CA_PORTAGE_CDI} € par an. C'est le seul statut freelance qui ouvre droit au chômage.`,
  intro:
    "Le portage, c'est la liberté du freelance avec le bulletin de paie du salarié. On le paie : c'est le statut où la plus petite part du chiffre d'affaires finit sur votre compte. Ce simulateur chiffre exactement ce qu'il vous reste, frais de gestion et cotisations déduits, face à un CDI et aux autres statuts.",
  sections: [
    {
      heading: "Comment marche le portage, concrètement",
      paragraphs: [
        "Vous trouvez vos missions et négociez vos tarifs comme un indépendant, mais vous signez un contrat de travail avec une société de portage qui facture le client à votre place. Elle encaisse le chiffre d'affaires, prélève des frais de gestion — souvent 5 à 10 % — puis transforme le reste en salaire, avec cotisations patronales et salariales du régime général.",
        "Le chemin de l'argent compte autant que le total : sur 100 € facturés, la société de portage retient d'abord sa commission, puis l'enveloppe restante supporte les charges sociales avant de devenir du net imposable. C'est cette double couche — frais de gestion puis cotisations « complètes » — qui explique pourquoi le portage rend moins, à chiffre d'affaires égal, que la micro ou l'EI.",
      ],
    },
    {
      heading: "Ce que vous achetez en échange",
      paragraphs: [
        "Le portage est le seul statut de freelance qui ouvre droit à l'assurance chômage. Concrètement : une mission s'arrête, vous pouvez prétendre à l'ARE comme n'importe quel salarié — un filet qu'aucune micro-entreprise n'offrira jamais. S'ajoutent la retraite complète du régime général, la prévoyance, et un bulletin de paie qui rassure les banques au moment d'un crédit immobilier.",
        "C'est le bon choix quand la sécurité pèse plus lourd que le net maximal : début d'activité, missions ponctuelles entre deux postes, ou besoin d'un revenu « bankable ». Quelqu'un qui quitte un CDI sans coupe-circuit y trouve un sas confortable ; un indépendant aguerri qui optimise son net y laissera trop de marge.",
      ],
    },
    {
      heading: "À partir de quel TJM le portage bat le CDI",
      paragraphs: [
        "Parce qu'il porte les cotisations les plus lourdes, le portage exige le TJM le plus élevé des cinq statuts pour égaler un même CDI. Le tableau plus bas donne le seuil exact selon votre salaire de référence ; réglez le simulateur sur vos jours facturés et vos frais réels pour obtenir votre propre point de bascule.",
        "La bonne lecture n'est pas « le portage rapporte moins » mais « le portage rapporte moins de cash, plus de droits ». Si vous comparez à revenu net strictement égal, le CDI gagne souvent ; si vous valorisez le chômage et la souplesse, l'écart de net devient le prix — souvent raisonnable — de votre tranquillité.",
      ],
    },
  ],
  faq: [
    {
      question: "Le portage salarial donne-t-il droit au chômage ?",
      answer:
        "Oui. Le salarié porté cotise à l'assurance chômage comme tout salarié du régime général : à la fin d'une mission, il peut ouvrir des droits à l'ARE auprès de France Travail, sous réserve des conditions habituelles d'affiliation. C'est l'avantage décisif du portage face à la micro-entreprise, l'EI ou l'EURL, qui n'ouvrent aucun droit au chômage.",
    },
    {
      question: "Quel pourcentage du chiffre d'affaires reste-t-il en portage ?",
      answer:
        "En ordre de grandeur, le salarié porté conserve environ la moitié de son chiffre d'affaires en net. La société de portage prélève 5 à 10 % de frais de gestion, puis l'enveloppe restante supporte les cotisations patronales (de l'ordre de 45 %) et salariales (environ 21 %) du régime général avant impôt. Le simulateur calcule le montant exact selon votre TJM et vos frais.",
    },
    {
      question: "Portage ou micro-entreprise : que choisir ?",
      answer:
        "La micro conserve une bien plus grande part du chiffre d'affaires mais n'offre ni chômage, ni retraite complète, et plafonne à 83 600 € de CA en prestations. Le portage rend moins de net mais ouvre les droits du salariat. Règle simple : micro si vous optimisez le net et acceptez le risque, portage si vous voulez un filet de sécurité ou un revenu reconnu par les banques.",
    },
    {
      question: "Y a-t-il un chiffre d'affaires minimum en portage ?",
      answer:
        "Il n'existe pas de plafond de CA en portage, contrairement à la micro. En pratique, les sociétés de portage demandent souvent un TJM plancher (fréquemment autour de 250 à 300 €/jour) pour que le salaire dépasse le minimum conventionnel une fois les charges déduites. En dessous, l'enveloppe ne suffit pas à constituer un bulletin de paie viable.",
    },
  ],
  related: [
    "portage-salarial-ou-cdi",
    "portage-salarial-ou-micro-entreprise",
    "simulateur-micro-entreprise",
  ],
};

// ---------------------------------------------------------------------- SASU
const SASU: StatutPage = {
  slug: "simulateur-sasu",
  statuts: ["sasu"],
  breadcrumb: "Simulateur SASU",
  metaTitle: "Simulateur SASU 2026 : salaire, dividendes et net réel",
  metaDescription:
    "Arbitrage salaire / dividendes, flat tax 31,4 %, impôt sur les sociétés et net après impôt. À quel TJM la SASU bat votre CDI. Validé URSSAF.",
  h1: "Simulateur SASU 2026 : salaire, dividendes et ce qu'il vous reste",
  tldr: `Le président de SASU est assimilé salarié : 75 à 80 % de charges sur le salaire versé, en échange d'une protection sociale de cadre — mais sans assurance chômage. Son vrai levier est l'arbitrage salaire/dividendes, ces derniers étant taxés à la flat tax de 31,4 % après impôt sur les sociétés. Pour égaler un CDI à 55 000 € brut en rémunération intégrale, comptez environ ${TJM_SASU_CDI} € par jour. Taux 2026.`,
  intro:
    "La SASU coûte cher en cotisations, mais c'est le seul statut qui vous laisse choisir entre salaire et dividendes — et c'est là que tout se joue. Ce simulateur chiffre votre net réel selon ce dosage, impôt sur les sociétés et flat tax compris, face à un CDI.",
  sections: [
    {
      heading: "Assimilé salarié : la protection du salariat, sans le chômage",
      paragraphs: [
        "Le président de SASU est « assimilé salarié » : il relève du régime général, avec la même couverture maladie et retraite qu'un cadre — mais sans cotisation chômage, donc sans droit à l'ARE au titre de son mandat. En contrepartie de cette protection, les charges sur le salaire sont les plus lourdes de tous les statuts indépendants : compter de l'ordre de 75 à 80 % de cotisations sur le net versé.",
        "Pris au pied de la lettre, ce chiffre fait fuir. Mais il ne raconte que la moitié de l'histoire : en SASU, vous n'êtes pas obligé de tout passer en salaire. C'est précisément cette liberté qui rend le statut intéressant pour qui sait s'en servir.",
      ],
    },
    {
      heading: "Le vrai levier : doser salaire et dividendes",
      paragraphs: [
        "Tout ce que vous ne vous versez pas en salaire reste un bénéfice, taxé à l'impôt sur les sociétés (15 % jusqu'à 42 500 € de profit, 25 % au-delà), puis distribuable en dividendes soumis à la flat tax de 31,4 %. Cet itinéraire évite les lourdes cotisations sociales du salaire : bien dosé, il améliore nettement le net pour un même chiffre d'affaires.",
        "Le réglage optimal dépend de votre niveau de revenu et de vos besoins de trésorerie : trop de salaire et vous payez des cotisations à plein, trop de dividendes et vous renoncez à des droits sociaux et à l'abattement salarial. Le panneau « Paramètres avancés » du simulateur vous laisse faire varier la part de rémunération et lire l'effet, euro par euro, sur votre net final.",
      ],
    },
    {
      heading: "Pourquoi la SASU séduit en sortie de CDI",
      paragraphs: [
        "Un point souvent décisif : il est possible de cumuler les allocations chômage issues d'un CDI rompu avec une SASU qui ne se verse pas de salaire. Vous lancez l'activité, vous vous rémunérez en dividendes une fois les premiers résultats là, et l'ARE complète la transition — un montage que la micro-entreprise gère beaucoup moins bien.",
        "La SASU prend tout son sens à partir d'un certain niveau de chiffre d'affaires, quand le gain de l'arbitrage dividendes dépasse le surcoût des charges et de la comptabilité. En dessous, la simplicité de la micro l'emporte presque toujours. Le tableau de seuils plus bas situe le point de bascule face à votre CDI.",
      ],
    },
  ],
  faq: [
    {
      question: "SASU ou EURL : quelle différence pour le revenu net ?",
      answer:
        "En EURL, le gérant majoritaire est travailleur non salarié (TNS) : cotisations plus légères (autour de 45 % du revenu), mais protection sociale moindre. En SASU, le président est assimilé salarié : meilleure couverture, charges bien plus lourdes sur le salaire, compensées par la possibilité de se verser des dividendes à la flat tax. À chiffre d'affaires égal, l'EURL rend souvent davantage en pur salaire ; la SASU reprend l'avantage dès qu'on optimise via les dividendes.",
    },
    {
      question: "Peut-on cumuler l'ARE (chômage) et une SASU ?",
      answer:
        "Oui, à condition de ne pas se verser de rémunération de président : tant que la SASU ne vous paie pas de salaire, France Travail maintient l'ARE issue de votre ancien CDI. Vous pouvez vous rémunérer en dividendes, qui ne sont pas considérés comme un salaire. C'est l'une des raisons pour lesquelles la SASU est si prisée au moment de quitter un poste.",
    },
    {
      question: "Vaut-il mieux se verser un salaire ou des dividendes en SASU ?",
      answer:
        "Le salaire ouvre des droits (retraite, maladie, indemnités) et bénéficie de l'abattement de 10 %, mais supporte des cotisations très lourdes. Les dividendes échappent aux cotisations sociales du salaire et subissent la flat tax de 31,4 %, mais n'ouvrent aucun droit. L'optimum est presque toujours un mélange : un salaire modéré pour les droits essentiels, le reste en dividendes. Le simulateur permet de tester chaque dosage.",
    },
    {
      question: "Quelles charges paie une SASU en 2026 ?",
      answer:
        "Sur le salaire du président : cotisations patronales et salariales du régime général, de l'ordre de 75 à 80 % du net versé. Sur les bénéfices conservés : impôt sur les sociétés à 15 % jusqu'à 42 500 € puis 25 %. Sur les dividendes distribués : flat tax de 31,4 % (12,8 % d'IR + 18,6 % de prélèvements sociaux). Le simulateur additionne ces couches pour donner votre net réel.",
    },
  ],
  related: ["sasu-ou-eurl", "micro-entreprise-ou-sasu", "simulateur-eurl"],
};

// --------------------------------------------------------------------- MICRO
const MICRO: StatutPage = {
  slug: "simulateur-micro-entreprise",
  statuts: ["micro"],
  breadcrumb: "Simulateur micro-entreprise",
  metaTitle: "Simulateur micro-entreprise 2026 : net réel et plafonds",
  metaDescription:
    "Cotisations en % du CA, abattement, plafond de 83 600 € et net après impôt. À quel TJM la micro bat votre CDI. Validé URSSAF.",
  h1: "Simulateur micro-entreprise 2026 : votre net réel et vos plafonds",
  tldr: `En micro-entreprise, les cotisations sont un pourcentage du chiffre d'affaires encaissé (environ 24,6 % en BNC) et l'impôt se calcule après un abattement forfaitaire de 34 %. C'est le statut qui laisse le plus de net tant qu'on reste sous son plafond de ${_fmt(_p.microPlafondService)} € de chiffre d'affaires en prestations : pour égaler un CDI à 55 000 € brut, environ ${TJM_MICRO_CDI} € par jour suffisent. Taux 2026.`,
  intro:
    "La micro-entreprise est le statut le plus simple et, sous un certain niveau de revenu, le plus rentable. Sa limite est connue d'avance : un plafond de chiffre d'affaires qui finit par tout verrouiller. Ce simulateur calcule votre net après cotisations et impôt, et vous dit à quel moment le plafond devient un mur.",
  sections: [
    {
      heading: "Pourquoi la micro est imbattable… jusqu'à un certain point",
      paragraphs: [
        "En micro, vos cotisations sont un simple pourcentage du chiffre d'affaires encaissé — pas de comptabilité d'engagement, pas de bilan, pas de TVA tant que vous restez sous les seuils de franchise. L'impôt, lui, se calcule après un abattement forfaitaire (34 % en BNC) censé représenter vos frais. Tant que vos charges réelles sont faibles, ce forfait joue en votre faveur et la micro rend plus que n'importe quel statut.",
        "C'est le statut idéal du prestataire intellectuel avec peu de dépenses : un développeur, un consultant, un rédacteur qui n'a besoin que d'un ordinateur. Le piège se referme dès que les frais montent — local, matériel, sous-traitance — car en micro, rien de tout cela n'est déductible : l'abattement s'applique, vos vraies factures restent à votre charge.",
      ],
    },
    {
      heading: "Le plafond qui change tout",
      paragraphs: [
        "Pour rester en micro en 2026, votre chiffre d'affaires ne doit pas dépasser 83 600 € en prestations de services (203 100 € en vente de marchandises). Au-delà deux années de suite, vous basculez à l'EI au réel ou en société. À 18 jours facturés par mois sur onze mois, ce plafond correspond à un TJM d'environ 420 € : au-dessus, la micro n'est tout simplement plus accessible — c'est pourquoi le tableau plus bas affiche un tiret sur les hauts salaires.",
        "Un seuil intermédiaire mérite l'œil : la franchise de TVA tombe à 37 500 € de CA en services. La dépasser ne vous sort pas de la micro, mais vous oblige à facturer la TVA. Sans incidence sur votre net si vos clients sont des entreprises qui la récupèrent ; à surveiller si vous vendez à des particuliers.",
      ],
    },
    {
      heading: "À partir de quel TJM la micro bat le CDI",
      paragraphs: [
        "La micro affiche le seuil de TJM le plus bas pour égaler un CDI donné : avec des cotisations légères et un abattement avantageux, elle « convertit » bien le chiffre d'affaires en net. Le tableau ci-dessous donne le point de bascule selon votre salaire de référence ; le simulateur l'ajuste à vos jours facturés et à votre foyer fiscal.",
        "La vraie question n'est donc pas « la micro est-elle rentable » — elle l'est presque toujours dans sa zone — mais « jusqu'où puis-je grandir avant qu'elle ne me bride ». Tant que vous restez sous le plafond avec peu de frais, gardez-la. Quand vos missions ou vos dépenses la dépassent, l'EI au réel ou la SASU prennent le relais.",
      ],
    },
  ],
  faq: [
    {
      question: "Quel est le plafond de la micro-entreprise en 2026 ?",
      answer:
        "83 600 € de chiffre d'affaires pour les prestations de services (BNC ou BIC) et 203 100 € pour la vente de marchandises. La franchise de TVA, distincte, s'applique sous 37 500 € (services) ou 85 000 € (vente). Dépasser le plafond de CA deux années consécutives entraîne le passage automatique à l'EI au réel ou la création d'une société.",
    },
    {
      question: "Les frais professionnels sont-ils déductibles en micro ?",
      answer:
        "Non. En micro-entreprise, l'impôt se calcule après un abattement forfaitaire (34 % en BNC, 50 % en BIC services, 71 % en vente) censé couvrir vos charges. Vos frais réels — matériel, local, logiciels, sous-traitance — ne sont jamais déduits en plus. La micro est donc avantageuse avec peu de frais, et pénalisante dès qu'ils deviennent importants : c'est là que l'EI au réel devient plus intéressante.",
    },
    {
      question: "Micro-entreprise ou EI au réel : comment choisir ?",
      answer:
        "Comparez vos frais réels à l'abattement forfaitaire. Si vos charges sont inférieures à l'abattement (34 % du CA en BNC), la micro rend davantage grâce à sa simplicité. Si vos frais dépassent ce forfait, l'EI au réel les déduit pour de vrai et devient plus avantageuse, sans plafond de chiffre d'affaires. Le simulateur place les deux côte à côte sur votre situation.",
    },
    {
      question: "Quelles cotisations paie un micro-entrepreneur en 2026 ?",
      answer:
        "Les cotisations sont un pourcentage du chiffre d'affaires encaissé : environ 24,6 % en BNC, 21,2 % en prestations BIC et 12,3 % en vente, auxquels s'ajoute une petite contribution à la formation. S'y ajoute l'impôt sur le revenu, calculé après abattement (ou, sur option et sous conditions de revenu, un versement libératoire prélevé directement sur le CA). Le simulateur intègre ces taux 2026.",
    },
  ],
  related: [
    "micro-entreprise-ou-sasu",
    "portage-salarial-ou-micro-entreprise",
    "simulateur-ei",
  ],
};

// ----------------------------------------------------------------- EI AU RÉEL
const EI: StatutPage = {
  slug: "simulateur-ei",
  statuts: ["ei"],
  breadcrumb: "Simulateur EI au réel",
  metaTitle: "Simulateur EI au réel 2026 : net réel et frais déductibles",
  metaDescription:
    "Cotisations TNS, frais réellement déductibles, aucun plafond de chiffre d'affaires et net après impôt. À quel TJM l'EI bat votre CDI.",
  h1: "Simulateur EI au réel 2026 : votre net quand les frais comptent",
  tldr: `L'entreprise individuelle au réel déduit vos frais professionnels à l'euro près, sans aucun plafond de chiffre d'affaires, avec des cotisations TNS d'environ 45 % du bénéfice après l'abattement d'assiette de 26 % de la réforme 2026. Elle devient plus avantageuse que la micro-entreprise dès que vos frais réels dépassent l'abattement forfaitaire de 34 % du chiffre d'affaires. Taux 2026.`,
  intro:
    "L'entreprise individuelle au réel, c'est la micro sans ses deux limites : vos frais sont déduits pour de vrai, et il n'y a aucun plafond de chiffre d'affaires. En échange, une vraie comptabilité et l'impôt sur le bénéfice. Ce simulateur calcule votre net après cotisations TNS et impôt, face à un CDI et aux autres statuts.",
  sections: [
    {
      heading: "Frais réels déductibles : là où l'EI dépasse la micro",
      paragraphs: [
        "En micro, l'administration applique un abattement forfaitaire (34 % en BNC) censé couvrir vos charges, que vos frais réels soient plus hauts ou plus bas. À l'EI au réel, on inverse la logique : vous tenez une comptabilité et vous déduisez vos dépenses professionnelles à l'euro près — local, matériel, déplacements, sous-traitance, logiciels, formation. Votre bénéfice imposable, c'est le chiffre d'affaires moins ces frais.",
        "La règle de décision est simple : comparez vos frais réels à l'abattement de la micro. Tant qu'ils restent en dessous, la micro et son zéro paperasse gagnent. Dès qu'ils le dépassent — un poste de travail coûteux, un atelier, de la sous-traitance régulière — l'EI au réel devient plus avantageuse, car elle paie cotisations et impôt sur un bénéfice plus faible.",
      ],
    },
    {
      heading: "Le régime TNS : des cotisations allégées, une protection à surveiller",
      paragraphs: [
        "L'entrepreneur individuel est un travailleur non salarié (TNS). Ses cotisations, calculées sur le bénéfice, restent nettement plus légères que celles d'un assimilé salarié (SASU, portage) : la réforme 2026 de l'assiette unique applique un abattement de 26 % avant calcul, ce qui rapproche encore l'assiette du revenu réellement perçu. C'est pourquoi, à chiffre d'affaires égal, l'EI laisse souvent plus de net qu'une société à l'IS très chargée sur le salaire.",
        "La contrepartie est sociale : pas d'assurance chômage, une retraite et une prévoyance moins généreuses que celles du régime général. Depuis 2022, le patrimoine personnel de l'entrepreneur est en revanche protégé par défaut, et l'EI peut, si besoin, opter pour l'impôt sur les sociétés. Pour qui veut maximiser son net en gérant lui-même sa protection, c'est un statut redoutablement efficace.",
      ],
    },
    {
      heading: "À partir de quel TJM l'EI bat le CDI",
      paragraphs: [
        "Grâce à des cotisations modérées et à la déduction des frais, l'EI au réel affiche un seuil de TJM bas pour égaler un CDI donné — souvent juste au-dessus de la micro, et bien en dessous des statuts à l'IS. Le tableau plus bas donne ce point de bascule selon votre salaire de référence ; réglez le simulateur sur vos jours facturés et vos frais réels pour obtenir le vôtre.",
        "L'EI est le prolongement naturel de la micro : on y passe quand le chiffre d'affaires franchit le plafond, ou quand les frais montent assez pour rendre l'abattement forfaitaire perdant. Tant que vous restez « léger », gardez la micro ; dès que l'activité grossit, l'EI au réel prend le relais sans changer de logique — vous restez en nom propre, sans créer de société.",
      ],
    },
  ],
  faq: [
    {
      question: "EI au réel ou micro-entreprise : laquelle choisir ?",
      answer:
        "Comparez vos frais réels à l'abattement forfaitaire de la micro (34 % du CA en BNC). En dessous, la micro rend plus grâce à sa simplicité et à l'absence de comptabilité. Au-dessus, l'EI au réel déduit vos charges pour de vrai et devient plus avantageuse, sans plafond de chiffre d'affaires. Le simulateur place les deux statuts côte à côte sur votre situation.",
    },
    {
      question: "Quels frais sont déductibles en EI au réel ?",
      answer:
        "Toutes les dépenses engagées dans l'intérêt de l'activité : loyer et charges du local, matériel et amortissements, déplacements, frais de repas dans les limites admises, logiciels et abonnements, sous-traitance, formation, cotisations facultatives (Madelin). C'est précisément ce que la micro ne permet pas : elle applique un abattement forfaitaire, vos factures réelles restant à votre charge.",
    },
    {
      question: "Y a-t-il un plafond de chiffre d'affaires en EI au réel ?",
      answer:
        "Non. Contrairement à la micro (83 600 € en prestations de services, 203 100 € en vente), l'EI au réel n'a aucun plafond de chiffre d'affaires. Vous pouvez développer votre activité sans changer de cadre, en restant en nom propre — c'est souvent la suite logique d'une micro qui a atteint ses limites.",
    },
    {
      question: "Quelles cotisations paie un entrepreneur individuel au réel en 2026 ?",
      answer:
        "Des cotisations TNS calculées sur le bénéfice (de l'ordre de 40 à 45 % après l'abattement d'assiette de 26 % issu de la réforme 2026), couvrant maladie, retraite, allocations familiales et CSG-CRDS, mais pas le chômage. S'y ajoute l'impôt sur le revenu au barème progressif sur ce même bénéfice. Le simulateur intègre ces taux 2026.",
    },
  ],
  related: ["simulateur-micro-entreprise", "simulateur-eurl"],
};

// --------------------------------------------------------------------- EURL
const EURL: StatutPage = {
  slug: "simulateur-eurl",
  statuts: ["eurl"],
  breadcrumb: "Simulateur EURL",
  metaTitle: "Simulateur EURL 2026 : rémunération, dividendes et net",
  metaDescription:
    "Arbitrage rémunération TNS / dividendes, règle des 10 % du capital, IS et net après impôt. À quel TJM l'EURL bat votre CDI.",
  h1: "Simulateur EURL 2026 : rémunération, dividendes et ce qu'il vous reste",
  tldr: `En EURL à l'impôt sur les sociétés, le gérant associé unique est travailleur non salarié : environ 45 % de cotisations sur sa rémunération, contre 75 à 80 % de charges pour un président de SASU. Sur le scénario de référence (TJM 550 €, tout en rémunération), l'EURL laisse ${NET_EURL_MOIS} €/mois net contre ${NET_SASU_MOIS} € en SASU. Mais seuls les dividendes sous 10 % du capital social profitent de la flat tax de 31,4 %.`,
  intro:
    "L'EURL, c'est l'EI passée en société : responsabilité limitée, option pour l'impôt sur les sociétés, et possibilité de se verser des dividendes. Mais le gérant associé unique reste un travailleur non salarié — et les dividendes y obéissent à une règle bien particulière. Ce simulateur chiffre votre net réel selon le dosage rémunération / dividendes, face à un CDI.",
  sections: [
    {
      heading: "Gérant majoritaire = TNS : la facture sociale allégée",
      paragraphs: [
        "Contrairement au président de SASU, assimilé salarié, le gérant associé unique d'une EURL est un travailleur non salarié. Ses cotisations sur la rémunération sont bien plus basses (de l'ordre de 45 % du revenu, contre 75 à 80 % du net en SASU), pour une protection sociale plus modeste et, comme tout indépendant, sans assurance chômage. À rémunération égale, l'EURL laisse donc davantage de net que la SASU.",
        "L'EURL relève par défaut de l'impôt sur le revenu, mais l'option pour l'impôt sur les sociétés est le choix courant dès qu'on veut piloter sa rémunération : c'est ce cas que modélise le simulateur. Le bénéfice non versé en salaire est alors taxé à l'IS (15 % jusqu'à 42 500 €, 25 % au-delà), puis conservé dans la société ou distribué en dividendes.",
      ],
    },
    {
      heading: "Rémunération ou dividendes : l'arbitrage, et le piège des 10 %",
      paragraphs: [
        "Comme en SASU, vous arbitrez entre rémunération — qui ouvre des droits mais supporte les cotisations — et dividendes, prélevés sur le bénéfice après IS. Mais une règle change tout en EURL : seule la fraction de dividendes inférieure à 10 % du capital social profite de la flat tax de 31,4 %. Au-delà de ce seuil, les dividendes sont soumis aux cotisations sociales TNS, comme une rémunération.",
        "Conséquence : la stratégie « petit salaire, gros dividendes » qui fonctionne en SASU est beaucoup moins efficace en EURL, sauf à doter la société d'un capital conséquent. Le panneau « Paramètres avancés » vous laisse régler la part de rémunération et le capital social pour voir, euro par euro, où se situe votre optimum — et constater l'effet du seuil des 10 %.",
      ],
    },
    {
      heading: "EURL ou SASU : le vrai départage",
      paragraphs: [
        "Le choix se joue sur deux axes. Sur la rémunération, l'EURL gagne : les charges TNS sont bien plus légères que celles de l'assimilé salarié. Sur les dividendes, la SASU reprend l'avantage : ils échappent aux cotisations et restent à la flat tax, sans la barrière des 10 % du capital. Votre profil de versement décide donc du gagnant.",
        "En pratique : si vous comptez vous verser l'essentiel en rémunération, l'EURL est souvent la plus rentable. Si votre stratégie repose sur les dividendes — ou si vous voulez cumuler avec l'ARE en début d'activité — la SASU prend le dessus. Le tableau de seuils plus bas situe le TJM à partir duquel l'EURL bat votre CDI ; comparez-le à celui de la SASU pour trancher sur vos chiffres.",
      ],
    },
  ],
  faq: [
    {
      question: "EURL ou SASU : quelle différence pour le revenu net ?",
      answer:
        "En EURL, le gérant est travailleur non salarié : cotisations légères (autour de 45 % du revenu), protection moindre, pas de chômage. En SASU, le président est assimilé salarié : meilleure couverture, charges bien plus lourdes sur le salaire, mais dividendes à la flat tax sans plafond. L'EURL l'emporte si vous vous versez surtout une rémunération ; la SASU si vous misez sur les dividendes.",
    },
    {
      question: "Comment sont taxés les dividendes d'une EURL ?",
      answer:
        "La part de dividendes inférieure à 10 % du capital social est soumise à la flat tax de 31,4 % (12,8 % d'IR + 18,6 % de prélèvements sociaux). Au-delà de ce seuil, les dividendes supportent les cotisations sociales TNS et l'impôt sur le revenu — et non la flat tax. C'est la grande différence avec la SASU, où tous les dividendes restent à la flat tax : en EURL, le capital social pèse directement sur votre optimisation.",
    },
    {
      question: "Le gérant d'une EURL a-t-il droit au chômage ?",
      answer:
        "Non. Comme tout travailleur non salarié, le gérant associé unique d'une EURL ne cotise pas à l'assurance chômage et n'ouvre aucun droit à l'ARE au titre de son mandat. Si la sécurité d'un filet est déterminante pour vous, le portage salarial est le seul statut indépendant qui ouvre droit au chômage.",
    },
    {
      question: "Quelles charges paie une EURL à l'IS en 2026 ?",
      answer:
        "Sur la rémunération du gérant : cotisations TNS (de l'ordre de 45 % après l'abattement d'assiette 2026). Sur le bénéfice : impôt sur les sociétés à 15 % jusqu'à 42 500 €, puis 25 %. Sur les dividendes : flat tax de 31,4 % sous 10 % du capital, cotisations TNS + IR au-delà. Le simulateur additionne ces couches pour donner votre net réel selon votre dosage.",
    },
  ],
  related: ["sasu-ou-eurl", "simulateur-sasu", "simulateur-ei"],
};

// ------------------------------------------------------------- SASU OU EURL
const SASU_OU_EURL: StatutPage = {
  slug: "sasu-ou-eurl",
  statuts: ["sasu", "eurl"],
  breadcrumb: "SASU ou EURL",
  metaTitle: "SASU ou EURL en 2026 : quel statut laisse le plus de net ?",
  metaDescription:
    "Cotisations TNS contre assimilé salarié, dividendes à la flat tax contre règle des 10 %, cumul ARE : le comparatif chiffré 2026.",
  h1: "SASU ou EURL : quel statut vous laisse le plus de net en 2026 ?",
  tldr: `Sur le scénario de référence (TJM 550 €, tout en rémunération), l'EURL laisse ${NET_EURL_MOIS} €/mois net contre ${NET_SASU_MOIS} € en SASU : son gérant est TNS (environ 45 % de cotisations) quand le président de SASU est assimilé salarié (75 à 80 % de charges). La SASU reprend l'avantage dès qu'on se verse des dividendes — tous à la flat tax de 31,4 % sans plafond, alors qu'en EURL seuls ceux sous 10 % du capital en bénéficient.`,
  intro: `C'est le duel classique du freelance qui passe en société — et la réponse dépend entièrement de la façon dont vous comptez vous payer. Sur le scénario de référence du simulateur (TJM 550 €, tout en rémunération), l'EURL laisse ${NET_EURL_MOIS} €/mois net contre ${NET_SASU_MOIS} € en SASU. Mais dès que les dividendes entrent en jeu, le match s'inverse. Ce comparatif chiffre les deux trajectoires sur VOS paramètres.`,
  sections: [
    {
      heading: "Deux régimes sociaux, deux factures très différentes",
      paragraphs: [
        "Tout part du statut social du dirigeant. Le gérant associé unique d'EURL est travailleur non salarié : ses cotisations tournent autour de 45 % de sa rémunération, allégées encore par l'abattement d'assiette de 26 % de la réforme 2026. Le président de SASU est assimilé salarié : régime général complet, mais 75 à 80 % de charges sur le net versé — la facture sociale la plus lourde de tous les statuts.",
        `La conséquence est mécanique : si vous transformez l'essentiel de votre chiffre d'affaires en rémunération, l'EURL gagne, et largement. Sur le scénario de référence (TJM 550 €, 18 jours facturés sur 11 mois, 100 % en rémunération), le simulateur donne ${NET_EURL_MOIS} €/mois net en EURL contre ${NET_SASU_MOIS} €/mois en SASU — un écart qui se creuse encore quand le chiffre d'affaires monte.`,
      ],
    },
    {
      heading: "Dividendes : la règle qui inverse le match",
      paragraphs: [
        "La SASU a une carte que l'EURL n'a pas : tous ses dividendes restent à la flat tax de 31,4 %, sans limite. Un président de SASU peut se verser un salaire minimal pour ses droits sociaux et sortir le reste en dividendes après IS — l'itinéraire qui évite les grosses cotisations. En EURL, la même stratégie se heurte à un mur : au-delà de 10 % du capital social, les dividendes du gérant repassent aux cotisations TNS, comme une rémunération.",
        "Autrement dit, l'optimisation « petit salaire, gros dividendes » est une stratégie SASU. En EURL, elle n'a de sens qu'avec un capital social important — rare quand on démarre. Le panneau « Paramètres avancés » du simulateur permet de faire varier la part de rémunération et le capital pour visualiser précisément où bascule votre situation.",
      ],
    },
    {
      heading: "Trancher : trois questions suffisent",
      paragraphs: [
        "Un : comment voulez-vous vous payer ? Essentiel en rémunération régulière → EURL. Minimum vital en salaire et le reste en dividendes annuels → SASU. Deux : touchez-vous l'ARE ? Le cumul allocations chômage + SASU sans salaire est un montage éprouvé en sortie de CDI ; l'EURL s'y prête moins bien car la rémunération du gérant, même faible, entame l'ARE. Trois : quelle protection sociale visez-vous ? L'assimilé salarié de la SASU cotise plus mais valide une meilleure retraite.",
        "Le tableau de seuils plus bas donne, pour chaque salaire CDI de référence, le TJM à partir duquel chacun des deux statuts devient gagnant. Réglez ensuite le simulateur sur vos propres chiffres : c'est le dosage rémunération/dividendes — pas le statut en lui-même — qui fait l'écart final.",
      ],
    },
  ],
  faq: [
    {
      question: "Quel statut paie le moins de cotisations : SASU ou EURL ?",
      answer:
        "L'EURL, nettement. Le gérant associé unique est travailleur non salarié : environ 45 % de cotisations sur sa rémunération (après l'abattement d'assiette de 26 % de la réforme 2026). Le président de SASU est assimilé salarié : 75 à 80 % de charges sur le net versé. À rémunération égale, l'EURL laisse donc plus de net — la SASU ne reprend l'avantage que par les dividendes, qui échappent aux cotisations.",
    },
    {
      question: "SASU ou EURL pour se verser des dividendes ?",
      answer:
        "La SASU. Ses dividendes sont intégralement soumis à la flat tax de 31,4 %, sans plafond. En EURL, seule la fraction inférieure à 10 % du capital social bénéficie de la flat tax : au-delà, les dividendes supportent les cotisations sociales TNS comme une rémunération. Sauf capital social très élevé, la stratégie dividendes n'est vraiment efficace qu'en SASU.",
    },
    {
      question: "SASU ou EURL pour cumuler avec le chômage (ARE) ?",
      answer:
        "La SASU est le montage le plus utilisé : un président qui ne se verse aucun salaire conserve l'intégralité de son ARE, et peut se rémunérer en dividendes (non considérés comme un salaire par France Travail). En EURL, la rémunération du gérant vient en déduction de l'allocation ; le cumul intégral est plus difficile à maintenir. Ni l'un ni l'autre ne génèrent de NOUVEAUX droits au chômage.",
    },
    {
      question: "Peut-on passer d'une EURL à une SASU, ou l'inverse ?",
      answer:
        "Oui, c'est une transformation de société (EURL → SASU ou SASU → EURL) : décision de l'associé unique, intervention d'un commissaire à la transformation dans certains cas, mise à jour des statuts et formalités au guichet unique. Comptez quelques centaines à quelques milliers d'euros de frais. C'est un choix réversible — mais assez coûteux pour mériter de bien simuler avant de créer.",
    },
  ],
  related: ["simulateur-sasu", "simulateur-eurl", "micro-entreprise-ou-sasu"],
};

// --------------------------------------------------------- MICRO OU SASU
const MICRO_OU_SASU: StatutPage = {
  slug: "micro-entreprise-ou-sasu",
  statuts: ["micro", "sasu"],
  breadcrumb: "Micro-entreprise ou SASU",
  metaTitle: "Micro-entreprise ou SASU en 2026 : le comparatif chiffré",
  metaDescription:
    "Net conservé, plafond de 83 600 €, cumul ARE et dividendes : le comparatif chiffré des deux statuts préférés des freelances.",
  h1: "Micro-entreprise ou SASU : le comparatif chiffré 2026",
  tldr: `Pour battre un CDI à 55 000 € brut, il faut environ ${TJM_MICRO_CDI} €/jour en micro-entreprise contre ${TJM_SASU_CDI} €/jour en SASU. Sous le plafond de ${_fmt(_p.microPlafondService)} € de chiffre d'affaires et avec peu de frais, la micro laisse quasi systématiquement plus de net. La SASU s'impose au-delà de ce plafond, avec des frais réels élevés, ou pour cumuler l'ARE en sortie de CDI.`,
  intro: `Ce sont les deux statuts les plus choisis par les freelances, et ils sont aux antipodes : la micro mise tout sur la simplicité et des cotisations légères, la SASU sur la protection et l'optimisation. Pour battre un CDI à 55 000 € brut, il faut un TJM d'environ ${TJM_MICRO_CDI} € en micro… contre ${TJM_SASU_CDI} € en SASU. Voici comment trancher selon votre niveau de revenu et votre situation.`,
  sections: [
    {
      heading: "Sous le plafond, la micro gagne presque toujours",
      paragraphs: [
        `En micro-entreprise, les cotisations sont un simple pourcentage du chiffre d'affaires (environ 24,6 % en BNC en 2026) et l'impôt se calcule après un abattement forfaitaire de 34 %. En SASU, le salaire du président supporte 75 à 80 % de charges. Le résultat se lit dans les seuils : pour égaler un CDI à 55 000 € brut (${NET_CDI_MOIS} €/mois net), il faut environ ${TJM_MICRO_CDI} €/jour en micro contre ${TJM_SASU_CDI} €/jour en SASU — presque 30 % de plus.`,
        "Tant que votre activité tient sous le plafond et que vos frais professionnels restent faibles, la micro convertit mieux chaque euro facturé en net disponible, sans comptable ni bilan. Créer une SASU « pour faire sérieux » à ce stade, c'est payer de la structure et des cotisations pour un bénéfice que vous ne touchez pas encore.",
      ],
    },
    {
      heading: "Le plafond de 83 600 € : là où la SASU entre en jeu",
      paragraphs: [
        `La micro s'arrête net à 83 600 € de chiffre d'affaires en prestations de services. Au rythme de 18 jours facturés sur 11 mois, ce plafond correspond à un TJM d'environ ${TJM_PLAFOND_MICRO} € : au-dessus, la question « micro ou SASU » ne se pose plus, la micro n'est simplement plus accessible. S'y ajoute la limite des frais : en micro, rien n'est déductible au réel — matériel coûteux, sous-traitance ou local font fondre l'avantage du forfait.`,
        "C'est dans cette zone haute que la SASU déploie ses atouts : pas de plafond, frais déductibles, impôt sur les sociétés à 15 % jusqu'à 42 500 € de bénéfice, et surtout l'arbitrage salaire/dividendes qui permet de piloter précisément ce que vous sortez et ce que vous capitalisez dans la société.",
      ],
    },
    {
      heading: "ARE, dividendes, crédibilité : les critères qui départagent",
      paragraphs: [
        "En sortie de CDI avec des droits au chômage, la SASU offre un montage que la micro ne permet pas : président sans salaire, ARE maintenue à 100 %, rémunération en dividendes quand les résultats arrivent. En micro, chaque euro de chiffre d'affaires encaissé vient réduire l'allocation mensuelle. Si vous comptez sur l'ARE comme filet de lancement, ce seul critère peut trancher le débat.",
        "Restent les critères d'image et de croissance : une SASU facture avec une TVA récupérable dès le premier euro, rassure certains grands comptes, et accueille plus tard des associés ou un rachat. La micro reste imbattable pour tester une activité ou compléter un revenu. Le simulateur ci-dessus place les deux statuts côte à côte sur votre TJM réel — c'est le point de départ le plus fiable.",
      ],
    },
  ],
  faq: [
    {
      question: "À chiffre d'affaires égal, qui laisse le plus de net : micro ou SASU ?",
      answer:
        "Sous le plafond de la micro (83 600 € de CA en services) et avec des frais réels faibles, la micro-entreprise laisse quasi systématiquement plus de net : cotisations d'environ 24,6 % du CA en BNC contre 75 à 80 % de charges sur le salaire du président de SASU. La SASU ne comble l'écart qu'en jouant sur les dividendes (flat tax 31,4 % après IS) et la déduction des frais réels — d'autant plus efficace que le chiffre d'affaires est élevé.",
    },
    {
      question: "Peut-on commencer en micro-entreprise et passer en SASU ensuite ?",
      answer:
        "Oui, et c'est le parcours le plus courant : on teste l'activité en micro (création gratuite, zéro comptabilité), puis on crée une SASU quand le chiffre d'affaires approche le plafond de 83 600 €, que les frais réels grossissent ou qu'un besoin d'optimisation apparaît. La bascule implique de créer la société, transférer les contrats clients et radier la micro — quelques semaines de formalités, sans continuité juridique entre les deux structures.",
    },
    {
      question: "Quel statut choisir en sortie de CDI avec des droits au chômage ?",
      answer:
        "La SASU permet le cumul le plus favorable : un président sans salaire conserve 100 % de son ARE et peut se verser des dividendes, qui ne sont pas déduits de l'allocation. En micro-entreprise, France Travail déduit chaque mois environ 70 % du chiffre d'affaires encaissé (après abattement) de l'ARE versée. Pour maximiser le filet pendant le lancement, la SASU l'emporte ; la micro reste plus simple si votre activité démarre doucement.",
    },
    {
      question: "La SASU vaut-elle le coup sous le plafond de la micro ?",
      answer:
        "Rarement pour le seul revenu net : sous 83 600 € de CA avec peu de frais, la micro laisse davantage, sans comptable (compter 1 000 à 2 000 €/an de frais de gestion en SASU). La SASU se justifie malgré tout dans trois cas : cumul ARE en sortie de CDI, frais professionnels élevés à déduire, ou clients grands comptes exigeant une société. Sinon, commencez en micro et basculez quand les chiffres l'imposent.",
    },
  ],
  related: [
    "simulateur-micro-entreprise",
    "simulateur-sasu",
    "sasu-ou-eurl",
  ],
};

// ----------------------------------------------- PORTAGE OU MICRO-ENTREPRISE
const PORTAGE_OU_MICRO: StatutPage = {
  slug: "portage-salarial-ou-micro-entreprise",
  statuts: ["portage", "micro"],
  breadcrumb: "Portage ou micro-entreprise",
  metaTitle: "Portage salarial ou micro-entreprise : comparatif 2026",
  metaDescription: `À TJM égal, la micro conserve environ ${PCT_MICRO_400} % du CA en net contre ${PCT_PORTAGE_400} % en portage — mais le portage ouvre le chômage.`,
  h1: "Portage salarial ou micro-entreprise : sécurité contre net maximal",
  tldr: `À 400 € par jour, la micro-entreprise conserve environ ${PCT_MICRO_400} % du chiffre d'affaires en net après cotisations et impôt, contre environ ${PCT_PORTAGE_400} % en portage salarial — plusieurs centaines d'euros d'écart chaque mois. Cette différence finance la protection du portage : assurance chômage, retraite complète du régime général et prévoyance, qu'aucune micro-entreprise n'offre.`,
  intro: `Même métier, même TJM, deux mondes : à 400 €/jour, la micro-entreprise vous laisse environ ${PCT_MICRO_400} % du chiffre d'affaires en net après cotisations et impôt, le portage environ ${PCT_PORTAGE_400} %. La différence achète une vraie protection — chômage compris. Ce comparatif chiffre exactement ce que chaque statut garde et ce qu'il couvre, pour choisir en connaissance de cause.`,
  sections: [
    {
      heading: "À TJM égal, l'écart de net est massif",
      paragraphs: [
        `Le chemin de l'argent explique tout. En micro, le chiffre d'affaires supporte environ 24,6 % de cotisations (BNC 2026) puis l'impôt après abattement de 34 % : sur un TJM de 400 €, il reste environ ${PCT_MICRO_400} % en net dans votre poche. En portage, la société prélève d'abord ses frais de gestion (souvent 5 à 10 %), puis l'enveloppe restante subit cotisations patronales ET salariales du régime général avant impôt : il reste environ ${PCT_PORTAGE_400} % du même chiffre d'affaires.`,
        "Sur une année pleine à 400 €/jour (environ 79 000 € facturés), l'écart se compte en dizaines de milliers d'euros. Aucun des deux statuts ne « triche » : le portage transforme la différence en droits sociaux. La vraie question est de savoir si ces droits valent, pour vous, ce qu'ils coûtent.",
      ],
    },
    {
      heading: "Ce que le portage achète avec la différence",
      paragraphs: [
        "Le portage est le seul statut freelance qui cotise à l'assurance chômage : mission terminée, vous pouvez ouvrir des droits à l'ARE comme n'importe quel salarié. S'ajoutent la retraite complète du régime général (base + complémentaire), la prévoyance, la mutuelle d'entreprise, et un bulletin de salaire qui change tout face à un banquier pour un crédit immobilier. La micro n'offre rien de tout cela : retraite réduite, pas de chômage, et des revenus que les banques regardent avec prudence les premières années.",
        "Le portage épargne aussi la gestion : pas de facturation à relancer, pas de déclarations URSSAF, pas de franchise de TVA à surveiller. Pour une mission longue chez un grand compte qui exige un cadre salarié, ou une transition entre deux CDI, ce confort a une vraie valeur — que le simulateur ne mesure pas, mais que votre tranquillité connaît.",
      ],
    },
    {
      heading: "Plafonds, TVA, minimums : les contraintes croisées",
      paragraphs: [
        `Chaque statut a sa zone d'exclusion. La micro plafonne à 83 600 € de chiffre d'affaires en prestations — environ ${TJM_PLAFOND_MICRO} €/jour au rythme de 18 jours sur 11 mois — et sa franchise de TVA saute dès 37 500 €. Le portage, lui, a un plancher : la plupart des sociétés refusent les TJM sous 250 à 300 €, car l'enveloppe ne suffit plus à constituer un bulletin de paie conforme au minimum conventionnel.`,
        "La règle de décision tient en deux profils. Vous optimisez le net, vos frais sont faibles, vous tolérez le risque : micro, tant que le plafond le permet. Vous voulez un filet (chômage, retraite pleine, crédit immobilier en vue) ou votre client impose un cadre salarié : portage, en acceptant son coût. Beaucoup de freelances font d'ailleurs les deux au fil de leur carrière — le simulateur vous dit ce que chaque option vaut à votre TJM.",
      ],
    },
  ],
  faq: [
    {
      question: "Quel écart de revenu entre portage et micro-entreprise à TJM égal ?",
      answer: `Sur un TJM de 400 € (environ 79 000 € facturés par an à 18 jours par mois sur 11 mois), la micro-entreprise BNC laisse environ ${PCT_MICRO_400} % du chiffre d'affaires en net après cotisations et impôt, contre environ ${PCT_PORTAGE_400} % en portage salarial — frais de gestion et cotisations du régime général déduits. L'écart, plusieurs centaines d'euros par mois, correspond au prix de la protection sociale complète du portage (chômage, retraite, prévoyance).`,
    },
    {
      question: "Le portage salarial est-il plus sûr que la micro-entreprise ?",
      answer:
        "Sur le plan social, oui : le salarié porté cotise au chômage (ARE possible en fin de mission), valide une retraite complète au régime général et bénéficie d'une prévoyance et d'une mutuelle d'entreprise. Le micro-entrepreneur n'a ni chômage, ni retraite complète, et sa protection maladie est minimale. En contrepartie, le portage rend nettement moins de net à chiffre d'affaires égal — la « sécurité » est exactement ce que finance la différence.",
    },
    {
      question: "Peut-on cumuler portage salarial et micro-entreprise ?",
      answer:
        "Oui, le cumul est légal et courant : le portage est un contrat de travail, la micro une activité indépendante, et rien n'interdit d'avoir les deux. Schéma classique : les grosses missions longues passent en portage (protection, bulletin de paie), les petites prestations ponctuelles en micro (net maximal, souplesse). Attention seulement à d'éventuelles clauses d'exclusivité dans le contrat de portage et au plafond de CA de la micro.",
    },
    {
      question: "Qui devrait choisir le portage plutôt que la micro-entreprise ?",
      answer:
        "Le portage s'impose dans quatre situations : vous quittez un CDI et voulez continuer à vous constituer des droits au chômage ; vous préparez un crédit immobilier et avez besoin de bulletins de salaire ; votre client (souvent grand compte) exige un intervenant salarié ; ou votre TJM dépasse ce que le plafond de la micro autorise et vous ne voulez pas créer de société. Sinon, à petit niveau de frais et sous le plafond, la micro maximise votre revenu.",
    },
  ],
  related: [
    "simulateur-portage-salarial",
    "simulateur-micro-entreprise",
    "portage-salarial-ou-cdi",
  ],
};

// ------------------------------------------------------- PORTAGE OU CDI
const PORTAGE_OU_CDI: StatutPage = {
  slug: "portage-salarial-ou-cdi",
  statuts: ["portage", "cdi"],
  breadcrumb: "Portage salarial ou CDI",
  metaTitle: "Portage salarial ou CDI : à quel TJM ça vaut le coup ?",
  metaDescription: `Le TJM pour égaler votre salaire (environ ${TJM_PORTAGE_CDI} €/jour pour 55 000 € brut), ce que vous gardez du salariat et ce que vous perdez.`,
  h1: "Portage salarial ou CDI : à partir de quel TJM ça vaut le coup ?",
  tldr: `Le portage est la sortie de CDI la moins risquée : vous restez salarié, avec assurance chômage et retraite du régime général. Mais pour égaler un CDI à 55 000 € brut (${NET_CDI_MOIS} €/mois net après impôt), il faut facturer environ ${TJM_PORTAGE_CDI} € par jour, soit ${CA_PORTAGE_CDI} € de chiffre d'affaires annuel — le seuil le plus élevé des cinq statuts freelance, parce que le portage porte la protection la plus complète.`,
  intro: `Le portage est la sortie de CDI la moins risquée : vous restez salarié, avec chômage et retraite — seul l'employeur change de nature. Mais ce confort se paie : pour égaler un CDI à 55 000 € brut (${NET_CDI_MOIS} €/mois net après impôt), il faut facturer environ ${TJM_PORTAGE_CDI} €/jour, soit ${CA_PORTAGE_CDI} € dans l'année. Ce simulateur calcule votre propre point de bascule.`,
  sections: [
    {
      heading: "Le portage garde presque tout du salariat",
      paragraphs: [
        "C'est la spécificité du portage face à tous les autres statuts freelance : vous signez un vrai contrat de travail. Assurance chômage (l'ARE s'ouvre en fin de mission), retraite complète du régime général, prévoyance, mutuelle, bulletins de salaire — un banquier ou un bailleur ne voit quasiment pas la différence avec votre CDI actuel. Aucune création d'entreprise, aucune comptabilité, aucune URSSAF à gérer.",
        "Ce qui change : c'est vous qui trouvez les missions et négociez le tarif, et c'est votre chiffre d'affaires qui finance tout — les frais de gestion de la société de portage (5 à 10 %), puis les cotisations patronales ET salariales. En CDI, l'employeur paie sa part au-dessus de votre brut ; en portage, tout sort de votre enveloppe. D'où un besoin de facturation nettement supérieur au « salaire équivalent ».",
      ],
    },
    {
      heading: "Le TJM qu'il faut viser pour ne pas perdre",
      paragraphs: [
        `Sur le scénario de référence du simulateur (18 jours facturés par mois, 11 mois, 3 000 € de frais professionnels), égaler le net d'un CDI de cadre à 55 000 € brut exige un TJM d'environ ${TJM_PORTAGE_CDI} € — le seuil le plus élevé des cinq statuts freelance, précisément parce que le portage porte la protection la plus complète. Le tableau plus bas décline ce seuil pour chaque niveau de salaire, de 35 000 € à 120 000 € brut.`,
        "Deux curseurs pèsent autant que le TJM : les jours réellement facturés (18 par mois est déjà un bon taux d'occupation — les intermissions ne sont pas payées) et le douzième mois sans facturation qui remplace vos congés payés. Passez vos propres valeurs dans le simulateur avant de négocier : un TJM correct à 20 jours facturés devient perdant à 15.",
      ],
    },
    {
      heading: "Les vrais termes de l'arbitrage",
      paragraphs: [
        "Face à votre CDI, le portage n'apporte ni économie de charges ni magie fiscale — il rend même un peu moins à revenu facturé égal. Ce qu'il apporte : la liberté de choisir missions, clients et rythme, un tarif que VOUS négociez (et qui peut monter bien plus vite qu'un salaire), et la possibilité de tester l'indépendance sans brûler le filet du chômage. Ce qu'il retire : la stabilité d'un revenu garanti pendant les creux, les congés payés implicites, et les avantages annexes (participation, titres-restaurant, mutuelle familiale).",
        "La bonne lecture n'est donc pas « portage contre CDI » mais « quel TJM transforme ma liberté en gain net ». Sous le seuil, vous payez votre indépendance ; au-dessus, elle vous paie. Et si votre TJM cible dépasse nettement le seuil, comparez aussi micro, EI et SASU : à protection moindre, elles rendent beaucoup plus — c'est tout l'objet de ce simulateur.",
      ],
    },
  ],
  faq: [
    {
      question: "Quel TJM demander en portage pour ne pas perdre par rapport à mon CDI ?",
      answer: `Pour un CDI de cadre à 55 000 € brut par an (${NET_CDI_MOIS} €/mois net après impôt), il faut environ ${TJM_PORTAGE_CDI} €/jour en portage salarial, à raison de 18 jours facturés par mois sur 11 mois — soit environ ${CA_PORTAGE_CDI} € de chiffre d'affaires annuel. Le seuil varie quasi proportionnellement avec le salaire : le tableau du simulateur le donne pour chaque niveau de brut, et le calcul s'ajuste à vos jours facturés réels.`,
    },
    {
      question: "Perd-on ses droits au chômage en passant du CDI au portage ?",
      answer:
        "Non — c'est même l'argument central du portage. Le salarié porté cotise à l'assurance chômage comme tout salarié : vos droits acquis en CDI sont conservés, et vos missions en portage en génèrent de nouveaux. En fin de mission, vous pouvez ouvrir ou recharger des droits à l'ARE auprès de France Travail. Aucun autre statut freelance (micro, EI, EURL, SASU) n'offre cette continuité.",
    },
    {
      question: "Le portage salarial compte-t-il pour la retraite comme un CDI ?",
      answer:
        "Oui : le salarié porté cotise au régime général (retraite de base) et à l'AGIRC-ARRCO (complémentaire) exactement comme un cadre en CDI, à hauteur du salaire reconstitué après frais de gestion. À chiffre d'affaires suffisant, vous validez vos trimestres et accumulez des points dans les mêmes conditions. C'est une différence majeure avec la micro-entreprise, où les droits retraite sont sensiblement plus faibles.",
    },
    {
      question: "Faut-il quitter son CDI pour le portage salarial ?",
      answer:
        "Le portage est le meilleur « sas » si vous voulez tester l'indépendance sans risque : rupture conventionnelle pour conserver l'ARE, puis missions portées qui maintiennent chômage et retraite. Il devient discutable si votre TJM est confortablement au-dessus du seuil d'équivalence : sa double couche de frais et cotisations en fait le statut le moins rémunérateur, et une micro, une EI ou une SASU rendrait nettement plus. Simulez les cinq statuts avant de signer.",
    },
  ],
  // Point d'entrée du cluster « statut vs CDI » : ces quatre pages ne sont pas
  // dans le footer et n'étaient citées nulle part ailleurs.
  related: [
    "simulateur-portage-salarial",
    "micro-entreprise-ou-cdi",
    "sasu-ou-cdi",
    "eurl-ou-cdi",
    "ei-ou-cdi",
  ],
};

export const PAGES: StatutPage[] = [
  HOME,
  MICRO,
  EI,
  EURL,
  SASU,
  PORTAGE,
  SASU_OU_EURL,
  MICRO_OU_SASU,
  PORTAGE_OU_MICRO,
  PORTAGE_OU_CDI,
  ...COMPARATIF_PAGES,
  ...GUIDE_PAGES,
  OBSERVATOIRE_TJM,
  ...INSTITUTIONNEL_PAGES,
  TJM_HUB,
  ...TJM_PAGES,
  ...OBJECTIF_PAGES,
  ...METIER_PAGES,
];

export const ROUTE_SLUGS: string[] = PAGES.filter((p) => p.slug).map(
  (p) => p.slug,
);

export function getPage(pathname: string): StatutPage {
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  return PAGES.find((p) => p.slug === slug) ?? HOME;
}

export function pageUrl(page: StatutPage): string {
  return page.slug ? `${SITE}/${page.slug}/` : `${SITE}/`;
}

// Chemin (absolu, sans domaine) de l'image Open Graph de la page.
// Générées par scripts/og-image.ts, référencées par scripts/prerender.ts.
// Le slug est aplati (« / » → « - ») pour que les pages à slug imbriqué
// (ex. « guides/… ») produisent un fichier plat dans public/ — og-image.ts
// n'écrit pas de sous-dossier.
export function ogImagePath(page: StatutPage): string {
  return page.slug ? `/og-${page.slug.replace(/\//g, "-")}.png` : "/og.png";
}
