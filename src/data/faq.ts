// Questions/réponses pensées pour le SEO (longue traîne) et le GEO
// (extractibles par les LLMs en réponse à des requêtes d'utilisateurs).
// Chaque réponse est autosuffisante — un LLM peut la citer sans lire le reste.

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: FaqItem[] = [
  {
    question:
      "À partir de quel TJM le freelance devient-il plus rentable qu'un CDI ?",
    answer:
      "Pour un CDI à 55 000 € brut/an (3 048 €/mois net après impôt), un freelance en EI au réel ou en micro-entreprise dépasse ce seuil dès environ 300 €/jour, à raison de 18 jours facturés par mois sur 11 mois. Le seuil monte à environ 405 €/jour en SASU et 435 €/jour en portage salarial, car ces statuts supportent des cotisations plus lourdes. Ces valeurs sont calculées au taux 2026, hors avantages CDI non monétaires (chômage, congés, retraite complémentaire).",
  },
  {
    question: "Quel statut juridique choisir pour devenir freelance en 2026 ?",
    answer:
      "Le choix dépend du chiffre d'affaires et des frais : sous 70 000 € de CA avec peu de frais, la micro-entreprise reste imbattable (cotisations en % du CA, comptabilité minimale). Au-delà ou avec des frais réels importants, l'EI au réel ou l'EURL deviennent plus avantageuses (frais déductibles, pas de plafond). La SASU s'impose si vous voulez optimiser via dividendes (flat tax 31,4 %) ou cumuler avec l'ARE France Travail. Le portage salarial est le seul à ouvrir droit au chômage, au prix d'un net plus faible (≈ 50 % du CA).",
  },
  {
    question: "Quelle différence entre micro-entreprise, EURL et SASU ?",
    answer:
      "La micro-entreprise est un régime simplifié (cotisations forfaitaires, abattement automatique sur les revenus) sous plafond de CA (83 600 € en services, 203 100 € en vente). L'EURL est une société à associé unique soumise à l'IS ou IR : le gérant est travailleur non salarié (TNS), cotisations modérées (≈ 45 % du revenu). La SASU est une société à président assimilé salarié : protection sociale du régime général, mais charges très élevées (≈ 75-80 % du net), compensées par la possibilité de se verser des dividendes à la flat tax 31,4 % sans cotisations.",
  },
  {
    question: "Comment fonctionne la flat tax (PFU) en 2026 ?",
    answer:
      "Depuis le 1ᵉʳ janvier 2026, le prélèvement forfaitaire unique (PFU), dit flat tax, est passé de 30 % à 31,4 %. Il se décompose en 12,8 % d'impôt sur le revenu et 18,6 % de prélèvements sociaux (la CSG est passée de 9,2 % à 10,6 % sur les revenus du capital). Cette flat tax s'applique aux dividendes, intérêts, plus-values mobilières et gains sur crypto-actifs. Une option pour le barème progressif de l'IR reste possible si elle est plus favorable, mais elle s'applique alors à l'ensemble des revenus du capital.",
  },
  {
    question:
      "Combien faut-il facturer en freelance pour gagner autant qu'en CDI ?",
    answer:
      "Règle de poche : il faut multiplier votre salaire net mensuel CDI par environ 1,6 à 1,8 pour obtenir le chiffre d'affaires freelance équivalent. Pour 3 000 €/mois net en CDI, comptez 5 000 à 5 500 €/mois de CA freelance, soit un TJM d'environ 300 € sur 17-18 jours facturés. Le multiplicateur exact dépend du statut : 1,6× en EI/EURL TNS, 1,8× en SASU, jusqu'à 2,2× en portage. Ce simulateur calcule le seuil précis pour votre situation.",
  },
  {
    question:
      "Le portage salarial est-il rentable en 2026 ?",
    answer:
      "Le portage est le statut où l'on conserve le moins du CA (environ 50 % en net) : la société de portage prélève 5 à 10 % de frais de gestion, puis l'enveloppe restante supporte les cotisations patronales (≈ 45 %) et salariales (≈ 21 %) du régime général. En contrepartie, c'est le seul statut freelance ouvrant droit à l'assurance chômage et à la retraite complète du régime général. Il est rentable quand vous valorisez la sécurité (transition vers le freelancing, missions ponctuelles, accès au crédit immobilier) plus que la maximisation du net.",
  },
  {
    question: "Qu'est-ce qui change avec la réforme TNS 2026 ?",
    answer:
      "La réforme de l'assiette sociale des travailleurs non salariés, applicable à partir d'avril 2026, aligne la base de calcul des cotisations sociales et de la CSG-CRDS sur un revenu unique : le revenu professionnel brut diminué d'un abattement forfaitaire de 26 %. Objectif : neutraliser le poids global des prélèvements tout en augmentant la part contributive (retraite), au détriment de la part non contributive (CSG). Concrètement : pas de hausse des prélèvements totaux, mais des droits retraite améliorés pour les indépendants. Concerne EI au réel et gérants d'EURL ; les micro-entrepreneurs ne sont pas concernés.",
  },
  {
    question:
      "Quel est le plafond de la micro-entreprise en 2026 ?",
    answer:
      "Les plafonds de chiffre d'affaires pour rester en micro-entreprise en 2026 sont de 83 600 € pour les prestations de services (BNC ou BIC) et 203 100 € pour la vente de marchandises. La franchise de TVA, elle, s'applique sous 37 500 € (services) ou 85 000 € (vente) ; au-dessus, vous facturez la TVA tout en restant en micro-entreprise. Si vous dépassez le plafond deux années consécutives, vous basculez automatiquement à l'EI au réel ou devez créer une société.",
  },
];
