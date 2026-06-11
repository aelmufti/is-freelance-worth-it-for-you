import type { StatutId } from "../lib/engine";

export interface StatutInfo {
  id: StatutId;
  titre: string;
  resume: string;
  avantages: string[];
  inconvenients: string[];
  pourQui: string;
}

export const STATUTS_INFO: StatutInfo[] = [
  {
    id: "micro",
    titre: "MICRO-ENTREPRISE",
    resume:
      "Régime ultra-simplifié : cotisations en % du CA, pas de comptabilité complexe. Plafonds 2026 : 83 600 € (services) / 203 100 € (vente).",
    avantages: [
      "Création gratuite et en ligne en quelques minutes",
      "Comptabilité réduite à un livre de recettes",
      "Cotisations proportionnelles au CA : pas de CA = pas de charges",
      "ACRE : cotisations réduites la première année",
      "Versement libératoire possible (IR payé au fil de l'eau, taux fixe)",
      "Franchise de TVA sous 37 500 € (services) / 85 000 € (vente)",
    ],
    inconvenients: [
      "Frais réels NON déductibles (abattement forfaitaire uniquement)",
      "Plafond de CA limitant pour les TJM élevés",
      "Pas d'assurance chômage",
      "Retraite calculée sur une base réduite",
      "Pas de récupération de TVA sur les achats (sous franchise)",
      "Crédibilité parfois moindre auprès des grands comptes",
    ],
    pourQui:
      "Idéal pour démarrer, tester une activité, ou pour les CA < 70 k€ avec peu de frais.",
  },
  {
    id: "ei",
    titre: "ENTREPRISE INDIVIDUELLE AU RÉEL",
    resume:
      "Travailleur indépendant (TNS) imposé à l'IR sur son bénéfice réel. Depuis 2026, cotisations calculées sur une assiette unique (revenu − 26 %).",
    avantages: [
      "Frais réels 100 % déductibles (matériel, déplacement, local…)",
      "Pas de plafond de chiffre d'affaires",
      "Cotisations TNS plus faibles qu'en assimilé salarié",
      "Patrimoine personnel protégé par défaut depuis 2022",
      "Pas de capital social, formalités réduites",
      "Option possible pour l'IS sans changer de structure",
    ],
    inconvenients: [
      "Comptabilité réelle : expert-comptable quasi indispensable",
      "Pas d'assurance chômage",
      "Tout le bénéfice est imposé à l'IR, même non prélevé",
      "Cotisations minimales dues même sans bénéfice",
      "Protection sociale TNS moins couvrante (prévoyance à compléter)",
    ],
    pourQui:
      "Pour les indépendants avec des frais importants ou un CA au-dessus des plafonds micro.",
  },
  {
    id: "eurl",
    titre: "EURL À L'IS",
    resume:
      "Société unipersonnelle, gérant TNS. Permet d'arbitrer entre rémunération (cotisations TNS) et dividendes, et de lisser son revenu.",
    avantages: [
      "Cotisations TNS modérées sur la rémunération",
      "Pilotage du revenu imposable (rémunération vs réserves)",
      "IS à 15 % jusqu'à 42 500 € de bénéfice",
      "Frais réels déductibles + TVA récupérable",
      "Responsabilité limitée aux apports",
      "Passage facile en SARL si association future",
    ],
    inconvenients: [
      "Dividendes > 10 % du capital soumis aux cotisations TNS",
      "Comptabilité complète + dépôt des comptes (~1 500-2 500 €/an)",
      "Cotisations minimales même sans rémunération",
      "Formalités de création (statuts, annonce légale, ~400-800 €)",
      "Pas d'assurance chômage",
    ],
    pourQui:
      "Pour optimiser un revenu confortable en se versant l'essentiel en rémunération TNS.",
  },
  {
    id: "sasu",
    titre: "SASU À L'IS",
    resume:
      "Société unipersonnelle, président assimilé salarié. Charges élevées sur le salaire mais dividendes à la flat tax (31,4 % en 2026) sans cotisations.",
    avantages: [
      "Protection sociale du régime général (hors chômage)",
      "Dividendes sans cotisations sociales : flat tax 31,4 % seulement",
      "Aucune cotisation si aucune rémunération (utile avec l'ARE)",
      "Image « société » crédible auprès des clients",
      "Responsabilité limitée aux apports",
      "Grande souplesse statutaire",
    ],
    inconvenients: [
      "Cotisations très élevées sur le salaire (~75-80 % du net)",
      "Pas d'assurance chômage malgré le statut « assimilé salarié »",
      "Fiche de paie mensuelle obligatoire si rémunération",
      "Comptabilité complète + frais de structure",
      "Dividendes versés une fois par an seulement (après clôture)",
      "Retraite faible si rémunération faible + tout en dividendes",
    ],
    pourQui:
      "Pour les créateurs en cumul ARE, ou les hauts revenus qui privilégient les dividendes.",
  },
  {
    id: "portage",
    titre: "PORTAGE SALARIAL",
    resume:
      "Vous êtes salarié d'une société de portage qui facture vos clients. Frais de gestion de 5 à 10 % du CA, puis charges d'un salarié classique.",
    avantages: [
      "Assurance chômage : le SEUL statut freelance qui y ouvre droit",
      "Retraite, prévoyance et mutuelle du régime général",
      "Zéro gestion : pas de société, pas de comptabilité",
      "Crédit immobilier facilité (fiches de paie)",
      "Frais professionnels remboursables hors cotisations",
      "Démarrage et arrêt immédiats, sans formalités",
    ],
    inconvenients: [
      "Le net le plus faible : ~50 % du CA seulement",
      "Frais de gestion (5-10 %) + double couche de charges",
      "TJM minimum souvent exigé (~250-300 €/jour)",
      "Dépendance à la société de portage",
      "Pas de déduction d'investissements lourds",
    ],
    pourQui:
      "Pour sécuriser une transition vers le freelancing ou des missions ponctuelles sans risque.",
  },
  {
    id: "cdi",
    titre: "CDI (RÉFÉRENCE)",
    resume:
      "Le point de comparaison : salaire fixe, protection maximale, mais coût employeur ~1,42× le brut et revenu plafonné.",
    avantages: [
      "Sécurité de revenu + assurance chômage complète",
      "Retraite, mutuelle, prévoyance financées en partie par l'employeur",
      "Congés payés, RTT, tickets resto, intéressement…",
      "Crédit immobilier le plus simple à obtenir",
      "Aucune gestion administrative",
    ],
    inconvenients: [
      "Revenu plafonné : l'écart facturation/salaire part à l'employeur",
      "Pas de déduction de frais (hors 10 % forfaitaires)",
      "Moins de liberté (horaires, choix des missions)",
      "Évolution salariale lente vs TJM du marché",
    ],
    pourQui:
      "La base de comparaison : votre TJM doit générer plus de net que votre CDI pour valoir le risque.",
  },
];
