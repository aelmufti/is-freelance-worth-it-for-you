// Pages institutionnelles / E-E-A-T (sujet YMYL = argent) : méthodologie,
// à propos (auteur), glossaire. Elles utilisent le layout « content »
// (pas de simulateur) et reçoivent un schema Article au prerender.

import type { StatutPage } from "../lib/pages";

// -------------------------------------------------- MÉTHODOLOGIE
const METHODOLOGIE: StatutPage = {
  slug: "methodologie",
  breadcrumb: "Méthodologie",
  layout: "content",
  metaTitle: "Méthodologie du simulateur freelance vs CDI 2026 : calculs et sources",
  metaDescription: `Comment sont calculés les revenus nets du simulateur freelance-ou-cdi.fr : cotisations par statut, barème 2026 de l'impôt, flat tax, impôt sur les sociétés, hypothèses, limites et validation contre le moteur URSSAF.`,
  h1: "Méthodologie : comment les calculs sont faits",
  intro: `Ce simulateur compare, pour un même chiffre d'affaires, le revenu net réellement disponible dans six statuts : micro-entreprise, EI au réel, EURL à l'IS, SASU à l'IS, portage salarial et CDI cadre. Cette page détaille exactement ce qui est calculé, avec quelles hypothèses, quelles sources et quelles limites — pour que vous puissiez juger de la fiabilité des chiffres, et les reproduire.`,
  sections: [
    {
      heading: "Ce que le moteur calcule, étape par étape",
      paragraphs: [
        `Le point de départ est le chiffre d'affaires : taux journalier moyen (TJM) multiplié par le nombre de jours réellement facturés dans l'année. Le moteur en déduit, pour chaque statut, les cotisations sociales, l'impôt sur le revenu (et, le cas échéant, l'impôt sur les sociétés et la flat tax sur les dividendes), puis les frais professionnels, pour arriver au revenu net mensuel et annuel après impôt.`,
        `Les cotisations dépendent du régime : un pourcentage du chiffre d'affaires en micro-entreprise (environ 24,6 % en BNC), des cotisations TNS en EI et EURL (de l'ordre de 45 % du revenu après l'abattement d'assiette de 26 % de la réforme 2026), et des cotisations du régime général en SASU et portage (75 à 80 % de charges sur le salaire, part patronale comprise). L'impôt sur le revenu applique le barème progressif 2026 avec le quotient familial du foyer renseigné.`,
      ],
    },
    {
      heading: "Impôt sur les sociétés, dividendes et flat tax",
      paragraphs: [
        `Pour l'EURL et la SASU à l'impôt sur les sociétés, le bénéfice non versé en rémunération est taxé à l'IS : 15 % jusqu'à 42 500 € de bénéfice, 25 % au-delà. Ce qui est ensuite distribué en dividendes supporte la flat tax (prélèvement forfaitaire unique) de 31,4 %, soit 12,8 % d'impôt sur le revenu et 18,6 % de prélèvements sociaux dans les hypothèses retenues.`,
        `Une règle propre à l'EURL est modélisée : la part de dividendes qui dépasse 10 % du capital social bascule des prélèvements forfaitaires vers les cotisations sociales TNS. C'est ce qui explique que la stratégie « petit salaire, gros dividendes » soit bien plus efficace en SASU qu'en EURL, à capital modeste.`,
      ],
    },
    {
      heading: "Le scénario de référence et ses hypothèses",
      paragraphs: [
        `Sauf réglage de votre part, les chiffres cités dans les pages reposent sur un scénario de référence : 18 jours facturés par mois sur 11 mois (soit 198 jours par an, un taux d'occupation réaliste qui réserve du temps pour la prospection, l'intermission et les congés), 3 000 € de frais professionnels annuels, un foyer d'un célibataire sans enfant, et un CDI de comparaison à 55 000 € brut cadre. Chaque curseur du simulateur modifie ces hypothèses en temps réel.`,
        `Le CDI « équivalent » affiché est calculé à net égal : c'est le salaire brut qui laisserait le même montant sur le compte après cotisations salariales et impôt. Cette équivalence ne valorise pas l'assurance chômage, les congés payés ni la retraite du salarié — elle sert de repère, pas de verdict.`,
      ],
    },
    {
      heading: "Validation, limites et fraîcheur",
      paragraphs: [
        `Les résultats sont comparés automatiquement au moteur de calcul open source « modele-social », celui qui équipe le simulateur officiel mon-entreprise.urssaf.fr : les écarts sont inférieurs à 2 % sur les cas testés. Cette démarche est purement technique — ce site est indépendant et n'est ni édité, ni approuvé, ni soutenu par l'URSSAF ou toute autre administration.`,
        `Certains éléments ne sont pas tous modélisés : cotisation foncière des entreprises (CFE), plafonnement du quotient familial, réduction générale de cotisations, mutuelle obligatoire, prévoyance et cas particuliers. Les avantages salarié (titres-restaurant, transport, mutuelle) sont une estimation indicative, affichée à part et exclue du net comparé. Le simulateur est une aide à la décision, pas un substitut à un expert-comptable. Les taux et barèmes sont datés dans le pied de page « Sources » et mis à jour à chaque évolution réglementaire.`,
      ],
    },
  ],
  faq: [
    {
      question: "Les calculs de ce simulateur sont-ils fiables ?",
      answer: `Ils sont comparés automatiquement au moteur open source « modele-social » de l'URSSAF (celui de mon-entreprise.urssaf.fr), avec des écarts inférieurs à 2 % sur les cas testés. Le code du moteur et tous les taux 2026 sont publics. C'est une aide à la décision indicative, pas un avis d'expert-comptable : certains cas particuliers ne sont pas modélisés.`,
    },
    {
      question: "Ce site est-il affilié à l'URSSAF ?",
      answer: `Non. Le site est un projet personnel indépendant, sans aucune affiliation ni approbation de l'URSSAF ou d'une administration. La comparaison au moteur « modele-social » est purement technique : elle sert à vérifier la justesse des calculs, pas à revendiquer un partenariat.`,
    },
    {
      question: "À quelle fréquence les taux sont-ils mis à jour ?",
      answer: `Les taux et barèmes sont vérifiés et datés dans le pied de page de chaque page (« Sources officielles »). Ils sont mis à jour à chaque évolution réglementaire significative : barème de l'impôt sur le revenu, taux de cotisations, réforme de l'assiette des indépendants, évolution de la flat tax.`,
    },
  ],
  related: ["a-propos", "glossaire", "tjm-en-salaire"],
};

// -------------------------------------------------- À PROPOS
const A_PROPOS: StatutPage = {
  slug: "a-propos",
  breadcrumb: "À propos",
  layout: "content",
  metaTitle: "À propos de freelance-ou-cdi.fr : qui édite ce simulateur ?",
  metaDescription: `Qui est derrière freelance-ou-cdi.fr : un simulateur gratuit, open source et sans collecte de données, édité par Ali El Mufti pour aider à comparer freelance et CDI en net réel. Indépendant de toute administration.`,
  h1: "À propos de freelance-ou-cdi.fr",
  intro: `freelance-ou-cdi.fr est un simulateur gratuit qui répond à une question simple mais mal outillée : entre le CDI et les différents statuts de freelance, qu'est-ce qui vous laisse vraiment le plus sur votre compte en fin de mois ? Voici qui l'édite, pourquoi, et selon quels principes.`,
  sections: [
    {
      heading: "Qui édite ce site",
      paragraphs: [
        `Le site est conçu et développé par Ali El Mufti, développeur indépendant (aelm.dev). C'est un projet personnel, sans société éditrice ni financement publicitaire : il fait partie d'une série d'outils gratuits pensés pour être réellement utiles plutôt que pour capter des données ou vendre un service.`,
        `Le code est entièrement open source (licence MIT) et public sur GitHub. N'importe qui peut inspecter le moteur de calcul, vérifier les taux utilisés, signaler une erreur ou proposer une amélioration. Cette transparence est volontaire : sur un sujet d'argent, une « boîte noire » n'inspire pas confiance.`,
      ],
    },
    {
      heading: "Pourquoi ce simulateur existe",
      paragraphs: [
        `La plupart des comparateurs répondent à côté de la vraie question. On trouve facilement son chiffre d'affaires ou son « salaire brut », mais rarement le net réellement disponible après cotisations ET impôt, statut par statut, comparé à un CDI équivalent. C'est pourtant ce chiffre-là qui décide d'un passage en indépendant.`,
        `L'objectif est donc de donner une réponse honnête et chiffrée, avec ses nuances : ce qu'on gagne en net, mais aussi ce qu'on perd en protection (chômage, congés, retraite). Le simulateur ne pousse aucun statut — il met les faits côte à côte pour que la décision reste la vôtre.`,
      ],
    },
    {
      heading: "Nos principes",
      paragraphs: [
        `Gratuité et sans compte : aucune inscription, aucun paywall. Respect de la vie privée : tous les calculs se font dans votre navigateur, aucune donnée saisie n'est envoyée ni stockée sur un serveur. Justesse : les résultats sont validés contre le moteur officiel de l'URSSAF et les taux sont datés.`,
        `Indépendance : ce site n'est ni édité, ni approuvé, ni soutenu par l'URSSAF ou toute autre administration. Il ne remplace pas un expert-comptable pour votre situation précise, mais vous donne un point de départ fiable pour en discuter — ou simplement pour y voir clair avant de vous lancer.`,
      ],
    },
  ],
  faq: [
    {
      question: "freelance-ou-cdi.fr est-il vraiment gratuit ?",
      answer: `Oui, entièrement : pas de compte, pas de paywall, pas de publicité intrusive. Le code est open source (MIT) et le simulateur fonctionne intégralement dans votre navigateur, sans collecte de données. C'est un projet personnel d'Ali El Mufti, pensé comme un outil d'utilité publique.`,
    },
    {
      question: "Mes données sont-elles collectées ?",
      answer: `Non. Tous les calculs sont réalisés localement dans votre navigateur : le TJM, les jours, votre situation familiale ou votre salaire ne sont jamais envoyés ni enregistrés sur un serveur. Vous pouvez utiliser le simulateur en toute confidentialité.`,
    },
  ],
  related: ["methodologie", "glossaire"],
};

// -------------------------------------------------- GLOSSAIRE
// Chaque terme = une section (heading = terme, paragraphs = définition).
const GLOSSAIRE: StatutPage = {
  slug: "glossaire",
  breadcrumb: "Glossaire",
  layout: "content",
  metaTitle: "Glossaire du freelance 2026 : TJM, TNS, flat tax, ARE… définitions",
  metaDescription: `Le vocabulaire du freelance expliqué simplement : TJM, chiffre d'affaires, cotisations, TNS, assimilé salarié, flat tax, impôt sur les sociétés, abattement, plafond, franchise de TVA, ARE, ACRE.`,
  h1: "Glossaire du freelance : les termes qui comptent",
  intro: `Passer en freelance, c'est apprendre une langue : TJM, TNS, flat tax, abattement, franchise de TVA… Voici les définitions claires des termes qui reviennent dans le simulateur et dans les guides, pour lire ses chiffres sans se tromper.`,
  sections: [
    {
      heading: "TJM (taux journalier moyen)",
      paragraphs: [
        `Le prix de vente hors taxes d'une journée de prestation. Ce n'est pas un salaire : il doit financer les cotisations sociales, l'impôt, les frais professionnels et les jours non facturés (congés, prospection, intermission). Selon le statut, il n'en reste qu'entre 40 et 60 % en net disponible.`,
      ],
    },
    {
      heading: "Chiffre d'affaires (CA)",
      paragraphs: [
        `Le total facturé hors taxes sur une période : TJM multiplié par les jours réellement facturés. C'est la base de départ de tous les calculs, avant cotisations et impôt. À ne pas confondre avec le revenu net, qui est ce qu'il reste une fois toutes les charges déduites.`,
      ],
    },
    {
      heading: "Cotisations sociales",
      paragraphs: [
        `Les prélèvements qui financent votre protection sociale (maladie, retraite, allocations familiales, et parfois chômage). Leur assiette et leur taux varient fortement selon le statut : un pourcentage du chiffre d'affaires en micro, du revenu en TNS, du salaire en assimilé salarié.`,
      ],
    },
    {
      heading: "Micro-entreprise",
      paragraphs: [
        `Régime simplifié en nom propre : cotisations calculées en pourcentage du chiffre d'affaires encaissé, impôt après un abattement forfaitaire, aucune comptabilité. Simple et avantageux à faibles frais, mais plafonné (83 600 € de CA en prestations de services) et sans frais réels déductibles.`,
      ],
    },
    {
      heading: "EI au réel (entreprise individuelle au réel)",
      paragraphs: [
        `La micro sans ses deux limites : les frais professionnels sont déduits pour de vrai et il n'y a aucun plafond de chiffre d'affaires. En échange, une vraie comptabilité et un impôt calculé sur le bénéfice réel. Le dirigeant reste travailleur non salarié (TNS).`,
      ],
    },
    {
      heading: "EURL",
      paragraphs: [
        `Société à associé unique. Le gérant associé unique est TNS (cotisations allégées). Souvent à l'impôt sur les sociétés, elle permet de piloter sa rémunération et de distribuer des dividendes — mais seule la part sous 10 % du capital social profite de la flat tax.`,
      ],
    },
    {
      heading: "SASU",
      paragraphs: [
        `Société par actions à associé unique. Le président est assimilé salarié : meilleure protection sociale (hors chômage), mais cotisations les plus lourdes sur le salaire. Son atout est l'arbitrage salaire/dividendes, ces derniers restant à la flat tax sans plafond.`,
      ],
    },
    {
      heading: "Portage salarial",
      paragraphs: [
        `Vous exercez comme un indépendant mais une société de portage vous salarie : elle facture le client, prélève des frais de gestion (5 à 10 %) et vous verse un salaire. Seul statut freelance à ouvrir des droits au chômage, au prix du net le plus bas à chiffre d'affaires égal.`,
      ],
    },
    {
      heading: "TNS (travailleur non salarié)",
      paragraphs: [
        `Le régime social des indépendants en nom propre (EI) et des gérants majoritaires (EURL) : cotisations plus légères qu'un salarié (environ 45 % du revenu), mais protection plus modeste et pas d'assurance chômage.`,
      ],
    },
    {
      heading: "Assimilé salarié",
      paragraphs: [
        `Le régime social du président de SASU et du salarié porté : rattaché au régime général (comme un cadre) pour la maladie et la retraite, avec des cotisations lourdes. Attention : « assimilé salarié » n'ouvre pas automatiquement le chômage (la SASU non, le portage oui).`,
      ],
    },
    {
      heading: "Flat tax (PFU)",
      paragraphs: [
        `Le prélèvement forfaitaire unique sur les dividendes, retenu ici à 31,4 % (12,8 % d'impôt sur le revenu et 18,6 % de prélèvements sociaux). Il s'applique notamment aux dividendes de SASU, et à ceux d'EURL sous le seuil de 10 % du capital social.`,
      ],
    },
    {
      heading: "Impôt sur les sociétés (IS)",
      paragraphs: [
        `L'impôt sur le bénéfice des sociétés (EURL et SASU sur option) : 15 % jusqu'à 42 500 € de bénéfice, 25 % au-delà. Le bénéfice non versé en rémunération y est soumis, avant d'être éventuellement distribué en dividendes.`,
      ],
    },
    {
      heading: "Abattement forfaitaire",
      paragraphs: [
        `En micro-entreprise, un pourcentage du chiffre d'affaires (34 % en BNC, 50 % ou 71 % ailleurs) déduit d'office pour calculer l'impôt, censé représenter vos frais. Avantageux si vos frais réels sont plus faibles, pénalisant s'ils sont plus élevés — auquel cas l'EI au réel devient préférable.`,
      ],
    },
    {
      heading: "Plafond de la micro-entreprise",
      paragraphs: [
        `La limite de chiffre d'affaires pour rester en micro : 83 600 € en prestations de services, 203 100 € en vente de marchandises. Dépassée deux années de suite, elle fait basculer vers l'EI au réel ou une société.`,
      ],
    },
    {
      heading: "Franchise de TVA",
      paragraphs: [
        `Le régime qui dispense de facturer la TVA sous certains seuils (environ 37 500 € de CA en services). Distinct du plafond de la micro : on peut rester micro-entrepreneur tout en devant facturer la TVA après avoir dépassé le seuil de franchise.`,
      ],
    },
    {
      heading: "ARE (allocation de retour à l'emploi)",
      paragraphs: [
        `L'allocation chômage versée par France Travail. Aucun statut freelance n'en ouvre de nouveaux droits, sauf le portage salarial. Un reliquat d'ARE issu d'un CDI peut toutefois être maintenu et cumulé avec une activité freelance, ce qui sécurise un lancement.`,
      ],
    },
    {
      heading: "ACRE",
      paragraphs: [
        `L'aide aux créateurs et repreneurs d'entreprise : une exonération partielle de cotisations sociales sur la première année d'activité, sous conditions. En micro, elle prend la forme de taux de cotisations réduits ; ailleurs, d'une exonération sur les cotisations du dirigeant.`,
      ],
    },
    {
      heading: "Net après impôt",
      paragraphs: [
        `Le montant réellement disponible une fois payés les cotisations sociales, les frais professionnels et l'impôt sur le revenu (plus IS et flat tax le cas échéant). C'est le seul chiffre comparable d'un statut à l'autre — et la référence utilisée partout dans ce simulateur.`,
      ],
    },
  ],
  faq: [],
  related: ["methodologie", "simulateur-micro-entreprise", "tjm-en-salaire"],
};

export const INSTITUTIONNEL_PAGES: StatutPage[] = [
  METHODOLOGIE,
  A_PROPOS,
  GLOSSAIRE,
];
