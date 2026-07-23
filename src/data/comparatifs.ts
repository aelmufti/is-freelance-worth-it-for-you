// Comparatifs statut-vs-statut (une paire = une page). Complètent les quatre
// comparatifs déjà présents dans src/lib/pages.ts.
//
// Chaque page a son angle propre et un contenu éditorial distinct
// (anti « doorway page »). Les chiffres cités sont CALCULÉS par le moteur sur
// le scénario de référence (18 j × 11 mois, 3 000 € de frais pro, célibataire,
// CDI 55 000 € brut) : impossible qu'ils divergent du simulateur.

import { DEFAULT_INPUT, DEFAULT_PARAMS } from "../lib/params";
import {
  calcCdi,
  calcEi,
  calcEurl,
  calcMicro,
  calcPortage,
  calcSasu,
  tjmEquivalentCdi,
} from "../lib/engine";
import type { StatutPage } from "../lib/pages";
import type { FiscalParams, SimulationInput } from "../lib/params";

const p = DEFAULT_PARAMS;
const ref = DEFAULT_INPUT;

const fmt = (n: number): string => {
  const s = String(Math.round(n));
  return s.length > 3 ? `${s.slice(0, -3)} ${s.slice(-3)}` : s;
};
const round5 = (n: number | null): number =>
  n === null ? NaN : Math.round(n / 5) * 5;
const netAt = (
  tjm: number,
  calc: (i: SimulationInput, p: FiscalParams) => { netMensuel: number },
): number => calc({ ...ref, tjm }, p).netMensuel;

// Nets mensuels de référence (après cotisations ET impôt)
const NET_CDI = calcCdi(ref, p).netMensuel;
const BRUT_K = Math.round(ref.cdiBrutAnnuel / 1000);

// TJM 400 € — niveau où la micro-entreprise est encore accessible
const MICRO_400 = netAt(400, calcMicro);
const EI_400 = netAt(400, calcEi);
const EURL_400 = netAt(400, calcEurl);

// TJM 550 € (scénario par défaut) — micro déjà hors plafond
const EI_550 = netAt(550, calcEi);
const EURL_550 = netAt(550, calcEurl);
const SASU_550 = netAt(550, calcSasu);
const PORTAGE_550 = netAt(550, calcPortage);

// Seuils de TJM pour égaler le CDI de référence (55 000 € brut)
const T_MICRO = round5(tjmEquivalentCdi(ref, p, calcMicro));
const T_EI = round5(tjmEquivalentCdi(ref, p, calcEi));
const T_EURL = round5(tjmEquivalentCdi(ref, p, calcEurl));
const T_SASU = round5(tjmEquivalentCdi(ref, p, calcSasu));

// -------------------------------------------------- MICRO OU EURL
const MICRO_OU_EURL: StatutPage = {
  slug: "micro-entreprise-ou-eurl",
  statuts: ["micro", "eurl"],
  breadcrumb: "Micro-entreprise ou EURL",
  metaTitle: "Micro-entreprise ou EURL en 2026 : quel statut choisir ?",
  metaDescription: `Micro-entreprise ou EURL en 2026 ? Cotisations en % du CA contre société à l'IS, plafond de 83 600 €, frais déductibles et dividendes : le comparatif chiffré pour choisir, validé URSSAF.`,
  h1: "Micro-entreprise ou EURL : le comparatif chiffré 2026",
  intro: `La micro et l'EURL sont deux façons opposées d'exercer seul : d'un côté la simplicité maximale et un plafond, de l'autre une vraie société à l'impôt sur les sociétés, sans limite de chiffre d'affaires. Pour égaler un CDI à ${fmt(ref.cdiBrutAnnuel)} € brut, il faut environ ${fmt(T_MICRO)} €/jour en micro contre ${fmt(T_EURL)} € en EURL. Voici quand chacune l'emporte.`,
  sections: [
    {
      heading: "Deux logiques : forfait contre frais réels",
      paragraphs: [
        `En micro-entreprise, tout est forfaitaire : les cotisations sont un pourcentage du chiffre d'affaires encaissé (environ 24,6 % en BNC) et l'impôt se calcule après un abattement de 34 % censé couvrir vos frais. Rien de tout cela ne demande de comptabilité. En EURL, on inverse la logique : vous tenez des comptes, déduisez vos frais réels à l'euro près, et payez l'impôt sur les sociétés sur le bénéfice restant.`,
        `Conséquence directe : tant que vos frais professionnels sont faibles, la micro convertit mieux chaque euro facturé. À 400 €/jour, elle laisse environ ${fmt(MICRO_400)} €/mois net contre ${fmt(EURL_400)} € en EURL sur le même scénario. L'EURL ne reprend l'avantage que lorsque les frais réels dépassent l'abattement forfaitaire, ou quand le chiffre d'affaires franchit le plafond de la micro.`,
      ],
    },
    {
      heading: "Le plafond, la responsabilité et les dividendes",
      paragraphs: [
        `La micro s'arrête à ${fmt(p.microPlafondService)} € de chiffre d'affaires en prestations de services. L'EURL n'a aucun plafond : c'est la suite naturelle quand l'activité grossit. Elle apporte aussi la responsabilité limitée (votre patrimoine personnel est protégé par la société) et la possibilité de se verser des dividendes après impôt sur les sociétés.`,
        `Attention toutefois à la règle propre à l'EURL : seule la fraction de dividendes inférieure à 10 % du capital social profite de la flat tax de 31,4 %. Au-delà, ils supportent les cotisations sociales TNS, comme une rémunération. La stratégie « petit salaire, gros dividendes » y est donc bien moins efficace qu'en SASU — un point décisif si votre choix se joue sur l'optimisation.`,
      ],
    },
    {
      heading: "Comment trancher",
      paragraphs: [
        `Restez en micro tant que trois conditions tiennent : votre chiffre d'affaires est sous le plafond, vos frais réels sont inférieurs à l'abattement de 34 %, et vous n'avez pas besoin de piloter finement rémunération et dividendes. C'est le cas de la plupart des prestataires intellectuels qui démarrent : développeur, consultant, rédacteur avec un simple ordinateur.`,
        `Passez à l'EURL dès que l'une de ces conditions saute : plafond approché, frais réels lourds (local, matériel, sous-traitance), ou volonté de capitaliser dans une société. Le simulateur ci-dessus place les deux statuts côte à côte sur votre TJM réel — c'est le point de départ le plus fiable avant de créer quoi que ce soit.`,
      ],
    },
  ],
  faq: [
    {
      question: "Micro-entreprise ou EURL : laquelle laisse le plus de net ?",
      answer: `Sous le plafond de la micro (${fmt(p.microPlafondService)} € de CA en services) et avec peu de frais, la micro laisse davantage : à 400 €/jour, environ ${fmt(MICRO_400)} €/mois net contre ${fmt(EURL_400)} € en EURL. L'EURL reprend l'avantage quand vos frais réels dépassent l'abattement forfaitaire de 34 % ou quand le chiffre d'affaires dépasse le plafond. Le simulateur compare les deux sur votre situation exacte.`,
    },
    {
      question: "Quand passer de la micro-entreprise à l'EURL ?",
      answer: `Trois déclencheurs : le chiffre d'affaires approche du plafond de ${fmt(p.microPlafondService)} €, vos frais professionnels réels dépassent l'abattement de 34 % (l'EURL les déduit pour de vrai), ou vous voulez la responsabilité limitée et la possibilité de capitaliser des bénéfices dans une société. Tant qu'aucun ne s'applique, la simplicité et le zéro comptabilité de la micro l'emportent presque toujours.`,
    },
    {
      question: "L'EURL permet-elle de payer moins de charges que la micro ?",
      answer: `Pas mécaniquement. En micro, les cotisations sont plafonnées à un pourcentage du chiffre d'affaires ; en EURL à l'IS, elles portent sur la rémunération TNS (environ 45 %) mais la déduction des frais réels et l'arbitrage avec les dividendes peuvent réduire l'assiette. L'EURL gagne surtout quand les frais sont élevés ; à frais faibles, la micro reste plus légère et plus simple.`,
    },
    {
      question: "Peut-on avoir une micro-entreprise et une EURL en même temps ?",
      answer: `Oui, ce sont deux structures juridiques distinctes et rien n'interdit de cumuler une activité en micro et une EURL, à condition qu'elles ne servent pas à contourner artificiellement le plafond de la micro pour une même activité. En pratique, la transition se fait plutôt en série : on teste en micro, puis on bascule en EURL quand les chiffres l'imposent, en radiant la micro.`,
    },
  ],
  related: ["simulateur-micro-entreprise", "simulateur-eurl", "micro-entreprise-ou-sasu"],
};

// -------------------------------------------------- MICRO OU EI
const MICRO_OU_EI: StatutPage = {
  slug: "micro-entreprise-ou-ei",
  statuts: ["micro", "ei"],
  breadcrumb: "Micro-entreprise ou EI au réel",
  metaTitle: "Micro-entreprise ou EI au réel 2026 : abattement ou frais réels ?",
  metaDescription: `Micro-entreprise ou EI au réel en 2026 ? Abattement forfaitaire de 34 % contre déduction des frais réels, plafond de 83 600 €, même régime TNS : le comparatif chiffré pour choisir, validé URSSAF.`,
  h1: "Micro-entreprise ou EI au réel : abattement ou frais réels ?",
  intro: `C'est le même métier, en nom propre, sous le même régime social TNS — mais deux façons de calculer l'impôt. La micro applique un abattement forfaitaire de 34 % ; l'EI au réel déduit vos frais réels. Tout le choix tient dans une comparaison : vos dépenses réelles sont-elles plus hautes ou plus basses que l'abattement ? Ce comparatif chiffre les deux sur vos paramètres.`,
  sections: [
    {
      heading: "La seule vraie question : vos frais contre l'abattement de 34 %",
      paragraphs: [
        `En micro, l'administration considère forfaitairement que 34 % de votre chiffre d'affaires (en BNC) couvre vos frais, quel que soit leur montant réel. En EI au réel, vous déduisez vos dépenses effectives : loyer, matériel, déplacements, logiciels, sous-traitance. La règle de décision est arithmétique : si vos frais réels sont inférieurs à 34 % du CA, la micro rend plus ; s'ils sont supérieurs, l'EI au réel prend l'avantage.`,
        `Sur le scénario de référence avec ${fmt(ref.fraisPro)} € de frais par an, à 400 €/jour, la micro laisse environ ${fmt(MICRO_400)} €/mois net contre ${fmt(EI_400)} € en EI au réel. Tant que vos frais restent modestes, l'abattement forfaitaire joue en votre faveur ; c'est l'atout de la micro pour les prestataires intellectuels peu équipés.`,
      ],
    },
    {
      heading: "Le plafond et la paperasse font le reste",
      paragraphs: [
        `Au-delà de l'impôt, deux différences comptent. La micro plafonne à ${fmt(p.microPlafondService)} € de chiffre d'affaires en prestations ; l'EI au réel n'a aucune limite, ce qui en fait la suite logique quand l'activité grossit. Et la micro ne demande aucune comptabilité — un simple relevé de recettes — quand l'EI impose un vrai bilan, souvent avec un expert-comptable (comptez quelques centaines à un millier d'euros par an).`,
        `Les deux statuts partagent en revanche l'essentiel : vous restez en nom propre, travailleur non salarié, sans assurance chômage, avec depuis 2022 la protection par défaut de votre patrimoine personnel. Passer de la micro à l'EI ne change donc ni votre régime social, ni votre responsabilité — seulement la façon de calculer le bénéfice imposable.`,
      ],
    },
    {
      heading: "Le bon réflexe : simuler avant de renoncer à l'abattement",
      paragraphs: [
        `L'erreur classique est de basculer au réel « parce que ça fait sérieux » alors que l'abattement forfaitaire est plus avantageux. Faites le calcul inverse : additionnez vos frais professionnels réels d'une année et comparez-les à 34 % de votre chiffre d'affaires. Si l'abattement est plus généreux, la micro vous fait gagner de l'argent ET du temps.`,
        `À l'inverse, si vous engagez du matériel coûteux, un local ou de la sous-traitance régulière, l'EI au réel déduit tout cela et fait fondre votre base imposable. Le simulateur ci-dessus vous permet de faire varier vos frais pour voir précisément le point de bascule entre les deux régimes.`,
      ],
    },
  ],
  faq: [
    {
      question: "Micro-entreprise ou EI au réel : comment savoir laquelle choisir ?",
      answer: `Comparez vos frais professionnels réels à l'abattement forfaitaire de la micro (34 % du CA en BNC). En dessous, la micro rend plus, sans comptabilité : à 400 €/jour et ${fmt(ref.fraisPro)} € de frais, environ ${fmt(MICRO_400)} €/mois net contre ${fmt(EI_400)} € au réel. Au-dessus, l'EI au réel déduit vos charges pour de vrai et devient plus avantageuse, sans plafond de chiffre d'affaires.`,
    },
    {
      question: "L'EI au réel a-t-elle un plafond de chiffre d'affaires ?",
      answer: `Non. Contrairement à la micro (${fmt(p.microPlafondService)} € en prestations de services), l'EI au réel n'a aucun plafond. C'est souvent la raison du passage : quand le chiffre d'affaires dépasse le plafond de la micro deux années de suite, on bascule automatiquement au réel, en restant en nom propre sans créer de société.`,
    },
    {
      question: "Change-t-on de régime social en passant de la micro à l'EI au réel ?",
      answer: `Non. Dans les deux cas, vous êtes travailleur non salarié (TNS), affilié à la Sécurité sociale des indépendants, sans assurance chômage. Seul le calcul du bénéfice imposable et des cotisations change : forfaitaire en micro, sur le bénéfice réel à l'EI. Votre couverture maladie et retraite reste de même nature.`,
    },
    {
      question: "Faut-il un comptable pour une EI au réel ?",
      answer: `Ce n'est pas obligatoire, mais fortement recommandé : l'EI au réel impose une comptabilité d'engagement, un bilan et une liasse fiscale. Comptez quelques centaines à un millier d'euros par an. C'est précisément ce coût — et le temps qu'il économise — qu'il faut mettre en balance avec le gain fiscal de la déduction des frais réels par rapport à la micro.`,
    },
  ],
  related: ["simulateur-micro-entreprise", "simulateur-ei", "micro-entreprise-ou-eurl"],
};

// -------------------------------------------------- EI OU EURL
const EI_OU_EURL: StatutPage = {
  slug: "ei-ou-eurl",
  statuts: ["ei", "eurl"],
  breadcrumb: "EI au réel ou EURL",
  metaTitle: "EI au réel ou EURL en 2026 : nom propre ou société ?",
  metaDescription: `EI au réel ou EURL en 2026 ? Nom propre à l'IR contre société à l'IS, responsabilité, dividendes et règle des 10 % du capital : le comparatif chiffré pour choisir, validé URSSAF.`,
  h1: "EI au réel ou EURL : nom propre ou société en 2026 ?",
  intro: `Les deux sont des statuts d'indépendant au régime TNS, aux cotisations proches. La vraie différence est structurelle : l'EI reste une personne physique imposée à l'impôt sur le revenu, l'EURL est une société qui peut opter pour l'impôt sur les sociétés et distribuer des dividendes. Sur le scénario de référence (550 €/jour), l'EI laisse ${fmt(EI_550)} €/mois net contre ${fmt(EURL_550)} € en EURL — mais le match se joue ailleurs.`,
  sections: [
    {
      heading: "Même régime social, deux enveloppes fiscales",
      paragraphs: [
        `À l'EI comme à l'EURL, le dirigeant est travailleur non salarié : les cotisations sociales, autour de 45 % du revenu après l'abattement d'assiette de 26 % de la réforme 2026, sont du même ordre. La bascule se fait sur l'impôt. L'EI est par défaut à l'impôt sur le revenu : tout le bénéfice est imposé à votre barème, que vous le preniez ou non. L'EURL peut opter pour l'impôt sur les sociétés et ne soumettre à l'IR que ce que vous vous versez réellement.`,
        `Cette option IS est le cœur de l'intérêt de l'EURL : le bénéfice non prélevé est taxé à l'IS (15 % jusqu'à 42 500 €, 25 % au-delà) et peut rester dans la société ou être distribué en dividendes. À l'EI à l'IR, aucune mise en réserve possible — le résultat est imposé intégralement chaque année, à votre tranche marginale.`,
      ],
    },
    {
      heading: "Responsabilité, dividendes et le piège des 10 %",
      paragraphs: [
        `L'EURL, en tant que société, sépare nettement votre patrimoine de celui de l'entreprise et accueille facilement un futur associé ou une transformation en SASU. L'EI, elle, protège aussi votre patrimoine personnel depuis 2022, mais reste une structure « en nom propre » sans capital ni parts sociales.`,
        `Côté dividendes, l'EURL bute sur la même limite que face à la SASU : seule la part inférieure à 10 % du capital social bénéficie de la flat tax de 31,4 % ; au-delà, elle repasse aux cotisations TNS. Avec un capital modeste, la stratégie dividendes rapporte donc peu — ce qui rapproche l'EURL de l'EI pour qui se verse surtout une rémunération.`,
      ],
    },
    {
      heading: "Quand l'EURL vaut son surcoût",
      paragraphs: [
        `L'EURL coûte plus cher à créer et à tenir (statuts, comptabilité, formalités). Ce surcoût se justifie quand vous voulez lisser votre rémunération dans le temps, capitaliser des bénéfices à l'IS plutôt que de tout imposer à l'IR, ou préparer l'entrée d'associés. Pour un indépendant qui veut simplement déduire ses frais et se verser son bénéfice, l'EI au réel fait le même travail sans la structure.`,
        `En résumé : l'EI si vous privilégiez la simplicité et vous versez l'essentiel de votre bénéfice ; l'EURL si l'option IS et la mise en réserve ont une valeur pour vous. Le simulateur compare les deux nets sur votre TJM ; au-delà du net immédiat, pesez la souplesse de l'IS que seule l'EURL apporte.`,
      ],
    },
  ],
  faq: [
    {
      question: "EI au réel ou EURL : quelle différence de revenu net ?",
      answer: `À cotisations TNS comparables, l'écart vient de l'impôt. Sur le scénario de référence (550 €/jour, tout en rémunération), l'EI laisse ${fmt(EI_550)} €/mois net contre ${fmt(EURL_550)} € en EURL à l'IS. L'EURL creuse l'écart quand vous mettez du bénéfice en réserve à l'IS au lieu de tout imposer à votre barème ; à rémunération intégrale, les deux sont proches.`,
    },
    {
      question: "L'EURL protège-t-elle mieux le patrimoine que l'EI ?",
      answer: `Les deux protègent le patrimoine personnel : l'EURL par la personnalité morale de la société, l'EI par la protection légale du patrimoine privé instaurée en 2022. La différence est surtout formelle et pratique : l'EURL, en tant que société, rassure certains partenaires, accueille des associés et se transforme plus facilement en SASU.`,
    },
    {
      question: "Peut-on passer d'une EI à une EURL ?",
      answer: `Oui : on crée l'EURL puis on y apporte ou cède le fonds de l'entreprise individuelle. C'est un vrai changement de structure (statuts, capital, formalités au guichet unique), pas une simple option fiscale. On le fait généralement pour bénéficier de l'IS, capitaliser des bénéfices ou préparer une association.`,
    },
    {
      question: "EI ou EURL : laquelle paie le moins d'impôt ?",
      answer: `Cela dépend de ce que vous prélevez. Si vous vous versez tout votre bénéfice, l'EI à l'IR et l'EURL à l'IS aboutissent à une imposition proche. Si vous laissez une partie du bénéfice dans la société, l'EURL à l'IS permet de ne payer que 15 à 25 % d'IS sur cette part au lieu de votre tranche marginale d'IR — un avantage qui grandit avec le niveau de revenu.`,
    },
  ],
  related: ["simulateur-ei", "simulateur-eurl", "sasu-ou-eurl"],
};

// -------------------------------------------------- EI OU SASU
const EI_OU_SASU: StatutPage = {
  slug: "ei-ou-sasu",
  statuts: ["ei", "sasu"],
  breadcrumb: "EI au réel ou SASU",
  metaTitle: "EI au réel ou SASU en 2026 : TNS ou assimilé salarié ?",
  metaDescription: `EI au réel ou SASU en 2026 ? Cotisations TNS allégées contre assimilé salarié, dividendes à la flat tax, cumul ARE et protection sociale : le comparatif chiffré, validé URSSAF.`,
  h1: "EI au réel ou SASU : quel statut vous laisse le plus de net ?",
  intro: `Deux statuts sans plafond de chiffre d'affaires, qui déduisent tous deux les frais réels — mais tout les oppose côté social. L'EI est TNS, cotisations légères et protection modeste ; la SASU est assimilée salarié, protection complète et charges lourdes, compensées par les dividendes. Sur le scénario de référence (550 €/jour, tout en rémunération), l'EI laisse ${fmt(EI_550)} €/mois net contre ${fmt(SASU_550)} € en SASU.`,
  sections: [
    {
      heading: "TNS contre assimilé salarié : la facture sociale",
      paragraphs: [
        `L'entrepreneur individuel au réel cotise en TNS : de l'ordre de 45 % de son bénéfice après l'abattement d'assiette de 26 % de la réforme 2026, pour une protection maladie et retraite plus modeste. Le président de SASU est assimilé salarié : couverture du régime général (hors chômage), mais 75 à 80 % de charges sur le net versé — la facture la plus lourde de tous les statuts.`,
        `À rémunération intégrale, l'écart est net : ${fmt(EI_550)} € contre ${fmt(SASU_550)} €/mois sur le scénario de référence. C'est logique — l'EI ne finance qu'une protection réduite, la SASU une protection de cadre. La question n'est donc pas « qui paie le moins » mais « ce que ces cotisations vous achètent, et si vous en avez besoin ».`,
      ],
    },
    {
      heading: "Le levier dividendes, réservé à la SASU",
      paragraphs: [
        `La SASU a une carte que l'EI n'a pas : au lieu de tout passer en salaire chargé, son président peut se verser un salaire modéré et sortir le reste du bénéfice en dividendes, taxés à la flat tax de 31,4 % après impôt sur les sociétés, sans limite. Bien dosé, ce montage rapproche, voire dépasse, le net d'une EI à haut niveau de revenu.`,
        `L'EI, imposée à l'IR sur la totalité de son bénéfice, n'a pas ce levier : tout est soumis aux cotisations TNS et au barème. Son avantage tient à sa simplicité et à des charges intrinsèquement plus basses ; celui de la SASU, à la flexibilité de l'arbitrage salaire/dividendes et à une meilleure couverture.`,
      ],
    },
    {
      heading: "Chômage, ARE et sortie de CDI",
      paragraphs: [
        `Un critère tranche souvent le débat en sortie de CDI : la SASU permet un président sans salaire qui conserve 100 % de son ARE et se rémunère en dividendes une fois les résultats là. L'EI, dont le bénéfice est un revenu d'activité, réduit l'allocation dès le premier euro dégagé. Si vous comptez sur le chômage comme filet de lancement, la SASU offre le montage le plus favorable.`,
        `À l'inverse, l'indépendant aguerri qui maximise son net sans besoin d'ARE ni de protection étendue trouvera souvent l'EI plus rentable et bien plus simple. Le simulateur met les deux nets face à face sur votre TJM ; ajoutez mentalement la valeur du chômage et de la retraite pour arbitrer.`,
      ],
    },
  ],
  faq: [
    {
      question: "EI au réel ou SASU : laquelle laisse le plus de net ?",
      answer: `À rémunération intégrale, l'EI l'emporte grâce à ses cotisations TNS allégées : ${fmt(EI_550)} €/mois net contre ${fmt(SASU_550)} € en SASU sur le scénario de référence (550 €/jour). La SASU rattrape, et peut dépasser, dès qu'on optimise via les dividendes (flat tax 31,4 % après IS) à haut niveau de chiffre d'affaires.`,
    },
    {
      question: "Peut-on cumuler l'ARE avec une EI ou une SASU ?",
      answer: `La SASU permet le cumul le plus favorable : un président sans salaire garde 100 % de son ARE et peut se verser des dividendes, qui ne sont pas déduits de l'allocation. En EI, le bénéfice est un revenu d'activité qui réduit l'ARE dès qu'il est dégagé. Pour maximiser le filet chômage en sortie de CDI, la SASU est le meilleur montage.`,
    },
    {
      question: "La SASU protège-t-elle mieux que l'EI au réel ?",
      answer: `Oui sur la couverture : le président de SASU relève du régime général (meilleure retraite, indemnités journalières, prévoyance), là où l'EI a une protection TNS plus modeste. Aucun des deux n'ouvre de droit au chômage au titre du mandat. Cette meilleure protection de la SASU se paie par des cotisations bien plus lourdes sur le salaire.`,
    },
    {
      question: "EI ou SASU pour un freelance qui a des frais élevés ?",
      answer: `Les deux déduisent les frais réels, donc ce critère ne les départage pas. Le choix se fait sur le social : EI pour des cotisations légères et la simplicité, SASU pour la protection du régime général, l'arbitrage salaire/dividendes et le cumul ARE. Le simulateur intègre vos frais réels pour comparer les nets sur votre situation.`,
    },
  ],
  related: ["simulateur-ei", "simulateur-sasu", "micro-entreprise-ou-sasu"],
};

// -------------------------------------------------- PORTAGE OU SASU
const PORTAGE_OU_SASU: StatutPage = {
  slug: "portage-salarial-ou-sasu",
  statuts: ["portage", "sasu"],
  breadcrumb: "Portage salarial ou SASU",
  metaTitle: "Portage salarial ou SASU en 2026 : sécurité ou optimisation ?",
  metaDescription: `Portage salarial ou SASU en 2026 ? Deux régimes assimilés salariés, mais chômage et zéro gestion d'un côté, dividendes et pilotage de l'autre : le comparatif chiffré, validé URSSAF.`,
  h1: "Portage salarial ou SASU : sécurité ou optimisation ?",
  intro: `Curieusement proches et pourtant opposés : dans les deux cas vous relevez du régime général (assimilé salarié). Mais le portage ajoute l'assurance chômage et vous décharge de toute gestion, tandis que la SASU offre l'arbitrage salaire/dividendes et le contrôle total. Sur le scénario de référence (550 €/jour), le portage laisse ${fmt(PORTAGE_550)} €/mois net contre ${fmt(SASU_550)} € en SASU à 100 % salaire.`,
  sections: [
    {
      heading: "Ce que le portage a et que la SASU n'a pas : le chômage",
      paragraphs: [
        `Le salarié porté cotise à l'assurance chômage : à la fin d'une mission, il peut ouvrir des droits à l'ARE comme n'importe quel salarié. Le président de SASU, lui, ne cotise pas au chômage au titre de son mandat — c'est l'exception notable du statut « assimilé salarié ». Pour qui veut un vrai filet en cas de creux d'activité, le portage a un avantage que la SASU ne rattrapera jamais.`,
        `Le portage supprime aussi toute la gestion : pas de société à créer, pas de comptabilité, pas de déclarations. La société de portage facture, encaisse, établit votre bulletin de paie. En échange, elle prélève des frais de gestion (5 à 10 %) qui s'ajoutent aux cotisations — d'où un net inférieur à chiffre d'affaires égal.`,
      ],
    },
    {
      heading: "Ce que la SASU a et que le portage n'a pas : le pilotage",
      paragraphs: [
        `La SASU vous rend maître de tout : vous choisissez la part de salaire et la part de dividendes, déduisez vos frais réels, capitalisez du bénéfice à l'IS. C'est ce qui explique qu'à haut niveau de revenu, une SASU bien pilotée laisse nettement plus que le portage, dont le net est « subi » une fois les frais de gestion et les cotisations complètes déduits.`,
        `Le montage SASU + ARE est d'ailleurs redoutable en sortie de CDI : président sans salaire, chômage maintenu à 100 %, dividendes quand les résultats arrivent. Le portage, lui, génère de nouveaux droits au chômage mais ne permet pas ce cumul optimisé — c'est un salaire, qui vient en déduction de l'allocation.`,
      ],
    },
    {
      heading: "Le bon choix selon votre horizon",
      paragraphs: [
        `Choisissez le portage pour la tranquillité : transition depuis un CDI, missions ponctuelles, besoin de bulletins de salaire pour un crédit immobilier, ou simplement refus de gérer une société. Vous perdez en net ce que vous gagnez en sérénité et en droits.`,
        `Choisissez la SASU pour la performance : activité installée, chiffre d'affaires élevé, volonté d'optimiser via les dividendes ou de cumuler avec l'ARE. Beaucoup de freelances commencent en portage puis créent une SASU une fois l'activité stabilisée — le simulateur vous montre ce que chaque statut vaut à votre TJM.`,
      ],
    },
  ],
  faq: [
    {
      question: "Portage salarial ou SASU : lequel laisse le plus de net ?",
      answer: `À chiffre d'affaires égal, la SASU laisse plus de net car elle évite les frais de gestion du portage (5 à 10 %) et permet l'arbitrage salaire/dividendes. Sur le scénario de référence (550 €/jour), le portage laisse ${fmt(PORTAGE_550)} €/mois contre ${fmt(SASU_550)} € en SASU à 100 % salaire — et l'écart se creuse encore si la SASU optimise via les dividendes.`,
    },
    {
      question: "Le portage donne-t-il droit au chômage, pas la SASU ?",
      answer: `Exactement. Le salarié porté cotise à l'assurance chômage et peut ouvrir des droits à l'ARE en fin de mission. Le président de SASU, bien qu'assimilé salarié, ne cotise pas au chômage au titre de son mandat. C'est la différence la plus décisive entre les deux : le portage sécurise, la SASU optimise.`,
    },
    {
      question: "Peut-on cumuler l'ARE avec le portage ou la SASU ?",
      answer: `La SASU permet le cumul le plus favorable : un président sans salaire conserve 100 % de son ARE et se rémunère en dividendes. En portage, votre salaire vient en déduction de l'allocation, mais vos missions génèrent de nouveaux droits. Pour maximiser un reliquat d'ARE existant, la SASU l'emporte ; pour reconstituer des droits, le portage.`,
    },
    {
      question: "Portage ou SASU en sortie de CDI ?",
      answer: `Le portage est le sas le plus simple : aucun montage, chômage maintenu par les missions, bulletins de salaire. La SASU est le montage le plus optimisé si vous avez un reliquat d'ARE conséquent (président sans salaire, dividendes) et acceptez de gérer une société. Le simulateur compare les nets ; ajoutez la valeur du chômage et de la gestion pour trancher.`,
    },
  ],
  related: ["simulateur-portage-salarial", "simulateur-sasu", "portage-salarial-ou-cdi"],
};

// -------------------------------------------------- PORTAGE OU EURL
const PORTAGE_OU_EURL: StatutPage = {
  slug: "portage-salarial-ou-eurl",
  statuts: ["portage", "eurl"],
  breadcrumb: "Portage salarial ou EURL",
  metaTitle: "Portage salarial ou EURL en 2026 : salariat ou société ?",
  metaDescription: `Portage salarial ou EURL en 2026 ? Salariat avec chômage et zéro gestion contre société TNS à l'IS plus rémunératrice : le comparatif chiffré pour choisir, validé URSSAF.`,
  h1: "Portage salarial ou EURL : salariat ou société ?",
  intro: `Deux mondes : le portage vous garde salarié (chômage, retraite du régime général, aucune gestion), l'EURL fait de vous un chef d'entreprise TNS à l'impôt sur les sociétés. Sur le scénario de référence (550 €/jour), l'EURL laisse ${fmt(EURL_550)} €/mois net contre ${fmt(PORTAGE_550)} € en portage — la différence, c'est le prix de la sécurité.`,
  sections: [
    {
      heading: "L'écart de net, et ce qu'il finance",
      paragraphs: [
        `En EURL à l'IS, le gérant est TNS : cotisations autour de 45 % du revenu, allégées par l'abattement d'assiette de 26 % de la réforme 2026, et frais réels déductibles. En portage, votre chiffre d'affaires supporte d'abord les frais de gestion de la société (5 à 10 %), puis les cotisations patronales ET salariales du régime général. D'où un net sensiblement plus bas : ${fmt(PORTAGE_550)} € contre ${fmt(EURL_550)} €/mois sur le scénario de référence.`,
        `Cet écart n'est pas une perte sèche : il finance l'assurance chômage, une retraite complète et une prévoyance que l'EURL n'offre pas. La bonne lecture est « l'EURL rend plus de cash, le portage plus de droits ». À vous de dire ce que vaut, pour votre situation, ce filet de sécurité.`,
      ],
    },
    {
      heading: "Gestion, engagement et réversibilité",
      paragraphs: [
        `Le portage, c'est zéro création, zéro comptabilité, zéro déclaration : idéal pour tester l'indépendance sans engagement, ou pour une mission ponctuelle entre deux postes. L'EURL demande de créer une société, de tenir des comptes et de gérer les formalités — un vrai investissement de temps et d'argent, justifié quand l'activité est installée.`,
        `Le portage est aussi le plus réversible : on entre et on sort sans dissoudre quoi que ce soit. Beaucoup de freelances l'utilisent comme rampe de lancement, puis créent une EURL (ou une SASU) une fois le chiffre d'affaires stabilisé et l'envie de piloter leur rémunération venue.`,
      ],
    },
    {
      heading: "Qui devrait choisir quoi",
      paragraphs: [
        `Le portage s'impose si vous voulez conserver le confort du salariat : chômage, bulletins de paie « bankables » pour un crédit, aucune gestion, mission encadrée exigée par un grand compte. Vous acceptez de rendre moins de net en échange de cette tranquillité.`,
        `L'EURL s'impose si vous voulez maximiser votre revenu, déduire des frais réels importants et piloter rémunération et dividendes dans le temps. Sur les dividendes, gardez en tête la règle des 10 % du capital, qui limite l'optimisation en EURL. Le simulateur chiffre les deux nets à votre TJM pour objectiver l'arbitrage.`,
      ],
    },
  ],
  faq: [
    {
      question: "Portage salarial ou EURL : lequel laisse le plus de net ?",
      answer: `L'EURL, nettement, grâce aux cotisations TNS allégées et à l'absence de frais de gestion : sur le scénario de référence (550 €/jour), ${fmt(EURL_550)} €/mois net contre ${fmt(PORTAGE_550)} € en portage. L'écart correspond au coût de la protection sociale complète du portage — chômage, retraite du régime général, prévoyance — que l'EURL n'apporte pas.`,
    },
    {
      question: "Le portage donne-t-il droit au chômage, pas l'EURL ?",
      answer: `Oui. Le salarié porté cotise à l'assurance chômage et peut ouvrir des droits à l'ARE en fin de mission. Le gérant d'EURL est TNS et n'ouvre aucun droit au chômage au titre de son mandat. Si un filet de sécurité est déterminant pour vous, le portage est le seul des deux à l'offrir.`,
    },
    {
      question: "Faut-il créer une société en portage salarial ?",
      answer: `Non, c'est justement son intérêt : vous signez un contrat de travail avec une société de portage qui gère tout (facturation, cotisations, bulletin de paie). Aucune création, aucune comptabilité. L'EURL, à l'inverse, suppose de constituer une société et d'en assurer la gestion comptable et administrative.`,
    },
    {
      question: "Peut-on passer du portage à l'EURL ?",
      answer: `Oui, et c'est un parcours fréquent : on démarre en portage pour tester l'activité sans risque, puis on crée une EURL quand le chiffre d'affaires est stable et qu'on veut optimiser son net. La transition suppose de créer la société et de transférer les contrats clients — quelques semaines de formalités, sans continuité juridique entre les deux.`,
    },
  ],
  related: ["simulateur-portage-salarial", "simulateur-eurl", "portage-salarial-ou-micro-entreprise"],
};

// -------------------------------------------------- MICRO OU CDI
const MICRO_OU_CDI: StatutPage = {
  slug: "micro-entreprise-ou-cdi",
  statuts: ["micro", "cdi"],
  breadcrumb: "Micro-entreprise ou CDI",
  metaTitle: "Micro-entreprise ou CDI en 2026 : à quel TJM ça vaut le coup ?",
  metaDescription: `Rester en CDI ou passer en micro-entreprise en 2026 ? Le TJM à partir duquel la micro bat votre salaire (environ ${fmt(T_MICRO)} €/jour pour ${BRUT_K} 000 € brut), ce que vous gagnez, ce que vous perdez. Validé URSSAF.`,
  h1: "Micro-entreprise ou CDI : à partir de quel TJM ça vaut le coup ?",
  intro: `La micro est la porte d'entrée la plus simple vers l'indépendance : création gratuite, cotisations en pourcentage du chiffre d'affaires, zéro comptabilité. Mais quitter un CDI, c'est renoncer au chômage, aux congés payés et à un revenu garanti. Pour égaler un CDI à ${fmt(ref.cdiBrutAnnuel)} € brut (${fmt(NET_CDI)} €/mois net après impôt), il faut environ ${fmt(T_MICRO)} €/jour en micro. Ce simulateur calcule votre propre point de bascule.`,
  sections: [
    {
      heading: "Le TJM qui remplace votre salaire",
      paragraphs: [
        `La micro affiche le seuil de TJM le plus bas de tous les statuts pour égaler un salaire donné, grâce à ses cotisations légères (environ 24,6 % du CA en BNC) et à l'abattement forfaitaire de 34 %. Pour un CDI cadre à ${fmt(ref.cdiBrutAnnuel)} € brut, comptez environ ${fmt(T_MICRO)} €/jour, à 18 jours facturés par mois sur 11 mois. Le tableau des seuils plus bas décline ce chiffre pour chaque niveau de salaire.`,
        `Attention au piège des jours facturés : 18 par mois est déjà un bon taux d'occupation, car prospection, intermission et congés ne se facturent pas. À 15 jours par mois, le TJM nécessaire grimpe d'environ 20 %. Réglez le simulateur sur votre rythme réel avant de vous fixer un objectif.`,
      ],
    },
    {
      heading: "Ce que vous perdez en quittant le CDI",
      paragraphs: [
        `Un TJM « équivalent » ne remplace pas tout le CDI. Vous perdez l'assurance chômage (la micro n'y ouvre aucun droit), les congés payés, une retraite mieux garnie, et souvent des avantages annexes : mutuelle d'entreprise, titres-restaurant, participation. La micro ne protège pas non plus contre les impayés ni les creux d'activité.`,
        `Le plafond de ${fmt(p.microPlafondService)} € de chiffre d'affaires en prestations est l'autre limite : au-delà, la micro n'est plus accessible et il faut basculer à l'EI au réel ou en société. La micro est donc idéale pour tester une activité ou compléter un revenu, moins pour remplacer durablement un haut salaire.`,
      ],
    },
    {
      heading: "Comment décider sereinement",
      paragraphs: [
        `La bonne méthode : repérez votre net mensuel actuel après impôt, trouvez le TJM qui le reproduit en micro dans le tableau des seuils, puis ajoutez une marge de sécurité pour les intermissions et l'absence de chômage. Si votre TJM cible est nettement au-dessus du seuil, la micro est une évidence financière ; s'il est juste au-dessus, pesez la perte de sécurité.`,
        `Beaucoup profitent d'une rupture conventionnelle pour lancer leur micro avec l'ARE comme filet : le chômage cumule alors partiellement avec les premiers revenus, ce qui adoucit la transition. Le simulateur compare micro et CDI sur vos chiffres exacts — le point de départ le plus fiable avant de vous décider.`,
      ],
    },
  ],
  faq: [
    {
      question: "Quel TJM faut-il pour que la micro-entreprise batte mon CDI ?",
      answer: `Pour un CDI cadre à ${fmt(ref.cdiBrutAnnuel)} € brut (${fmt(NET_CDI)} €/mois net après impôt), il faut environ ${fmt(T_MICRO)} €/jour en micro-entreprise, à 18 jours facturés par mois sur 11 mois. Le seuil monte proportionnellement avec le salaire visé et si vous facturez moins de jours. Le tableau des seuils du simulateur le donne pour chaque niveau de brut.`,
    },
    {
      question: "Perd-on le chômage en passant du CDI à la micro-entreprise ?",
      answer: `La micro n'ouvre aucun droit au chômage : vous ne cotisez pas à l'assurance chômage et ne générez pas de nouveaux droits. En revanche, des droits acquis avant (via une rupture conventionnelle par exemple) peuvent être maintenus partiellement et cumulés avec vos revenus de micro-entrepreneur, ce qui aide au lancement. Seul le portage salarial ouvre de vrais droits au chômage parmi les statuts freelance.`,
    },
    {
      question: "La micro-entreprise est-elle vraiment plus rentable qu'un CDI ?",
      answer: `Au-dessus du seuil d'équivalence (environ ${fmt(T_MICRO)} €/jour pour ${fmt(ref.cdiBrutAnnuel)} € brut), la micro laisse plus de net que le CDI comparé. Mais « plus rentable » ne veut pas dire « équivalent » : le CDI apporte chômage, congés et retraite que le net seul ne reflète pas. Comparez à net égal, puis pondérez selon votre besoin de sécurité.`,
    },
    {
      question: "Jusqu'à quel salaire la micro-entreprise reste-t-elle intéressante ?",
      answer: `Tant que le chiffre d'affaires nécessaire reste sous le plafond de ${fmt(p.microPlafondService)} € en prestations — soit environ 420 €/jour au rythme de 18 jours sur 11 mois. Au-delà, la micro n'est plus accessible : pour remplacer un très haut salaire, il faut passer à l'EI au réel, l'EURL ou la SASU, comparées dans ce simulateur.`,
    },
  ],
  hideFromFooter: true,
  related: ["simulateur-micro-entreprise", "tjm-en-salaire", "portage-salarial-ou-cdi"],
};

// -------------------------------------------------- SASU OU CDI
const SASU_OU_CDI: StatutPage = {
  slug: "sasu-ou-cdi",
  statuts: ["sasu", "cdi"],
  breadcrumb: "SASU ou CDI",
  metaTitle: "SASU ou CDI en 2026 : à partir de quel TJM ça vaut le coup ?",
  metaDescription: `Rester en CDI ou passer en SASU en 2026 ? Deux régimes assimilés salariés, mais dividendes et liberté d'un côté, chômage garanti de l'autre. Le TJM d'équivalence (environ ${fmt(T_SASU)} €/jour pour ${BRUT_K} 000 € brut), validé URSSAF.`,
  h1: "SASU ou CDI : à partir de quel TJM ça vaut le coup ?",
  intro: `La SASU est le statut freelance le plus proche du CDI : dans les deux cas, vous êtes assimilé salarié, avec la couverture du régime général. La grande différence est le chômage — que le CDI garantit et que la SASU n'ouvre pas. Pour égaler un CDI à ${fmt(ref.cdiBrutAnnuel)} € brut (${fmt(NET_CDI)} €/mois net), il faut environ ${fmt(T_SASU)} €/jour en SASU. Voici l'arbitrage complet.`,
  sections: [
    {
      heading: "Presque le même statut social, sauf le chômage",
      paragraphs: [
        `Le président de SASU relève du régime général comme un salarié : même assurance maladie, mêmes indemnités journalières, même retraite de base et complémentaire. La seule protection qui manque est l'assurance chômage — il ne cotise pas à l'ARE au titre de son mandat. Un CDI, lui, garantit ce filet en cas de rupture.`,
        `Parce que la SASU porte des cotisations lourdes (75 à 80 % de charges sur le salaire), le TJM nécessaire pour égaler un CDI est élevé : environ ${fmt(T_SASU)} €/jour pour ${fmt(ref.cdiBrutAnnuel)} € brut, à rémunération intégrale. Mais ce chiffre ne raconte que la moitié de l'histoire, car en SASU vous n'êtes pas obligé de tout passer en salaire.`,
      ],
    },
    {
      heading: "Le levier que le CDI n'a pas : les dividendes",
      paragraphs: [
        `En SASU, tout ce que vous ne vous versez pas en salaire reste un bénéfice, taxé à l'impôt sur les sociétés (15 % jusqu'à 42 500 €, 25 % au-delà), puis distribuable en dividendes à la flat tax de 31,4 %. Ce dosage salaire/dividendes permet d'améliorer le net à chiffre d'affaires égal — un pilotage impossible pour un salarié en CDI, dont la rémunération est entièrement soumise aux cotisations.`,
        `C'est aussi ce qui rend la SASU imbattable en sortie de CDI : président sans salaire, ARE maintenue à 100 %, dividendes une fois les résultats là. Vous transformez votre reliquat de chômage en trésorerie de lancement, tout en construisant votre société — un montage que le CDI, par nature, ne permet pas.`,
      ],
    },
    {
      heading: "Sécurité contre liberté",
      paragraphs: [
        `Le CDI reste le choix de la stabilité : revenu garanti, chômage en cas de coup dur, aucune gestion. La SASU est le choix de la liberté et du potentiel : vous fixez votre tarif, choisissez vos missions, pilotez votre rémunération — au prix de la gestion d'une société et de la perte du filet chômage sur les nouvelles périodes.`,
        `La bonne question n'est donc pas « SASU ou CDI » dans l'absolu, mais « à quel TJM ma liberté devient-elle aussi un gain net ». Sous le seuil, vous payez votre indépendance ; au-dessus, elle vous paie. Le simulateur situe ce seuil sur vos chiffres, et compare la SASU aux autres statuts freelance souvent plus rémunérateurs.`,
      ],
    },
  ],
  faq: [
    {
      question: "Quel TJM pour que la SASU batte mon CDI ?",
      answer: `Pour un CDI cadre à ${fmt(ref.cdiBrutAnnuel)} € brut (${fmt(NET_CDI)} €/mois net après impôt), il faut environ ${fmt(T_SASU)} €/jour en SASU à rémunération intégrale, à 18 jours facturés par mois sur 11 mois. Ce seuil baisse si vous optimisez via les dividendes. Le tableau des seuils du simulateur le donne pour chaque niveau de salaire.`,
    },
    {
      question: "Le président de SASU a-t-il droit au chômage comme un salarié en CDI ?",
      answer: `Non. Bien qu'assimilé salarié pour la maladie et la retraite, le président de SASU ne cotise pas à l'assurance chômage au titre de son mandat et n'ouvre pas de droits à l'ARE. C'est la principale protection du CDI qu'il perd. En revanche, un reliquat d'ARE issu d'un CDI antérieur peut être maintenu s'il ne se verse pas de salaire.`,
    },
    {
      question: "Pourquoi la SASU est-elle si prisée en sortie de CDI ?",
      answer: `Parce qu'elle permet de cumuler l'ARE issue du CDI rompu avec une activité : président sans salaire, l'allocation est maintenue à 100 %, et l'on se rémunère en dividendes une fois les résultats là. Ce montage transforme le reliquat de chômage en trésorerie de lancement, tout en gardant la couverture du régime général.`,
    },
    {
      question: "SASU ou CDI : lequel protège le mieux ?",
      answer: `Le CDI, grâce à l'assurance chômage et au revenu garanti. La SASU offre la même couverture maladie et retraite qu'un cadre, mais sans chômage et sans salaire garanti. Elle compense par la liberté (tarif, missions, dividendes) et un potentiel de revenu supérieur au-delà du seuil d'équivalence d'environ ${fmt(T_SASU)} €/jour.`,
    },
  ],
  hideFromFooter: true,
  related: ["simulateur-sasu", "portage-salarial-ou-cdi", "micro-entreprise-ou-cdi"],
};

// -------------------------------------------------- EURL OU CDI
const EURL_OU_CDI: StatutPage = {
  slug: "eurl-ou-cdi",
  statuts: ["eurl", "cdi"],
  breadcrumb: "EURL ou CDI",
  metaTitle: "EURL ou CDI en 2026 : à partir de quel TJM ça vaut le coup ?",
  metaDescription: `Rester en CDI ou passer en EURL en 2026 ? Gérant TNS à l'IS contre salarié : cotisations plus légères mais pas de chômage. Le TJM d'équivalence (environ ${fmt(T_EURL)} €/jour pour ${BRUT_K} 000 € brut), validé URSSAF.`,
  h1: "EURL ou CDI : à partir de quel TJM ça vaut le coup ?",
  intro: `Passer d'un CDI à une EURL, c'est troquer le statut de salarié contre celui de gérant indépendant : cotisations plus légères, mais plus de chômage ni de revenu garanti. Pour égaler un CDI à ${fmt(ref.cdiBrutAnnuel)} € brut (${fmt(NET_CDI)} €/mois net), il faut environ ${fmt(T_EURL)} €/jour en EURL. Ce simulateur calcule votre point de bascule et met les deux nets face à face.`,
  sections: [
    {
      heading: "Gérant TNS : des charges plus légères que le salariat",
      paragraphs: [
        `Le gérant associé unique d'une EURL est travailleur non salarié : ses cotisations, autour de 45 % du revenu après l'abattement d'assiette de 26 % de la réforme 2026, sont plus légères que celles d'un salarié « tout compris » (part patronale incluse). C'est pourquoi le TJM nécessaire pour égaler un CDI — environ ${fmt(T_EURL)} €/jour pour ${fmt(ref.cdiBrutAnnuel)} € brut — est plus bas que celui d'une SASU ou d'un portage.`,
        `À l'IS, l'EURL permet aussi de ne soumettre à l'impôt sur le revenu que ce que vous vous versez, et de capitaliser le reste dans la société à 15-25 % d'IS. Un salarié en CDI n'a pas cette souplesse : tout son brut passe par les cotisations et l'impôt, sans mise en réserve possible.`,
      ],
    },
    {
      heading: "La contrepartie : ni chômage, ni revenu garanti",
      paragraphs: [
        `En échange de ces charges allégées, le gérant d'EURL renonce à l'assurance chômage (aucun droit à l'ARE au titre du mandat), à une retraite aussi garnie que celle d'un cadre, et à la sécurité d'un salaire mensuel garanti. Il gère aussi les creux d'activité et les impayés seul. Le CDI, lui, garantit le revenu et le filet chômage.`,
        `La protection sociale du TNS s'est rapprochée de celle du salarié, mais reste plus modeste sur la prévoyance et la retraite. Un gérant prudent complète souvent avec une prévoyance et une retraite facultatives (contrats Madelin), déductibles — un coût à intégrer dans la comparaison avec le CDI.`,
      ],
    },
    {
      heading: "Trancher sur vos chiffres",
      paragraphs: [
        `Repérez votre net mensuel actuel après impôt et cherchez le TJM qui le reproduit en EURL dans le tableau des seuils. S'il est nettement sous votre TJM cible, l'EURL est un gain net ; s'il est proche, la perte de sécurité pèse davantage. Ajoutez toujours une marge pour les intermissions et la protection sociale à reconstituer.`,
        `Si votre choix est déjà « je passe en société », comparez surtout EURL et SASU : l'EURL gagne si vous vous versez l'essentiel en rémunération, la SASU si vous misez sur les dividendes ou le cumul ARE. Le simulateur place EURL, SASU et CDI côte à côte sur votre TJM.`,
      ],
    },
  ],
  faq: [
    {
      question: "Quel TJM pour que l'EURL batte mon CDI ?",
      answer: `Pour un CDI cadre à ${fmt(ref.cdiBrutAnnuel)} € brut (${fmt(NET_CDI)} €/mois net après impôt), il faut environ ${fmt(T_EURL)} €/jour en EURL à l'IS, à 18 jours facturés par mois sur 11 mois. C'est un seuil plus bas que la SASU, grâce aux cotisations TNS allégées. Le tableau des seuils du simulateur le décline pour chaque niveau de salaire.`,
    },
    {
      question: "Le gérant d'EURL a-t-il droit au chômage comme un salarié ?",
      answer: `Non. Le gérant associé unique d'une EURL est travailleur non salarié et ne cotise pas à l'assurance chômage : aucun droit à l'ARE au titre du mandat. C'est la principale protection du CDI qu'il perd. Un reliquat d'ARE antérieur peut toutefois être partiellement maintenu selon la rémunération que le gérant se verse.`,
    },
    {
      question: "L'EURL laisse-t-elle plus de net qu'un CDI équivalent ?",
      answer: `Au-dessus du seuil d'environ ${fmt(T_EURL)} €/jour (pour ${fmt(ref.cdiBrutAnnuel)} € brut), oui, grâce aux cotisations TNS plus légères et à la déduction des frais réels. Mais à net égal, le CDI apporte le chômage et une retraite plus solide : comparez à net égal, puis retranchez le coût d'une prévoyance et d'une retraite facultatives pour une comparaison honnête.`,
    },
    {
      question: "EURL ou CDI pour un premier passage en indépendant ?",
      answer: `L'EURL demande de créer et gérer une société, ce qui est un vrai engagement pour un premier pas. Beaucoup préfèrent tester d'abord en micro-entreprise ou en portage salarial (qui garde le chômage), puis créer une EURL une fois l'activité confirmée. Le simulateur compare ces options pour éclairer le premier choix.`,
    },
  ],
  hideFromFooter: true,
  related: ["simulateur-eurl", "sasu-ou-cdi", "micro-entreprise-ou-cdi"],
};

// -------------------------------------------------- EI OU CDI
const EI_OU_CDI: StatutPage = {
  slug: "ei-ou-cdi",
  statuts: ["ei", "cdi"],
  breadcrumb: "EI au réel ou CDI",
  metaTitle: "EI au réel ou CDI en 2026 : à partir de quel TJM ça vaut le coup ?",
  metaDescription: `Rester en CDI ou passer en entreprise individuelle au réel en 2026 ? Cotisations TNS et frais déductibles contre sécurité du salariat. Le TJM d'équivalence (environ ${fmt(T_EI)} €/jour pour ${BRUT_K} 000 € brut), validé URSSAF.`,
  h1: "EI au réel ou CDI : à partir de quel TJM ça vaut le coup ?",
  intro: `L'entreprise individuelle au réel est l'indépendance en nom propre, sans société : cotisations TNS allégées, frais réels déductibles, aucun plafond. Face à elle, le CDI garde le chômage, les congés et un revenu garanti. Pour égaler un CDI à ${fmt(ref.cdiBrutAnnuel)} € brut (${fmt(NET_CDI)} €/mois net), il faut environ ${fmt(T_EI)} €/jour en EI. Ce simulateur chiffre l'arbitrage.`,
  sections: [
    {
      heading: "Un TJM d'équivalence bas, grâce au régime TNS",
      paragraphs: [
        `L'entrepreneur individuel est TNS : ses cotisations, calculées sur le bénéfice après l'abattement d'assiette de 26 % de la réforme 2026, restent bien plus légères que celles d'un assimilé salarié. Résultat, le TJM pour égaler un CDI — environ ${fmt(T_EI)} €/jour pour ${fmt(ref.cdiBrutAnnuel)} € brut — est parmi les plus bas, juste au-dessus de la micro et loin devant la SASU ou le portage.`,
        `L'EI déduit en plus vos frais réels à l'euro près, sans plafond de chiffre d'affaires. Pour un indépendant qui a de vraies dépenses professionnelles (matériel, local, déplacements), c'est un avantage net sur le CDI, dont la rémunération ne « déduit » rien de vos frais de travail.`,
      ],
    },
    {
      heading: "Ce que le CDI garde et que l'EI n'a pas",
      paragraphs: [
        `Le revers du régime TNS : pas d'assurance chômage, une retraite et une prévoyance plus modestes que le régime général, et aucun revenu garanti. Vous encaissez les creux d'activité et les impayés seul. Le CDI, lui, sécurise le revenu, ouvre des droits au chômage et cotise à une retraite de cadre.`,
        `Depuis 2022, votre patrimoine personnel est protégé par défaut à l'EI, ce qui lève l'un des vieux risques du statut. Reste la volatilité du revenu d'indépendant : une marge de trésorerie et une prévoyance facultative sont vivement conseillées pour compenser ce que le CDI apporte automatiquement.`,
      ],
    },
    {
      heading: "Décider avec le bon repère",
      paragraphs: [
        `Partez de votre net mensuel actuel après impôt, trouvez le TJM qui le reproduit en EI dans le tableau des seuils, puis ajoutez une marge pour les intermissions et la protection à reconstituer. Si votre TJM cible est confortablement au-dessus du seuil, l'EI est un vrai gain ; s'il est juste au-dessus, la sécurité du CDI pèse lourd.`,
        `Si vous hésitez encore sur le statut, comparez l'EI à la micro (même métier, abattement contre frais réels) et au portage (qui garde le chômage). Le simulateur met l'EI, le CDI et les autres statuts côte à côte sur votre TJM réel.`,
      ],
    },
  ],
  faq: [
    {
      question: "Quel TJM pour que l'EI au réel batte mon CDI ?",
      answer: `Pour un CDI cadre à ${fmt(ref.cdiBrutAnnuel)} € brut (${fmt(NET_CDI)} €/mois net après impôt), il faut environ ${fmt(T_EI)} €/jour en EI au réel, à 18 jours facturés par mois sur 11 mois. C'est l'un des seuils les plus bas, grâce aux cotisations TNS et à la déduction des frais réels. Le tableau des seuils du simulateur le donne pour chaque salaire.`,
    },
    {
      question: "Perd-on le chômage en quittant un CDI pour une EI ?",
      answer: `Oui : l'entrepreneur individuel est TNS et ne cotise pas à l'assurance chômage, sans droit à l'ARE au titre de son activité. Un reliquat de droits acquis en CDI peut être maintenu partiellement au démarrage et cumulé avec les revenus d'indépendant. Seul le portage salarial ouvre de vrais droits au chômage parmi les statuts freelance.`,
    },
    {
      question: "EI au réel ou CDI : lequel laisse le plus de net ?",
      answer: `Au-dessus d'environ ${fmt(T_EI)} €/jour (pour ${fmt(ref.cdiBrutAnnuel)} € brut), l'EI laisse plus de net grâce aux cotisations TNS légères et aux frais déductibles. Mais le CDI apporte chômage, congés et retraite de cadre que le net seul ne reflète pas : comparez à net égal, puis intégrez le coût d'une prévoyance facultative pour être juste.`,
    },
    {
      question: "EI au réel ou micro pour quitter un CDI ?",
      answer: `Si vos frais professionnels sont faibles, la micro est plus simple et souvent plus avantageuse jusqu'à son plafond de ${fmt(p.microPlafondService)} €. Si vos frais réels sont élevés ou si vous dépassez ce plafond, l'EI au réel les déduit pour de vrai, sans limite de chiffre d'affaires. Le simulateur compare les deux — et le CDI — sur votre situation.`,
    },
  ],
  hideFromFooter: true,
  related: ["simulateur-ei", "micro-entreprise-ou-cdi", "eurl-ou-cdi"],
};

export const COMPARATIF_PAGES: StatutPage[] = [
  MICRO_OU_EURL,
  MICRO_OU_EI,
  EI_OU_EURL,
  EI_OU_SASU,
  PORTAGE_OU_SASU,
  PORTAGE_OU_EURL,
  MICRO_OU_CDI,
  SASU_OU_CDI,
  EURL_OU_CDI,
  EI_OU_CDI,
];
