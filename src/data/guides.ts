// Guides informationnels (prose) sous le préfixe d'URL « guides/… ».
//
// Ils utilisent le même gabarit que les pages statut (simulateur + éditorial),
// mais visent des requêtes informationnelles (« comment fixer son TJM »,
// « charges sociales freelance »…) et renvoient vers les simulateurs. Contenu
// unique et distinct (anti « doorway page »).

import { DEFAULT_PARAMS } from "../lib/params";
import type { StatutPage } from "../lib/pages";

const p = DEFAULT_PARAMS;
const fmt = (n: number): string => {
  const s = String(Math.round(n));
  return s.length > 3 ? `${s.slice(0, -3)} ${s.slice(-3)}` : s;
};
const PLAFOND = fmt(p.microPlafondService);

// -------------------------------------------------- FIXER SON TJM
const FIXER_TJM: StatutPage = {
  slug: "guides/comment-fixer-son-tjm",
  breadcrumb: "Comment fixer son TJM",
  metaTitle: "Comment fixer son TJM en freelance (2026) : la méthode chiffrée",
  metaDescription: `Comment calculer son TJM freelance en 2026 ? Partir du salaire cible, compter les jours réellement facturables, ajouter charges, frais et marge : la méthode pas à pas, avec les erreurs à éviter.`,
  h1: "Comment fixer son TJM en freelance : la méthode 2026",
  intro: `Le TJM (taux journalier moyen) est la décision la plus structurante d'un freelance : trop bas, vous travaillez à perte sans le voir ; trop haut, vous ne signez pas. La bonne méthode ne part pas du marché mais de vos chiffres — le salaire que vous voulez remplacer, les jours que vous pouvez réellement facturer, et tout ce que le TJM doit financer que le salariat prenait en charge.`,
  sections: [
    {
      heading: "Partir du net que vous visez, pas du marché",
      paragraphs: [
        `Commencez par le revenu net mensuel que vous voulez toucher après impôt. Multipliez-le par douze, puis remontez le fil à l'envers : ce net doit rester une fois payés les cotisations sociales de votre statut, l'impôt sur le revenu et vos frais professionnels. C'est exactement ce que fait le simulateur ci-dessus, qui vous donne le TJM correspondant statut par statut.`,
        `Le marché n'intervient qu'ensuite, comme garde-fou : si votre TJM calculé est très au-dessus des prix pratiqués dans votre spécialité, il faudra soit réduire votre train de vie cible, soit monter en compétence ou en positionnement. Mais partir du marché d'abord, c'est risquer de caler son tarif sous son seuil de rentabilité sans s'en apercevoir.`,
      ],
    },
    {
      heading: "Compter les jours réellement facturables",
      paragraphs: [
        `L'erreur la plus fréquente est de diviser son objectif annuel par 220 jours ouvrés. En réalité, un freelance facture rarement plus de 18 jours par mois sur 11 mois, soit environ 198 jours par an : le reste part en prospection, en administratif, en intermission entre deux missions, en formation et en congés — tout ce temps non facturé que le salaire couvrait implicitement.`,
        `Cette différence est énorme : passer de 220 à 198 jours facturés augmente mécaniquement le TJM nécessaire d'environ 10 %, et viser 15 jours par mois plutôt que 18 le renchérit encore de 20 %. Réglez le curseur « jours facturés » du simulateur sur une hypothèse prudente : mieux vaut un TJM un peu haut et des semaines pleines qu'un TJM juste et des trous non anticipés.`,
      ],
    },
    {
      heading: "Ajouter les charges, les frais et une vraie marge",
      paragraphs: [
        `Le TJM est un prix de vente hors taxes, pas un salaire journalier. Il doit financer les cotisations sociales (de 24,6 % du chiffre d'affaires en micro BNC à 75-80 % de charges sur le salaire en SASU), l'impôt, vos frais professionnels (matériel, logiciels, assurance, comptable) et une marge de sécurité pour les creux. Selon le statut, il ne reste au final qu'entre 40 et 60 % du TJM en net disponible.`,
        `Ajoutez enfin ce que le salariat vous offrait gratuitement et que vous devez désormais autofinancer : mutuelle, prévoyance, retraite complémentaire, jours de maladie. Un TJM correctement fixé intègre ces coûts invisibles — c'est la différence entre un tarif qui « paraît » élevé et un tarif qui vous laisse réellement mieux qu'un CDI.`,
      ],
    },
  ],
  faq: [
    {
      question: "Comment calculer son TJM freelance ?",
      answer: `Partez du net mensuel visé, annualisez-le, puis ajoutez les cotisations sociales de votre statut, l'impôt sur le revenu et vos frais professionnels pour obtenir le chiffre d'affaires nécessaire. Divisez ce chiffre d'affaires par les jours réellement facturables (environ 198 par an, soit 18 jours × 11 mois). Le simulateur fait ce calcul statut par statut à partir de votre objectif.`,
    },
    {
      question: "Combien de jours par an un freelance facture-t-il vraiment ?",
      answer: `Rarement plus de 198 jours (18 jours par mois sur 11 mois). Le reste part en prospection, administratif, intermission, formation et congés — non facturé. Calculer son TJM sur 220 jours ouvrés est l'erreur la plus courante : elle sous-estime le tarif nécessaire de 10 % ou plus.`,
    },
    {
      question: "Quelle marge ajouter à son TJM ?",
      answer: `Au-delà des cotisations, de l'impôt et des frais, prévoyez une marge pour les creux d'activité et pour autofinancer ce que le salariat offrait (mutuelle, prévoyance, retraite complémentaire, jours de maladie). Une marge de sécurité de 10 à 20 % au-dessus de votre seuil de rentabilité strict évite de travailler à perte pendant les intermissions.`,
    },
    {
      question: "Faut-il aligner son TJM sur le marché ?",
      answer: `Le marché est un garde-fou, pas un point de départ. Fixez d'abord votre TJM à partir de vos chiffres (net visé, jours facturables, charges), puis comparez-le aux prix de votre spécialité. S'il est très au-dessus, retravaillez votre positionnement ; s'il est en dessous du marché, vous laissez de l'argent sur la table.`,
    },
  ],
  hideFromFooter: true,
  related: ["tjm-en-salaire", "tjm-pour-4000-euros-net", "portage-salarial-ou-cdi"],
};

// -------------------------------------------------- CHARGES SOCIALES
const CHARGES_SOCIALES: StatutPage = {
  slug: "guides/charges-sociales-freelance",
  breadcrumb: "Charges sociales du freelance",
  metaTitle: "Charges sociales du freelance 2026 : combien selon le statut ?",
  metaDescription: `Combien de charges sociales paie un freelance en 2026 ? Micro (24,6 % du CA), TNS (~45 % du revenu), assimilé salarié (75-80 %) : ce que chaque statut prélève et ce qu'il couvre, expliqué simplement.`,
  h1: "Charges sociales du freelance : combien, selon le statut ?",
  intro: `« Combien de charges ? » est la première question de tout futur freelance — et la réponse dépend entièrement du statut. On ne compare pas les mêmes choses : la micro cotise en pourcentage du chiffre d'affaires, le TNS sur son revenu, l'assimilé salarié sur son salaire net. Voici comment lire ces taux sans se tromper, et ce qu'ils achètent vraiment.`,
  sections: [
    {
      heading: "Trois bases de calcul, trois niveaux de charges",
      paragraphs: [
        `En micro-entreprise, les cotisations sont un pourcentage du chiffre d'affaires encaissé : environ 24,6 % en prestations BNC, 21,2 % en prestations BIC, sans comptabilité. En entreprise individuelle au réel et en EURL, le dirigeant est travailleur non salarié (TNS) : ses cotisations tournent autour de 45 % de son revenu, calculées sur le bénéfice après l'abattement d'assiette de 26 % de la réforme 2026.`,
        `En SASU et en portage salarial, le dirigeant est assimilé salarié : il supporte cotisations patronales ET salariales du régime général, soit 75 à 80 % de charges rapportées au net versé. Attention à ne pas comparer ces pourcentages entre eux : 24,6 % du chiffre d'affaires et 75 % du net ne portent pas sur la même base. Le seul repère fiable est le net final, que le simulateur calcule pour chaque statut.`,
      ],
    },
    {
      heading: "Ce que ces cotisations vous achètent",
      paragraphs: [
        `Les charges les plus lourdes ne sont pas de l'argent perdu : elles financent de la protection. L'assimilé salarié (SASU, portage) valide une retraite de cadre, des indemnités journalières solides et une prévoyance ; le portage y ajoute l'assurance chômage. Le TNS (EI, EURL) cotise moins mais valide une retraite et une prévoyance plus modestes, sans chômage.`,
        `La micro est un cas particulier : ses cotisations légères ouvrent une protection réduite, surtout pour la retraite. C'est le prix de la simplicité. Beaucoup de micro-entrepreneurs complètent avec une prévoyance et une retraite facultatives — un coût à intégrer dans la comparaison, car il rapproche la micro des statuts plus chargés une fois la protection reconstituée.`,
      ],
    },
    {
      heading: "La réforme 2026 de l'assiette des indépendants",
      paragraphs: [
        `Depuis la réforme de l'assiette unique, les cotisations des TNS se calculent sur une assiette après un abattement de 26 %, censée mieux refléter le revenu réellement disponible. Concrètement, l'assiette sociale se rapproche du revenu net, ce qui modifie le rendement de l'EI et de l'EURL par rapport aux années précédentes — un point que le simulateur intègre déjà dans ses taux 2026.`,
        `Cette réforme ne change pas la hiérarchie des statuts (micro et TNS restent plus légers que l'assimilé salarié), mais elle rebat un peu les cartes à la marge. C'est une raison de plus de raisonner en net calculé plutôt qu'en taux affiché : un même « pourcentage de charges » ne produit pas le même net d'une année ou d'un statut à l'autre.`,
      ],
    },
  ],
  faq: [
    {
      question: "Combien de charges sociales paie un micro-entrepreneur en 2026 ?",
      answer: `Environ 24,6 % du chiffre d'affaires encaissé en prestations de services BNC, 21,2 % en prestations BIC, plus une petite contribution à la formation. Ces cotisations sont prélevées directement sur le chiffre d'affaires, sans comptabilité, mais ouvrent une protection sociale réduite — notamment pour la retraite.`,
    },
    {
      question: "Pourquoi la SASU a-t-elle des charges si élevées ?",
      answer: `Parce que le président est assimilé salarié : son salaire supporte les cotisations patronales et salariales du régime général, soit 75 à 80 % de charges rapportées au net. En contrepartie, il valide une retraite de cadre et une bonne couverture maladie. La SASU compense ce coût en permettant de se verser une partie du revenu en dividendes, non soumis à ces cotisations.`,
    },
    {
      question: "TNS ou assimilé salarié : quelle différence de charges ?",
      answer: `Le TNS (EI, EURL) cotise environ 45 % de son revenu pour une protection plus modeste ; l'assimilé salarié (SASU, portage) supporte 75 à 80 % de charges sur son salaire pour une protection complète du régime général. À revenu égal, le TNS laisse donc plus de net immédiat, l'assimilé salarié plus de droits.`,
    },
    {
      question: "Peut-on comparer les taux de charges entre statuts ?",
      answer: `Pas directement : ils ne portent pas sur la même base (chiffre d'affaires en micro, revenu en TNS, salaire net en assimilé salarié). Le seul repère fiable est le revenu net final après cotisations et impôt, à chiffre d'affaires égal. C'est précisément ce que le simulateur calcule et met côte à côte pour les six statuts.`,
    },
  ],
  hideFromFooter: true,
  related: ["simulateur-micro-entreprise", "simulateur-sasu", "sasu-ou-eurl"],
};

// -------------------------------------------------- FREELANCE ET CHÔMAGE
const CHOMAGE_ARE: StatutPage = {
  slug: "guides/freelance-et-chomage-are",
  breadcrumb: "Freelance et chômage (ARE)",
  metaTitle: "Freelance et chômage (ARE) en 2026 : quels droits selon le statut ?",
  metaDescription: `Un freelance a-t-il droit au chômage en 2026 ? Seul le portage salarial ouvre des droits ; micro, EI, EURL et SASU non. Maintien de l'ARE d'un CDI, cumul, ARCE : le guide complet.`,
  h1: "Freelance et chômage (ARE) : quels droits en 2026 ?",
  intro: `« Est-ce que je garde le chômage ? » est la peur numéro un au moment de quitter un CDI. La réponse tient en deux temps : quels statuts génèrent de nouveaux droits (un seul, le portage), et comment conserver ou cumuler l'ARE issue d'un CDI rompu avec une activité freelance. Bien compris, ce mécanisme sécurise énormément un lancement.`,
  sections: [
    {
      heading: "Un seul statut freelance ouvre des droits : le portage",
      paragraphs: [
        `Parmi les statuts d'indépendant, seul le portage salarial cotise à l'assurance chômage : le salarié porté ouvre des droits à l'ARE en fin de mission, exactement comme un salarié classique. La micro-entreprise, l'EI, l'EURL et la SASU n'ouvrent aucun droit au chômage au titre de l'activité — leurs dirigeants ne cotisent pas à France Travail.`,
        `C'est l'argument décisif du portage pour qui veut continuer à se constituer un filet : chaque mission portée génère de nouveaux droits, et vous restez « bankable » avec des bulletins de paie. Les autres statuts optimisent le net, mais laissent la gestion du risque entièrement à votre charge.`,
      ],
    },
    {
      heading: "Maintenir l'ARE d'un CDI pendant le lancement",
      paragraphs: [
        `Si vous quittez un CDI avec des droits ouverts (rupture conventionnelle, licenciement), vous pouvez conserver cette ARE tout en démarrant une activité freelance — le montant est simplement ajusté selon vos revenus. En SASU, le montage le plus favorable consiste à ne pas se verser de salaire : l'ARE est alors maintenue à 100 % et l'on se rémunère en dividendes une fois les résultats là.`,
        `En micro-entreprise ou en EI, l'ARE est réduite chaque mois en fonction du chiffre d'affaires ou du bénéfice dégagé, mais le cumul reste possible et adoucit la transition. C'est pourquoi beaucoup de freelances lancent leur activité juste après une rupture conventionnelle : le reliquat d'ARE sert de trésorerie de démarrage.`,
      ],
    },
    {
      heading: "ARCE : toucher son chômage en capital",
      paragraphs: [
        `France Travail propose une alternative au maintien mensuel : l'ARCE, qui verse une partie de vos droits en deux fois sous forme de capital pour financer la création ou la reprise d'entreprise. C'est intéressant si vous avez besoin d'un apport initial, mais vous renoncez au maintien mensuel de l'ARE — un arbitrage à faire selon votre besoin de trésorerie et la maturité de votre projet.`,
        `Dans tous les cas, ces dispositifs ne créent pas de droits nouveaux : ils consomment un reliquat existant. Une fois épuisé, seul le portage salarial permet d'en reconstituer. Anticiper ce point évite la mauvaise surprise du freelance qui, deux ans après avoir quitté son CDI, découvre qu'il n'a plus aucun filet.`,
      ],
    },
  ],
  faq: [
    {
      question: "Un auto-entrepreneur a-t-il droit au chômage ?",
      answer: `Non : la micro-entreprise ne cotise pas à l'assurance chômage et n'ouvre aucun droit à l'ARE au titre de l'activité. En revanche, un reliquat de droits acquis avant (via un CDI rompu) peut être maintenu partiellement et cumulé avec les revenus de micro-entrepreneur. Seul le portage salarial ouvre de nouveaux droits parmi les statuts freelance.`,
    },
    {
      question: "Peut-on cumuler l'ARE et une activité freelance ?",
      answer: `Oui. Avec un reliquat d'ARE issu d'un CDI, le cumul est possible dans tous les statuts, avec un ajustement du montant selon vos revenus. En SASU sans salaire, l'ARE est maintenue à 100 % (revenus en dividendes) ; en micro ou EI, elle est réduite selon le chiffre d'affaires ou le bénéfice. Le cumul adoucit fortement un lancement.`,
    },
    {
      question: "Le portage salarial ouvre-t-il vraiment droit au chômage ?",
      answer: `Oui : le salarié porté cotise à l'assurance chômage comme tout salarié et peut ouvrir des droits à l'ARE en fin de mission. C'est le seul statut freelance dans ce cas. C'est ce qui en fait le meilleur « sas » pour tester l'indépendance sans brûler son filet de sécurité.`,
    },
    {
      question: "Qu'est-ce que l'ARCE ?",
      answer: `L'ARCE (aide à la reprise ou à la création d'entreprise) permet de percevoir une partie de ses droits au chômage en capital, en deux versements, plutôt qu'en allocation mensuelle. Elle finance le démarrage mais fait renoncer au maintien mensuel de l'ARE. C'est un arbitrage entre trésorerie immédiate et filet mensuel, selon la maturité du projet.`,
    },
  ],
  hideFromFooter: true,
  related: ["simulateur-portage-salarial", "simulateur-sasu", "portage-salarial-ou-cdi"],
};

// -------------------------------------------------- ACRE
const ACRE: StatutPage = {
  slug: "guides/acre-premiere-annee",
  breadcrumb: "ACRE : première année",
  metaTitle: "ACRE 2026 : exonération de cotisations la première année, mode d'emploi",
  metaDescription: `L'ACRE en 2026 : qui y a droit, quelle exonération de cotisations sociales la première année, comment ça marche en micro-entreprise et en société. Le guide clair pour ne pas payer trop au démarrage.`,
  h1: "ACRE : l'exonération de cotisations de la première année",
  intro: `L'ACRE (aide aux créateurs et repreneurs d'entreprise) allège les cotisations sociales de votre première année d'activité. Mal connue ou oubliée, elle représente pourtant plusieurs milliers d'euros au démarrage — le moment où la trésorerie est la plus fragile. Voici qui y a droit, ce qu'elle exonère et comment elle s'applique selon le statut.`,
  sections: [
    {
      heading: "Ce que l'ACRE exonère, et pour combien de temps",
      paragraphs: [
        `L'ACRE consiste en une exonération partielle des cotisations sociales sur la première période d'activité — de l'ordre de douze mois. Elle ne supprime pas toutes les charges, mais en efface une bonne partie tant que votre revenu reste sous certains plafonds. Sur un lancement, cela améliore nettement le net conservé au moment où chaque euro compte.`,
        `L'exonération est dégressive selon le revenu : pleine sous un premier seuil, réduite ensuite, puis nulle au-delà d'un plafond. Concrètement, plus votre première année démarre fort, moins l'avantage est important — mais il reste presque toujours bon à prendre pour les premiers mois, souvent plus modestes.`,
      ],
    },
    {
      heading: "Comment ça marche selon le statut",
      paragraphs: [
        `En micro-entreprise, l'ACRE se traduit par des taux de cotisations réduits pendant la première année : au lieu des 24,6 % habituels en BNC, vous payez un pourcentage abaissé sur votre chiffre d'affaires. En société (EURL, SASU) ou en EI, l'exonération porte sur les cotisations calculées sur le revenu ou le salaire du dirigeant, dans les mêmes limites de plafond.`,
        `L'ACRE est en principe attribuée automatiquement à la création pour les micro-entrepreneurs éligibles, mais mieux vaut le vérifier : un oubli de l'administration ou une condition non remplie peut vous faire payer le plein tarif dès le départ. Gardez la trace de votre demande et contrôlez vos premiers appels de cotisations.`,
      ],
    },
    {
      heading: "Qui peut en bénéficier",
      paragraphs: [
        `L'ACRE vise les créateurs et repreneurs d'entreprise sous conditions : notamment ne pas en avoir bénéficié dans les trois années précédentes, et remplir certains critères tenant à votre situation (demandeur d'emploi, jeune, bénéficiaire de minima sociaux, ou création classique selon les règles en vigueur). Les conditions évoluent régulièrement : vérifiez votre éligibilité au moment de la création.`,
        `Cumulée avec le maintien de l'ARE ou l'ARCE de France Travail, l'ACRE forme un package de démarrage puissant : charges allégées d'un côté, filet chômage de l'autre. C'est souvent ce qui rend viable une première année à chiffre d'affaires modeste — d'où l'intérêt de bien articuler les deux dispositifs dès le lancement.`,
      ],
    },
  ],
  faq: [
    {
      question: "Qu'est-ce que l'ACRE pour un freelance ?",
      answer: `C'est une exonération partielle de cotisations sociales sur la première année d'activité, destinée aux créateurs et repreneurs d'entreprise. En micro-entreprise, elle prend la forme de taux de cotisations réduits sur le chiffre d'affaires ; en société ou en EI, d'une exonération sur les cotisations du dirigeant, dans la limite de plafonds de revenu.`,
    },
    {
      question: "L'ACRE est-elle automatique en micro-entreprise ?",
      answer: `Pour les micro-entrepreneurs éligibles, l'ACRE est en principe attribuée automatiquement à la création, mais il faut le vérifier : contrôlez vos premiers appels de cotisations pour vous assurer que les taux réduits sont bien appliqués. Une condition non remplie ou une erreur peut vous faire payer le plein tarif.`,
    },
    {
      question: "Combien de temps dure l'ACRE ?",
      answer: `L'exonération porte sur la première période d'activité, de l'ordre de douze mois, avec un montant dégressif selon le revenu : pleine sous un premier seuil, réduite au-delà, puis nulle au-dessus d'un plafond. Les modalités exactes évoluent : vérifiez les règles en vigueur au moment de votre création.`,
    },
    {
      question: "Peut-on cumuler l'ACRE et le chômage ?",
      answer: `Oui : l'ACRE (allègement de cotisations) se cumule avec le maintien de l'ARE ou l'ARCE de France Travail (droits au chômage). C'est un package de démarrage courant : charges réduites la première année et filet chômage, qui rend viable un lancement à chiffre d'affaires modeste.`,
    },
  ],
  hideFromFooter: true,
  related: ["simulateur-micro-entreprise", "guides/charges-sociales-freelance", "guides/freelance-et-chomage-are"],
};

// -------------------------------------------------- FRANCHISE TVA
const FRANCHISE_TVA: StatutPage = {
  slug: "guides/franchise-tva-freelance",
  breadcrumb: "Franchise de TVA",
  metaTitle: "Franchise de TVA du freelance 2026 : seuils et conséquences",
  metaDescription: `La franchise en base de TVA en 2026 : seuils (37 500 € en services), ce que ça change pour vos factures et vos clients, quand la TVA devient obligatoire. Le guide clair pour freelances.`,
  h1: "Franchise de TVA : seuils et conséquences pour le freelance",
  intro: `Tant que votre chiffre d'affaires reste sous certains seuils, vous facturez sans TVA : c'est la franchise en base. Passé ces seuils, vous devez la collecter — un changement qui touche vos factures, votre trésorerie et surtout vos clients. Comprendre ce mécanisme évite deux erreurs symétriques : facturer de la TVA à tort, ou dépasser le seuil sans s'en rendre compte.`,
  sections: [
    {
      heading: "Les seuils de la franchise en base",
      paragraphs: [
        `En prestations de services, la franchise de TVA s'applique sous environ 37 500 € de chiffre d'affaires, avec un seuil de tolérance légèrement supérieur ; en vente de marchandises, les seuils sont bien plus hauts (autour de 85 000 €). Sous ces montants, vous ne facturez pas de TVA, vous n'en récupérez pas non plus, et vos déclarations sont simplifiées.`,
        `Attention à ne pas confondre ce seuil de TVA avec le plafond de la micro-entreprise (${PLAFOND} € en services) : ce sont deux limites distinctes. On peut rester en micro tout en dépassant le seuil de franchise de TVA — dans ce cas, on garde le régime micro mais on doit facturer la TVA.`,
      ],
    },
    {
      heading: "Ce que change le passage à la TVA",
      paragraphs: [
        `Une fois assujetti, vous ajoutez la TVA (20 % dans le cas général) sur vos factures, la collectez pour le compte de l'État et la reversez, en déduisant la TVA que vous payez sur vos propres achats professionnels. Cela implique des déclarations régulières et une gestion de trésorerie plus fine, car la TVA collectée n'est pas votre argent.`,
        `L'impact réel dépend de vos clients. Si vous facturez des entreprises, elles récupèrent la TVA : facturer avec ou sans ne change presque rien pour elles, et vous, vous pouvez enfin déduire la TVA sur vos achats. Si vous facturez des particuliers, qui ne récupèrent rien, passer à la TVA renchérit votre prix de 20 % — un vrai sujet de compétitivité.`,
      ],
    },
    {
      heading: "Faut-il rester sous le seuil ou l'assumer ?",
      paragraphs: [
        `Pour un freelance qui travaille surtout avec des entreprises, dépasser le seuil de TVA est neutre, voire avantageux (récupération de la TVA sur les achats). Il n'y a aucune raison de brider son chiffre d'affaires pour rester en franchise. Certains optent même volontairement pour la TVA dès le départ afin de déduire leurs investissements.`,
        `Pour un freelance qui vend à des particuliers, en revanche, franchir le seuil signifie soit augmenter ses prix de 20 %, soit rogner sa marge. Là, surveiller son chiffre d'affaires ou ajuster son activité a du sens. Dans tous les cas, anticipez le franchissement : le régler après coup, avec des factures déjà émises sans TVA, est source de complications.`,
      ],
    },
  ],
  faq: [
    {
      question: "Quel est le seuil de franchise de TVA en 2026 ?",
      answer: `Environ 37 500 € de chiffre d'affaires en prestations de services (avec un seuil de tolérance un peu supérieur) et environ 85 000 € en vente de marchandises. Sous ces montants, vous facturez sans TVA (franchise en base). Ce seuil est distinct du plafond de la micro-entreprise (${PLAFOND} € en services).`,
    },
    {
      question: "Dépasser le seuil de TVA fait-il sortir de la micro-entreprise ?",
      answer: `Non : le seuil de franchise de TVA et le plafond de la micro sont deux limites différentes. Vous pouvez rester micro-entrepreneur tout en dépassant le seuil de TVA — vous conservez le régime micro, mais vous devez alors facturer et reverser la TVA. Vous ne quittez la micro qu'en dépassant son plafond de chiffre d'affaires.`,
    },
    {
      question: "La TVA change-t-elle mon revenu net ?",
      answer: `Si vos clients sont des entreprises qui récupèrent la TVA, presque pas : vous la collectez et la reversez, mais vous pouvez déduire la TVA sur vos achats professionnels, ce qui joue en votre faveur. Si vos clients sont des particuliers, passer à la TVA renchérit votre prix de 20 % ou réduit votre marge, selon que vous répercutez ou non.`,
    },
    {
      question: "Peut-on facturer la TVA volontairement sous le seuil ?",
      answer: `Oui, on peut renoncer à la franchise et opter pour la TVA même sous les seuils. C'est intéressant si vous réalisez des achats professionnels importants dont vous voulez récupérer la TVA, et si vos clients sont des entreprises. Pour une clientèle de particuliers, mieux vaut généralement rester en franchise tant que possible.`,
    },
  ],
  hideFromFooter: true,
  related: ["simulateur-micro-entreprise", "simulateur-ei", "micro-entreprise-ou-ei"],
};

// -------------------------------------------------- SALARIÉ → FREELANCE
const SALARIE_FREELANCE: StatutPage = {
  slug: "guides/passer-de-salarie-a-freelance",
  breadcrumb: "De salarié à freelance",
  metaTitle: "Passer de salarié à freelance en 2026 : les étapes et les pièges",
  metaDescription: `Comment passer de salarié à freelance en 2026 ? Rupture conventionnelle et chômage, choix du statut, TJM, trésorerie : les étapes pour sécuriser sa transition sans y laisser de plumes.`,
  h1: "Passer de salarié à freelance : les étapes clés en 2026",
  intro: `Quitter la sécurité d'un CDI pour l'indépendance est autant un projet financier qu'un saut personnel. Bien préparé, il se fait sans casse : en s'appuyant sur le chômage comme filet, en choisissant le bon statut et en fixant un TJM qui remplace vraiment le salaire. Voici l'ordre dans lequel dérouler la transition pour ne rien laisser au hasard.`,
  sections: [
    {
      heading: "Sécuriser la sortie : rupture conventionnelle et chômage",
      paragraphs: [
        `La meilleure porte de sortie est souvent la rupture conventionnelle : elle ouvre des droits à l'ARE, contrairement à une démission classique. Ce reliquat de chômage devient votre filet de lancement — vous pouvez le maintenir en cumul avec vos premiers revenus, ou le percevoir en capital via l'ARCE pour financer le démarrage.`,
        `Ne quittez pas votre poste avant d'avoir clarifié ce point : selon que vous partez en rupture conventionnelle, en fin de CDD ou en démission, vos droits diffèrent radicalement. Un lancement adossé à l'ARE est infiniment plus confortable qu'un départ sans filet — cela peut valoir la peine d'attendre le bon moment.`,
      ],
    },
    {
      heading: "Choisir le statut et fixer le TJM",
      paragraphs: [
        `Le choix du statut découle de votre profil : micro-entreprise pour tester simplement avec peu de frais, EI au réel si vos frais sont élevés, SASU pour cumuler l'ARE et optimiser via les dividendes, portage salarial pour garder le confort du salariat et le chômage. Le simulateur compare les six statuts sur vos chiffres — c'est le point de départ le plus objectif.`,
        `En parallèle, fixez votre TJM à partir du net que vous voulez remplacer, pas du marché : le tableau des seuils vous donne, pour votre ancien salaire, le TJM minimal par statut. Ajoutez une marge pour les intermissions et pour autofinancer mutuelle, prévoyance et retraite que l'employeur payait. Un TJM juste au-dessus du seuil laisse peu de coussin.`,
      ],
    },
    {
      heading: "Constituer sa trésorerie et ses premiers clients",
      paragraphs: [
        `Avant de vous lancer, visez trois à six mois de charges d'avance : les premiers paiements clients tardent souvent, et les délais de règlement en freelance sont réels. Idéalement, sécurisez une première mission ou un premier client avant de démissionner — beaucoup commencent en parallèle de leur emploi, dans le respect de leur contrat, pour valider la demande.`,
        `Enfin, anticipez les coûts invisibles du salariat que vous reprenez à votre charge : mutuelle, prévoyance, retraite complémentaire, matériel, comptable, assurance professionnelle. Les intégrer dès le business plan évite la désillusion du freelance qui, un an après, réalise que son « meilleur salaire » ne couvrait pas ce que le CDI offrait gratuitement.`,
      ],
    },
  ],
  faq: [
    {
      question: "Faut-il démissionner pour devenir freelance ?",
      answer: `Mieux vaut éviter la démission simple, qui n'ouvre pas de droits au chômage. La rupture conventionnelle est la voie privilégiée : elle donne accès à l'ARE, qui sert de filet de lancement (en cumul avec les premiers revenus, ou en capital via l'ARCE). Clarifiez vos droits avant de quitter votre poste.`,
    },
    {
      question: "Quel statut choisir pour se lancer en freelance ?",
      answer: `Cela dépend de votre profil : micro-entreprise pour tester simplement avec peu de frais, EI au réel si vos frais sont élevés, SASU pour cumuler l'ARE et optimiser via les dividendes, portage salarial pour garder chômage et bulletins de paie. Le simulateur compare les six statuts sur votre TJM et votre situation.`,
    },
    {
      question: "Combien de trésorerie prévoir avant de se lancer ?",
      answer: `Visez trois à six mois de charges d'avance : les premiers paiements clients tardent et les délais de règlement sont réels en freelance. Sécuriser une première mission avant de démissionner, ou démarrer en parallèle de son emploi (dans le respect de son contrat), réduit fortement le risque de la transition.`,
    },
    {
      question: "Quel TJM viser en quittant son CDI ?",
      answer: `Partez du net mensuel de votre salaire actuel et cherchez, dans le tableau des seuils, le TJM qui le reproduit dans le statut visé. Ajoutez une marge pour les intermissions et pour autofinancer mutuelle, prévoyance et retraite. Un TJM juste au niveau du seuil ne laisse aucun coussin : mieux vaut viser au-dessus.`,
    },
  ],
  hideFromFooter: true,
  related: ["tjm-en-salaire", "portage-salarial-ou-cdi", "micro-entreprise-ou-cdi"],
};

export const GUIDE_PAGES: StatutPage[] = [
  FIXER_TJM,
  CHARGES_SOCIALES,
  CHOMAGE_ARE,
  ACRE,
  FRANCHISE_TVA,
  SALARIE_FREELANCE,
];
