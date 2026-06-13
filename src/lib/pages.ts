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
import type { StatutId } from "./engine";
import type { FaqItem } from "../data/faq";
import { FAQ } from "../data/faq";

export const SITE = "https://freelance-ou-cdi.fr";

export interface PageSection {
  heading: string;
  // Un paragraphe = une chaîne = un seul nœud texte (sécurité hydration #418).
  paragraphs: string[];
}

export interface StatutPage {
  slug: string; // "" pour la home
  statut?: StatutId; // statut mis en avant (focus podium)
  breadcrumb?: string; // libellé fil d'Ariane
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: PageSection[];
  faq: FaqItem[];
  inputOverrides?: Partial<SimulationInput>;
}

// --------------------------------------------------------------------- HOME
const HOME: StatutPage = {
  slug: "",
  metaTitle:
    "Freelance ou CDI 2026 : simulateur de revenu net (micro, SASU, EURL)",
  metaDescription:
    "Simulateur gratuit 2026 : comparez votre net en micro-entreprise, EURL, SASU, portage salarial et CDI. Cotisations, impôt sur le revenu, flat tax 31,4 % et seuil de rentabilité TJM, calculs validés URSSAF.",
  h1: "Freelance ou CDI : combien il vous reste vraiment",
  intro:
    "Micro-entreprise, EI au réel, EURL, SASU, portage salarial — net après cotisations ET impôt sur le revenu, comparé à votre CDI. Barème IR 2026, flat tax 31,4 %, réforme TNS incluse.",
  sections: [],
  faq: FAQ,
};

// ------------------------------------------------------------------- PORTAGE
const PORTAGE: StatutPage = {
  slug: "simulateur-portage-salarial",
  statut: "portage",
  breadcrumb: "Simulateur portage salarial",
  metaTitle:
    "Simulateur portage salarial 2026 : salaire net réel vs CDI et freelance",
  metaDescription:
    "Combien reste-t-il vraiment en portage salarial en 2026 ? Frais de gestion, cotisations du régime général, net après impôt, et le TJM à partir duquel le portage bat votre CDI. Calculs validés URSSAF.",
  h1: "Simulateur portage salarial 2026 : ce qu'il vous reste vraiment",
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
};

// ---------------------------------------------------------------------- SASU
const SASU: StatutPage = {
  slug: "simulateur-sasu",
  statut: "sasu",
  breadcrumb: "Simulateur SASU",
  metaTitle:
    "Simulateur SASU 2026 : salaire, dividendes et net réel vs CDI",
  metaDescription:
    "Simulateur SASU 2026 : arbitrage salaire / dividendes, flat tax 31,4 %, impôt sur les sociétés et net après impôt. À partir de quel TJM la SASU bat votre CDI, calculs validés URSSAF.",
  h1: "Simulateur SASU 2026 : salaire, dividendes et ce qu'il vous reste",
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
};

// --------------------------------------------------------------------- MICRO
const MICRO: StatutPage = {
  slug: "simulateur-micro-entreprise",
  statut: "micro",
  breadcrumb: "Simulateur micro-entreprise",
  metaTitle:
    "Simulateur micro-entreprise 2026 : revenu net réel et plafonds",
  metaDescription:
    "Simulateur micro-entreprise 2026 : cotisations en % du CA, abattement, plafonds et net après impôt. À partir de quel TJM la micro bat votre CDI, et quand le plafond vous bloque. Calculs validés URSSAF.",
  h1: "Simulateur micro-entreprise 2026 : votre net réel et vos plafonds",
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
};

export const PAGES: StatutPage[] = [HOME, PORTAGE, SASU, MICRO];

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
